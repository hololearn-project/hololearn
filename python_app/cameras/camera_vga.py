import cv2
import numpy as np
from cameras.cameras import camera


class vgacam(camera):

    def __init__(self):

        self.cap = cv2.VideoCapture(0)

        if not self.cap.isOpened():
            raise IOError("Cannot open webcam")

    def get_frame(self):

        ret, frame = self.cap.read()

        return frame

    def get_depth(self):

        return np.zeros((100, 100))
