import cv2
import pyaudio
import wave
import numpy as np
import threading
import time
import subprocess
import os
from cameras.cameras import camera_wrapper as camera_obj

########################
## JRF
## VideoRecorder and AudioRecorder are two classes based on openCV and pyaudio, respectively. 
## By using multithreading these two classes allow to record simultaneously video and audio.
## ffmpeg is used for muxing the two signals
## A timer loop is used to control the frame rate of the video recording. This timer as well as
## the final encoding rate can be adjusted according to camera capabilities
##

########################
## Usage:
## 
## numpy, PyAudio and Wave need to be installed
## install openCV, make sure the file cv2.pyd is located in the same folder as the other libraries
## install ffmpeg and make sure the ffmpeg .exe is in the working directory
##
## 
## start_AVrecording(filename) # function to start the recording
## stop_AVrecording(filename)  # "" ... to stop it
##
##
########################



class VideoRecorder():
	
	# Video class based on openCV 
	
	def __init__(self):
		self.cam = camera_obj().cam
		self.video_filename1 = "depth_video.avi"
		self.video_filename2 = "color_video.avi"
		self.open = True
		self.device_index = 0
		self.fps = 15          	        # fps should be the minimum constant rate at which the camera can
		self.fourcc = "MJPG"       		# capture images (with no decrease in speed over time; testing is required)
		self.frameSize = (576, 640) 	# video formats and also depend and vary according to the camera used
		self.video_writer1 = cv2.VideoWriter_fourcc(*self.fourcc)
		# self.video_writer2 = cv2.VideoWriter_fourcc(*self.fourcc)
		self.video_out1 = cv2.VideoWriter(self.video_filename1, self.video_writer1, self.fps, self.frameSize)
		# self.video_out2 = cv2.VideoWriter(self.video_filename2, self.video_writer2, self.fps, self.frameSize)
		self.frame_counts = 1
		self.start_time = time.time()
		self.preview = False
				
	def record(self):

		print('Recording started')

		# Create a VideoCapture object and read from input file
		# If the input is the camera, pass 0 instead of the video file name
		# Read until video is completed
		while(self.open):

			depth_frame = self.cam.get_depth()
			self.video_out1.write(depth_frame)
			# print(depth_frame.shape)

			# color_frame = self.cam.get_frame()
			# color_frame = np.delete(color_frame, 3, 2)
			# self.video_out2.write(color_frame)

			self.frame_counts += 1

			if(self.preview):
				cv2.imshow('frame', depth_frame)
			if cv2.waitKey(1) & 0xFF == ord('q'):
				break

		cv2.destroyAllWindows()

	# Finishes the video recording therefore the thread too
	def stop(self):
		
		if self.open==True:
			self.open=False
			self.video_out1.release()
			# self.video_out2.release()
			cv2.destroyAllWindows()
		else: 
			pass


	# Launches the video recording function using a thread			
	def start(self):
		video_thread = threading.Thread(target=self.record)
		video_thread.start()


def start_AVrecording(filename="output"):

	global video_thread
				
	video_thread = VideoRecorder()

	video_thread.start()

def stop_AVrecording(filename1, filename2):
	
	frame_counts = video_thread.frame_counts
	elapsed_time = time.time() - video_thread.start_time
	recorded_fps = frame_counts / elapsed_time
	print("total frames " + str(frame_counts))
	print("elapsed time " + str(elapsed_time))
	print("recorded fps " + str(recorded_fps))
	video_thread.stop()
	# Makes sure the threads have finished
	while threading.active_count() > 1:
		time.sleep(1)

	cmd = "ffmpeg -i "+filename1+".avi -c:v copy -c:a copy -y "+filename1+".mp4"
	subprocess.call(cmd, shell=True)

	# cmd = "ffmpeg -i "+filename2+".avi -c:v copy -c:a copy -y "+filename2+".mp4"
	# subprocess.call(cmd, shell=True)

# Required and wanted processing of final files
def file_manager():

	local_path = os.getcwd()

	if os.path.exists(str(local_path) + "/depth_video.avi"):
		os.remove(str(local_path) + "/depth_video.avi")
	
	if os.path.exists(str(local_path) + "/color_video.avi"):
		os.remove(str(local_path) + "/color_video.avi")

if __name__== "__main__":
	
	filename1 = "depth_video"
	filename2 = "color_video"
	file_manager()
	
	start_AVrecording()

	input()
	stop_AVrecording(filename1, filename2)



