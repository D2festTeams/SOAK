var consoleInterface = "window.$oak=function(request){switch(request){case undefined:case'':case'hello':console.log('%cwelcome, this is', 'color:blue');console.log(' _______ _______ _______ ___  __ ');console.log('|     __|       |   _   |   |/  |');console.log('|__     |   +   |       |      <  _');console.log('|_______|_______|___|___|___|\\\\__||_|');break;default:document.head.dispatchEvent(new CustomEvent('soak-console', {'detail':request}));break;}}";

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
function addConsoleInterface() {
  var tag = document.createElement('script');
  tag.innerHTML = consoleInterface;
  document.head.addEventListener('soak-console', function(e) {
    console.log(e.detail);
    // chrome.extension.sendMessage();
  });
  document.head.appendChild(tag);
}

// !EXPERIMENTAL! check whether this page support "content-security-policy" header
function checkCSP() {
  var request=new XMLHttpRequest();
  request.open('HEAD',window.location,false);
  request.send(null);

  var headers = request.getAllResponseHeaders();
  var tab = headers.split("\n").map(function(h) {
    return { "key": h.split(": ")[0], "value": h.split(": ")[1] }
  }).filter(function(h) { return h.value !== undefined; });

  console.group("Request Headers");
  console.table(tab);
  console.groupEnd("Request Headers");
  var csp = tab.filter(function(item) {
    return item.key === 'Content-Security-Policy'
  });
  return csp.length !== 0;
}

chrome.extension.onMessage.addListener(function(request, sender, send_response) {
  switch(request.type) {
    case 'SCRIPT_SELECTED':
      window.location.reload();
      break;
  }
});

function onLoad() {
  chrome.extension.sendMessage({type:'REQ_SELECTED_SCRIPT'}, function(response) {
    if (response.data) {
      console.log('selected : ' + response.data.name);
      inject(response.data);
    }
  });
  addConsoleInterface();
  if (checkCSP()) {
    console.error("Shit, this page has 'Content-Security-Policy'.");
  }
}

// document.addEventListener('DOMContentLoaded', onload);
window.onload = onLoad;
