from ast import fix_missing_locations
from cameras.cameras import camera
from pyk4a import Config, PyK4A
import numpy as np
import pyk4a
import cv2

class kinectcam(camera):

    def __init__(self):
        """
        Initialises connection with the azure kinect camera, and sets several object attributes

        Parameters
        ----------
        none
        
        Returns
        -------
        none
        """
        k4a = PyK4A(
            Config(
                color_resolution=pyk4a.ColorResolution.RES_720P,
                depth_mode=pyk4a.DepthMode.NFOV_UNBINNED,
                synchronized_images_only=True,
            )
        )
        k4a.start()

        # getters and setters directly get and set on device
        k4a.whitebalance = 4500
        assert k4a.whitebalance == 4500
        k4a.whitebalance = 4510
        assert k4a.whitebalance == 4510

        self.clipping_distance = 2000
        self.k4a = k4a

    def get_frame(self):
        """
        Retrieves an image from the camera output, and calls the process_frame method
        to process the image.

        Parameters
        ----------
        none
        
        Returns
        -------
        [int, int, int]
            a 3d array containing the image data, enoded as BRGA
        """
        capture = self.k4a.get_capture()
        color = capture.color #[:, :, :3]

        return self.process_frame(color)

    def get_depth(self):
        """
        Retrieves a depth image form the camera output, 
        and calls process_depth method to process the image.

        Parameters
        ----------
        none
        
        Returns
        -------
        [int, int, int]
            a 3d array containing the depth data, enoded as BRGA
        """
        capture = self.k4a.get_capture()
        depth = capture.depth
        return self.process_depth(depth)
