import math
import cv2
import pyrealsense2 as rs
import numpy as np
import cubemos.SkeletonTracking.samples.python.util as cm

from cubemos.SkeletonTracking.samples.python.skeletontracker import skeletontracker  # noqa: E501
from cameras.cameras import camera

# Global Settings
np.set_printoptions(threshold=np.inf)


class intelcamSkeleton(camera):

    def __init__(self):

        self.color_image = None
        self.depth_image = None
        self.joints = []

        config = rs.config()
        config.enable_stream(rs.stream.depth, 1280, 720, rs.format.z16, 30)
        config.enable_stream(rs.stream.color, 1280, 720, rs.format.bgr8, 30)

        self.pipeline = rs.pipeline()
        self.pipeline.start()

        self.align = rs.align(rs.stream.color)

        unaligned_frames = self.pipeline.wait_for_frames()
        frames = self.align.process(unaligned_frames)
        depth = frames.get_depth_frame()
        self.depth_intrinsic = depth.profile.as_video_stream_profile().intrinsics  # noqa: E501

        self.skeletrack = skeletontracker(
            cloud_tracking_api_key="")
        self.joint_confidence = 0.2

    def update_frames(self):

        self.joints = []
        unaligned_frames = self.pipeline.wait_for_frames()
        frames = self.align.process(unaligned_frames)
        depth = frames.get_depth_frame()
        color = frames.get_color_frame()

        if not depth or not color:
            return

        self.depth_image = np.asanyarray(depth.get_data())
        self.color_image = np.asanyarray(color.get_data())

        skeletons = self.skeletrack.track_skeletons(self.color_image)

        # self.color_image = cv2.cvtColor(self.color_image, cv2.COLOR_BGR2RGB)
        cm.render_result(skeletons, self.color_image, self.joint_confidence)

        self.render_ids_3d(skeletons, depth)

        print(self.joints)

    def get_frame(self):

        self.update_frames()

        return self.process_frame(self.color_image)

    def get_depth(self):
        return self.process_depth(self.depth_image)

    def render_ids_3d(self, skeletons_2d, depth_map):

        thickness = 1
        text_color = (255, 255, 255)
        rows, cols, channel = self.color_image.shape[:3]
        distance_kernel_size = 5
        # calculate 3D keypoints and display them
        for skeleton_index in range(len(skeletons_2d)):
            skeleton_2D = skeletons_2d[skeleton_index]
            joints_2D = skeleton_2D.joints
            did_once = False
            for joint_index in range(len(joints_2D)):
                if not did_once:
                    cv2.putText(
                        self.color_image,
                        "id: " + str(skeleton_2D.id),
                        (int(joints_2D[joint_index].x),
                            int(joints_2D[joint_index].y - 30)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.55,
                        text_color,
                        thickness,
                    )
                    did_once = True
                # check if the joint was detected and has valid coordinate
                if skeleton_2D.confidences[joint_index] > self.joint_confidence:  # noqa: E501
                    distance_in_kernel = []
                    low_bound_x = max(
                        0,
                        int(
                            joints_2D[joint_index].x - math.floor(distance_kernel_size / 2)  # noqa: E501
                        ),
                    )
                    upper_bound_x = min(
                        cols - 1,
                        int(joints_2D[joint_index].x + math.ceil(distance_kernel_size / 2)),  # noqa: E501
                    )
                    low_bound_y = max(
                        0,
                        int(
                            joints_2D[joint_index].y - math.floor(distance_kernel_size / 2)  # noqa: E501
                        ),
                    )
                    upper_bound_y = min(
                        rows - 1,
                        int(joints_2D[joint_index].y + math.ceil(distance_kernel_size / 2)),  # noqa: E501
                    )
                    for x in range(low_bound_x, upper_bound_x):
                        for y in range(low_bound_y, upper_bound_y):
                            distance_in_kernel.append(depth_map.get_distance(x, y))  # noqa: E501
                    median_distance = np.percentile(np.array(distance_in_kernel), 50)  # noqa: E501
                    depth_pixel = [
                        int(joints_2D[joint_index].x),
                        int(joints_2D[joint_index].y),
                    ]
                    if median_distance >= 0.3:
                        point_3d = rs.rs2_deproject_pixel_to_point(
                            self.depth_intrinsic, depth_pixel, median_distance
                        )
                        point_3d = np.round([float(i) for i in point_3d], 3)

                        self.joints.append(point_3d)

                        cv2.putText(self.color_image, str(point_3d), (int(joints_2D[joint_index].x),  # noqa: E501
                                    int(joints_2D[joint_index].y)), cv2.FONT_HERSHEY_DUPLEX, 0.4,  # noqa: E501
                                    text_color, thickness)
