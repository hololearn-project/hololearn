from data_streams.vstreamer import LidarVideoTrack, LidarBGRTrack, LidarDepthTrack, WebcamVideoTrack, FlagVideoStreamTrack  # noqa: E501
from cameras.cameras import camera_wrapper as camera_obj
# from python_app.data_streams.vstreamer import FlagVideoStreamTrack


class StreamingTrack:

    def __init__(self) -> None:
        self.cam = camera_obj().cam
        self.depthTrack = LidarDepthTrack(self.cam)
        self.BGRTrack = LidarBGRTrack(self.cam)
        self.videoTrack = LidarVideoTrack(self.cam)
        self.webcamTrack = WebcamVideoTrack()
        # self.dummyTrack = 
        self.flag = FlagVideoStreamTrack()