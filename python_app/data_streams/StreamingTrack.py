from data_streams.vstreamer import LidarVideoTrack, LidarDepthTrack, WebcamVideoTrack  # noqa: E501
from cameras.cameras import camera_wrapper as camera_obj


class StreamingTrack:

    def __init__(self) -> None:
        self.cam = camera_obj().cam
        self.depthTrack = LidarDepthTrack(self.cam)
        self.videoTrack = LidarVideoTrack(self.cam)
        self.webcamTrack = WebcamVideoTrack()
