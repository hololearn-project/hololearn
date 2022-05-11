import cv2
from cameras.cameras import camera_wrapper as camera_obj
import numpy as np
import time

class DummyStream():

    def __init__(self):

        self.cam = camera_obj()
        self.start_time = None
        self.end_time = None
        self.frame_count = 0

    def stream(self):

        self.start_time = time.time()

        while True:
            frame = self.cam.cam.get_depth()
            cv2.imshow('stream', frame)
            self.frame_count += 1
            if cv2.waitKey(1) & 0xFF == ord('q'):
                self.end_time = time.time();
                print("FPS: "+str(self.frame_count/(self.end_time-self.start_time)))
                break

if __name__== "__main__":

    dummy_stream = DummyStream()
    dummy_stream.stream()
