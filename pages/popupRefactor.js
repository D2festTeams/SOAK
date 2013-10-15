(function(context){
	"use strict";

	var reloadStatus = false,
		util = new Util(),
		message = new Message(),
		list = new List();
	
	// this.$ = util.$;
	context.onload = function(){
		var _httpRegex = /^(http\:\/\/|https\:\/\/)/;
		chrome.tabs.query({
			active: true,
			currentWindow: true
		},function(tabs){
			if(_httpRegex.exec(tabs[0].url)){
				list.update();
			}else{
				list.hide();
			}
		});
	}


	function Util(){
		return {
			$ : function( $query ){
				var elements = document.querySelectorAll($query);
				return elements.length > 1 ? elements : elements[0];
			}
		}
	}

	function List(){
		var repository = [],
			que = [];

		return {

			update : function(){
				message.send({
					type : '',

				});
			},

			add : function(){

			},

			remove : function(){

			},

			search : function(){

			},

			hide: function(){
				$('.invalid-url').style.display = 'block';
			}


		};
	}

	function Message(){

		return {
			send : function(obj){
				alert(obj);
			},

			handle: function(){

			}
		};

	}

})(this);