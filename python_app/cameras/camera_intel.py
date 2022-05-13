
## License: Apache 2.0. See LICENSE file in root directory.
## Copyright(c) 2017 Intel Corporation. All Rights Reserved.

#####################################################
##              Align Depth to Color               ##
#####################################################
from ast import fix_missing_locations
from cameras.cameras import camera

# from defisheye import Defisheye

# First import the library
import pyrealsense2 as rs
# Import Numpy for easy array manipulation
import numpy as np
import math
# Import OpenCV for easy image rendering
import cv2
import sys

# import requests
import os

url = 'https://gist.githubusercontent.com/Learko/8f51e58ac0813cb695f3733926c77f52/raw/07eed8d5486b1abff88d7e34891f1326a9b6a6f5/haarcascade_frontalface_default.xml'
filename = url.split('/')[-1] # this will take only -1 splitted part of the url
filepath = ""

if(not os.path.isfile(filepath + filename)):
    r = rs.get(url)
    with open(filepath + filename,'wb') as output_file:
        output_file.write(r.content)

#Global Settings
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
        self.colorizer = rs.colorizer(1)

        self.thresholder = rs.threshold_filter()
        self.thresholder.set_option(rs.option.max_distance, 10)
        self.spacer = rs.spatial_filter()
        self.temporer = rs.temporal_filter()
        self.filler = rs.hole_filling_filter()

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
            config.enable_stream(rs.stream.color, 960, 540, rs.format.bgra8, 30)
            print("Using L5XX camera")
        else:
            config.enable_stream(rs.stream.color, 1024, 768, rs.format.bgr8, 30)
        print("flag")

        profile = self.pipeline.start(config)
        print("flag")
        # Getting the depth sensor's depth scale (see rs-align example for explanation)
        depth_sensor = profile.get_device().first_depth_sensor()
        print("flag")
        depth_scale = depth_sensor.get_depth_scale()
        print("Depth Scale is: " , depth_scale)

        clipping_distance_in_meters = 2
        self.clipping_distance = clipping_distance_in_meters / depth_scale
        self.enable_dynamic_calibration = True;

        # Create an align object
        # rs.align allows us to perform alignment of depth frames to others frames
        # The "align_to" is the stream type to which we plan to align depth frames.
        align_to = rs.stream.color
        self.align = rs.align(align_to)

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
        frames = self.pipeline.wait_for_frames()

        aligned_frames = self.align.process(frames)

        color_frame = aligned_frames.get_color_frame()

        if not color_frame:
            print("Invalid frame", file=sys.stderr)

        color_image = np.asanyarray(color_frame.get_data())

        return self.process_frame(color_image)

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

        frames = self.pipeline.wait_for_frames()

        aligned_frames = self.align.process(frames)

        aligned_depth_frame = aligned_frames.get_depth_frame()
        

        depth_image = self.thresholder.process(aligned_depth_frame)
        # depth_image = self.spacer.process(depth_image)
        # depth_image = self.temporer.process(depth_image)
        # depth_image = self.filler.process(depth_image)

        depth_image = self.colorizer.colorize(aligned_depth_frame)

        if not aligned_depth_frame:
            print("Invalid frame", file=sys.stderr)

        depth_image = np.asanyarray(depth_image.get_data())

        return self.process_depth(depth_image)

