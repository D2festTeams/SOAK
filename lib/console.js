// experimental console interface
window.$oak = function(request) {
  switch(request) {
    case undefined:
    case'':
    case'hello':
      console.log('welcome soak');
      console.log('%cwelcome, this is', 'color:blue');
      console.log(' _______ _______ _______ ___  __ ');
      console.log('|     __|       |   _   |   |/  |');
      console.log('|__     |   +   |       |      <  _');
      console.log('|_______|_______|___|___|___|\\\\__||_|');
      break;
    default:
      document.head.dispatchEvent(new CustomEvent('soak-console', {'detail':request}));
      break;
  }
}
