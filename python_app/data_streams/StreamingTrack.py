from data_streams.vstreamer import LidarVideoTrack, LidarDepthTrack, LidarVideoSkeletonTrack, WebcamVideoTrack  # noqa: E501
from cameras.cameras import camera_wrapper as camera_obj
# from cameras.camera_intel_skeleton import intelcamSkeleton


class StreamingTrack:

    def __init__(self) -> None:
        self.cam = camera_obj().cam

        self.depthTrack = LidarDepthTrack(self.cam)

        # if isinstance(self.cam, intelcamSkeleton):
        #     self.videoTrack = LidarVideoSkeletonTrack(self.cam)
        # else:
        #     self.videoTrack = LidarVideoTrack(self.cam)
        self.videoTrack = LidarVideoTrack(self.cam)

        self.webcamTrack = WebcamVideoTrack()
