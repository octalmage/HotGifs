var gui = require('nw.gui');
var win = gui.Window.get();

var nativeMenuBar = new gui.Menu({ type: "menubar" });
nativeMenuBar.createMacBuiltin("Hot Gifs");
win.menu = nativeMenuBar;

// Create a tray text
var tray = new gui.Tray({ title: 'Hot Gifs'});

// Give it a menu.
var menu = new gui.Menu();
menu.append(new gui.MenuItem({label: 'Exit', click: function() 
{
    gui.App.quit();
}, }));
tray.menu = menu;

//Get clipboard reference.
var clipboard = gui.Clipboard.get();

//Uncomment to show dev tools.
//win.showDevTools();


var api_key="dc6zaTOxFJmzC";
var translate_endpoint="http://api.giphy.com";
var api_version="v1";

//Hotkey Stuff
var option = {
  key : "Ctrl+Alt+G",
  active : function() {
  	win.show(); 

    //Workaround to focus the input after showing. 
    setTimeout(function()
    {
      win.focus();
      $("#s").focus();
    }, 200);

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