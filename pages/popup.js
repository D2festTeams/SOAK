var scripts;

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

  var result = /(http\:\/\/|https\:\/\/)/.exec(scriptInfo.depends);

  if (result) return scriptInfo;

  for(var s in scripts) {
    if (scripts[s].name === scriptInfo.depends) {
      scriptInfo.depends = scripts[s].url;
      break;
    }
    delete scriptInfo.depends;
  }
  return scriptInfo;
}

function handleEvent(e) {
  console.log('click on : ' + e.currentTarget.dataset.index);
  var selected = e.currentTarget.dataset.index;
  var scriptInfo = convertDepends(scripts[selected]);
  // check depends and convert to url
  chrome.tabs.query({active:true, currentWindow:true}, tabCallback(scriptInfo));
}

function updateScriptList() {
  var container  = document.querySelector('.container');
  // TODO: we don't need to clear every child(compare & remove)
  while (container.firstChild) container.removeChild(container.firstChild);

  for(var i = 0 ; i < scripts.length ; i++) {
    var div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = scripts[i].name;
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
      scripts = res.scripts;
      updateScriptList();
      break;
    case 'DATA_CHANGED':
      console.log('data changed');
      requestScriptList();
      break;
  }
}

function requestScriptList() {
  // send msg to background.js
  chrome.extension.sendMessage({type:'REQ_SCRIPT_LIST'}, handleResponse);
}

function onLoad() {
  requestScriptList();
  chrome.extension.onMessage.addListener(handleResponse);
}

window.onload = onLoad;
