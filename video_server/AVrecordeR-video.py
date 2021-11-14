import cv2
import numpy
from cameras.cameras import camera_wrapper as camera_obj

class VideoRecorder():
	
	# Video class based on openCV 
	def __init__(self):
		
		
		self.cam = camera_obj()
		self.video_out = cv2.VideoWriter('outpy.avi',cv2.VideoWriter_fourcc('M','J','P','G'),10, (540,960))

	
	# Video starts being recorded 
	def record(self):

		print('Recording started')

		# Create a VideoCapture object and read from input file
		# If the input is the camera, pass 0 instead of the video file name
		# Read until video is completed
		while(True):
		# Capture frame-by-frame
			frame = self.cam.get_frame_bgr()

			if frame is not None:

				resized = cv2.resize(frame, (540, 960), interpolation = cv2.INTER_AREA)
				cv2.imshow('frame', resized)
				self.video_out.write(resized)
			# Display the resulting frame

			# Press Q on keyboard to  exit
			if cv2.waitKey(25) & 0xFF == ord('q'):
				print('Recording stopped')
				break

		# When everything done, release the video capture object

		# Closes all the frames
		self.video_out.release()
		cv2.destroyAllWindows()
	
recorder = VideoRecorder()
recorder.record()


