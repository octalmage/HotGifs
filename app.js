var gui = require('nw.gui');
var win = gui.Window.get();
var app_version = gui.App.manifest.version;

if (process.platform === "darwin")
{
	var nativeMenuBar = new gui.Menu(
	{
		type: "menubar"
	});
	nativeMenuBar.createMacBuiltin("Hot Gifs");
	win.menu = nativeMenuBar;
}

// Create a tray text
var tray = new gui.Tray(
{
	title: 'Hot Gifs'
});

// Give it a menu.
var menu = new gui.Menu();
menu.append(new gui.MenuItem(
{
	label: 'v' + app_version
}));
menu.append(new gui.MenuItem(
{
	type: 'separator'
}));
menu.append(new gui.MenuItem(
{
	label: 'Exit',
	click: function()
	{
		gui.App.quit();
	},
}));
tray.menu = menu;

//Get clipboard reference.
var clipboard = gui.Clipboard.get();

//Uncomment to show dev tools.
//win.showDevTools();

var api_key = "dc6zaTOxFJmzC";
var translate_endpoint = "http://api.giphy.com";
var api_version = "v1";

//Settings
var shouldcheckforupdate = 1;

//Hotkey Stuff
var option = {
	key: "Ctrl+Alt+G",
	active: function()
	{
		win.show();

		//Workaround to focus the input after showing.
		setTimeout(function()
		{
			win.focus();
			$("#s").focus();
		}, 0);

	},
	failed: function(msg)
	{
		console.log(msg);
	}
};

var shortcut = new gui.Shortcut(option);

gui.App.registerGlobalHotKey(shortcut);

$(document).on("ready", function()
{
	if (shouldcheckforupdate)
	{
		checkforupdate();
	}

	$("#search").on("click", function()
	{
		search();
	});

	$("#s").keyup(function(e)
	{
		if (e.keyCode == 13)
		{
			search();
		}
	});

	//Double click to center GUI.
	$(document).on("dblclick", function centerwindow()
	{
		win.setPosition("center");
	});

	$(document).keyup(function(e)
	{
		//Close the dialog if esc is pressed.
		if (e.keyCode == 27)
		{
			$("#s").val("");
			win.hide();
		}
	});

});

function search()
{
	win.hide();
	keyword = $("#s").val();
	$("#s").val("");
	url = translate_endpoint + "/" + api_version + "/gifs/translate?s=" + keyword + "&api_key=" + api_key;
	$.ajax(
	{
		type: "GET",
		url: url
	}).done(function(res)
	{
		try
		{
			clipboard.set(res.data.images.original.url, 'text');
		}
		catch (error)
		{
			clipboard.set("No Results", 'text');
		}
	});

}

function checkforupdate()
{
	$.ajax(
	{
		type: "GET",
		url: "https://api.github.com/repos/octalmage/hotgifs/releases"
	}).done(function(releases)
	{
		current_version = releases[0].name.substr(1, releases[0].name.length);
		if (current_version != app_version)
		{
			alert("Update available! \nInstalled version: " + app_version + ".\nLatest version: " + current_version + ".")
			gui.Shell.openExternal("https://github.com/octalmage/HotGifs/releases");
		}
	});
}
