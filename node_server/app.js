/* eslint-disable prefer-const */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require('http');
const wrtc = require('wrtc');
const Peer = require('simple-peer');
let pythonWhisperer = undefined;

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./user1.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
    , (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Connected to the chinook database.');
      }
    });

// createTable(db);

// // eslint-disable-next-line valid-jsdoc
// /**
//  * creates table.
//  */
// async function createTable(db) {
//   await db.run('DROP TABLE lectures', (err) => {
//     if (err) {
//       console.log('error in dropping: ' + err);
//     }
//   });

//   await
//   db.run(
//  'CREATE TABLE lectures(name text, depthStreamId integer, imageStreamId integer, screenShareStreamId integer)');
// }

// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   } else {
//     console.log('Close the database connection.');
//   }
// });

let globalScreenShare = undefined;
let globalWebcam = undefined;


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
app.options('*', cors());
app.set('port', (process.env.PORT || 8080));


// cors permissions
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers',
      'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
    return res.send(200);
  } else {
    return next();
  }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// initiating the socket server
const port = 4000;
const server = http.createServer(app);
const io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

io.sockets.on('error', (e) => console.log(e));
io.sockets.on('connect_error', (err) => {
  console.log(`connect_error due to ${err.message}`);
});

// WEBRTC STUFF

// Set up a config file for the WebRTC peer connection.
const wrtcStandardConfig = {
  // Unified-plan helps have multiple audio/video
  // tracks on a single pc connecton.
  sdpSemantics: 'unified-plan',
};

// Create a map of python connections.
const pythonConnectionsMap = new Map();

/**
 * Create new WebRTC connection.
 *
 * @param {String} id
 * @param {String} classroomId
 * @return {null} nothing
 */
function createRtcConnectionToPython(id, classroomId) {
  // Check if id is already in the map. If not
  // add it to the map. Else throw error.
  if (!(id in pythonConnectionsMap)) {
    pythonConnectionsMap.set(id, {
      tracks: [],
      rtcPeerConnection: null,
      dataChannel: null,
      mediaStream: null,
      teacherIdKey: null,
      classroomId: classroomId,
      id,
    });
  } else {
    console.error('python connection was already in our ' +
        'list and yet asked to be initialized again');
    return null;
  }

  // Keep track of time to check the latency
  // (of WebRTC) between Python's side and the server.
  const date = new Date();
  const timeStart = date.getTime();
  /**
   * Returns the amount of time spent since the connection
   * was initialized.
   *
   * @param {Time} time the start time
   * @return {Time} spentTime the amount of time since init
   */
  function currentStamp(time) {
    const currt = date.getTime();
    return currt - time;
  };

  // Create new Peer Connection using the config.
  const pc = new wrtc.RTCPeerConnection(wrtcStandardConfig);

  // Listen for tracks in the peer connection.
  let trackCounterUserAdd = 0;
  const trackNames = ['videostream', 'depthstream'];
  pc.addEventListener('track', function(track) {
    console.log('Track recieved.');
    console.log(track);
    console.log(track.streams[0]);

    // Add the track to the python connections map.
    pythonConnectionsMap.get(id).tracks.push(track);

    // See currently connected users.
    const users = getUsers();
    console.log('current list of users: ' + users);
    console.log('my classroom: ' + classroomId);
    console.log('users classrooms: ');
    users.forEach((user) => console.log(user.id + '  ' + user.classroomId));
    for (const user of users) {
      console.log(user.id + '   ' + user.classroomId);
    };

    // Filter all the students who are associated with the classroomID.
    const studentsinclassroom = getStudentsOfSameClassroom(classroomId);
    studentsinclassroom.forEach((user) => {
      try {
        if ( user.peer != null ) {
          // If user has a peer connection established,
          // create a new stream for the user.
          const trackName = trackNames[trackCounterUserAdd];
          trackCounterUserAdd = trackCounterUserAdd + 1;
          if (trackCounterUserAdd > 1) {
            trackCounterUserAdd = 0;
          };
          const newStream = new wrtc.MediaStream({id: trackName});
          newStream.addTrack(track.track);
          user.rtcStream.push(newStream);

          // For every user in the given classroom,
          // add teacher's video track to the peer connection.
          user.peer.addStream(newStream);
          console.log('Added track ' + track + ' to user ' + user.id);
        } else {
          // Tell the client to create a new peer connection.
          user.socket.emit('teacher-presence');
        }
      } catch (error) {
        console.log('error in adding stream to user', error);
      }
    });
  });

  // Listen for connection state changes.
  pc.addEventListener('connectionstatechange', (event) => {
    if (pc.connectionState == 'closed') { // if closed, clean up
      console.warn('Python connection was closed!');
      const studentsinclassroom = getStudentsOfSameClassroom(classroomId);
      studentsinclassroom.forEach((stud) => {
        if (stud.peer != null) {
          stud.rtcStream.forEach((strm) => {
            stud.peer.removeStream(strm);
          });
        };
        stud.rtcStream.forEach((_) => {
          stud.rtcStream.pop();
        });
      });
      pc.close();
      pythonConnectionsMap.delete(id);
    };
  });

  // Create a data channel in the peer connection.
  const dc = pc.createDataChannel('chat');
  pythonWhisperer = dc;

  /**
   * Define data channel routes.
   */
  function dataconnInitRoutes() {
    // Data channel closed
    dc.onclose = function() {
      clearInterval(dcInterval);
      console.log('close');
    };

    // Data channel opened. Start sending pings.
    dc.onopen = function() {
      console.log('data connection with python rtc connection open!');
      dc.send('ping');
    };

    // Received message from data channel.
    dc.onmessage = function(evt) {
      console.log(evt.data);

      // If message starts with pong, print out
      // the latency between the Python and JS.
      if (evt.data.substring(0, 4) === 'pong') {
        const elapsedMs = currentStamp(timeStart) -
            parseInt(evt.data.substring(5), 10);
        console.log('RTT ', elapsedMs);
      }
    };
  }

  // Create new MediaStream.
  const stream1 = new wrtc.MediaStream({id: 'videostream'});
  // Create new MediaStream.
  const stream2 = new wrtc.MediaStream({id: 'depthstream'});

  // Create video track.
  const source1 = new wrtc.nonstandard.RTCVideoSource();

  // Create depth track.
  const source2 = new wrtc.nonstandard.RTCVideoSource();

  // Create audio track.
  // const source3 = new wrtc.nonstandard.RTCAudioSource();

  // Add tracks to the peer connection.
  pc.addTrack(source1.createTrack(), stream1);
  pc.addTrack(source2.createTrack(), stream2);
  // pc.addTrack(source3.createTrack(), stream);
  // Define peerconnection, data channel and mediastream in the map.
  pythonConnectionsMap.get(id).rtcPeerConnection = pc;
  pythonConnectionsMap.get(id).dataChannel = dc;
  pythonConnectionsMap.get(id).mediaStream = [stream1, stream2];

  // Data channel.
  dataconnInitRoutes();
};


// END WEBRTC

/**
 * Check if python connection already exists.
 * @param {String} classroomId
 * @return {Boolean} whether the python connection exists in the map.
 */
function isPythonStreamInClassroom(classroomId) {
  let res = false;
  for (const conn of pythonConnectionsMap.values()) {
    if (conn.classroomId == classroomId) {
      res = true;
    }
  }
  return res;
};

/**
 * Access the ID of the Python connection for a specific classroom.
 * @param {String} classroomId
 * @return {String} python connection id
 */
function getPythonIdInClassroom(classroomId) {
  let resid = null;
  for (const conn of pythonConnectionsMap.values()) {
    if (conn.classroomId == classroomId) {
      console.log('======= Mediastream gotten ======> ' + conn.id);
      resid = conn.id;
    }
  }
  if (resid == null) {
    console.error('asked for python stream in classroom ' +
        classroomId + ' but wasn\'t there');
  }
  return resid;
};

/**
 * Get all users in the same classroom who are students.
 * @param {String} classroomId
 * @return {Array} filtered list of users
 */
function getStudentsOfSameClassroom(classroomId) {
  studs = [];
  users.forEach((user) => {
    if (user.classroomId == classroomId && !user.isTeacher) {
      studs.push(user);
    }
  });
  return studs;
}

/**
 * Get the first found teacher with given classroomid.
 * @param {String} classroomId
 * @return {Object} one user from list of users
 */
function getTeacherInClassroom(classroomId) {
  let founduser = null;
  users.forEach((user) => {
    if (user.classroomId == classroomId && user.isTeacher) {
      founduser = user;
    };
  });
  if (founduser != null) {
    return founduser;
  }
  console.error('teacher not found in classroom');
}

/**
 * Return boolean indicating whether there is a teacher in the given classroom.
 * @param {String} classroomId
 * @return {Boolean} indicating teacher presence in classroom
 */
function isTeacherInClassroom(classroomId) {
  let result = false;
  users.forEach((user) => {
    if (user.classroomId == classroomId && user.isTeacher) {
      result = true;
    };
  });
  return result;
}

// socket server behavior
let users = [];
const lastAlivesUsers = new Map();
/**
 * Helper for getting latest list of users in the global scope.
 *
 * @return {Array} list of users
 */
function getUsers() {
  return users;
};
// socket.io connection here...
console.log('Trying to connect ..');
io.sockets.on('connection', (socket) => {
  let screenLectureUploadTeacher = undefined;
  let screenLectureUploadScreenShare = undefined;
  socket.on('console', (message) => {
    console.log('------------------------');
    console.log('USER LOG: ' + message);
  });
  socket.on('pointChange', (newPoint) => {
    newPoint = newPoint / 100 * 2000 + 1000;
    pythonWhisperer.send('pointChange ' + newPoint);
  });
  socket.on('rangeChange', (newRange) => {
    newPoint = newRange / 100 * 2000 + 200;
    pythonWhisperer.send('rangeChange ' + newRange);
  });
  socket.on('uploadCurrentLecture', (lectureName) => {
    if (screenLectureUploadTeacher == undefined || screenLectureUploadTeacher == '') {
      return;
    }
    db.all('SELECT * FROM screenLectureStreams', (error, rows) => {
      // receives all the results as an array
      let highest = -1;
      rows.forEach((stream) => {
        if (stream.id > highest) {
          highest = stream.id;
        }
      });
      const startCount = highest;

      console.log('counter at start is: ' + startCount);
      // eslint-disable-next-line max-len
      db.run('INSERT INTO screenLectureStreams (id,stream) VALUES(?, ?)', [startCount + 1, screenLectureUploadTeacher], (err) => {
        if (err) {
          return console.log(err.message);
        }
        console.log('teacher was added to the table: ${this.lastID}');
      });

      // ScreenShare is not uploaded if not recorded.
      if (screenLectureUploadScreenShare != undefined && screenLectureUploadScreenShare != '') {
        // eslint-disable-next-line max-len
        db.run('INSERT INTO screenLectureStreams(id, stream) VALUES(?, ?)', [startCount + 2, screenLectureUploadScreenShare], (err) => {
          if (err) {
            return console.log(err.message);
          }
          console.log('ScreenShare was added to the table: ${this.lastID}');
        });

        db.run('INSERT INTO screenLectures(name, teacherStreamId, screenShareStreamId) VALUES(?, ?, ?)',
            [lectureName, startCount + 1, startCount + 2], (err) => {
              if (err) {
                return console.log(err.message);
              }
              console.log('Lecture was added to the table: ${this.lastID}');
            });
      } else {
        db.run('INSERT INTO screenLectures(name, teacherStreamId, screenShareStreamId) VALUES(?, ?, ?)',
            [lectureName, startCount + 1, -1], (err) => {
              if (err) {
                return console.log(err.message);
              }
              console.log('Lecture was added to the table: ${this.lastID}');
            });
      }
    });
  });
  socket.on('screenLectureUploadTeacher', () => {
    screenLectureUploadTeacher = '';
    socket.emit('sendNextChunkTeacher', 0);
    console.log('started lecture upload initiation');
  });
  socket.on('teacherStreamUpload', (chunk, newStart) => {
    screenLectureUploadTeacher += chunk;
    socket.emit('sendNextChunkTeacher', newStart);
  });

  socket.on('screenLectureUploadScreenShare', () => {
    screenLectureUploadScreenShare = '';
    socket.emit('sendNextChunkScreenShare', 0);
  });
  socket.on('screenShareStreamUpload', (chunk, newStart) => {
    screenLectureUploadScreenShare += chunk;
    socket.emit('sendNextChunkScreenShare', newStart);
  });

  socket.on('editLecture', (lecture, newLectureName) => {
    db.run('UPDATE lectures SET name = ? WHERE name = ?', [newLectureName, lecture.name], (err) => {
      if (err) {
        console.log('error on updating lecture: ' + lecture);
      } else {
        console.log('lecture edited');
        socket.emit('editCompleted');
      }
    });
  });
  socket.on('editScreenLecture', (lecture, newLectureName) => {
    db.run('UPDATE screenLectures SET name = ? WHERE name = ?', [newLectureName, lecture.name], (err) => {
      if (err) {
        console.log('error on updating lecture: ' + lecture);
      } else {
        socket.emit('editCompleted');
      }
    });
  });
  socket.on('removeLecture', (lecture) => {
    db.run('DELETE FROM lectures WHERE name=?', [lecture.name], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('Lecture was deleted');
    });
    db.run('DELETE FROM streams WHERE id=?', [lecture.depthStreamId], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('DepthStream deleted was deleted');
    });
    db.run('DELETE FROM streams WHERE id=?', [lecture.imageStreamId], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('ImageStream deleted was deleted');
    });
    db.run('DELETE FROM streams WHERE id=?', [lecture.screenShareStreamId], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('ScreenShareStream deleted was deleted');
    });
  });
  socket.on('removeScreenLecture', (lecture) => {
    db.run('DELETE FROM screenlectures WHERE name=?', [lecture.name], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('Lecture was deleted');
    });
    db.run('DELETE FROM screenLectureStreams WHERE id=?', [lecture.teacherStreamId], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('TeacherStream deleted was deleted');
    });
    db.run('DELETE FROM screenLectureStreams WHERE id=?', [lecture.ScreenShareStreamId], (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('ScreenShareStream deleted was deleted');
    });
  });

  socket.on('getDepthStream', (streamId) => {
    db.all('SELECT * FROM streams WHERE id=' + streamId, (error, rows) => {
      if (error) {
        console.log('error while retrieving the lectures: ' + error);
      } else {
        socket.emit('depthStream', rows);
      }
    });
  });
  socket.on('getTeacherStream', (streamId) => {
    db.all('SELECT * FROM streams WHERE id=' + streamId, (error, rows) => {
      if (error) {
        console.log('error while retrieving the lectures: ' + error);
      } else {
        socket.emit('teacherStream', rows);
      }
    });
  });
  socket.on('getImageStream', (streamId) => {
    db.all('SELECT * FROM streams WHERE id=' + streamId, (error, rows) => {
      if (error) {
        console.log('error while retrieving the lectures: ' + error);
      } else {
        socket.emit('imageStream', rows);
      }
    });
  });
  socket.on('getScreenShareStream', (streamId) => {
    db.all('SELECT * FROM streams WHERE id=' + streamId, (error, rows) => {
      if (error) {
        console.log('error while retrieving the lectures: ' + error);
      } else {
        socket.emit('screenShareStream', rows);
      }
    });
  });
  socket.on('getScreenLecture', (lectureName) => {
    console.log('request for lecture: ' + lectureName);
    let screenShareUploaded = false;
    let teacherUploaded = false;
    db.all('SELECT * FROM screenLectures WHERE name=\'' + lectureName + '\'', (error, rows) => {
      if (error) {
        console.log('error while retrieving the lecture: ' + error);
      } else {
        db.all('SELECT * FROM screenLectureStreams WHERE id=' + rows[0].teacherStreamId, (error, teacherStream) => {
          if (error) {
            console.log('error while retrieving the teacherStream: ' + error);
          } else {
            if (rows.screemShareStreamId == -1) {
              console.log('only teacher stream');
              socket.on('getNextChunkTeacher', (start) => {
                if (teacherStream[0].stream.length <= start) {
                  teacherUploaded = true;
                  socket.emit('playLecture');
                } else {
                  // eslint-disable-next-line max-len
                  socket.emit('nextTeacherChunk', teacherStream[0].stream.substring(start, start + 100000), start + 100000);
                }
              });
              socket.emit('onlyTeacherLecture');
            } else {
              // eslint-disable-next-line max-len
              db.all('SELECT * FROM screenLectureStreams WHERE id=' + rows[0].screenShareStreamId, (error, screenShareStream) => {
                if (error) {
                  console.log('error while retrieving the teacherStream: ' + error);
                } else {
                  socket.on('getNextChunkTeacher', (start) => {
                    if (teacherStream[0].stream.length <= start) {
                      teacherUploaded = true;
                      if (screenShareUploaded) {
                        socket.emit('playLecture');
                      }
                    } else {
                      // eslint-disable-next-line max-len
                      socket.emit('nextTeacherChunk', teacherStream[0].stream.substring(start, start + 100000), start + 100000);
                    }
                  });
                  socket.on('getNextChunkScreenShare', (start) => {
                    if (screenShareStream[0].stream.length <= start) {
                      screenShareUploaded = true;
                      if (teacherUploaded) {
                        socket.emit('playLecture');
                      }
                    } else {
                      // eslint-disable-next-line max-len
                      socket.emit('nextScreenShareChunk', screenShareStream[0].stream.substring(start, start + 100000), start + 100000);
                    }
                  });
                  socket.emit('screenShareIncludedLecture');
                }
              });
            }
          }
        });
      }
    });
  });
  socket.on('getLectures', () => {
    db.all('SELECT * FROM lectures', (error, rows) => {
      if (error) {
        console.log('error while retrieving the lectures: ' + error);
      } else {
        socket.emit('allLectures', rows);
      }
    });
  });
  socket.on('getScreenLectures', () => {
    db.all('SELECT * FROM screenLectures', (error, rows) => {
      if (error) {
        console.log('error while retrieving the lectures: ' + error);
      } else {
        socket.emit('allScreenLectures', rows);
      }
    });
  });
  socket.on('uploadScreenLecture', (lectureName, teacherBlob, screenShareBlob) => {
    // eslint-disable-next-line no-unused-vars
    db.all('SELECT * FROM screenLectureStreams', (error, rows) => {
      // receives all the results as an array
      let highest = -1;
      rows.forEach((stream) => {
        if (stream.id > highest) {
          highest = stream.id;
        }
      });
      const startCount = highest;

      db.run('INSERT INTO screenLectureStreams (id,stream) VALUES(?, ?)', [startCount + 1, teacherBlob], (err) => {
        if (err) {
          return console.log(err.message);
        }
      });

      db.run('INSERT INTO screenLectureStreams(id, stream) VALUES(?, ?)', [startCount + 2, screenShareBlob], (err) => {
        if (err) {
          return console.log(err.message);
        }
      });

      db.run('INSERT INTO screenLectures(name, teacherStreamId, screenShareStreamId) VALUES(?, ?, ?)',
          [lectureName, startCount + 1, startCount + 2], (err) => {
            if (err) {
              return console.log(err.message);
            }
          });
    });
  });
  socket.on('uploadLecture', (lectureName, depthBlob, imageBlob, screenShareBlob) => {
    // eslint-disable-next-line no-unused-vars
    db.all('SELECT * FROM streams', (error, rows) => {
      // receives all the results as an array
      let highest = -1;
      rows.forEach((stream) => {
        if (stream.id > highest) {
          highest = stream.id;
        }
      });
      const startCount = highest;

      db.run('INSERT INTO streams (id,stream) VALUES(?, ?)', [startCount + 1, depthBlob], (err) => {
        if (err) {
          return console.log(err.message);
        }
      });
      db.run('INSERT INTO streams(id, stream) VALUES(?, ?)', [startCount + 2, imageBlob], (err) => {
        if (err) {
          return console.log(err.message);
        }
      });
      db.run('INSERT INTO streams(id, stream) VALUES(?, ?)', [startCount + 3, screenShareBlob], (err) => {
        if (err) {
          return console.log(err.message);
        }
      });

      db.run('INSERT INTO lectures(name, depthStreamId, imageStreamId, screenShareStreamId) VALUES(?, ?, ?, ?)',
          [lectureName, startCount + 1, startCount + 2, startCount + 3], (err) => {
            if (err) {
              return console.log(err.message);
            }
          });
    });
  });

  socket.on('micChange', () => {
    setTimeout(function() {
      users.forEach((user) => {
        if (!user.isTeacher) {
          user.peer.removeTrack(user.teacherStreams.
              screensharestream.getAudioTracks()[0],
          user.teacherStreams.screensharestream);
          user.peer.addTrack(globalScreenShare.getAudioTracks()[0],
              user.teacherStreams.screensharestream);
          user.teacherStreams.screensharestream.removeTrack(
              user.teacherStreams.screensharestream.getAudioTracks()[0]);
          user.teacherStreams.screensharestream.
              addTrack(globalScreenShare.getAudioTracks()[0]);
        }
        io.sockets.emit('teacherStreamChanged');
      });
    }, 1200);
  });

  socket.on('screenShareChange', () => {
    setTimeout(function() {
      users.forEach((user) => {
        if (!user.isTeacher) {
          user.peer.removeTrack(user.teacherStreams.screensharestream.
              getVideoTracks()[0], user.teacherStreams.screensharestream);
          user.peer.addTrack(globalScreenShare.getVideoTracks()[0],
              user.teacherStreams.screensharestream);
          user.teacherStreams.screensharestream.removeTrack(
              user.teacherStreams.screensharestream.getVideoTracks()[0]);
          user.teacherStreams.screensharestream.addTrack(
              globalScreenShare.getVideoTracks()[0]);
        }
      });
      io.sockets.emit('teacherStreamChanged');
      console.log('change message sent');
    }, 1200);
  });

  socket.on('setTeacherTable', (table) => {
    users.forEach((user) => {
      if (user.isTeacher) {
        user.table = table;
        io.sockets.emit('update-connections');
        socket.emit('update-connections');
      }
    });
  });

  socket.on('attendance', (table) => {
    const userList = [];
    users.forEach((user) => {
      if (user.seat > 0 && user.table == table) {
        userList.push({
          name: user.name,
          table: user.table,
          seat: user.seat,
        });
      }
    });
    socket.emit('attendanceList', userList);
  });


  socket.on('rotateClicked', () => {
    const filledTables = [];
    let teacherTable = 1;
    users.forEach((user) => {
      if (!user.isTeacher && (!filledTables.includes(user.table))) {
        filledTables.push(user.table);
      }
      if (user.isTeacher) {
        teacherTable = user.table;
      }
    });
    filledTables.sort(function(a, b) {
      return a - b;
    });
    if (!filledTables.includes(teacherTable) && filledTables.length != 0) {
      teacherTable = filledTables[0];
    }
    users.forEach((user) => {
      if (user.isTeacher) {
        for (let i = 0; i != filledTables.length; i++) {
          if (filledTables[i] == teacherTable) {
            if (i + 1 >= filledTables.length) {
              user.table = filledTables[0];
            } else {
              user.table = filledTables[i + 1];
            }
          }
        }
      }
    });
    io.sockets.emit('update-connections');
    socket.emit('update-connections');
  });

  socket.on('request to speak', () => {
    console.log('request to speak');
    let idSent = false;
    let name = 'Unknown caller';
    users.forEach((user) => {
      if (user.id == socket.id) {
        name = user.name;
      }
    });
    users.forEach((user) => {
      if (user.isTeacher) {
        socket.emit('connect to teacher', user.id);
        socket.broadcast.emit('speaker', socket.id, name);
        idSent = true;
      }
    });
    if (idSent) {
      socket.emit('request accepted');
    } else {
      socket.emit('request denied');
    }
  });

  socket.on('done speaking', () => {
    console.log('done speaking');
    socket.broadcast.emit('speaker done', socket.id);
    socket.emit('speaking disconnected');
  });

  socket.on('test', () => {
    db.all('SELECT * FROM screenLectureStreams', (error, rows) => {
      if (error) {
        console.log('error while retrieving the lectures: ' + error);
      } else {
        socket.emit('testback', rows[11]);
      }
    });
  });

  socket.on('getUsers', () => {
    const userToSend = [];
    users.forEach((user) => {
      userToSend.push({name: user.name, table: user.table, seat: user.seat});
    });
    socket.emit('users', userToSend);
  });

  socket.on('getUsersTablesNext', () => {
    const usersToSend = [];
    users.forEach((user) => {
      usersToSend.push({table: user.table});
    });
    socket.emit('userTablesNext', usersToSend);
  });

  socket.on('getUsersTablesPrevious', () => {
    const userToSend = [];
    users.forEach((user) => {
      userToSend.push({table: user.table});
    });
    socket.emit('userTablesPrevious', userToSend);
  });

  socket.on('getSeats', (table) => {
    const userSeats = [];
    users.forEach((user) => {
      if (user.table == table && user.seats != '') {
        userSeats.push({seat: user.seat, name: user.name});
      }
    });
    socket.emit('userSeats', userSeats);
  });

  console.log('Socket.io connection established');
  socket.on('announce', (data) => {
    let alreadyHere = false;
    users.forEach((user) => {
      if (user.seat == data.selectedPosition && data.table == user.table &! data.table == -4) {
        socket.emit('seat taken');
        alreadyHere = true;
        console.log('seat taken');
      }
    });
    if (!alreadyHere) {
      let seat = data.selectedPosition;
      let userId = data.userId;
      let userIsTeacher = data.teacher;
      let userClassroomId = data.classroomId;
      let name = data.name;
      lastAlivesUsers.set(socket.id, Date.now());
      if (!(socket.id in users)) {
        console.log('seat: ' + seat);
        users.push({
          id: socket.id,
          seat: seat,
          userId,
          socketConnection: socket,
          isTeacher: userIsTeacher,
          classroomId: userClassroomId,
          peer: null,
          socket,
          name,
          rtcStream: [],
          teacherStreams: { // non-null if user is
            videostream: null, // a teacher and has a python
            depthstream: null, // stream and a screenshare stream
            screensharestream: null,
            webcamstream: null,
          },
          table: data.table,
        });
      }
      console.log('new user: ' + users[users.length - 1].name);
      console.log('users: ' + users);
      socket.broadcast.emit('update-connections');
      socket.emit('teacher-presence');
    }
  });

  socket.on('query-connections', () => {
    let thisUserTable = null;
    users.forEach((user) => {
      if (user.id == socket.id) {
        thisUserTable = user.table;
      };
    });
    const allUserIds = []; // for debugging purposes
    const onlyStudentsSameTable = [];
    users.forEach((user) => {
      if (user.table == thisUserTable) {
        onlyStudentsSameTable.push({id: user.id, seat: user.seat});
      };
      allUserIds.push(user.id);
    });
    console.log('the list of users we have: ' +
        allUserIds + ' and the sent list: ' +
        onlyStudentsSameTable + ' for request origin: ' + socket.id);
    socket.emit('connections-list', onlyStudentsSameTable);
  });

  socket.on('signal', (id, data) => {
    socket.to(id).emit('signal', socket.id, data);
  });

  socket.on('message', (msg, name) => {
    console.log('message from: ' + name + ' saying: ' + msg);
    io.emit('new message', msg, name);
  });

  socket.on('ping', () => {
    users.forEach((user) => {
      lastAlivesUsers.set(user.id, Date.now());
    });
  });

  socket.on('rotated', (seat, rotation) => {
    let thisUserTable = null;
    users.forEach((user) => {
      if (user.id == socket.id) {
        thisUserTable = user.table;
      };
    });
    io.emit('rotate', seat, rotation, thisUserTable);
  });
  socket.on('disconnect', function() {
    users = users.filter((x) => x.id != socket.id);
    io.emit('update-connections');
  });

  // Listen for an SDP answer from python side.
  socket.on('python-answer', (msg) => {
    console.log('Python answer received!');
    // Set the remote description of peer connection to be the message received.
    pythonConnectionsMap
        .get(socket.id).rtcPeerConnection.setRemoteDescription(msg.sdp);
  });

  // Listen for first reply from python.
  socket.on('first-call-python', (data) => {
    // Establish a WebRTC connection with Python.
    createRtcConnectionToPython(socket.id, data.classroomId);
    pythonConnectionsMap.get(socket.id).teacherIdKey = data.teacherIdKey;
    pythonConnectionsMap.get(socket.id).classroomId = data.classroomId;
    // Grab the PC connection from the map.
    const pc = pythonConnectionsMap.get(socket.id).rtcPeerConnection;
    pc.createOffer().then(function(offer) {
      console.log('Offer created.');
      // Set local description of PC to the offer.
      return pc.setLocalDescription(offer);
    }).then(function() {
      return new Promise(function(resolve) {
        // Wait for the ICE candidate gathering to finish.
        if (pc.iceGatheringState === 'complete') resolve();
        else {
          /**
           * Checks the ICE gathering state and returns once it's complete.
           */
          function checkState() {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          }
          pc.addEventListener('icegatheringstatechange', checkState);
        }
      });
    }).then(function() {
      // Send the newly created SDP offer to Python through socket connection.
      const offer = pc.localDescription;
      socket.emit('offer', (offer));
      console.log('Offer sent!');
    });
  });

  // Communication to browser with custom RTC connection
  socket.on('teacher-stream-consumer-signal', (data) => {
    users.forEach((user) => {
      try {
        if (user.id == socket.id) {
          user.peer.signal(data);
        }
      } catch (error) {
        console.log('could not signal, peer was destroyed');
      }
    });
  });

  // Connect to the users connected.
  socket.on('browser-ask-to-reconnect-webrtc', () => {
    socket.emit('teacher-presence');
  });
  socket.on('teacher-stream-consumer-connect', () => {
    users.forEach((user) => {
      if (user.id == socket.id) {
        // Establish a new peer connection.
        user.peer = new Peer({initiator: false, wrtc: wrtc});
        user.peer.on('signal', (data) => {
          socket.emit('teacher-stream-emitter-signal', data);
        });
        user.peer.on('connect', () => {
          console.log('teacher peer connected to web client');
          // console.log(Array.from(pythonConnectionsMap.values()));
          if (isPythonStreamInClassroom(user.classroomId)) {
            // Get existing stream and add to connection
            // once the connection is made
            const pyid = getPythonIdInClassroom(user.classroomId);
            console.log('python stream was in the classroom' +
                ' when student joined! -> with id ' + pyid);
            const videostream = new wrtc.MediaStream({id: 'videostream'});
            const depthstream = new wrtc.MediaStream({id: 'depthstream'});
            user.rtcStream.push(videostream);
            user.rtcStream.push(depthstream);
            videostream.addTrack(pythonConnectionsMap
                .get(pyid).tracks[0].track);
            depthstream.addTrack(pythonConnectionsMap
                .get(pyid).tracks[1].track);
            user.peer.addStream(videostream);
            user.peer.addStream(depthstream);
          }
          if (!user.isTeacher && isTeacherInClassroom(user.classroomId)) {
            // if a teacher sharing his screen is here,
            console.log('user was not a teacher but there' +
                ' was one in the classroom');
            const teacher = getTeacherInClassroom(user.classroomId);
            // get it and add to this student
            if (teacher.teacherStreams.screensharestream != null) {
              console.log('teacher has a screenshare' +
                  ' stream, sending to client...');
              const screensharestream =
                  new wrtc.MediaStream({id: 'screensharestream'});
              globalScreenShare.getTracks()
                  .forEach((track) => screensharestream.addTrack(track));
              user.peer.addStream(screensharestream);
              user.teacherStreams.screensharestream = screensharestream;
            }
            if (teacher.teacherStreams.webcamstream != null) {
              console.log('teacher has a webcam' +
                  ' stream, sending to client...');
              const webcamstream =
                  new wrtc.MediaStream({id: 'webcamstream'});
              globalWebcam.getTracks()
                  .forEach((track) => webcamstream.addTrack(track));
              user.peer.addStream(webcamstream);
              user.teacherStreams.webcamstream = webcamstream;
            }
          }
        });
        user.peer.on('stream', (stream) => {
          console.log('RECEIVED STREAM FROM A BROWSER CLIENT');
          let savedstream;
          console.log(stream.getAudioTracks().length);
          if (stream.getAudioTracks().length == 0) {
            console.log('webcam');
            globalWebcam = stream;
            savedstream = new wrtc.MediaStream({id: 'webcamstream'});
          } else {
            globalScreenShare = stream;
            savedstream = new wrtc.MediaStream({id: 'screensharestream'});
          }
          // send the stream to all non-teacher students of the same classroom
          const students = getStudentsOfSameClassroom(user.classroomId);
          stream.getTracks().forEach((trk) => savedstream.addTrack(trk));
          if (stream.getAudioTracks().length == 0) {
            user.teacherStreams.webcamstream = savedstream;
            students.forEach((user) => {
              const sentstream = new wrtc
                  .MediaStream({id: 'webcamstream'});
              stream.getTracks().forEach((trk) => sentstream.addTrack(trk));
              user.peer.addStream(sentstream);
              stream.getTracks();
              user.teacherStreams.webcamstream = sentstream;
            });
          } else {
            user.teacherStreams.screensharestream = savedstream;
            students.forEach((user) => {
              const sentstream = new wrtc
                  .MediaStream({id: 'screensharestream'});
              stream.getTracks().forEach((trk) => sentstream.addTrack(trk));
              user.peer.addStream(sentstream);
              stream.getTracks();
              user.teacherStreams.screensharestream = sentstream;
            });
          }
        });
        user.peer.on('error', (err) => {
          console.log('error', err);
          console.log('attempting to reconnect to user...');
          // user.peer.destroy();
          // socket.emit('teacher-presence');
        });
        user.peer.on('close', () => {
          console.log('user ' + socket.id +
              ' closed the rtc conn to server, reconnecting...');
          user.peer.destroy();
          socket.emit('teacher-presence');
        });
      }
    });
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));

// server.listen(port, () => console.log(`Server is running on port ${port}`));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
