from cameras.cameras import camera

# from defisheye import Defisheye

# First import the library
import pyrealsense2 as rs
# Import Numpy for easy array manipulation
import numpy as np
# Import OpenCV for easy image rendering
import sys

np.set_printoptions(threshold=np.inf)


class intelcam(camera):

    def __init__(self):
        """
        The constructor for the camera_intel class, requires no arguments

        Parameters
        ----------
        none

        Returns
        -------
        none

        """
        # Create a pipeline
        self.pipeline = rs.pipeline()
        self.counter = 0
        # Create a config and configure the pipeline to stream
        #  different resolutions of color and depth streams
        config = rs.config()

        # Get device product line for setting a supporting resolution
        pipeline_wrapper = rs.pipeline_wrapper(self.pipeline)
        pipeline_profile = config.resolve(pipeline_wrapper)
        device = pipeline_profile.get_device()
        device_product_line = str(device.get_info(rs.camera_info.product_line))

        config.enable_stream(rs.stream.depth, 640, 480, rs.format.z16, 30)

        if device_product_line == 'L500':
            config.enable_stream(rs.stream.color, 960, 540, rs.format.bgra8, 30)  # noqa: E501
            print("Using L5XX camera")
        else:
            config.enable_stream(rs.stream.color, 1024, 768, rs.format.bgr8, 30)  # noqa: E501

        profile = self.pipeline.start(config)

        depth_sensor = profile.get_device().first_depth_sensor()
        depth_scale = depth_sensor.get_depth_scale()
        print("Depth Scale is: ", depth_scale)

        clipping_distance_in_meters = 2
        self.clipping_distance = clipping_distance_in_meters / depth_scale

        # Create an align object
        # rs.align allows us to perform alignment of
        # depth frames to others frames
        # The "align_to" is the stream type to which
        # we plan to align depth frames.
        align_to = rs.stream.color
        self.align = rs.align(align_to)

    def get_frame(self):
        """
        Retrieves an image from the camera output
        and calls the process_frame method
        to process the image.

        Parameters
        ----------
        none

        Returns
        -------
        [int, int, int]
            a 3d array containing the image data, enoded as BRGA
        """

        frames = self.pipeline.wait_for_frames()

        aligned_frames = self.align.process(frames)

        color_frame = aligned_frames.get_color_frame()

        if not color_frame:
            print("Invalid frame", file=sys.stderr)

        color_image = np.asanyarray(color_frame.get_data())

        return self.process_frame(color_image)

    def get_depth(self):
        """
        Retrieves a depth image form the camera output
        and calls process_depth method to process the image.

        Parameters
        ----------
        none

        Returns
        -------
        [int, int, int]
            a 3d array containing the depth data, enoded as BRGA
        """
        frames = self.pipeline.wait_for_frames()

        aligned_frames = self.align.process(frames)

        aligned_depth_frame = aligned_frames.get_depth_frame()

        if not aligned_depth_frame:
            print("Invalid frame", file=sys.stderr)

        depth_image = np.asanyarray(aligned_depth_frame.get_data())
        return self.process_depth(depth_image)
