'use strict';

const CONN_SIMULT = 10;
const SERVER = 'https://opentokdemo.tokbox.com';
const PORT = 443;
const ROOM_NAME = '/room/aRoomNameTest';


var myRequest = require('./myRequest')();
var Firebase = require('firebase');

var promisify = myRequest.promisify;

function getRoomInfo(roomNumber) {
  return myRequest.sendXHR('GET', SERVER + ROOM_NAME + roomNumber + '/info').
    then((aRoomInfo) => {
      if (!(aRoomInfo.firebaseToken && aRoomInfo.firebaseURL)) {
        myRequest.logger.error('Error getting room params ['+ aRoomInfo + ']');
        process.exit(1);
      }
      return aRoomInfo;
    }).catch(error => {
      myRequest.logger.error('There was an error requesting room info. ' + error);
    });
}

function _updateValues() {
}
/*
try {
  var fbRootRefs = [];
  var authProm = [];
  for (var i = 0; i < CONN_SIMULT; i++) {
    getRoomInfo(i).then(function(k, aRoomParams) {
      myRequest.logger.log('k: ' + k);
      myRequest.logger.log('firebaseURL:' + aRoomParams.firebaseURL);
      myRequest.logger.log('firebaseToken:'+ aRoomParams.firebaseToken);
      var aFbRootRef = new Firebase(aRoomParams.firebaseURL);
      aFbRootRef.authWithCustomToken_P = promisify(aFbRootRef.authWithCustomToken);
      fbRootRefs[k] = aFbRootRef;
      aFbRootRef.authWithCustomToken(aRoomParams.firebaseToken, function(por) {
        myRequest.logger.log('Creada conexion ' + por);
      }.bind(null, k));
    }.bind(null, i));
  }
  myRequest.logger.log('TERMINA');
} catch (error) {
  myRequest.logger.error('Error:'. error);
  process.exit(1);
}
*/
try {
  var count = 0;
  var fbRootRefs = [];
  var resolve1;
  var prom1 = new Promise((resolve,reject) => {resolve1 = resolve});
  var authProm = [prom1];
  for (var i = 0; i < CONN_SIMULT; i++) {
    getRoomInfo(i).then(function(k, aRoomParams) {
      myRequest.logger.log('Va por la ' + count);
      count++;
      myRequest.logger.log('k: ' + k);
      myRequest.logger.log('firebaseURL:' + aRoomParams.firebaseURL);
      var aFbRootRef = new Firebase(aRoomParams.firebaseURL);
      aFbRootRef.authWithCustomToken_P = promisify(aFbRootRef.authWithCustomToken);
      fbRootRefs[k] = aFbRootRef;
      authProm.push(aFbRootRef.authWithCustomToken_P(aRoomParams.firebaseToken));
      if (count >= CONN_SIMULT) {
        myRequest.logger.log('Creadas todas las promesas resolver la primera');
        resolve1();
      }
    }.bind(null, i));
  }
  Promise.all(authProm).then((values) => {
    myRequest.logger.log('Auth todos. fbRootRefs.length:'+fbRootRefs.length);
    for (var i = 0, l = fbRootRefs.length; i < l; i++) {
      var rootRef = fbRootRefs[i];
      myRequest.logger.log('RootRef:' + rootRef ? 'Tiene valor' : 'no instanciado');
      if (i > 0) {
        myRequest.logger.log(fbRootRefs[i] == fbRootRefs[i -1 ] ? 'mismo obj q anterior':
                                                                  'distinto obj q anterior');
      }
      var archiveRef = rootRef.child('archives');
      archiveRef.on('value', function updateArchive(snapshot) {
        myRequest.logger.log('Actualizado archivo:' + JSON.stringify(snapshot.val()));
      });
    }
  });
  myRequest.logger.log('TERMINA');
} catch (error) {
  myRequest.logger.error('Error:'. error);
  process.exit(1);
}
