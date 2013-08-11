// we have to use url which supports 'https', because it can be blocked on `https` sites.
var defaultScripts = [
  {name:"jQuery", url:"https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"},
  {name:"Underscore", url:"https://raw.github.com/jashkenas/underscore/master/underscore-min.js"},
  {name:"jqMobi", url:"http://cdn.app-framework-software.intel.com/1.2/jq.mobi.min.js"},

  // experimental (rawgithub.com, depends, css)
  {
    name:"chardin.js", 
    depends:"jQuery",
    url:"https://rawgithub.com/heelhook/chardin.js/master/chardinjs.js",
    css:"https://rawgithub.com/heelhook/chardin.js/master/chardinjs.css"
  }
];

function MessageHandler() {
  this.selectedScript;
  this.port;
  this.handleMessage = function(request, sender, send_response) {
    switch(request.type) {
      case 'REQ_SCRIPT_LIST':
        console.log('msg type : ' + request.type);
        // TODO: query webstorage & merge with default scripts
        send_response({type:'RES_SCRIPT_LIST', scripts: defaultScripts});
        break;

      case 'INJECTED':
        if (handler.port === undefined) break;
        handler.port.postMessage(request);
        break;
      case 'SCRIPT_SELECTED':
        selectedScript = request.data;
        break;
      case 'REQ_SELECTED_SCRIPT':
        send_response({type:request.type, data:selectedScript});
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
