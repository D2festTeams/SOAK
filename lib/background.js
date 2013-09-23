// we have to use url which supports 'https', because it can be blocked on `https` sites.
var defaultScripts = [
  {name:"jQuery", url:"https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"},
  {name:"jqMobi", url:"http://cdn.app-framework-software.intel.com/1.2/jq.mobi.min.js"},
  {name:"zepto", url:"http://zeptojs.com/zepto.min.js"},
  {name:"kimbo", url:"http://kimbojs.com/dist/kimbo.min.js"},
  {name:"BSI", url:"http://bytes1.dyndns.org/BSI/website-app.js"},
  {name:"tt", url:"http://jsdo.it/damele0n/10kN/js"},
  {name:"Underscore", url:"https://raw.github.com/jashkenas/underscore/master/underscore-min.js"},
  {name:"spotlight", url:"https://gist.github.com/chitacan/6175451/raw/961f370f4cb8f2a0942a7f55700a053fd0c47729/spotlight.js"},

  // experimental (rawgithub.com, depends, css)
  {
    name:"chardin.js", 
    depends:"jQuery",
    url:"https://rawgithub.com/heelhook/chardin.js/master/chardinjs.js",
    css:"https://rawgithub.com/heelhook/chardin.js/master/chardinjs.css"
  }
];

var _scripts;
var _handler = new MessageHandler();

function MessageHandler() {
  this.selectedScript = {};
  this.port = {};
  this.handleMessage = function(request, sender, send_response) {
    switch(request.type) {
      case 'REQ_SCRIPT_LIST':
        console.log('msg type : ' + request.type);
        if (_scripts)
          send_response({type:request.type, listArray: _scripts});
        else {
          chrome.storage.local.get(null, function(data) {
            _scripts = data.scripts;
            send_response({type:request.type, listArray: _scripts});
          });
        }
        return true;
      case 'INJECTED':
        console.dir(sender.tab.id + ' script injected');
        console.dir(_handler.port);
        if (_handler.port[sender.tab.id] === undefined) break;
        _handler.port[sender.tab.id].postMessage(request);
        break;
      case 'INJECT_LIST':
        _handler.selectedScript[request.tab] = request.data;
        break;
      case 'REQ_SELECTED_LIST':
        if (Object.keys(_handler.selectedScript).length === 0) {
          send_response({type:request.type, listArray:[]});
          break;
        }
        var script = _handler.selectedScript[sender.tab.id];
        if (script !== 'undefined')
          send_response({type:request.type, listArray:script});
        break;
      case 'ADD_LIST':
        if (request.name && request.url) {
          var data = {};
          data.name = request.name;
          data.url  = request.url;
          data.uid  = hex_md5(data.name + data.url);
          if (_scripts.every(hasScript(data.uid))) {
            _scripts.push(data);
            storeScriptData(_scripts);
          } else
            send_response({type:request.type, status:'error'});
        }
        break;
      case 'REMOVE_LIST':
        break;
    }
  }
}

function hasScript(uid) {
  return function(item) {
    return (item.uid !== uid);
  };
};

function storeScriptData(data) {
  chrome.storage.local.set({'scripts':data}, function() {
    console.log('stored : ' + data.length);
  });
}

chrome.extension.onConnect.addListener(function(port) {
  if (port.name !== 'DEVTOOLS-PORT') return;

  chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
    _handler.port[tabs[0].id] = port;
  });
  port.onDisconnect.addListener(function(e) {
    for (var key in _handler.port) {
      if(_handler.port[key].portId_ === port.portId_)
        delete _handler.port[key];
    }
    console.dir(_handler.port);
  });
});

chrome.extension.onMessage.addListener(_handler.handleMessage);
chrome.runtime.onInstalled.addListener(function(detail) {
  console.log(detail.reason);
  switch(detail.reason) {
    case 'install':
      // first install, persists default script to storage.
      storeScriptData(updateMD5(defaultScripts));
      break;
    case 'update':
      console.log('extension updated');
      chrome.storage.local.get(null, function(data) {
        _scripts = updateMD5(data.scripts);
        console.dir(data);
      });
      break;
  }
});

function updateMD5(data) {
  data.map(function(item) {
    if (!item.uid)
      item.uid = hex_md5(item.name + item.url);
  });
  return data;
}

chrome.storage.onChanged.addListener(function(changes, areaName) {
  _scripts = changes.scripts.newValue;
  console.dir(_scripts);
  console.log(areaName + ' storage changed');
  chrome.extension.sendMessage({type:'DATA_CHANGED'});
});
