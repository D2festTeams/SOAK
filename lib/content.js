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

chrome.extension.onMessage.addListener(function(msg) {
  if (msg.type === 'SCRIPT_SELECTED') {
    console.log('selected : ' + msg.data.name);
    inject(msg.data);
  }
});
