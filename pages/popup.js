function tabCallback(url) {
  return function(tabs) {
    scripts = handleEvent.scripts;
    chrome.tabs.sendMessage(tabs[0].id, {type:'SCRIPT_SELECTED', data:url});
  }
}

// FIXME: we don't need to create this handler....
function handleEvent(scripts) {
  return function(e) {
    console.log('click on : ' + e.currentTarget.dataset.index);
    var selected = e.currentTarget.dataset.index;
    var url = scripts[selected];
    chrome.tabs.query({active:true, currentWindow:true}, tabCallback(url));
  }
}

function handleResponse(res) {
  console.log('received : ' + res.type);

  var container  = document.querySelector('.container');
  var firstChild = container.firstChild;
  // TODO: we don't need to clear every child(compare & remove)
  while (firstChild) container.removeChild(firstChild);

  for(var i = 0 ; i < res.scripts.length ; i++) {
    var div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = res.scripts[i].name;
    div.setAttribute('data-index', i);
    div.addEventListener('click', handleEvent(res.scripts));
    container.appendChild(div);
  }
}

function handleContentLoaded() {
  // send msg to background.js
  chrome.extension.sendMessage({type:'REQ_SCRIPT_LIST'}, handleResponse);
}

document.addEventListener('DOMContentLoaded', handleContentLoaded);
