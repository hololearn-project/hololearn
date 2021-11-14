# import required libraries
from vidgear.gears import VideoGear
from vidgear.gears import NetGear

# open any valid video stream(for e.g `test.mp4` file)
stream = VideoGear(source=0).start()

# Define Netgear Server with default parameters
server = NetGear()

# loop over until KeyBoard Interrupted
while True:

    try:

        # read frames from stream
        frame = stream.read()

        # check for frame if Nonetype
        if frame is None:
            break

        # {do something with the frame here}

        # send frame to server
        server.send(frame)

    except KeyboardInterrupt:
        break

# safely close video stream
stream.stop()

# safely close server
server.close()