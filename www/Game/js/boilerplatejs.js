var game = new Phaser.Game(640, 360, Phaser.AUTO);

var GameState = {

	preload: function(){
		//load all assets here
	};
	create: function(){
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		//everything goes after these lines
		//this.background.scale.setTo(1,1); un-comment as needed
	};
	update: function(){

	};
};

game.state.add('GameState', GameState);
game.state.start('GameState');