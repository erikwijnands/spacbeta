
BasicGame.Preloader = function (game) {

  this.background = null;
  this.preloadBar = null;

};

BasicGame.Preloader.prototype = {

  preload: function () {

    this.stage.backgroundColor = '#000';

    this.preloadBar = this.add.sprite(this.game.width / 2 - 100, this.game.height / 2, 'preloaderBar');
    this.add.text(this.game.width / 2, this.game.height / 2 - 30, "Loading...", { font: "32px chintzy", fill: "#fff" }).anchor.setTo(0.5, 0.5);

    this.load.setPreloadSprite(this.preloadBar);

    this.load.bitmapFont('fonttitle', 'assets/fonttitle.png','assets/fonttitle.fnt');
    this.load.bitmapFont('font', 'assets/font.png','assets/font.fnt');
    this.load.image('starhor' ,'assets/starhor.png');
    this.load.image('starvert', 'assets/starvert.png');
    this.load.image('starbak', 'assets/starbaktest.png');
    this.load.image('bullet', 'assets/images/bullet5.png');
    this.load.image('enemyBullet', 'assets/enemy-bullet.png');
    this.load.spritesheet('powerup1', 'assets/powerup1.png',32,32);
    this.load.spritesheet('BossBullet', 'assets/boss-bullet.png', 15,15)
    this.load.spritesheet('enemygreen', 'assets/enemy.png', 32, 32);
    this.load.spritesheet('whiteEnemy', 'assets/shooting-enemy.png', 32, 32);
    this.load.spritesheet('enemygold', 'assets/enemygold.png', 32, 32);
    this.load.spritesheet('boss', 'assets/boss.png', 93, 75);
    this.load.spritesheet('explosion', 'assets/explosion.png', 64, 64);
    this.load.spritesheet('player', 'assets/player.png',60,40);
    this.load.spritesheet('missile', 'assets/missile.png', 11, 25);
    this.load.audio('explosion', ['assets/explosion.ogg', 'assets/explosion.wav']);
    this.load.audio('playerExplosion', ['assets/player-explosion.ogg', 'assets/player-explosion.wav']);
    this.load.audio('enemyFire', ['assets/enemy-fire.ogg', 'assets/enemy-fire.wav']);
    this.load.audio('playerFire', ['assets/player-fire.ogg', 'assets/player-fire.wav']);
    this.load.audio('powerUp', ['assets/powerup.ogg', 'assets/powerup.wav']);
    this.load.audio('song', ['assets/song.ogg', 'assets/song.mp3']);
    //this.load.audio('titleMusic', ['audio/main_menu.mp3']);
    //  + lots of other required assets here

  },

  create: function () {

    this.preloadBar.cropEnabled = false;

  },

  update: function () {

    //  You don't actually need to do this, but I find it gives a much smoother game experience.
    //  Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
    //  You can jump right into the menu if you want and still play the music, but you'll have a few
    //  seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
    //  it's best to wait for it to decode here first, then carry on.
    
    //  If you don't have any music in your game then put the game.state.start line into the create function and delete
    //  the update function completely.
    
    if (this.cache.isSoundDecoded('song'))
    {
      this.state.start('MainMenu');
    }

  }

};
