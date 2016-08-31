
BasicGame.MainMenu = function (game) {

 
  this.playButton = null;

};

BasicGame.MainMenu.prototype = {
  preload: function() {
   
  },
  create: function () {
    this.music = this.game.add.audio('song');
    this.music.play();
    this.music.loopFull();
    this.bak = this.add.tileSprite(0.5, 0.5, this.game.width, this.game.height, 'starbak');
    this.bak.autoScroll(0,40);
    this.title = this.add.bitmapText(this.game.width / 2, this.game.height / 2 - 150,'fonttitle', "SpacescapE", 80);
    this.title.anchor.setTo(0.5, 0.5);
    this.title.alpha = 0.1;
    this.game.add.tween(this.title).to( { alpha: 1 }, 2000, "Linear", true);
    this.game.time.events.add(Phaser.Timer.SECOND * 3, this.fontime, this);
  },
  update: function () {
    if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
      this.startGame();
    };
  },
  startGame: function (pointer) {
    if (this.music.isPlaying == true) {
        this.music.stop();
    };    
    this.state.start('Game');
  },
  fontime: function() {
    var tweenA;
    var tweenB;
    this.instructions = this.add.bitmapText(this.game.width/2, this.game.height/2+100,'font',"Tap the ship to move around and shoot", 20);
    this.instructions.anchor.setTo(0.5,0.5);
    this.instructions.alpha = 0.001;
     this.instructions2 = this.add.bitmapText(this.game.width/2, this.game.height/2+150,'font',"Tap to begin", 35);
    this.instructions2.anchor.setTo(0.5,0.5);
    this.instructions2.alpha = 0.001;
    tweenA = this.game.add.tween(this.instructions).to( { alpha: 1 }, 2000, "Linear", true);
    tweenB = this.game.add.tween(this.instructions2).to( { alpha: 1 }, 2000, "Linear", true);
    tweenA.chain(tweenB);
  }
};
