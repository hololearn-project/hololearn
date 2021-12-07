from aiortc import VideoStreamTrack
from av.frame import Frame
from av import VideoFrame
from cameras.cameras import camera_wrapper as camera_obj
import cv2
import numpy as np
import math


class WebcamVideoTrack(VideoStreamTrack):
    def __init__(self):
        """
        Initialize OpenCV video capture into WebRTC video track.

        Parameters
        ----------
        none

        Returns
        -------
        none
        """
        super().__init__()
        self.counter = 0
        self.cap = cv2.VideoCapture(0)
        # Check if the webcam is opened correctly
        if not self.cap.isOpened():
            raise IOError("Cannot open webcam")

    async def recv(self) -> Frame:
        """
        Returns the next frame.

        Parameters
        ----------
        none

        Returns
        -------
        frame: Frame
        """
        pts, time_base = await self.next_timestamp()
        ret, cvframe = self.cap.read()
        cvframe = cv2.resize(cvframe, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)  # noqa: E501
        frame = VideoFrame.from_ndarray(cvframe)
        frame.pts = pts
        frame.time_base = time_base
        return frame


class FlagVideoStreamTrack(VideoStreamTrack):
    """
    A video track that returns an animated flag.
    """

    def __init__(self):
        super().__init__()  # don't forget this!
        self.counter = 0
        height, width = 480, 640

        # generate flag
        data_bgr = np.hstack(
            [
                self._create_rectangle(
                    width=213, height=480, color=(255, 0, 0)
                ),  # blue
                self._create_rectangle(
                    width=214, height=480, color=(255, 255, 255)
                ),  # white
                self._create_rectangle(width=213, height=480, color=(0, 0, 255))  # noqa: E501
            ]
        )

        # shrink and center it
        M = np.float32([[0.5, 0, width / 4], [0, 0.5, height / 4]])
        data_bgr = cv2.warpAffine(data_bgr, M, (width, height))

        # compute animation
        omega = 2 * math.pi / height
        id_x = np.tile(np.array(range(width), dtype=np.float32), (height, 1))
        id_y = np.tile(
            np.array(range(height), dtype=np.float32), (width, 1)
        ).transpose()

        self.frames = []
        for k in range(30):
            phase = 2 * k * math.pi / 30
            map_x = id_x + 10 * np.cos(omega * id_x + phase)
            map_y = id_y + 10 * np.sin(omega * id_x + phase)
            self.frames.append(
                VideoFrame.from_ndarray(
                    cv2.remap(data_bgr, map_x, map_y, cv2.INTER_LINEAR), format="bgr24"  # noqa: E501
                )
            )

    async def recv(self):
        pts, time_base = await self.next_timestamp()

        frame = self.frames[self.counter % 30]
        frame.pts = pts
        frame.time_base = time_base
        self.counter += 1
        return frame

    def _create_rectangle(self, width, height, color):
        data_bgr = np.zeros((height, width, 3), np.uint8)
        data_bgr[:, :] = color
        return data_bgr


class LidarVideoTrack(VideoStreamTrack):
    def __init__(self, cam: camera_obj):
        super().__init__()
        self.cam = cam

    async def recv(self) -> Frame:
        pts, time_base = await self.next_timestamp()
        cvframe = self.cam.get_frame()
        cvframe = np.array(cvframe, dtype=np.uint8)
        frame = VideoFrame.from_ndarray(cvframe, format='bgra')
        frame.pts = pts
        frame.time_base = time_base
        return frame


class LidarBGRTrack(VideoStreamTrack):
    def __init__(self, cam: camera_obj):
        super().__init__()
        self.cam = cam

    async def recv(self) -> Frame:
        pts, time_base = await self.next_timestamp()
        cvframe = self.cam.get_frame_bgr_encoded()
        cvframe = np.array(cvframe, dtype=np.uint8)
        frame = VideoFrame.from_ndarray(cvframe, format='bgra')
        frame.pts = pts
        frame.time_base = time_base
        return frame


class LidarDepthTrack(VideoStreamTrack):
    def __init__(self, cam: camera_obj):
        super().__init__()
        self.cam = cam

    async def recv(self) -> Frame:
        pts, time_base = await self.next_timestamp()
        cvframe = self.cam.get_depth()
        cvframe = np.array(cvframe, dtype=np.uint8)
        frame = VideoFrame.from_ndarray(cvframe)
        frame.pts = pts
        frame.time_base = time_base
        return frame
