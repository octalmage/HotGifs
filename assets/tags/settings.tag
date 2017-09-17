<settings>
	<form id="settings" onsubmit={ submit }>
		<virtual each={ value, name in settings }>
			<input type="checkbox" name={ name } checked={ value } onclick={ parent.toggle }> { parent.opts.labels[name] } <br>
		</virtual>
		<input type="submit" value="Save">
	</form>

	<script>
	this.settings = opts.settings;

		submit(e) {
			e.preventDefault();
			// this.parent.trigger('submit', {test: 'test'});
			opts.update(this.settings);
		}

		toggle(e) {
			const item = e.item;
			this.settings[item.name] = !item.value;
		}
	</script>

	<style scoped>
		:scope {
			color: #FFFFFF;
			background-color: #FF69B4;
		}
	</style>

</settings>
