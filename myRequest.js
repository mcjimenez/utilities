function myRequest() {
  var Utils =  require('./shared/utils');
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

  var Logger = Utils.MultiLevelLogger;
  var logger = new Logger('myRequest', Logger.DEFAULT_LEVELS.log);

  var promisify = Utils.promisify;

  function sendXHR(aType, aURL, aData, aDataType) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(aType, aURL);
      logger.log('Type:' + aType + ', url:' + aURL);
      xhr.responseType = 'json';
      xhr.overrideMimeType && xhr.overrideMimeType('application/json');
      if (aDataType) {
        // Note that this requires
        xhr.setRequestHeader('Content-Type', aDataType);
        aData && xhr.setRequestHeader('Content-Length', aData.length);
      }

      xhr.onload = function (aEvt) {
        if (xhr.status === 200) {
          var response = xhr.response || xhr.responseText;
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
          resolve(response);
        } else {
          reject({ status: xhr.status, reason: xhr.response });
        }
      };

      xhr.onerror = function (aEvt) {
        logger.error('sendXHR. XHR failed ' + JSON.stringify(aEvt) + 'url: '+
                    aURL + ' Data: ' + aData + ' RC: ' + xhr.responseCode);
        reject(aEvt);
      };

      xhr.send(aData);
    });
  }

  return {
    logger: logger,
    promisify: promisify,
    sendXHR: sendXHR
  };

}

module.exports = myRequest;
