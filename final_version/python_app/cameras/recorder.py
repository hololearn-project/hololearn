import cv2


class recorder():

    def __init__(self):

        self.frameBuffer = []
        self.limit = 500
        self.counter = 0

    def add_frame(self, frame):

        self.frameBuffer.append(frame)

        if self.counter % self.limit == 0:
            self.write_to_file("demo")

    def write_to_file(self, fileName):

        height, width = self.frameBuffer[0].shape
        size = (width, height)

        newFileName = fileName + str(self.counter / 500)

        out = cv2.VideoWriter(newFileName + ".mp4", cv2.VideoWriter_fourcc(*'DIVX'), 15, size)  # noqa: E501

        for k in range(len(self.frameBuffer)):
            out.write(self.frameBuffer[k])

        out.release()

        self.frameBuffer = []
