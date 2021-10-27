from abc import ABC, abstractmethod
import numpy as np
# Import OpenCV for easy image rendering
import cv2
import sys
from pathlib import Path
import requests
import os

webcam = False

url = 'https://gist.githubusercontent.com/Learko/8f51e58ac0813cb695f3733926c77f52/raw/07eed8d5486b1abff88d7e34891f1326a9b6a6f5/haarcascade_frontalface_default.xml'  # noqa: E501
filename = url.split('/')[-1]
filepath = ""

if(not os.path.isfile(filepath + filename)):  # pragma: no cover
    r = requests.get(url)
    with open(filepath + filename, 'wb') as output_file:
        output_file.write(r.content)


def _add_dll_directory(path: Path):  # pragma: no cover
    from ctypes import c_wchar_p, windll  # type: ignore
    from ctypes.wintypes import DWORD

    AddDllDirectory = windll.kernel32.AddDllDirectory
    AddDllDirectory.restype = DWORD
    AddDllDirectory.argtypes = [c_wchar_p]
    AddDllDirectory(str(path))


def kinect():  # pragma: no cover
    if sys.platform != "win32":
        return
    env_path = os.getenv("KINECT_LIBS", None)
    if env_path:
        candidate = Path(env_path)
        dll = candidate / "k4a.dll"
        if dll.exists():
            _add_dll_directory(candidate)
            return
    # autodetecting
    program_files = Path("C:\\Program Files\\")
    for dir in sorted(program_files.glob("Azure Kinect SDK v*"), reverse=True):
        candidate = dir / "sdk" / "windows-desktop" / "amd64" / "release" / "bin"  # noqa: E501
        dll = candidate / "k4a.dll"
        if dll.exists():
            _add_dll_directory(candidate)
            return


class camera(ABC):
    debug = False
    edge_tracking = False
    near_plane = 500
    far_plane = 10000
    point = 2500
    face = (0, 0)
    mapRes = 767
    dimX = 960
    dimY = 540
    faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + './haarcascade_frontalface_default.xml')  # noqa: E501
    dist_image = []
    depthRange = 1000
    black = False

    @abstractmethod
    def get_frame(self) -> bytes:
        pass

    @abstractmethod
    def get_depth(self) -> bytes:
        pass

    def crop(self, image, width=dimX, height=dimY):
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

        if(type(image) != np.ndarray):
            raise Exception("Image is not valid")
        elif(height > image.shape[0] or width > image.shape[1]):
            raise Exception("New image dimensions exceed original image size")
        elif(height < 0 or width < 0):
            raise Exception("New image dimensions less than zero")

        midY = int(image.shape[0] / 2)
        midX = int(image.shape[1] / 2)

        return image[int(midY - height / 2):int(midY + height / 2), int(midX - width / 2):int(midX + width / 2)]  # noqa: E501

    def set_focal_window(self, image, range=depthRange):
        """
        takes the depth map and normalises the values in the given range around
        the object's point attribute

        Parameters
        ----------
        image: [int, int]
            a depth map, where each 2d coordinate
            corresponds to the depth at that pixel location
        range: int
            a range infront of and behind the center point
            that will be included in the returned depth map.
            A lower range will result in more accuracy,
            but will include
            fewer details.

        Returns
        -------
        [int, int]
            a 2d array, containing a depth map centered
            around the point attribute.

        """

        if(type(image) != np.ndarray):
            raise Exception("Image is not valid")
        if(range <= 0):
            raise Exception("Range must be greater than zero")

        new_point = image[self.face]

        if(self.near_plane < new_point < self.far_plane):
            self.point = new_point

        image = (image - (self.point - range)) / ((2 * range) / self.mapRes)

        return np.clip(image, 0, self.mapRes)

    def remove_background_noise(self, image):
        """
        makes use of the open cv library to smooth
        the depth map, and remove any erroneous
        "noise" caused by the camera.

        Parameters
        ----------
        image: [int, int]
            the image to be processed

        Returns
        -------
        [int, int]
            largely the same array as the input image,
            with the background noise removed.

        """
        if(type(image) != np.ndarray):
            raise Exception("Image is not valid")

        kernel = np.ones((5, 5), np.uint8)
        return cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)

    def find_min_max_non_zero(self, image):
        """
        takes a depth map with the background noise
        removed and indentifies the locations of
        the first and last non-zero pixels in both
        the x and y axes

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
        if(type(image) != np.ndarray):
            raise Exception("Image is not valid")

        if np.amax(image) == 0:
            return 0, 0, 0, 0
        else:
            non_zero = np.transpose(np.nonzero(image))
            x_0 = np.amin(non_zero[:, 1])
            x_n = np.amax(non_zero[:, 1])
            y_0 = np.amin(non_zero[:, 0])
            y_n = np.amax(non_zero[:, 0])

            return int(x_0), int(x_n), int(y_0), int(y_n)

    def encode_bgr_channels(self, image):
        """
        Takes a depth map with depth values ranging from 0 to 755, and
        returns a color image, with the sum of the colour values equalling
        the input depth for each pixel.

        Parameters
        ----------
        image: [int, int]

        Returns
        -------
        [int, int, int]
            a 3d array representation of the depth map, with the previous
            depth value now being split accross 3 colour channels.
        """

        if(type(image) != np.ndarray):
            raise Exception("Image is not valid")
        elif(image.ndim != 2):
            raise Exception("Image is not 2-dimensional")
        elif(np.amin(image) < 0):
            raise Exception("Image is not valid (negative depths)")
        if self.black:
            image[np.where(image >= 755)] = 0

        b_channel = np.clip(image, 0, 255)
        image = image - 255

        g_channel = np.clip(image, 0, 255)
        image = image - 255

        r_channel = np.clip(image, 0, 255)

        return np.dstack((g_channel, r_channel, b_channel))

    def sharpen_edges(self, image):
        """
        Substracts the edge curve of the image from the
        image itself to remove stray boarder values.

        Parameters
        ----------
        image: [int, int, int]
            The image to be processed

        Returns
        -------
        [int, int, int]
            The resultant sharpened image
        """

        if(type(image) != np.ndarray):
            raise Exception("Image is not valid")

        _, thresh = cv2.threshold(image, 1, 255, cv2.THRESH_BINARY)

        thresh = np.uint8(thresh)

        edges = cv2.Canny(thresh, 100, 200)

        return image - edges

    def process_frame(self, color_image):
        """
        Takes an image, crops it to a certain size,
        and uses facial detection to record the position
        of the target's face.

        Parameters
        ----------
        image: [int, int, int]

        Returns
        -------
        [int, int, int]
            a 3d array containing the image data, enoded as BRGA
        """

        if(type(color_image) != np.ndarray):
            raise Exception("Image is not valid")

        color_image = self.crop(color_image, width=400)

        gray = cv2.cvtColor(color_image, cv2.COLOR_BGR2GRAY)

        self.faces = self.faceCascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in self.faces:
            if(w * h > 400):
                # cv2.rectangle(color_image, (x, y), (x + w, y + h), 0xff0000 )
                self.face = (min((int)(y + (h / 2)), color_image.shape[0] - 1), min((int)(x + (w / 2)), color_image.shape[1] - 1))  # noqa: E501
                break

        return color_image

    def process_depth(self, depth_image):
        """
        Removes background noise, normalises the data around a central point,
        and returns a slice of the result encoded as an BRGA image.

        Parameters
        ----------
        image: [int, int]

        Returns
        -------
        [int, int, int]
            a 3d array containing the depth data, enoded as BRGA
        """

        if(type(depth_image) != np.ndarray):
            raise Exception("Image is not valid")
        elif(depth_image.ndim != 2):
            raise Exception("Image is not 2-dimensional")

        depth_image = self.crop(depth_image, width=400)

        depth_image = self.set_focal_window(depth_image)

        depth_image = self.remove_background_noise(depth_image)

        depth_image = self.sharpen_edges(depth_image)

        x_0, x_n, y_0, y_n = self.find_min_max_non_zero(depth_image)

        depth_image = self.encode_bgr_channels(depth_image)

        return depth_image


class camera_wrapper(camera):

    def __init__(self):  # pragma: no cover
        """
        Determines which type fo depth sensing camera is connected,
        if any, and sets its cam attribute accordingly

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
        except Exception as e:
            print(e)
            try:
                kinect()
                from cameras.camera_kinect import kinectcam
                self.cam = kinectcam()
                self.cam.get_frame()
            except Exception as e:
                print(e)
                try:
                    from cameras.camera_vga import vgacam
                    self.cam = vgacam()
                    self.cam.get_frame()
                    print("kinected")
                except Exception as e:
                    print(e)

    def get_frame(self):
        """
        Calls the get_frame method of the wrapper's camera attribute,
        and returns the result

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
        Calls the get_depth method of the wrapper's camera attribute,
        and returns the result

        Parameters
        ----------
        none

        Returns
        -------
        [int, int, int]
            a 3d array containing the depth data, enoded as BRGA
        """
        return self.cam.get_depth()
