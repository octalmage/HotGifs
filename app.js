var gui = require("nw.gui");
var win = gui.Window.get();
var app_version = gui.App.manifest.version;

var AutoLaunch = require("auto-launch");

var runatstartup = new AutoLaunch(
{
    name: "Hot Gifs",
	isHidden: "false"
});

var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var keydown = 0;
var showing = 0;

var previewtext = "Hold enter to preview.";
var skiptext = "Press tab to skip.";

var startup;

if (process.platform === "darwin")
{
	var nativeMenuBar = new gui.Menu(
	{
		type: "menubar"
	});
	nativeMenuBar.createMacBuiltin("Hot Gifs");
	win.menu = nativeMenuBar;
}

//Create tray icon.
var tray = new gui.Tray(
{
	icon: "tray.png"
});

//Give it a menu.
var menu = new gui.Menu();
menu.append(new gui.MenuItem(
{
	label: "Hot Gifs"
}));
menu.append(new gui.MenuItem(
{
	type: "separator"
}));
menu.append(new gui.MenuItem(
{
	label: "v" + app_version
}));

//Run at startup.
if (process.platform === "darwin")
{
	startup = new gui.MenuItem(
	{
		label: "Run at startup?",
		type: "checkbox",
		click: startupClicked
	});
	menu.append(startup);
}

menu.append(new gui.MenuItem(
{
	type: "separator"
}));
menu.append(new gui.MenuItem(
{
	label: "Exit",
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

var translate_endpoint = "http://api.giphy.com";
var api_version = "v1";

//Settings
var shouldcheckforupdate = 1;

//Hotkey Stuff
var option = {
	key: "Ctrl+Alt+G",
	active: function()
	{
		showing = 1;
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

//Startup check.
runatstartup.isEnabled(function(found)
{
	if (found)
	{
		startup.checked = true;
	}
});

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

	$("#s").keydown(function(e)
	{
		//If the instruction text isn't showing, and it's the preview instructions, show it.
		if (!instructionsshowing() && $("#instructions").text() == previewtext)
			$("#instructions").fadeIn();
		
		//Tab to skip gif.
		if (e.keyCode == 9 && keydown)
		{
			//Hide skip instructions if they're currently showing.
			if (instructionsshowing())
				$("#instructions").fadeOut();
				
			e.preventDefault();
			search();
			return;
		}
		
		//Enter is currently held down.
		if (keydown) return;
			
		//Search if enter is pressed down.
		if (e.keyCode == 13)
		{
			//Show skip instructions.
			$("#instructions").fadeOut(null, function()
			{
				$("#instructions").text(skiptext);
				$("#instructions").fadeIn();
			});
			
			keydown = 1;
			search();
		}
	});
	
	$("#s").keyup(function(e)
	{
		//Hide window if enter is released.
		if (e.keyCode == 13)
		{
			closeGUI();
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
			closeGUI();
		}
	});
});

function search()
{
	keyword = $("#s").val();
	$("#i").attr("src", "");
	$("#scene").show();
	url = translate_endpoint + "/" + api_version + "/gifs/translate?s=" + encodeURIComponent(keyword) + "&api_key=" + config.key;
	console.log(url);
	$.ajax(
	{
		type: "GET",
		url: url
	}).done(function(res)
	{
		//If results are found. 
		if (typeof res.data.images != "undefined")
		{
			clipboard.set(res.data.images.original.url, "text");
			if (showing)
			{
				win.height = 270;
				$("#i").attr("src", res.data.images.original.url);	
			}
		}
		else
		{
			clipboard.set("No Results", "text");
			if (showing)
			{
				$("#instructions").fadeOut(null, function()
				{
					$("#instructions").text("No Results.");
					$("#instructions").fadeIn();
				});
			}
		}
	});

}

function closeGUI()
{
	keydown = 0;
	showing = 0;
	win.height = 60;
	$("#s").val("");
	$("#scene").hide();
	$("#i").attr("src", "");
	$("#instructions").stop().hide().text(previewtext);
	win.hide();
}

function instructionsshowing()
{
	return $("#instructions").css("display") != "none";
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
			alert("Update available! \nInstalled version: " + app_version + ".\nLatest version: " + current_version + ".");
			gui.Shell.openExternal("https://github.com/octalmage/HotGifs/releases/latest/");
		}
	});
}

function startupClicked()
{
	if (startup.checked)
	{
		runatstartup.enable();
	}
	else
	{
		runatstartup.disable();
	}
}
