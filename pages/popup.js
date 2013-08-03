function tabCallback(url) {
  return function(tabs) {
    scripts = handleEvent.scripts;
    chrome.tabs.sendMessage(tabs[0].id, {type:'SCRIPT_SELECTED', data:url});
  }
}

function handleEvent(scripts) {
  return function(e) {
    console.log('click on : ' + e.currentTarget.dataset.index);
    var selected = e.currentTarget.dataset.index;
    var url = scripts[selected];
    chrome.tabs.query({active:true, currentWindow:true}, tabCallback(url));
  }
}

function handleResponse(res) {
  // TODO: update popup list
  // handleEvent.scripts = res.scripts;
  console.log('received : ' + res.type);
  console.log('received : ' + res.scripts);
  
  var divs = document.querySelectorAll('.item');
  for(var i = 0 ; i < divs.length ; i++)
    divs[i].addEventListener('click', handleEvent(res.scripts));
}

function handleContentLoaded() {
  // send msg to background.js
  chrome.extension.sendMessage({type:'REQ_SCRIPT_LIST'}, handleResponse);
}

document.addEventListener('DOMContentLoaded', handleContentLoaded);
