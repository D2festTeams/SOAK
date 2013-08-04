// we have to use url which supports 'https', because it can be blocked on `https` sites.
var defaultScripts = [
  {name:"jQuery", url:"https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"},
  {name:"Underscore", url:"https://raw.github.com/jashkenas/underscore/master/underscore-min.js"}
];

function MessageHandler() {
  this.port;
  this.handleMessage = function(request, sender, send_response) {
    switch(request.type) {
      case 'REQ_SCRIPT_LIST':
        console.log('msg type : ' + request.type);
        // TODO: query webstorage & merge with default scripts
        send_response({type:'RES_SCRIPT_LIST', scripts: defaultScripts});
        break;

      case 'INJECTED':
        // TODO: need refactoring. really wierd
        handler.port.postMessage(request);
        break;
    }
  }
}

var handler = new MessageHandler();

chrome.extension.onConnect.addListener(function(port) {
  if (port.name !== 'DEVTOOLS-PORT') return;
  handler.port = port;
});

chrome.extension.onMessage.addListener(handler.handleMessage);
