from cameras.cameras import camera


class dummy_camera(camera):

    def __init__(self):
        pass

    def get_frame(self):
        pass

    def get_depth(self):
        pass
