<main ondblclick={ dblclick }>
  <input type="text" id="s" ref="input" onkeydown={ keydown } onkeyup={ keyup } autofocus="true" />
  <div id="scene" show={ showScene }>
    <img src={ img } id="i">
  </div>
  <div id="instructions" show={ showInstructions }>{ instructions }</div>
  <script>
    this.previewtext = this.instructions = 'Hold enter to preview.';
    this.skiptext = 'Press tab to skip.';
    this.img = '#';
    this.showInstructions = false;
    this.isKeyDown = false;
    this.showScene = false;

    keydown(e) {
      // If the instruction text isn't showing, and it's the preview instructions, show it.
      if (!this.showInstructions && this.instructions == this.previewtext) { this.showInstructions = true; };

      // Tab to skip gif.
      if (e.keyCode === 9 && this.isKeyDown) {
        // Hide skip instructions if they're currently showing.
        if (this.showInstructions) { this.showInstructions = false; }

        e.preventDefault();
        this.search();

        if (!opts.settings.get('opt-out')) opts.visitor.event('User interaction', 'Skip').send();
        return;
      }

      // Enter is currently held down.
      if (this.isKeyDown) return;

      // Search if enter is pressed down.
      if (e.keyCode === 13) {
        // Show skip instructions.
        this.instructions = this.skiptext;

        this.isKeyDown = true;
        this.search();
      }
    };

    keyup(e) {
      // Hide window if enter or esc is released.
      if (e.keyCode === 13 || e.keyCode === 27) {
        this.closeWindow();
      }
    }

    dblclick() {
      opts.win.center();
    }

    closeWindow() {
      this.isKeyDown = false;
      this.showInstructions = false;
      this.showScene = false;
      this.refs.input.value = '';
      this.img = '';
      this.instructions = this.previewtext;

      opts.win.setSize(500, 60);
      opts.win.hide();
    }

    search() {
      const keyword = this.refs.input.value;
      const translate_endpoint = 'http://api.giphy.com';
      const api_version = 'v1';

      // Time Giphy response.
      const start = new Date().getTime();

      this.img = 'assets/img/load.gif';
      this.showScene = true;
      url = `${translate_endpoint}/${api_version}/gifs/translate?s=${encodeURIComponent(keyword)}&api_key=${opts.config.key}`;
      fetch(url).then((res) => res.json()).then((res) => {
        const end = new Date().getTime();
        const time = end - start;
        if (!opts.settings.get('opt-out')) opts.visitor.timing('User interaction', 'Time to return Giphy results', time).send();

        // If results are found.
        if (typeof res.data.images !== 'undefined') {
          opts.clipboard.writeText(res.data.images.original.url);
          if (this.showScene) {
            opts.win.setSize(500, 270);
            this.img = res.data.images.downsized_medium.url;
            if (!opts.settings.get('opt-out')) opts.visitor.event('User interaction', 'Preview').send();
          }
        } else {
          opts.clipboard.writeText('No Results');
          if (this.showScene) {
            // TODO: Fix fadeout.
            this.instructions = 'No Results.';
          }
          if (!opts.settings.get('opt-out')) opts.visitor.event('User interaction', 'No Results', keyword).send();
        }
      });
      if (!opts.settings.get('opt-out')) opts.visitor.event('User interaction', 'Search', keyword).send();
    };
    </script>
    <style scoped>
    :scope
    {
      font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
      font-size:48px;
      color: #FFF;
      margin: 0px;
      padding: 0px;
      overflow:hidden;
      -webkit-app-region: drag;

    }
    input
    {
      border: 0;
      color: #FFF;
      background-color: #FF69B4;
      font-size:48px;
      width: 498px;
      text-align:center;
      outline: none;
      background:url(assets/img/g.png) no-repeat right bottom;
      background-size: 75px;
    }

    img
    {
      display:block;
      margin: 0 auto;
      max-height: 200px;
      max-width: 100%;
      text-align: center;
      position: relative;
      top: 50%;
      transform: translateY(-50%);
    }

    #scene
    {
      height: 200px;
      width: 100%;
    }

    #instructions
    {
      position: fixed;
      left: 0px;
      top: 45px;
      font-size: 12px;
      opacity: 0.5;
    }
    </style>
</main>
