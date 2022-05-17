import cv2
from cameras.cameras import camera_wrapper as camera_obj
import time
import numpy as np

class delay_recorder():

    def __init__(self):

        self.verbose = True

        self.cam = camera_obj()

        self.file_name = 'delay_video'
        
        self.width = 960
        self.height = 540

        self.fps = 20
        self.prev = 0
        self.writer= cv2.VideoWriter(self.file_name+'.mp4', cv2.VideoWriter_fourcc(*'MP4V'), self.fps, (self.width,self.height))
        
    def record(self):

        while True:

            frame = self.cam.get_frame()
            time_elapsed = time.time() - self.prev

            if time_elapsed > 1./self.fps:
                prev = time.time()
                
                self.writer.write(frame)

                cv2.imshow('frame', frame)

            if cv2.waitKey(1) & 0xFF == 27:
                break
        
        self.writer.release()
        cv2.destroyAllWindows()


def main():

    recorder = delay_recorder()

    recorder.record()

    #Waits for the video to finish encoding before continuing
    time.sleep(1)

if __name__ == "__main__":
    main()
    
        



