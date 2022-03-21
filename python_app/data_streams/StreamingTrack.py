from data_streams.vstreamer import LidarVideoTrack, LidarBGRTrack, LidarDepthTrack, WebcamVideoTrack, FlagVideoStreamTrack  # noqa: E501
from cameras.cameras import camera_wrapper as camera_obj
# from python_app.data_streams.vstreamer import FlagVideoStreamTrack


class StreamingTrack:
    """
    class containing several different 'camera' objects that can provide
    image frames to rtClient, to then send to the js side
    
    """
    def __init__(self) -> None:
        self.cam = camera_obj().cam                 #the same camera object is used for each object as only one instance can be created
        self.depthTrack = LidarDepthTrack(self.cam) #object that serves frames of processed depth data
        self.BGRTrack = LidarBGRTrack(self.cam)     #object that serves frames of colour images, with the background removed
        self.videoTrack = LidarVideoTrack(self.cam) #object that serves colour images with the background intact
        self.webcamTrack = WebcamVideoTrack()       
        # self.dummyTrack = 
        self.flag = FlagVideoStreamTrack()          #object that sends a simple animation of a waving flag, used for testing