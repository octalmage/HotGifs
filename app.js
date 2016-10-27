var gui = require("nw.gui");
var win = gui.Window.get();
var app_version = gui.App.manifest.version;

var ua = require("universal-analytics");
var visitor = ua("UA-67011723-1");

var AutoLaunch = require("auto-launch");

var runatstartup = new AutoLaunch(
{
	name: "Hot Gifs",
	isHidden: "false"
});

var config = require("./config.json");

//Load user settings.
var Configstore = require("configstore");
var pkg = require("./package.json");
var settings = new Configstore(pkg.name, {"opt-out": false, "check-for-updates": true, "nsfw": true});

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
	icon: "assets/img/tray.png",
	iconsAreTemplates: false
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
	label: "Settings",
	click: settingsClicked
}));

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

		if (!settings.get('opt-out')) visitor.event("User interaction", "Window Open").send();
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
	if (settings.get('check-for-updates'))
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

			if (!settings.get('opt-out')) visitor.event("User interaction", "Skip").send();
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
	var keyword = $("#s").val();

	//Time Giphy response.
	var start = new Date().getTime();

	$("#i").attr("src", "assets/img/load.gif");
	$("#scene").show();

	var url = translate_endpoint + "/" + api_version + "/gifs/translate?s=" + encodeURIComponent(keyword) + "&api_key=" + config.key;

	if ( !settings.get('nsfw') ) {
		url += '&rating=pg-13';
	}

	$.ajax(
	{
		type: "GET",
		url: url
	}).done(function(res)
	{
		var end = new Date().getTime();
		var time = end - start;
		if (!settings.get('opt-out')) visitor.timing("User interaction", "Time to return Giphy results", time).send();

		//If results are found.
		if (typeof res.data.images != "undefined")
		{
			clipboard.set(res.data.images.original.url, "text");
			if (showing)
			{
				win.height = 270;
				$("#i").attr("src", res.data.images.downsized_medium.url);
				if (!settings.get('opt-out')) visitor.event("User interaction", "Preview").send();
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
			if (!settings.get('opt-out')) visitor.event("User interaction", "No Results", keyword).send();
		}
	});
	if (!settings.get('opt-out')) visitor.event("User interaction", "Search", keyword).send();
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

function settingsClicked()
{
	var dialog = gui.Window.open('assets/view/settings.html',
	{
		width: 300,
		height: 100,
		toolbar: false
	});

	dialog.on("loaded", function()
	{
		// Load settings.
		for (var x in settings.all)
		{
			dialog.window.$('input[name="' + x +'"]').prop('checked', settings.all[x]);
		}

		// On submit, save the settings.
		dialog.window.$("form").on("submit", function(event)
		{
			event.preventDefault();
			dialog.window.$('input:checkbox').map(function()
			{
				 settings.set(this.name, this.checked ? true : false);
			});
			dialog.close();
		});
	});
}
