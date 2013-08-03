function inject(data) {
  var tag = document.createElement('script');
  tag.src = data.url;
  document.head.appendChild(tag);
  chrome.extension.sendMessage({type:'INJECTED'});
}

chrome.extension.onMessage.addListener(function(msg) {
  if (msg.type === 'SCRIPT_SELECTED') {
    console.log('selected : ' + msg.data.name);
    inject(msg.data);
  }
});
