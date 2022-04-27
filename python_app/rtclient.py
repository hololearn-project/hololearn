import asyncio
import dataclasses
import os
import socketio


from pathlib import Path
from aiortc import RTCPeerConnection, RTCSessionDescription
from data_streams.StreamingTrack import StreamingTrack

# Socket.io details
NODEJS_URL = 'localhost'
NODEJS_PORT = '4000'
ROOT = os.path.dirname(__file__)
CLASSROOM_ID = "defaultClassroom"


def _add_dll_directory(path: Path):
    from ctypes import c_wchar_p, windll  # type: ignore
    from ctypes.wintypes import DWORD

    AddDllDirectory = windll.kernel32.AddDllDirectory
    AddDllDirectory.restype = DWORD
    AddDllDirectory.argtypes = [c_wchar_p]
    AddDllDirectory(str(path))


def kinect():
    if os.system.platform != "win32":
        return
    env_path = os.getenv("KINECT_LIBS", None)
    if env_path:
        candidate = Path(env_path)
        dll = candidate / "k4a.dll"
        if dll.exists():
            _add_dll_directory(candidate)
            return
    # autodetecting
    program_files = Path("C:\\Program Files\\")
    for dir in sorted(program_files.glob("Azure Kinect SDK v*"), reverse=True):
        candidate = dir / "sdk" / "windows-desktop" / "amd64" / "release" / "bin"  # noqa: E501
        dll = candidate / "k4a.dll"
        if dll.exists():
            _add_dll_directory(candidate)
            return


async def main(pc, mediatracks):
    """
    Connects to a socket and listens for a SDP offer.
    Once offer is received, create an answer and communicate it back to
    offerer through socket.
    Once peer connection is established, start listening for media
    tracks / data channel.

    Parameters
    ----------
    pc: RTCPeerConnection

    Returns
    -------
    none
    """
    # pc - PeerConnection
    print("Starting!")

    # Create a socket.io client
    sio = socketio.AsyncClient()

    # Connect with the socket.
    await sio.connect("http://" + NODEJS_URL + ":" + NODEJS_PORT)

    # Listening for a track.
    @pc.on("track")
    def on_track(track):
        """
        Listen for a track.

        Parameters
        ----------
        track: MediaStreamTrack

        Returns
        -------
        none
        """
        print("{} track received from server".format(track.kind), track)

        # Add a track to the peerconnection from the list of mediatracks.
        pc.addTrack(mediatracks.pop())

        # Listening for the end of a track.
        @track.on("ended")
        async def on_ended():
            print("Track %s ended", track.kind)

    @pc.on("datachannel")
    def on_data(channel):
        """
        Listen for data channels.

        Parameters
        ----------
        channel: RTCSessionDescription

        Returns
        -------
        none
        """
        print("Message channel open")

        # Listen for a message transmitted throuh data channel.
        @channel.on("message")
        def on_message(msg):
            """
            Listen for messages in data channel.

            Parameters
            ----------
            msg: String

            Returns
            -------
            none
            """
            if isinstance(msg, str) and msg.startswith("ping"):
                reply = "pong" + msg[4:]
                channel.send(reply)

            if isinstance(msg, str) and msg.startswith("pointChange"):
                newPoint = int(msg[12:])
                streamingTrack.cam.setPoint(newPoint)
            
            if isinstance(msg, str) and msg.startswith("rangeChange"):
                newRange= int(msg[12:])
                streamingTrack.cam.setRange(newRange)


    @pc.on("connectionstatechange")
    async def state_change():
        """
        Listen for changes in the connection

        Parameters
        ----------
        none

        Returns
        -------
        none
        """
        print("Connection state is {}".format(pc.connectionState))
        if (pc.connectionState == "failed"):
            # Close the connection if state fails.
            await pc.close()

    @sio.event
    async def offer(data):
        """
        Listen for a offer message from socket connection.

        Parameters
        ----------
        data: dict

        Returns
        -------
        none
        """
        print("Received data from JS.")

        # Create a new RTCSessionDescription using the data that
        # was sent through socket connection.
        # sdp: string containing a SDP message describing the session
        offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
        print("trying to add nodejs sdp as our remote description")
        print(offer)
        # Set the peer connection's remote description to be the newly
        # created offer.
        await pc.setRemoteDescription(offer)
        print("added successfully, now creating answer")

        # Create an answer for the offer.
        answer = await pc.createAnswer()

        # Set the answer as local description.
        await pc.setLocalDescription(answer)
        print("sending answer")

        # Transmit the answer through socket.io.
        await sio.emit('python-answer', data={"sdp": dataclasses.asdict(answer)})  # noqa: E501
        print(answer)

    # Entry field for the teacher's ID.
    given_id_key = input('Please enter teacher id key given in browser: ')
    if not given_id_key:
        # If teacher ID isn't entered, use the default key.
        given_id_key = 'defaultTeacher'

    # Send message consisting of teacher's ID and classroom ID through socket.
    await sio.emit('first-call-python', data=dict(teacherIdKey=given_id_key, classroomId=CLASSROOM_ID))  # noqa: E501

    # While a peer connection is not yet established, try again.
    while pc.connectionState != 'connected':
        print('connection state is: ', pc.connectionState)
        await asyncio.sleep(1)

    # Keep peer connection running, while it's connected.
    while (pc.connectionState == "connected"):
        await asyncio.sleep(1)


if __name__ == "__main__":
    # Create new WebRTC peer connection with default settings.
    pc = RTCPeerConnection()
    # Assign two placeholder tracks.
    # webcam = WebcamVideoTrack()
    # flagstream = FlagVideoStreamTrack()
    streamingTrack = StreamingTrack()
    mediatracks = []
    # mediatracks.append(webcam)
    # mediatracks.append(flagstream)
    # mediatracks.append(streamingTrack.depthTrack)
    # mediatracks.append(streamingTrack.videoTrack)
    mediatracks.append(streamingTrack.flag)
    mediatracks.append(streamingTrack.BGRTrack)

    # Keep the asyncio loop running until connection closed or
    # keyboard interrupt found.
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main(pc, mediatracks))
    except KeyboardInterrupt as e:
        print("Caught keyboard interrupt. Canceling tasks...")
        print(e)
        loop.stop()
    finally:
        loop.close()
