function inject(scriptInfo) {
  // we support only 1-DEPTH dependency
  if (scriptInfo.depends) {
    var dep = document.createElement('script');
    dep.setAttribute('src', scriptInfo.depends);
    document.head.appendChild(dep);
  }

  if (scriptInfo.css) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', scriptInfo.css);
    document.head.appendChild(link);
  }

  var tag = document.createElement('script');
  tag.setAttribute('src', scriptInfo.url);
  document.head.appendChild(tag);

  chrome.extension.sendMessage({type:'INJECTED'});
}

// !EXPERIMENTAL! console interface (minified from console.js)
var consoleInterface = document.createElement('script');
consoleInterface.innerHTML = "window.$oak=function(request){switch(request){case undefined:case'':case'hello':console.log('%cwelcome, this is', 'color:blue');console.log(' _______ _______ _______ ___  __ ');console.log('|     __|       |   _   |   |/  |');console.log('|__     |   +   |       |      <  _');console.log('|_______|_______|___|___|___|\\\\__||_|');break;default:document.head.dispatchEvent(new CustomEvent('soak-console', {'detail':request}));break;}}";
document.head.addEventListener('soak-console', function(e) {
  console.log(e.detail);
  // chrome.extension.sendMessage();
});
document.head.appendChild(consoleInterface);

chrome.extension.onMessage.addListener(function(msg) {
  if (msg.type === 'SCRIPT_SELECTED') {
    console.log('selected : ' + msg.data.name);
    inject(msg.data);
  }
});
