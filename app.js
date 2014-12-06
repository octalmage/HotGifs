var gui = require('nw.gui');
var win = gui.Window.get();

var nativeMenuBar = new gui.Menu({ type: "menubar" });
nativeMenuBar.createMacBuiltin("Hot Gif");
win.menu = nativeMenuBar;

var clipboard = gui.Clipboard.get();

//win.showDevTools();


var api_key="dc6zaTOxFJmzC";
var translate_endpoint="http://api.giphy.com";
var api_version="v1";

//Hotkey Stuff
var option = {
  key : "Ctrl+Alt+G",
  active : function() {
  	win.show(); 
    win.focus(); 
    $("#s").focus();
  },
  failed : function(msg) {
    console.log(msg);
  }
};

var shortcut = new gui.Shortcut(option);


gui.App.registerGlobalHotKey(shortcut);


$(document).on("ready", function()
{
	$("#search").on("click", function()
	{
		search();
	});
	$("#s").keyup(function (e) 
	{
    	if (e.keyCode == 13) 
    	{
        	search();
    	}
	});
});

function search()
{
		keyword=$("#s").val();
		$("#s").val("");
		win.hide();
		url=translate_endpoint+"/"+api_version+"/gifs/translate?s=" + keyword + "&api_key=" + api_key;

		$.ajax({type: "GET",url: url }).done(function(res) 
  		{
    		clipboard.set(res.data.images.original.url, 'text');
  		});

}