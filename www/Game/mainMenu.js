
BasicGame.MainMenu = function (game) {

 
  this.playButton = null;

};

BasicGame.MainMenu.prototype = {
  preload: function() {
    this.star;
    this.texture1;
    this.texture2;
    this.texture3;
    this.stars = [];
  },
  create: function () {
    this.music = this.game.add.audio('song');
    this.music.play();
    this.music.loopFull();
    this.star = this.game.make.sprite(0, 0, 'starhor');
    this.texture1 = this.game.add.renderTexture(800, 600, 'texture1');
    this.texture2 = this.game.add.renderTexture(800, 600, 'texture2');
    this.texture3 = this.game.add.renderTexture(800, 600, 'texture3');    
    this.game.add.sprite(0, 0, this.texture1);
    this.game.add.sprite(0, 0, this.texture2);
    this.game.add.sprite(0, 0, this.texture3);
    var t = this.texture1;
    var s = -4;
    for (var i = 0; i < 300; i++)
    {
        if (i == 100)
        {
            s = -6;
            t = this.texture2;
        }
        else if (i == 200)
        {
            s = -7;
            t = this.texture3;
        };
        this.stars.push( { x: this.game.world.randomX, y: this.game.world.randomY, speed: s, texture: t });
    };
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
    for (var i = 0; i < 300; i++)
    {
        this.stars[i].x -= this.stars[i].speed;
        if (this.stars[i].x > 800)
        {
            this.stars[i].y = this.game.world.randomX;
            this.stars[i].x = -32;
        }
        if (i == 0 || i == 100 || i == 200)
        {
            this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, true);
        }
        else
        {
            this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, false);
        }
    };
    if (this.cache.isSoundDecoded('song')) {
        
    }
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
