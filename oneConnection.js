const SERVER = 'https://opentokdemo.tokbox.com';
const PORT = 443;
const ROOM_NAME = '/room/aRoomNameTest';

var myRequest = require('./myRequest')();
var Firebase = require('firebase');

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

try {
  var roomNumber = Math.floor(Math.random() * 1000) + 1;
  getRoomInfo(roomNumber).then(function(aRoomParams) {
    myRequest.logger.log('roomNumber:' + roomNumber);
    var aFbRootRef = new Firebase(aRoomParams.firebaseURL);
    aFbRootRef.authWithCustomToken(aRoomParams.firebaseToken, function() {
      myRequest.logger.log('autenticado ' + roomNumber);
      aFbRootRef.child('archives').on('value', function updateArchive(snapshot) {
        //myRequest.logger.log('Actualizado archivo:' + JSON.stringify(snapshot.val()));
      });
    });
  });
} catch (error) {
  myRequest.logger.error('Error:'. error);
  process.exit(1);
}
