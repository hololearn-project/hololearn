/* eslint-disable no-unused-vars */
/**
 * Correctly sets the source for the video element
 * containing the recorded picture video.
 */
function setRecordedPictureSource() {
  const rcp = document.getElementById('recordedDepthStream');

  const source = rcp.getElementById('pictureSource');

  source.setAttribute('src', 'url goes here');
}

/**
 * Correctly sets the source for the video element
 * containing the recorded depth video.
 */
function setRecordedDepthSource() {
  const rcd = document.getElementById('recordedDepthStream');

  const source = rcd.getElementById('depthSource');

  source.setAttribute('src', 'url goes here');
}

