// we have to use url which supports 'https', because it can be blocked on `https` sites.
var _scripts = [
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
  this.selectedScript = {};
  this.port;
  this.handleMessage = function(request, sender, send_response) {
    switch(request.type) {
      case 'REQ_SCRIPT_LIST':
        console.log('msg type : ' + request.type);
        // TODO: query webstorage & merge with default scripts
        send_response({type:request.type, scripts: _scripts});
        break;
      case 'INJECTED':
        if (handler.port === undefined) break;
        handler.port.postMessage(request);
        break;
      case 'SCRIPT_SELECTED':
        handler.selectedScript[request.tab] = request.data;
        break;
      case 'REQ_SELECTED_SCRIPT':
        if (Object.keys(handler.selectedScript) === 0)
          break;
        var script = handler.selectedScript[sender.tab.id];
        if (script !== 'undefined')
          send_response({type:request.type, data:script});
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
chrome.runtime.onInstalled.addListener(function(detail) {
  console.log(detail.reason);
  switch(detail.reason) {
    case 'install':
      // first install, persists default script to storage.
      chrome.storage.local.set({'scripts':_scripts}, function() {
        console.log('storage ok');
      });
      break;
    case 'update':
      console.log('extension updated');
      chrome.storage.local.get(null, function(data) {
        _scripts = data.scripts;
        console.dir(data);
      });
      break;
  }
});
chrome.storage.onChanged.addListener(function(changes, areaName) {
  _scripts = changes.scripts.newValue;
  console.dir(_scripts);
  console.log(areaName + ' storage changed');
  chrome.extension.sendMessage({type:'DATA_CHANGED'});
});
