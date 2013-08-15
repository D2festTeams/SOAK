var _scripts;
var _httpRegex = /^(http\:\/\/|https\:\/\/)/;

function tabCallback(scriptInfo) {
  return function(tabs) {
    // save selected script info to "background.js"
    chrome.extension.sendMessage({type:'SCRIPT_SELECTED', data:scriptInfo, tab:tabs[0].id});
    // request reload current page to "content.js"
    chrome.tabs.sendMessage(tabs[0].id, {type:'SCRIPT_SELECTED'});
  }
}

function convertDepends(scriptInfo) {
  if (!scriptInfo.depends) return scriptInfo;

  var result = _httpRegex.exec(scriptInfo.depends);

  if (result) return scriptInfo;

  for(var s in _scripts) {
    if (_scripts[s].name === scriptInfo.depends) {
      scriptInfo.depends = _scripts[s].url;
      break;
    }
    delete scriptInfo.depends;
  }
  return scriptInfo;
}

function handleEvent(e) {
  console.log('click on : ' + e.currentTarget.dataset.index);
  var selected = e.currentTarget.dataset.index;
  var scriptInfo = convertDepends(_scripts[selected]);
  // check depends and convert to url
  chrome.tabs.query({active:true, currentWindow:true}, tabCallback(scriptInfo));
}

function updateScriptList(data) {
  var container  = document.querySelector('.container');
  // TODO: we don't need to clear every child(compare & remove)
  while (container.firstChild) container.removeChild(container.firstChild);

  for(var i = 0 ; i < data.length ; i++) {
    var div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = data[i].name;
    div.setAttribute('data-index', i);
    div.addEventListener('click', handleEvent);
    container.appendChild(div);
  }
}

function handleResponse(res) {
  console.log('received : ' + res.type);

  switch(res.type) {
    case 'REQ_SCRIPT_LIST':
      // TODO: merge scripts & res.scripts
      _scripts = res.scripts;
      updateScriptList(_scripts);
      break;
    case 'DATA_CHANGED':
      console.log('data changed');
      requestScriptList();
      break;
    case 'SCRIPT_ADDED':
      console.err('we already have this url!!!');
      break;
  }
}

function requestScriptList() {
  // send msg to background.js
  chrome.extension.sendMessage({type:'REQ_SCRIPT_LIST'}, handleResponse);
}

function filterData(query) {
  var result = _scripts.filter(function(item) {
    var q = query.toLowerCase();
    var i = item.name.toLowerCase();
    return i.indexOf(q) > -1;
  });
  updateScriptList(result);
}

function initPopup() {
  var input = document.getElementById('soak-query');
  var name  = document.getElementById('soak-name');
  var btn   = document.getElementsByClassName('soak-btn')[0];
  var toggleQuery = function (show) {
    if (show) {
      btn .style.display = 'block';
      name.style.display = 'block';
    } else {
      btn .style.display = 'none';
      name.style.display = 'none';
    }
  }

  input.addEventListener('keyup', function(e) {
    var value = e.target.value;
    if (e.keyCode === 13 && value) {
      // TODO: search or add url
      return;
    }
    if (value.length < 5) {
      toggleQuery(false);
      filterData(value);
    } else {
      var result = _httpRegex.exec(value);
      toggleQuery(result);
    }
  });
  btn.addEventListener('click', function(e) {
    // TODO: add script
    if (input.value && name.value) {
      var data = {};
      data.name = name.value;
      data.url  = input.value;
      chrome.extension.sendMessage({type:'SCRIPT_ADDED', data:data}, handleResponse);
      input.value = '';
      name.value  = '';
      toggleQuery(false);
    }
  });
}

function onLoad() {
  initPopup();
  requestScriptList();
  chrome.extension.onMessage.addListener(handleResponse);
}

window.onload = onLoad;
