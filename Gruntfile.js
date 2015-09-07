module.exports = function(grunt)
{

	grunt.initConfig(
	{
		pkg: grunt.file.readJSON("package.json"),
		jshint:
		{
			files: ["app.js", "Gruntfile.js"],
			options:
			{
				globals:
				{
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		jsbeautifier:
		{
			files: ["app.js", "Gruntfile.js"],
			options:
			{
				js:
				{
					braceStyle: "expand",
					indentWithTabs: true,
					indentSize: 1,
					maxPreserveNewlines: 2
				}
			}
		},
		nodewebkit:
		{
			options:
			{
				platforms: ["win32", "osx64", "linux32"],
				version: "0.12.3",
				buildDir: "./build",
				macIcns: "./logo.icns"
			},
			src: ["index.html", "package.json", "app.js", "load.gif", "tray.png", "g.png", "config.json", "node_modules/auto-launch/**", "node_modules/universal-analytics/**"]
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks("grunt-node-webkit-builder");
	grunt.loadNpmTasks("grunt-contrib-compress");

	grunt.registerTask("test", ["jshint"]);
	grunt.registerTask("clean", ["jsbeautifier"]);
	grunt.registerTask("build", ["nodewebkit"]);
	grunt.registerTask("default", ["jshint"]);

};