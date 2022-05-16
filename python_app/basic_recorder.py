import cv2
from cameras.cameras import camera_wrapper as camera_obj

# cap= cv2.VideoCapture(0)
cam = camera_obj()

width= int(960)
height= int(540)

writer= cv2.VideoWriter('basicvideo.mp4', cv2.VideoWriter_fourcc(*'DIVX'), 15, (width,height))

while True:
    
    # ret,frame= cap.read()

    frame = cam.get_frame()

    writer.write(frame)

    cv2.imshow('frame', frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break


# cap.release()
writer.release()
cv2.destroyAllWindows()