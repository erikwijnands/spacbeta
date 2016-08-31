var Spacescape = Spacescape || {};
Spacescape.Gamestate = {
	init: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		//this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.bulletspeed = -1000;
	},
	preload: function() {
		this.load.image('player', 'assets/images/playershiptest.png');
		this.load.image('particle', 'assets/images/bulletplayer.png');
		this.load.image('bullet5', 'assets/images/bullet5.png');
		this.load.image('enemygreen', 'assets/images/enemygreen.png');
		this.load.image('enemypurple', 'assets/images/enemypurple.png');
		this.load.image('enemyyellow', 'assets/images/enemyyellow.png');
		this.load.image('fire', 'assets/images/arrow.png');
		this.load.image('star', 'assets/images/starstest.png')
	},	
	create: function(){
		//player
		this.player = this.add.sprite(this.game.world.centerX,this.game.world.height -100, 'player');
		this.player.anchor.setTo(0.5);
		this.game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
		this.player.inputEnabled = true;
		this.player.input.enableDrag();
		//bullets
		this.bullets = [];
		this.nextShotAt = 0;
    	this.shotDelay = 100;
		//enemytest
		this.enemygreen = this.add.sprite(this.game.world.centerX, this.game.world.height - 600,'enemygreen');
		this.enemygreen.anchor.setTo(0.5);
		this.game.physics.arcade.enable(this.enemygreen);
		this.enemygreen.body.collideWorldBounds = true;

	},
	update: function(){
		if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
      	this.fire();
    	};
    	//overlaps
    	//this.game.physics.arcade.overlap(this.player, this.enemygreen, this.killplayer())
    	this.game.physics.arcade.overlap(this.bullet, this.enemygreen, this.enemyHit, null, this);
	},
	enemyHit: function (bullet, enemy) {
    	bullet.kill();
     	enemygreen.kill();
    },

	animatesprite: function(sprite,event){
		sprite.play('animate');
	},
	gameover: function() {
		//this.game.state.restart();
		this.state.start('homestate', true, false, 'GAME OVER')
	},
	fire: function() {
		if (this.nextShotAt > this.time.now) {
      		return;
    	};
    	this.nextShotAt = this.time.now + this.shotDelay;
     	var bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet5');
     	bullet.anchor.setTo(0.5, 0.5);
     	this.physics.enable(bullet, Phaser.Physics.ARCADE);
     	bullet.body.velocity.y = -500;
     	this.bullets.push(bullet);
   	}
};

Spacescape.game = new Phaser.Game(360,640, Phaser.AUTO);
Spacescape.game.state.add('Gamestate', Spacescape.Gamestate);
Spacescape.game.state.start('Gamestate');