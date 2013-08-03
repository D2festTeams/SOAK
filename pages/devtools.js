function onLoaded() {
  var port = chrome.extension.connect({name:"DEVTOOLS-PORT"});
  port.onMessage.addListener(function(msg) {
    console.log('received : ' + msg.type);
    // find injected script tag & focus in devtools
    chrome.devtools.inspectedWindow.eval(
      "inspect($$('head script:last-child')[0])",
      function(result, isException) { }
    );
  });

  // for console interface
  chrome.experimental.devtools.console.onMessageAdded.addListener(function(msg) {
    console.log('console catched - ' + msg);
  });
}

window.onload = onLoaded;
