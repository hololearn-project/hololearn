from cameras.dummy_camera import dummy_camera
from cameras.cameras import camera
import cv2
import numpy as np
import unittest
import mock

import warnings
warnings.filterwarnings('ignore')

cam = dummy_camera()


class Test_Camera_Functions(unittest.TestCase):

    # Tests for crop()

    def test_crop_valid(self):

        img = np.zeros((500, 500))

        img_cropped = camera.crop(None, img, width=200, height=200)

        self.assertEqual(img_cropped.shape, (200, 200))

    def test_crop_invalid_larger(self):

        img = np.zeros((1, 1))

        self.assertRaises(Exception, camera.crop, None, img, 200, 200)

    def test_crop_invalid_negative(self):

        img = np.zeros((1, 1))

        self.assertRaises(Exception, camera.crop, None, img, -1, -1)

    def test_crop_invalid_image(self):

        img = 0

        self.assertRaises(Exception, camera.crop, None, img, -1, -1)

    ###########################################################################

    # Tests for set_focal_window()

    def test_set_focal_window_valid(self):

        # Needs to be vgacam since there is not always a device connected

        img = np.zeros((10, 10))

        img_altered = cam.set_focal_window(image=img, window=1000)

        self.assertEqual(img_altered.shape, img.shape)

    def test_set_focal_window_invalid_range(self):

        img = np.zeros((10, 10))

        self.assertRaises(Exception, cam.set_focal_window, img, 0)

    def test_set_focal_window_invalid_img(self):

        img = 0

        self.assertRaises(Exception, cam.set_focal_window, img, 1000)

    ###########################################################################

    # Tests for remove_background_noise()

    def test_remove_background_noise_valid(self):

        img = np.zeros((10, 10))

        img_altered = cam.remove_background_noise(image=img)

        self.assertEqual(img_altered.shape, img.shape)

    def test_remove_background_noise_invalid_img(self):

        img = 0

        self.assertRaises(Exception, cam.remove_background_noise, img)

    ###########################################################################

    # Tests for find_min_max_non_zero()

    def test_find_min_max_non_zero_valid_type(self):

        img = np.ones((10, 10))

        x_0, x_n, y_0, y_n = cam.find_min_max_non_zero(image=img)

        self.assertIsInstance(x_0, int)
        self.assertIsInstance(x_n, int)
        self.assertIsInstance(y_0, int)
        self.assertIsInstance(y_n, int)

    def test_find_min_max_non_zero_valid_results(self):

        img = np.zeros((10, 10))

        img[1, 2] = 1
        img[7, 8] = 1

        x_0, x_n, y_0, y_n = cam.find_min_max_non_zero(image=img)

        self.assertEqual(x_0, 2)
        self.assertEqual(x_n, 8)
        self.assertEqual(y_0, 1)
        self.assertEqual(y_n, 7)

    def test_find_min_max_non_zero_invalid_img(self):

        img = 0

        self.assertRaises(Exception, cam.find_min_max_non_zero, img)

    ###########################################################################

    # Tests for enode_bgr_channels()

    def test_encode_bgr_channels_valid(self):

        img = np.ones((10, 10))

        img_encoded = cam.encode_bgr_channels(img)

        self.assertEqual(img_encoded.shape, (img.shape[0], img.shape[1], 3))

    def test_encode_bgr_channels_invalid_negative(self):

        img = np.ones((10, 10))

        img *= -1

        self.assertRaises(Exception, cam.encode_bgr_channels, img)

    def test_encode_bgr_channels_invalid_img(self):

        img = 0

        self.assertRaises(Exception, cam.encode_bgr_channels, img)

    def test_encode_bgr_channels_invalid_dim(self):

        img = np.zeros((10, 10, 10))

        self.assertRaises(Exception, cam.encode_bgr_channels, img)

    ###########################################################################

    # Tests for sharpen_edges()

    def test_sharpen_edges_valid(self):

        img = np.ones((10, 10, 10))

        img_sharp = cam.sharpen_edges(img)

        self.assertEqual(img_sharp.shape, img.shape)

    def test_sharpen_edges_invalid_img(self):

        img = 0

        self.assertRaises(Exception, cam.sharpen_edges, img)

    ###########################################################################

    # Tests for process_frame()

    def test_process_frame_method_calls(self):

        img = np.array(np.ones((540, 960, 3)), dtype=np.uint8)

        with mock.patch.object(camera, 'crop', return_value=img) as mock_crop:
            cam.process_frame(img)
            mock_crop.assert_called_once()

        with mock.patch.object(cv2, 'cvtColor', return_value=img) as mock_cvt:
            cam.process_frame(img)
            mock_cvt.assert_called_once()

    def test_process_frame_valid(self):

        img = np.array(np.ones((540, 960, 3)), dtype=np.uint8)

        img_proc = cam.process_frame(img)

        self.assertEqual(img_proc.shape, (540, 400, 3))

    def test_process_frame_invalid_img(self):

        img = 0

        self.assertRaises(Exception, cam.process_frame, img)

    ###########################################################################

    # Tests for process_depth()

    def test_process_depth_method_calls(self):

        img = np.array(np.ones((540, 960)), dtype=np.uint8)

        with mock.patch.object(camera, 'crop', return_value=img) as mock_crop:
            cam.process_depth(img)
            mock_crop.assert_called_once()

        with mock.patch.object(camera, 'set_focal_window', return_value=img) as mock_sfw:  # noqa: E501
            cam.process_depth(img)
            mock_sfw.assert_called_once()

        with mock.patch.object(camera, 'remove_background_noise', return_value=img) as mock_rbn:  # noqa: E501
            cam.process_depth(img)
            mock_rbn.assert_called_once()

        with mock.patch.object(camera, 'sharpen_edges', return_value=img) as mock_sharp:  # noqa: E501
            cam.process_depth(img)
            mock_sharp.assert_called_once()

        with mock.patch.object(camera, 'find_min_max_non_zero', return_value=(0, 0, 0, 0)) as mock_mmno:   # noqa: E501
            cam.process_depth(img)
            mock_mmno.assert_called_once()

        with mock.patch.object(camera, 'encode_bgr_channels', return_value=(0, 0, 0, 0)) as mock_bgr:  # noqa: E501
            cam.process_depth(img)
            mock_bgr.assert_called_once()

    def test_process_depth_valid(self):

        img = np.array(np.ones((540, 960)), dtype=np.uint8)

        img_proc = cam.process_depth(img)

        self.assertEqual(img_proc.shape, (540, 400, 3))

    def test_process_depth_invalid_img(self):

        img = 0

        self.assertRaises(Exception, cam.process_depth, img)

    def test_process_depth_invalid_dim(self):

        img = np.zeros((10, 10, 10))

        self.assertRaises(Exception, cam.process_depth, img)


if __name__ == '__main__':
    unittest.main()
