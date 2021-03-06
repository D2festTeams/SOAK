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
  // {
  //   name:"chardin.js", 
  //   depends:"jQuery",
  //   url:"https://rawgithub.com/heelhook/chardin.js/master/chardinjs.js",
  //   css:"https://rawgithub.com/heelhook/chardin.js/master/chardinjs.css"
  // }
];

var _scripts;
var _handler = new MessageHandler();

function MessageHandler() {
  this.selectedScript = {};
  this.port = {};
  this.handleMessage = function(request, sender, send_response) {
    switch(request.type) {
      case 'REQ_SCRIPT_LIST':
        var selected;
        var tabID = request.tabID;
        var tabURL= request.tabURL;
        if (_handler.selectedScript[tabID]) {
          selected = _handler.selectedScript[tabID][tabURL];
        }
        console.dir(_scripts);
        console.log('msg type : ' + request.type);
        if (_scripts)
          send_response({type:request.type, listArray: addCheckedProp(_scripts, selected)});
        else {
          chrome.storage.local.get(null, function(data) {
            _scripts = data.scripts;
            send_response({type:request.type, listArray: addCheckedProp(_scripts, selected)});
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
        var tabID  = request.tabID;
        var tabURL = request.tabURL;
        if (!_handler.selectedScript[tabID]) _handler.selectedScript[tabID] = {};
        _handler.selectedScript[tabID][tabURL] = request.data;
        break;
      case 'REQ_SELECTED_LIST':
        if (!sender.tab) {
          send_response({type:request.type, listArray:[]});
          break;
        }
        var selected = _handler.selectedScript[sender.tab.id];
        if (Object.keys(_handler.selectedScript).length === 0 ||
           !selected ||
           !selected[sender.tab.url]) {
          send_response({type:request.type, listArray:[]});
          break;
        }
        var UIDs = selected[sender.tab.url];
        send_response({type:request.type, listArray:getMatchedScript(UIDs)});
        break;
      case 'ADD_LIST':
        if (request.name && request.url) {
          var data = {};
          data.name = request.name;
          data.url  = request.url;
          data.uid  = hex_md5(data.name + data.url);
          if (_scripts.every(uidFilter(data.uid))) {
            _scripts.push(data);
            storeScriptData(_scripts);
            send_response({type:request.type, status:'complete'});
          } else
            send_response({type:request.type, status:'error'});
        } else
          send_response({type:request.type, status:'error'});
        break;
      case 'REMOVE_LIST':
        var list = request.listArray;
        if (!list.length) {
          send_response({type:request.type, status:'error'});
          break;
        }
        storeScriptData(_scripts.filter(uidFilter(list)));
        send_response({type:request.type, status:'complete'});
        break;
    }
  }
}

function addCheckedProp(scriptInfo, selected) {
  if (!selected) {
    for (var i = 0 ; i < scriptInfo.length ; i++) {
      scriptInfo[i].checked = false;
    }
    return scriptInfo;
  }

  var result = scriptInfo.slice(0); 
  result.map(function(item) {
    for (var i = 0 ; i < selected.length ; i++) {
      if (item.uid === selected[i]) {
        item.checked = true;
        return;
      } else 
        item.checked = false;
    }
  });
  return result;
}

function getMatchedScript(uids) {
  return _scripts.filter(function(item) {
    for(var i = 0 ; i < uids.length ; i++) {
      if (item.uid === uids[i])
        return item;
    }
  });
}

function uidFilter(uid) {
  if (Array.isArray(uid)) {
    return function(item) {
      for (var i = 0 ; i < uid.length ; i++) {
        if (item.uid !== uid[i])
          continue;
        else
          return false;
      }
      return true;
    }
  } else {
    return function(item) {
      return (item.uid !== uid);
    }
  }
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
