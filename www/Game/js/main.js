var Spacescape = Spacescape || {}; 
var phealth = 100;
var ehealth = 100;
var bdamage = 50;
var nlives = 4;
Spacescape.Gamestate = {

	init: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
	},
	preload: function() {
		this.load.image('player','assets/images/playershiptest.png');
		this.load.image('background', 'assets/images/verticalbak.png');
		this.load.image('enemygreen', 'assets/images/enemygreen.png');
		this.load.image('bullet', 'assets/images/bulletplayer.png');
	},
	create: function(){
		this.background = this.game.add.sprite(0,0,'background');
		this.player = this.game.add.sprite(this.game.world.centerX,550,'player');
	},
	update: function(){

	},

};
//init phaser framework
Spacescape.game = new Phaser.Game(360,640, Phaser.AUTO);
Spacescape.game.state.add('Gamestate', Spacescape.Gamestate);
Spacescape.game.state.start('Gamestate');