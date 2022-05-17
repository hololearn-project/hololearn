import cv2
from cameras.cameras import camera_wrapper as camera_obj
import time
import numpy as np

class basic_recorder():

    def __init__(self):

        self.verbose = True

        self.cam = camera_obj()

        self.video_folder = 'videos/'
        self.file_name = 'basic_video'

        self.fps_sample_length = 30
        
        self.width = 960
        self.height = 540

        self.fps = None
        self.effective_fps = None
        self.writer = None

        self.frame_count = None
        self.duration = None

        self.record = True
        self.adjust = True
        
    def calc_fps(self):

        if self.verbose:
            print('Calculating FPS')

        writer_dummy = cv2.VideoWriter(self.video_folder+'dummy.mp4', cv2.VideoWriter_fourcc(*'DIVX'), 15, (self.width,self.height))

        t = time.process_time()

        for i in range(30):

            frame = self.cam.get_frame()

            writer_dummy.write(frame)

            cv2.imshow('frame', frame)

        elapsed = time.process_time() - t
            
        fps = self.fps_sample_length/elapsed

        writer_dummy.release()

        if self.verbose:
            print('FPS: '+str(fps))

        return fps

    def init_writer(self):

        self.fps = self.calc_fps()

        self.writer= cv2.VideoWriter(self.video_folder+self.file_name+'.mp4', cv2.VideoWriter_fourcc(*'MP4V'), self.fps, (self.width,self.height))
    
    def start(self):

        start = time.process_time()

        while True:

            frame = self.cam.get_frame()

            self.writer.write(frame)

            cv2.imshow('frame', frame)

            if cv2.waitKey(1) & 0xFF == 27:
                end = time.process_time()
                break

        self.writer.release()

        self.duration = end - start

        cv2.destroyAllWindows()

    def sync_frame_rate(self):

        cap = cv2.VideoCapture(self.video_folder+self.file_name+'.mp4')

        self.frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        self.effective_fps = self.frame_count/self.duration

        self.writer= cv2.VideoWriter(self.video_folder+self.file_name+"_synced.mp4", cv2.VideoWriter_fourcc(*'MP4V'), self.effective_fps, (self.width,self.height))

        while cap.isOpened():

            ret, frame = cap.read()

            if ret:
                self.writer.write(frame)
            else:
                break

        cap.release()
        self.writer.release()
        cv2.destroyAllWindows()

    def adjust_frame_rate(self, src, new_fps=24):

        cap = cv2.VideoCapture(self.video_folder+src+'.mp4')

        self.frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        self.writer= cv2.VideoWriter(self.video_folder+self.file_name+"_"+str(new_fps)+"fps.mp4", cv2.VideoWriter_fourcc(*'MP4V'), new_fps, (self.width,self.height))

        while cap.isOpened():

            ret, frame = cap.read()

            if ret:
                self.writer.write(frame)
            else:
                break

        cap.release()
        self.writer.release()
        cv2.destroyAllWindows()


def main():

    recorder = basic_recorder()

    if recorder.record:
        #Estimates the fps over x frames
        recorder.init_writer()

        #Starts recording
        recorder.start()

        #Waits for the video to finish encoding before continuing
        time.sleep(1)

        #Rewrites the video using the number of frames / duration as the eff. fps 
        recorder.sync_frame_rate()

    if recorder.adjust:
        #Rewrites the video at the provided fps
        recorder.adjust_frame_rate('basic_video', new_fps=24)

if __name__ == "__main__":
    main()
    
        



