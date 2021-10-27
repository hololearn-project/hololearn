#!/usr/bin/env python
from flask import Flask, render_template, Response
# from camera import Camera
from cameras.cameras import camera_wrapper as camera_obj
from flask_cors import CORS, cross_origin


app = Flask(__name__)
CORS(app)
cam = camera_obj() 

@app.route('/')
def index():
    return render_template('index.html')

def genVid(camera):
    """
    Provides the current frame from the color camera in jpeg format.

    Parameters
    ----------
    none
        
    Returns
    -------
    none
    """
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """
    Sets up the stream for the video_feed url.

    Parameters
    ----------
    none
        
    Returns
    -------
    none
    """
    return Response(genVid(cam),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

def genDepth(camera):
    """
    Provides the current frame of the depth camera in jpeg format.

    Parameters
    ----------
    none
        
    Returns
    -------
    none
    """
    while True:
        frame = camera.get_depth()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/depth_feed')
def depth_feed():
    """
    Sets up the stream for the depth_feed url.

    Parameters
    ----------
    none
        
    Returns
    -------
    none
    """
    return Response(genDepth(cam),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(host='localhost', debug=True)