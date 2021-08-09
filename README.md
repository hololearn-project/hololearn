# HoloLearn

Online lecturing system for hybrid and online learning augmented by holograms-.


## requirements

```
- Python 3.7+ (and requirements.txt)
- Node.js (and included dependencies)
- Intel L515 or Azure Kinect LiDAR camera (requires SDK)
```

Both [python](https://www.python.org/) and [node.js](https://nodejs.org/en/) can be found on their official websites.

## quickstart guide

There are two components to this software:

- the node.js server
- the python client

In order to use this software, after installing the aforementioned dependencies this is the procedure:

*First you'll want to run the web server.*

### node.js server

1. navigate to `final_version/node_server`
2. in a shell, run the following:
   - `npm install`
   - `npm run start`
3. Success! You can now access the website at the URL shown in the terminal (usually `http://localhost:4000`)

*Now that you have a web server, teachers and students can join the session. In order to give a lecture, you will want to connect your Lidar camera to the server.*

### python client

1. navigate to `final_version/python_app`
2. create a python virtual environment and enter it:
   - `python -m venv venv`
   - `.\venv\Scripts\activate` (on windows)
3. install the dependencies and run the python script:
   - `python -m pip install -r requirements.txt`
   - `python rtclient.py`
4. When the Python script asks for your teacher ID, press enter (it will use the default ID, which is fine)

That's it! You now have a functional system.

## usage

To run locally, follow the Quickstart guide.

To run on a server, you will find a guide in the `doc` folder for setting the server up.

## structure

Here we will go over the basic structure of both parts of the codebase.

### Python client

All python client files are in the `python_app` folder. Then:

- `rtclient.py` is the main script.
  - It initiates a Socket.io connection to a running Node.js server instance and it contains the URL of that server instance at the top of the file.
  - Once that connection is made, a WebRTC connection is made as well and it initiates the LiDAR video streams and adds them to the WebRTC connection. If no Lidar camera is found, it will try to use your webcam.
- The `data_streams` folder is responsible for adapting LiDAR or other video camera streams to deliver their data to a WebRTC connection.
- The `cameras`  folder contains scripts for **getting data from cameras (including LiDAR)** and **pre-processing that data** for use on the receiving end (the browser that creates the 3D object out of the LiDAR streams)

### node.js server

All node.js server files are in the `node_server` folder. Then:

- `app.js` is the server script, that runs an Express and Socket.io server. It manages all browser connections. There is no other script that is run by the server itself.
- The `public` folder contains all the client-side code, including:
  - the `main.js` script, which handles all initialization and execution on the client browser.
  - `stylesheets`, `images` and `assets` respectively contain the CSS, images and assets such as the 3D classroom model which the browser needs to render the page.
  - in `javascripts`:
    - `threejs-loader` contains threejs standard code for loading 3d models
    - `threejs-scripts` contains all scripts related to threejs, namely `modelling.js` which generates the 3D teacher and `OrbitControls.js` which is the standard orbit controls given by threejs's community libraries.
    - `attendanceList.js`, `chatbox.js`, `loginScript.js`, `rotateClassroom.js` and `studentCamera.js` have descriptive names and they implement their named feature.
    - `mediaChange.js` and `mediaCheck.js` handle getting screen-share, video and microphone streams from the user.
    - `peers.js` handles all the communication both with the server, and with other users. Both using Socket.io and WebRTC.

## testing

The code is tested using a diverse range of techniques.
The majority of testing is done via unit tests on the pipeline, this includes all of the Python tests, and the majority of the javascript tests.
We also regularly perform system tests whenever major changes are made, to ensure that there are no unintended side-effects to the changes we make.
Some tests need to be run locally, due to the dependencies of the code being tested.

Here's the different steps to testing modelling.js
1. open the modelling.js file and uncomment the line indicated by comments at the top and bottom of the file (these lines will need to be commented again to run the code normally)
2. enter the `final_version/node_server` folder
3. install dependencies using `npm install`
4. run the cypress tests using `npx cypress open`
5. once the cypress window opens, select modelling.test.js to run the tests
