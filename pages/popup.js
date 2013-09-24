var _scripts,
    _scriptQue = [],
    _elemArray = [],
    _httpRegex = /^(http\:\/\/|https\:\/\/)/;

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
    var tab = tabs[0];
    var msg = {};
    msg.type    = 'INJECT_LIST';
    msg.data    = scriptInfo;
    msg.tabID   = tab.id;
    msg.tabURL  = tab.url;
    msg.UIDList = getUIDList(scriptInfo);

    // save selected script info to "background.js"
    chrome.extension.sendMessage(msg);
    // request reload current page to "content.js"
    chrome.tabs.sendMessage(tab.id, {type:'INJECT_LIST'});
  }
}

function getUIDList(scriptInfo) {
  var result = [];
  scriptInfo.map(function(item) {
    result.push(item.uid);
  });
  return result;
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
    if(_elemArray[i].status) returnArray.push(_elemArray[i].dataset.uid);
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
    li.setAttribute('data-uid', data[i].uid);
    li.addEventListener('click', handleEvent);
    ul.appendChild(_elemArray[i] = li);
    _elemArray[i].slider = p;
    _elemArray[i].checkbox = p2;
    // _elemArray[i].indexNumber = i;
    // console.log(data[i]);
  }
  autoSwitchUpdate();
}


function handleEvent(e) {
  slideSwitch(this);
  // console.log('click on : ' + e.currentTarget.dataset.index);
  var selected = e.currentTarget.dataset.uid;
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
      searchBox.style.display = 'none';
      editBox.style.display = 'none';
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
      console.table(_scripts);
      updateScriptList(_scripts);
      // chrome.extension.sendMessage({type:'REQ_SELECTED_LIST'}, handleResponse);
      break;
    case 'REQ_SELECTED_LIST':
      console.dir(res);
      break;
    case 'DATA_CHANGED':
      console.log('data changed');
      requestScriptList();
      break;
    case 'INJECTED':
      console.log('status : ' + res.status);
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
  var searchBox = getElem('soak-query'),
      // name  = getElem('soak-name'),
      libraryList = getElem('libraryList'),
      searchBox = getElem('searchBox'),
      editBox = getElem('editBox'),
      addButton = getElem('addButton'),
      removeButton = getElem('removeButton'),
      injectButton = getElem('injectButton'),
      searchButton = getElem('searchButton'),
      editButton = getElem('editButton'),
      autoSwitch = getElem('autoSwitch');
      editButton.box = editBox;
      searchButton.box = searchBox;
      autoSwitch.myButton = getElem('p', autoSwitch)[0];
      // btn   = document.getElementsByClassName('soak-btn')[0];
  // var toggleQuery = function (show) {
  //   if (show) {
  //     // btn .style.display = 'block';
  //     // name.style.display = 'block';
  //   } else {
  //     // btn .style.display = 'none';
  //     // name.style.display = 'none';
  //   }
  //}
  
  searchBox.addEventListener('keyup', function(e) {
    var value = e.target.value;
    if (e.keyCode === 13 && value) {
      // TODO: search or add url
      return;
    }
    if (value.length < 5) {
      // toggleQuery(false);
      filterData(value);
    } else {
      var result = _httpRegex.exec(value);
      // toggleQuery(result);
    }
  });


  searchButton.addEventListener('click', function(){
    toggleBoxes(this);
  });

  editButton.addEventListener('click', function(){
    toggleBoxes(this);
  });

  removeButton.addEventListener('click', function(){
    if(confirm('Remove selected libraries ?')){
      var data = {};
      data.type = "REMOVE_LIST";
      data.listArray = checkLibraryList();
      console.log(data);
      chrome.extension.sendMessage(data, handleResponse);
    }
  });

  injectButton.addEventListener('click', function(){
    callBackground(checkLibraryList());
  });

  autoSwitch.addEventListener('click', function(){
    if(slideSwitch(this)){} // do something
  });

  addButton.addEventListener('click', function(e) {
    var libName = getElem('libraryName'),
        libURL  = getElem('libraryURL'),
        libCSS  = getElem('styleURL');
    // TODO: add script
    if (libName.value && libURL.value) {
      var data = {};
      data.type = 'ADD_LIST';
      data.name = libName.value;
      data.url  = libURL.value;
      data.css = libCSS.value;
      console.log(data);
      chrome.extension.sendMessage(data, handleResponse);
      libName.value = libURL.value = libCSS.value = '';
      // name.value  = '';
      // toggleBoxes(false);
    }
  });
}

function toggleBoxes (elem) {
  if(elem.status){
    elem.box.style.display = 'none';
  }else{
    autoSwitchOFF();
    searchBox.style.display = 'none';
    editBox.style.display = 'none';
    elem.box.style.display = 'block';
  }
  window.scrollTo(0, document.body.scrollHeight);
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
      var invalid = document.getElementsByClassName('invalid-url')[0];
      invalid.style.display = 'block';
    }
  });
}

window.onload = onLoad;
