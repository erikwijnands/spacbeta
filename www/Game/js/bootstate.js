var bootstate = {
	init: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
	},
	preload: function() {
		//load logo,progress bar, etc
	},
	create: function() {
		this.game.stage.backgroundColor = '#000';
		this.state.start('preloadstate');
	},
};