import cv2
import numpy as np

import pyk4a
from pyk4a import Config, PyK4A

def main():
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

    clipping_distance = 2000

    while 1:
        capture = k4a.get_capture()
        color = capture.transformed_color[:, :, :3]
        depth = capture.depth

        # remove background
        further_color = 0
        depth_image_3d = np.dstack((depth,depth,depth)) #depth image is 1 channel, color is 3 channels
        bg_removed = np.where((depth_image_3d > clipping_distance) | (depth_image_3d <= 0), further_color, color)
        print(depth[int(len(depth) / 2)][int(len(depth) / 2)], end='\r')
        if np.any(bg_removed):
            cv2.imshow("kk", bg_removed)
            key = cv2.waitKey(10)
            if key != -1:
                cv2.destroyAllWindows()
                break

    k4a.stop()


if __name__ == "__main__":
    main()