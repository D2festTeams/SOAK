var _scripts,
    _elemArray = [],
    _httpRegex = /^(http\:\/\/|https\:\/\/)/;

// function addClass( element, className )
//   element.setAttribute('class', element.getAttribute('class') + ' ' +  className);
// }

// function removeClass( element, className ){
//   element.setAttribute('class', element.getAttribute('class').replace(className, '').trim());
// }

function toggle( bool ){
  return bool ? false : true;
}

function initSwitch() {
  var lis = getElem('libraryList').children;
  for(var i = 0 ; i < lis.length ; i++) {
    var el = lis[i];
    el.slider = el.slider || getElem('p', el)[0]; 
    el.status = false;
    removeClass(el.slider, 'selected');
  }
}

function getElem( query, obj ){
  if (obj) return obj.getElementsByTagName(query);
  return document.getElementById(query);
}

function tabCallback(scriptInfo) {
  return function(tabs) {
    // save selected script info to "background.js"
    chrome.extension.sendMessage({type:'INJECT_LIST', data:scriptInfo, tab:tabs[0].id});
    // request reload current page to "content.js"
    chrome.tabs.sendMessage(tabs[0].id, {type:'INJECT_LIST'});
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

function checkLibraryList() {
  var returnArray = [],
      i = 0,
      l = _elemArray.length;
  for (; i < l; i++ ){
    if(_elemArray[i].status) returnArray.push(_scripts[i]);
  }
  return returnArray;
}

function callBackground( scriptInfo ){
  chrome.tabs.query({active:true, currentWindow:true}, tabCallback(scriptInfo));
}

function updateScriptList(data) {
  var ul = document.getElementById('libraryList');
  // TODO: we don't need to clear every child(compare & remove)
  while (ul.firstChild) ul.removeChild(ul.firstChild);

  for(var i = 0 ; i < data.length ; i++) {
    var li = document.createElement('li');
    var p  = document.createElement('p');
    var p2 = document.createElement('p');
    p.classList.add('slideButton');
    p2.classList.add('icon-checkbox');
    li.appendChild(p);
    li.appendChild(p2);
    li.setAttribute('data-libName', data[i].name);
    li.setAttribute('data-index', i);
    li.addEventListener('click', handleEvent);
    ul.appendChild(_elemArray[i] = li);
    _elemArray[i].slider = p;
    _elemArray[i].checkbox = p2;
    _elemArray[i].indexNumber = i;
  }
  autoSwitchUpdate();
}


function handleEvent(e) {
  slideSwitch(this);
  console.log('click on : ' + e.currentTarget.dataset.index);
  var selected = e.currentTarget.dataset.index;
  // var scriptInfo = convertDepends(_scripts[selected]);
  var scriptInfo = checkLibraryList();
  scriptInfo.filter(function(item) {
    return convertDepends(item);
  });
  // check depends and convert to url
  if(autoSwitch.status) callBackground(scriptInfo);
}


function slideSwitch( element ){
  element.slider = element.slider || getElem('p', element)[0];
  element.checkbox = element.checkbox || getElem('p', element)[1];
  if (element.status = toggle(element.status)){
    element.slider.classList.add('selected');
    if(element.checkbox){
      element.checkbox.className = 'icon-checkedbox listCheckboxes';
    }else{
      autoSwitchUpdate(); 
    }
    return true;
  }else{
    element.slider.classList.remove('selected');
    if(element.checkbox){
      element.checkbox.className = 'icon-checkbox listCheckboxes';
    }else{
      autoSwitchUpdate();
    }
    return false;
  }
}

function autoSwitchOFF(){
  autoSwitch.status = true;
  slideSwitch(autoSwitch);
}

function autoSwitchUpdate(){
  var i = 0, 
      l = _elemArray.length;
  for(; i < l; ++i){
    var elem = _elemArray[i];
    if(autoSwitch.status){
      elem.checkbox.style.display = 'none';
      elem.slider.style.display = 'inline-block';
    }else{
      elem.slider.style.display = 'none';
      elem.checkbox.style.display = 'inline-block';
    }
  }
}


function handleResponse(res) {
  console.log('received : ' + res.type);

  switch(res.type) {
    case 'REQ_SCRIPT_LIST':
      // TODO: merge scripts & res.scripts
      _scripts = res.listArray;
      updateScriptList(_scripts);
      break;
    case 'DATA_CHANGED':
      console.log('data changed');
      requestScriptList();
      break;
    case 'ADD_LIST':
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
  var input = getElem('soak-query'),
      name  = getElem('soak-name'),
      libraryList = getElem('libraryList'),
      addButton = getElem('addButton'),
      removeButton = getElem('removeButton'),
      injectButton = getElem('injectButton'),
      autoSwitch = getElem('autoSwitch');
      autoSwitch.myButton = getElem('p', autoSwitch)[0];
      btn   = document.getElementsByClassName('soak-btn')[0];
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


  addButton.addEventListener('click', function(){
    // do something
  });

  removeButton.addEventListener('click', function(){
    if(confirm(' Delete selected libraries ?')){} // do something
  });

  injectButton.addEventListener('click', function(){
    callBackground(checkLibraryList());
  });

  autoSwitch.addEventListener('click', function(){
    if(slideSwitch(this)){}; // do something
  });

  btn.addEventListener('click', function(e) {
    // TODO: add script
    if (input.value && name.value) {
      var data = {};
      data.name = name.value;
      data.url  = input.value;
      chrome.extension.sendMessage({type:'ADD_LIST', data:data}, handleResponse);
      input.value = '';
      name.value  = '';
      toggleQuery(false);
    }
  });
}

function onLoad() {
  // FIXME: we can put every function in this file into this callback.
  chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
    var result = _httpRegex.exec(tabs[0].url);
    if (result) {
      initPopup();
      requestScriptList();
      chrome.extension.onMessage.addListener(handleResponse);
    } else {
      // var area    = document.getElementsByClassName('soak-area')[0];
      var invalid = document.getElementsByClassName('invalid-url')[0];
      // area   .style.display = 'none';
      invalid.style.display = 'block';
    }
  });
}

window.onload = onLoad;
