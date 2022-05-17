from abc import ABC, abstractmethod
from turtle import back
import numpy as np
import math
import time
# Import OpenCV for easy image rendering
import cv2 
import sys
from threading import Thread
import requests
import os
url = 'https://gist.githubusercontent.com/Learko/8f51e58ac0813cb695f3733926c77f52/raw/07eed8d5486b1abff88d7e34891f1326a9b6a6f5/haarcascade_frontalface_default.xml'
filename = url.split('/')[-1] # this will take only -1 splitted part of the url
filepath = ""


if(not os.path.isfile(filepath + filename)):
    r = requests.get(url)
    with open(filepath + filename,'wb') as output_file:
        output_file.write(r.content)

class camera(ABC):
    debug = False
    frame_cnt = 0
    edge_tracking = False
    multi_face_sampling = False
    near_plane = 500
    far_plane = 100000
    point = 1500
    face = (0, 0)
    face_samples = []
    mapRes = 255
    mapResRemovalThres = mapRes - 10
    dimX = 576
    dimY = 640
    cropdimX = 500
    cropdimY = 500
    open_kernel = np.ones((5, 5), np.uint8)
    erosion_kernel = np.ones((2, 2), np.uint8)
    default_format=".jpg"
    faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + './haarcascade_frontalface_default.xml')
    dist_image = []
    transpose = False
    bgr = True
    totalTime = 0
    steps = 1
    numThreads = 3
    start_time = time.time()
    range = 1200
    BLACK_PIXEL = [0,0,0]

    
    @abstractmethod
    def get_frame(self) -> bytes:
        pass

    @abstractmethod
    def get_depth(self) -> bytes:
        pass

    def get_background_removed_frame(self, depth, color, alt_img=None):

        color = np.delete(color, 3, 2)

        _, thresh = cv2.threshold(depth,0,255, cv2.THRESH_BINARY)

        thresh = self.remove_background_noise(thresh)

        if alt_img is not None:
            return np.where(thresh==255, color, alt_img)
        else:
            return np.where(thresh==255, color, 0)

    def crop(self, image, width=cropdimX, height=cropdimY):
        """
        Takes an image and returns a centered slice, of the given dimensions

        Parameters
        ----------
        image: [int, int, int]
            the image to be cropped, represented as a 3d image
        width: int
            the desired width of the returned image
        heigth: int
            the desired height of the returned image

        Returns
        -------
        [int, int, int]
            a slice of the given image, centered in the middle
        """

        width = self.cropdimX
        height = self.cropdimY

        midY = int(image.shape[0]/2)
        midX = int(image.shape[1]/2)

        ret = image[int(midY-height/2):int(midY+height/2), int(midX-width/2):int(midX+width/2)]
        return ret
        
    def set_focal_window(self, image, range=1200):
        """
        takes the depth map and normalises the values in the given range around
        the object's point attribute

        Parameters
        ----------
        image: [int, int]
            a depth map, where each 2d coordinate corresponds to the depth at that
            pixel location
        range: int
            a range infront of and behind the center point that will be included in the
            returned depth map. A lower range will result in more accuracy, but will include 
            fewer details.

        Returns
        -------
        [int, int]
            a 2d array, containing a depth map centered around the point attribute

        """
        if not self.multi_face_sampling:
            new_point = image[self.face] #1300
        else:
            new_depths = [image[int(i[0]), int(i[1])] for i in self.face_samples]
            new_point = np.mean(new_depths)

        if(self.near_plane < new_point < self.far_plane):
            self.point = new_point

        image = (image - (self.point - range)) / ((2 * range)/self.mapRes)

        image = np.clip(image, 0, self.mapRes)
        
        return image

    def remove_background_noise(self, image):
        """
        makes use of the open cv library to smooth the depth map, and remove any
        erroneous "noise" caused by the camera.

        Parameters
        ----------
        image: [int, int]
            the image to be processed

        Returns
        -------
        [int, int]
            largely the same array as the input image, with the background noise removed

        """

        image = cv2.morphologyEx(image, cv2.MORPH_OPEN, self.open_kernel)

        # cv2.imshow("inside remove background noise", image)
        # cv2.waitKey(0)

        return image

    def find_min_max_non_zero(self, image):
        """
        takes a depth map with the background noise removed and indentifies the
        locations of the first and last non-zero pixels in both the x and y axes
        
        Parameters
        ----------
        image: [int, int, int]
            the image to be processed

        Returns
        -------
        x_0: int
            x index of first nonzero element
        x_n: int
            x index of last nonzero element
        y_0: int
            y index of first nonzero element
        y_n: int
            y index of last nonzero element


        """
        if np.max(image) == 0:
            return 0, 0, 0, 0
        else:
            non_zero = np.nonzero(image)
            if(self.transpose): non_zero = np.transpose()
            
            x_0 = np.amin(non_zero[:,1])
            x_n = np.amax(non_zero[:,1])
            y_0 = np.amin(non_zero[:,0])
            y_n = np.amax(non_zero[:,0])

            return x_0, x_n, y_0, y_n

    def remove_background(self, depth, frame):
        pass

    def encode_img(self, image, imgFormat=default_format):
        ret, buffer = cv2.imencode('.png', image)

        return buffer.tobytes()

    def encode_bgr_channels_color(self, image):
        """
        Takes a depth map with depth values ranging from 0 to 755, and
        returns a color image, with the sum of the colour values equalling the input depth
        for each pixel

        Parameters
        ----------
        image: [int, int]

        Returns
        -------
        [int, int, int]
            a 3d array representation of the depth map, with the previous depth value now being
            split accross 3 colour channels
        # """
        b_channel = np.clip(image, 0, 255)
        image = image - 255

        g_channel = np.clip(image, 0, 255)
        image = image - 255

        r_channel = np.clip(image, 0, 255)

        image = np.dstack((b_channel, g_channel, r_channel))

        # cv2.imshow("inside encode bgr color", image)
        # cv2.waitKey(0)

        return image

    def sharpen_edges(self, image):
        """
        Substracts the edge curve of the image from the image itself to remove stray
        boarder values.

        Parameters
        ----------
        image: [int, int, int]
            The image to be processed

        Returns
        -------
        [int, int, int]
            The resultant sharpened image
        """

        _, thresh = cv2.threshold(image, 1, 255, cv2.THRESH_BINARY)

        thresh = np.uint8(thresh)

        edges = cv2.Canny(thresh, 100, 200)

        return image - edges

    def process_frame(self, color_image):
        """
        Takes an image, crops it to a certain size, and uses facial detection to record the
        position of the target's face.

        Parameters
        ----------
        image: [int, int]
        
        Returns
        -------
        [int, int, int]
            a 3d array containing the image data, enoded as BRGA
        """
        color_image = self.crop(color_image)
        if (self.transpose): color_image = cv2.transpose(color_image)

        gray = cv2.cvtColor(color_image, cv2.COLOR_BGR2GRAY)

        self.frame_cnt += 1

        if self.frame_cnt % 5 == 0:

            self.faces = self.faceCascade.detectMultiScale(gray, 1.3, 5)

            for (x,y,w,h) in self.faces:
                if(w*h > 400):
                    cv2.rectangle(color_image, (x, y), (x + w, y + h), 0xff0000 )

                    self.face = (min((int)(y+(h/2)), color_image.shape[0]-1), min((int)(x+(w/2)), color_image.shape[1]-1))

                    self.face_samples = []

                    self.face_samples.append(self.face + (0,10))
                    self.face_samples.append(self.face + (0,-10))
                    self.face_samples.append(self.face + (10,0))
                    self.face_samples.append(self.face + (-10,0))

                    #self.face_grid(x, w, y, h, (color_image.shape[0]-1, color_image.shape[1]-1))
                    
                    break
        
        return color_image

    def face_grid(self, x, w, y, h, dim):

        GRID_SAMPLE_GAP_PCT = 0.2

        # Starts at 25% into the box area and stops at 75%, thus 50% coverage

        x_grid = x + 0.25*w
        y_grid = y + 0.25*h

        x_inc = GRID_SAMPLE_GAP_PCT*(0.5*w)
        y_inc = GRID_SAMPLE_GAP_PCT*(0.5*h)

        self.face_samples = []

        for k in range(int(1/GRID_SAMPLE_GAP_PCT)):

            x_k = min(dim[1]-1, x + (k*x_inc))

            for j in range(int(1/GRID_SAMPLE_GAP_PCT)):

                y_j = min(dim[0]-1, y +(j*y_inc))

                self.face_samples.append((y_j, x_k))
        
    def setPoint(self, newPoint):
        print('we want to change point')
        self.point = newPoint
        print("point=", self.point)

    def setRange(self, newRange):
        newRange = 600 + newRange/100 * 1200
        self.range = newRange

class camera_wrapper(camera):

    def __init__(self):
        """
        Determines which type fo depth sensing camera is connected, if any, and sets its cam
        attribute accordingly

        Parameters
        ----------
        none
        
        Returns
        -------
        none
        """
        self.cam = None
        try:
            from cameras.camera_intel import intelcam
            self.cam = intelcam()
            self.cam.get_frame()
            print("intel cam connected")
        except Exception as e:
            print(e)
            try:
                from cameras.camera_kinect import kinectcam
                self.cam = kinectcam()
                self.cam.get_frame()
            except Exception as e:
                print(e)
        # if type == 'intel':
        #     from cameras.camera_intel import intelcam
        #     self.cam = intelcam()
        # if type == 'kinect':
        #     from cameras.camera_kinect import kinectcam
        #     self.cam = kinectcam()
    
    def get_frame(self):
        """
        Calls the get_frame method of the wrapper's camera attribute, and returns the result

        Parameters
        ----------
        none
        
        Returns
        -------
        [int, int, int]
            a 3d array containing the image data, enoded as BRGA
        """
        return self.cam.get_frame()

    def get_depth(self):
        """
        Calls the get_depth method of the wrapper's camera attribute, and returns the result

        Parameters
        ----------
        none
        
        Returns
        -------
        [int, int, int]
            a 3d array containing the depth data, enoded as BRGA
        """
        return self.cam.get_depth()






