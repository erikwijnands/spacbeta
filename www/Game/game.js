BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
  preload: function() {
    this.star;
    this.texture1;
    this.texture2;
    this.texture3;
    this.stars = [];
    this.wave = 1;
  },
  create: function () {
    //this.setbak();
    /////star test
    this.star = this.game.make.sprite(0, 0, 'starvert');
    this.texture1 = this.game.add.renderTexture(800, 600, 'texture1');
    this.texture2 = this.game.add.renderTexture(800, 600, 'texture2');
    this.texture3 = this.game.add.renderTexture(800, 600, 'texture3');    
    this.game.add.sprite(0, 0, this.texture1);
    this.game.add.sprite(0, 0, this.texture2);
    this.game.add.sprite(0, 0, this.texture3);
    var t = this.texture1;
    var s = 2;
    for (var i = 0; i < 300; i++)
    {
        if (i == 200)
        {
            s = 3;
            t = this.texture2;
        }
        else if (i == 300)
        {
            s = 3;
            t = this.texture3;
        }
        this.stars.push( { x: this.game.world.randomX, y: this.game.world.randomY, speed: s, texture: t });
    };
    this.setupAudio();
    this.setplayer();
    this.setenemies();
    this.setbullets();
    this.setexplosions();
    this.setupPlayerIcons();
    this.setuptext();
    //this.switchwave();
    this.reviver();
  },

  update: function () {
    //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
    this.checkCollisions();
    this.spawnEnemies();
    this.enemyFire();
    this.processPlayerInput();
    this.processDelayedEffects();
    /////star test
    for (var i = 0; i < 300; i++)
    {
        this.stars[i].y += this.stars[i].speed;
        if (this.stars[i].y > 800)
        {
            this.stars[i].x = this.game.world.randomX;
            this.stars[i].y = -32;
        }
        if (i == 0 || i == 200 || i == 300)
        {
            this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, true);
        }
        else
        {
            this.stars[i].texture.renderXY(this.star, this.stars[i].x, this.stars[i].y, false);
        }
    }
  },

  setupAudio: function () {
    this.sound.volume = 0.3;
    this.explosionSFX = this.add.audio('explosion');
    this.playerExplosionSFX = this.add.audio('playerExplosion');
    this.enemyFireSFX = this.add.audio('enemyFire');
    this.playerFireSFX = this.add.audio('playerFire');
    this.powerUpSFX = this.add.audio('powerUp');
    this.music = this.game.add.audio('song');
  },

  quitGame: function (pointer) {
    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
    this.bak.destroy();
    this.player.destroy();
    this.enemyPool.destroy();
    this.bulletPool.destroy();
    this.explosionPool.destroy();
    this.shooterPool.destroy();
    this.enemyBulletPool.destroy();
    this.powerUpPool.destroy();
    this.bossPool.destroy();
    this.scoreText.destroy();
    //this.endText.destroy();
    this.returnText.destroy();
    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  },
  enemyHit: function(bullet,enemy){
    bullet.kill();
    this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
  },
  fire: function() {
    if(!this.player.alive || this.nextShotAt>this.time.now) {
      return;
    };
    this.nextShotAt = this.time.now + this.shotDelay;
    this.playerFireSFX.play();
    var bullet;
    if (this.weaponLevel === 0) {
      if (this.bulletPool.countDead() === 0) {
        return;
      }
      bullet = this.bulletPool.getFirstExists(false);
      bullet.reset(this.player.x,this.player.y -20);
      bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
    }else{
      if (this.bulletPool.countDead() < this.weaponLevel*2) {
        return;
      }
      for (var i=0; i < this.weaponLevel; i++) {
        bullet = this.bulletPool.getFirstExists(false);
        bullet.reset(this.player.x - (10+i*6),this.player.y-20);
        this.physics.arcade.velocityFromAngle(-95-i*10, BasicGame.BULLET_VELOCITY, bullet.body.velocity);
        bullet = this.bulletPool.getFirstExists(false);
        bullet.reset(this.player.x + (10+i*6),this.player.y-20);
        this.physics.arcade.velocityFromAngle(-85+i*10, BasicGame.BULLET_VELOCITY, bullet.body.velocity);
      } 
    }
  },
  enemyFire:function() {
    this.shooterPool.forEachAlive(function (enemy) {
      if (this.time.now > enemy.nextShotAt && this.enemyBulletPool.countDead() > 0) {
          var bullet = this.enemyBulletPool.getFirstExists(false);
          bullet.reset(enemy.x, enemy.y);
          this.physics.arcade.moveToObject(bullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY);
          enemy.nextShotAt = this.time.now + BasicGame.SHOOTER_SHOT_DELAY;
          this.enemyFireSFX.play();
        }
      }, this);
    if (this.bossApproaching === false && this.boss.alive && this.boss.nextShotAt < this.time.now && this.BossBulletPool.countDead() >= 10) {
      this.boss.nextShotAt = this.time.now + BasicGame.BOSS_SHOT_DELAY;
      this.enemyFireSFX.play();
      for (var i = 0; i < 5; i++) {
        var leftBullet = this.BossBulletPool.getFirstExists(false);
        leftBullet.reset(this.boss.x - 10 - i * 10, this.boss.y + 20);
        var rightBullet = this.BossBulletPool.getFirstExists(false);
        rightBullet.reset(this.boss.x + 10 + i * 10, this.boss.y + 20);
        if (this.boss.health > BasicGame.BOSS_HEALTH / 2) {
          // aim directly at the player
          this.physics.arcade.moveToObject(
            leftBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY-200
          );
          this.physics.arcade.moveToObject(
            rightBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY-200
          );
          } else {
          // aim slightly off center of the player
          this.physics.arcade.moveToXY(
            leftBullet, this.player.x - i * 100, this.player.y,
            BasicGame.ENEMY_BULLET_VELOCITY-200
          );
          this.physics.arcade.moveToXY(
            rightBullet, this.player.x + i * 100, this.player.y,
            BasicGame.ENEMY_BULLET_VELOCITY-200
          );
        }
      }
    }
  },
  playerHit: function (player, enemy) {
    this.damageEnemy(enemy,BasicGame.CRASH_DAMAGE);
    if (this.ghostUntil && this.ghostUntil > this.time.now) {
      return;
    }
    this.playerExplosionSFX.play();
    var life = this.lives.getFirstAlive();
    if (life !== null) {
      life.kill();
      this.ghostUntil = this.time.now + BasicGame.PLAYER_GHOST_TIME;
      this.player.play('ghost');
      this.weaponLevel = 0;
    } else {
      this.explode(player);
      player.kill();
      this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
    }
  },
  explode: function(sprite) {
    if (this.explosionPool.countDead() === 0) {
      return;
    };
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    explosion.play('boom', 15,false,true);
    explosion.body.velocity.x = sprite.body.velocity.x;
    explosion.body.velocity.y = sprite.body.velocity.y;
  },
  setupPlayerIcons:function() {
    //powerup, a spreadshot
    this.powerUpPool = this.add.group();
    this.powerUpPool.enableBody = true;
    this.powerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.powerUpPool.createMultiple(5, 'powerup1');
    this.powerUpPool.setAll('anchor.x', 0.5);
    this.powerUpPool.setAll('anchor.y', 0.5);
    this.powerUpPool.setAll('outOfBoundsKill', true);
    this.powerUpPool.setAll('checkWorldBounds', true);
    this.powerUpPool.setAll(
      'reward', BasicGame.POWERUP_REWARD, false, false, 0, true
    );
    this.powerUpPool.forEach(function(powerup){
      powerup.animations.add('blink', [0,1], 20,true);
      powerup.play('blink');
    });
    //lives
    this.lives = this.add.group();
    ////////location of first life icon
    var firslifeiconx = this.game.width -10 - (BasicGame.PLAYER_EXTRA_LIVES * 30);
    for (var i = 0; i < BasicGame.PLAYER_EXTRA_LIVES; i++) {
      var life = this.lives.create(firslifeiconx + (30*i),30, 'player');
      life.scale.setTo(0.5,0.5);
      life.anchor.setTo(0.5,0.5);
    };
    //this.liveamount = BasicGame.PLAYER_EXTRA_LIVES;
    //this.livetext = this.game.add.text(this.game.world.width - 75, this.game.world.height - 550,'LIVES X '+this.liveamount, {font: '15px Arial', fill: '#0f0'});
  },
  setbak: function() {
    this.bak = this.add.tileSprite(0.5, 0.5, this.game.width, this.game.height, 'starbak');
    this.bak.autoScroll(0,40);
  },
  setplayer:function() {
    this.player = this.add.sprite(this.game.width/2,this.game.height-50,'player');
    this.player.anchor.setTo(0.5,0.5);
    this.player.animations.add('fly', [ 0, 1, 2 ], 20, true);
    this.player.animations.add('ghost', [ 3, 0, 3, 1 ], 20, true);
    this.player.play('fly');
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.speed = 300;
    this.player.body.collideWorldBounds = true;
    //lower player hitbox
    //this.player.body.setSize(20,20,0,-5);  
    this.weaponLevel = 0;
  },
  setenemies:function(){
    //enemygreen pool
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50, 'enemygreen');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true); 
    this.enemyPool.setAll('reward',BasicGame.ENEMY_REWARD,false,false,0,true);   
    this.enemyPool.setAll('dropRate', BasicGame.ENEMY_DROP_RATE, false, false, 0, true);
    this.enemyPool.forEach(function (enemy) {
      enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
      enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
      enemy.events.onAnimationComplete.add( function (e) {
        e.play('fly');}, this); 
    });
    this.nextEnemyAt = 0;
    this.enemyDelay = 500;
    //enemy shooter single shot
    this.shooterPool = this.add.group();
    this.shooterPool.enableBody = true;
    this.shooterPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.shooterPool.createMultiple(20, 'whiteEnemy');
    this.shooterPool.setAll('anchor.x', 0.5);
    this.shooterPool.setAll('anchor.y', 0.5);
    this.shooterPool.setAll('outOfBoundsKill', true);
    this.shooterPool.setAll('checkWorldBounds', true);
    this.shooterPool.setAll('reward', BasicGame.SHOOTER_REWARD, false, false, 0, true);
    this.shooterPool.setAll('dropRate', BasicGame.SHOOTER_DROP_RATE, false, false, 0, true);
    this.shooterPool.forEach(function (enemy) {
      enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
      enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
      enemy.events.onAnimationComplete.add( function (e) {
        e.play('fly');
      }, this);
    });
    this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 3;
    this.shooterDelay = BasicGame.SPAWN_SHOOTER_DELAY;
    //boss first
    this.bossPool = this.add.group();
    this.bossPool.enableBody = true;
    this.bossPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bossPool.createMultiple(1, 'boss');
    this.bossPool.setAll('anchor.x', 0.5);
    this.bossPool.setAll('anchor.y', 0.5);
    this.bossPool.setAll('outOfBoundsKill', true);
    this.bossPool.setAll('checkWorldBounds', true);
    this.bossPool.setAll('reward', BasicGame.BOSS_REWARD, false, false, 0, true);
    this.bossPool.setAll('dropRate', BasicGame.BOSS_DROP_RATE, false, false, 0, true);
    this.bossPool.forEach(function (enemy) {
      enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
      enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
      enemy.events.onAnimationComplete.add( function (e) {
        e.play('fly');
      }, this);
    });
    this.boss = this.bossPool.getTop();
    this.bossApproaching = false;
    //golden enemies
    this.enemygoldPool = this.add.group();
    this.enemygoldPool.enableBody = true;
    this.enemygoldPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemygoldPool.createMultiple(50, 'enemygold');
    this.enemygoldPool.setAll('anchor.x', 0.5);
    this.enemygoldPool.setAll('anchor.y', 0.5);
    this.enemygoldPool.setAll('outOfBoundsKill', true);
    this.enemygoldPool.setAll('checkWorldBounds', true); 
    this.enemygoldPool.setAll('reward',BasicGame.ENEMY_REWARD + 2000, false, false, 0, true);   
    this.enemygoldPool.setAll('dropRate', BasicGame.ENEMY_DROP_RATE, false, false, 0, true);
    this.enemygoldPool.forEach(function (enemy) {
      enemy.animations.add('fly', [ 0, 1, 2 ], 20, true);
      enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
      enemy.events.onAnimationComplete.add( function (e) {
        e.play('fly');}, this); 
    });
    this.nextEnemygoldAt = this.time.now + Phaser.Timer.SECOND * 20;
    this.enemygoldDelay = this.rnd.integerInRange(10000, 20000);
  },
  setbullets:function(){
    //enemy bullets
    this.enemyBulletPool = this.add.group();
    this.enemyBulletPool.enableBody = true;
    this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyBulletPool.createMultiple(100, 'enemyBullet');
    this.enemyBulletPool.setAll('anchor.x', 0.5);
    this.enemyBulletPool.setAll('anchor.y', 0.5);
    this.enemyBulletPool.setAll('outOfBoundsKill', true);
    this.enemyBulletPool.setAll('checkWorldBounds', true);
    this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);
    //player bullets
    this.bulletPool = this.add.group();
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bulletPool.createMultiple(100, 'bullet');
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
    this.bulletPool.setAll('outOfBoundsKill', true);
    this.bulletPool.setAll('checkWorldBounds', true);
    this.nextShotAt = 0;
    this.shotDelay = 100;
    //Boss bullets
    this.BossBulletPool = this.add.group();
    this.BossBulletPool.enableBody = true;
    this.BossBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.BossBulletPool.createMultiple(100, 'BossBullet');
    this.BossBulletPool.forEach(function(bullet){
      bullet.animations.add('pew', [0,1,2],20,true);
      bullet.play('pew');
    })
    this.BossBulletPool.setAll('anchor.x', 0.5);
    this.BossBulletPool.setAll('anchor.y', 0.5);
    this.BossBulletPool.setAll('outOfBoundsKill', true);
    this.BossBulletPool.setAll('checkWorldBounds', true);
    this.BossBulletPool.setAll('reward', 0, false, false, 0, true);
  },
  setexplosions:function(){
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function (explosion) {
      explosion.animations.add('boom');
    });
  },
  setuptext:function() {
    //score
    this.score = 0;
    this.scoreText = this.add.text(this.game.width/2,30,''+this.score,{font:'20px chintzy', fill: '#fff', align: 'center'});
    this.scoreText.anchor.setTo(0.5,0.5);
  },
  checkCollisions:function(){
    this.physics.arcade.overlap(this.bulletPool, this.enemyPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.bulletPool, this.shooterPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.player, this.shooterPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.enemyBulletPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.player, this.enemyPool, this.playerHit, null, this);    
    this.physics.arcade.overlap(this.player, this.powerUpPool, this.playerPowerUp, null, this);
    this.physics.arcade.overlap(this.player, this.BossBulletPool, this.playerHit, null, this);
    this.physics.arcade.overlap(this.bulletPool, this.enemygoldPool, this.enemyHit, null, this);
    this.physics.arcade.overlap(this.player, this.enemygoldPool, this.playerHit, null, this);
    //boss collision
    if (this.bossApproaching === false) {
      this.physics.arcade.overlap(this.bulletPool, this.bossPool, this.enemyHit, null, this);
      this.physics.arcade.overlap(this.player, this.bossPool, this.playerHit, null, this);
    }
  },
  spawnEnemies:function(){
    //enemygreen
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
          this.nextEnemyAt = this.time.now + this.enemyDelay;
          var enemy = this.enemyPool.getFirstExists(false);
            // spawn at a random location top of the screen
          enemy.reset(this.rnd.integerInRange(20, this.game.width-20), 0,BasicGame.ENEMY_HEALTH);
            // also randomize the speed
          enemy.body.velocity.y = this.rnd.integerInRange(100, 130);
          enemy.play('fly');
      };
    //golden enemies
    if (this.nextEnemygoldAt < this.time.now && this.enemygoldPool.countDead() > 0) {
          this.nextEnemygoldAt = this.time.now + this.enemygoldDelay;
          var gold = this.enemygoldPool.getFirstExists(false);
            // spawn at a random location top of the screen
          gold.reset(this.rnd.integerInRange(30, this.game.width-30), 0,BasicGame.ENEMY_HEALTH);
            // also randomize the speed
          gold.body.velocity.y = this.rnd.integerInRange(200, 230);
          gold.body.velocity.x = this.rnd.integerInRange(200, -230);
          var targetgold = this.rnd.integerInRange(30, this.game.width - 30);
      	  gold.rotation = this.physics.arcade.moveToXY(gold, targetgold, this.game.height,this.rnd.integerInRange(BasicGame.SHOOTER_MIN_VELOCITY, BasicGame.SHOOTER_MAX_VELOCITY)) - Math.PI / 2;
      	  gold.play('fly');
      };
    //enemies with shooting mechanics
    if (this.nextShooterAt < this.time.now && this.shooterPool.countDead() > 0) {
      this.nextShooterAt = this.time.now + this.shooterDelay;
      var shooter = this.shooterPool.getFirstExists(false);
      shooter.reset(
        this.rnd.integerInRange(20, this.game.width - 20), 0,
        BasicGame.SHOOTER_HEALTH
      );
      var target = this.rnd.integerInRange(20, this.game.width - 20);
      shooter.rotation = this.physics.arcade.moveToXY(
        shooter, target, this.game.height,
        this.rnd.integerInRange(
          BasicGame.SHOOTER_MIN_VELOCITY, BasicGame.SHOOTER_MAX_VELOCITY
        )
      ) - Math.PI / 2;
      shooter.play('fly');
      shooter.nextShotAt = 0;
    }
  },
  processPlayerInput:function(){
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    if (this.input.activePointer.isDown && this.physics.arcade.distanceToPointer(this.player) > 15) {
        this.physics.arcade.moveToPointer(this.player, this.player.speed);
      };
    if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
        if (this.returnText && this.returnText.exists) {
          this.state.start('MainMenu');
        }else{
          this.fire();
        }
      };      
  },
  processDelayedEffects:function(){
    //part of returning to main menu
    if (this.showReturn && this.time.now > this.showReturn && !this.player.alive) {
      this.returnText = this.add.bitmapText(this.game.width/2, this.game.height/2+20,'font', 'Tap to go back to Main Menu', 25); 
      this.returnText.anchor.setTo(0.5,0.5);
      this.overtext = this.add.bitmapText(this.game.world.centerX, this.game.world.centerY,'font', 'Game Over',30);
      this.overtext.anchor.setTo(0.5,0.5);
      this.music.stop();
      this.showReturn = false;
    };
    if (this.ghostUntil && this.ghostUntil < this.time.now) {
      this.ghostUntil = null;
      this.player.play('fly');
    };
    if (this.showReturn && this.time.now > this.showReturn && !this.boss.alive) {
      this.returnText = this.add.bitmapText(this.game.width/2, this.game.height/2+20,'font', 'Tap to go back to Main Menu', 25); 
      this.returnText.anchor.setTo(0.5,0.5);
      this.overtext = this.add.bitmapText(this.game.world.centerX, this.game.world.centerY,'font', 'You Win!!!', 30);
      this.overtext.anchor.setTo(0.5,0.5);
      this.showReturn = false;
    }
    //boss invulnerability until position is reached
    if(this.bossApproaching && this.boss.y > 80) {
      this.bossApproaching = false;
      this.boss.nextShotAt = 0;
      this.boss.body.velocity.y = 0;
      this.boss.body.velocity.x = BasicGame.BOSS_X_VELOCITY;
      this.boss.body.bounce.x = 1;
      this.boss.body.collideWorldBounds = true;
    }
  },
  damageEnemy:function(enemy,damage) {
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
      this.explosionSFX.play();
      this.spawnPowerUp(enemy);
      this.addToScore(enemy.reward);
      if (enemy.key === 'boss') {
        this.enemyPool.destroy();
        this.enemygoldPool.destroy();
        this.shooterPool.destroy();
        this.bossPool.destroy();
        this.enemyBulletPool.destroy();
        this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
      };
      if (enemy.key === 'enemygold') {
        this.explode(enemy);
        this.explosionSFX.play();
        this.spawnPowerUp(enemy);
        this.addToScore(enemy.reward);
        // NOT WORKING this.lives.push();
        // ALSO NOT WORKING BasicGame.PLAYER_EXTRA_LIVES++;
      }
    }
  },
  spawnPowerUp: function(enemy) {
    if (this.powerUpPool.countDead() === 0 || this.weaponLevel === 5) {
      return;
    }
    if (this.rnd.frac() < enemy.dropRate) {
      var powerUp = this.powerUpPool.getFirstExists(false);
      powerUp.reset(enemy.x,enemy.y);
      powerUp.body.velocity.y = BasicGame.POWERUP_VELOCITY;
    }
  },
  addToScore:function(score) {
    this.score += score;
    this.scoreText.text = this.score;
    /*if (this.score === 10000) {
      this.enemyPool.destroy();
      this.shooterPool.destroy();
      this.enemyBulletPool.destroy();
      //this.switchwave();
      this.game.time.events.add(Phaser.Timer.SECOND * 2, this.reviver, this);
    };
    if (this.score === 25000) {
      this.enemyPool.destroy();
      this.shooterPool.destroy();
      this.enemyBulletPool.destroy();
      //this.switchwave();
      this.game.time.events.add(Phaser.Timer.SECOND * 2, this.reviver, this);
    };*/
    if (this.score >= 350 && this.bossPool.countDead()== 1) {
      this.spawnBoss();
      //this.bossApproaching = false;
      //this.game.time.events.add(Phaser.Timer.SECOND * 2, this.reviver, this);
    };    
     /*if (this.score >= 200 && this.bossPool.countDead() == 1) {
      this.spawnBoss();
    }*/
  },
  /*switchwave:function() {
    this.wave = this.wave++;
    this.wavetext = this.add.bitmapText(this.game.width / 2, this.game.height / 2 ,'fonttitle', "Wave Complete", 80);
    this.wavetext.anchor.setTo(0.5,0.5);
  },*/
  reviver: function() {
    this.setenemies();
    this.setbullets();
    this.spawnEnemies();
    /*if (this.score >= 350 && this.bossPool.countDead() == 0) {
      this.spawnBoss();
    }*/
  },
  playerPowerUp: function(player,powerUp) {
    this.addToScore(powerUp.reward);
    powerUp.kill();
    this.powerUpSFX.play();
    if (this.weaponLevel <7) {
      this.weaponLevel++;
    }
  },
  spawnBoss: function() {
    this.bossApproaching = true;
    this.boss.reset(this.game.width/2,0,BasicGame.BOSS_HEALTH);
    this.physics.enable(this.boss,Phaser.Physics.ARCADE);
    this.boss.body.velocity.y = BasicGame.BOSS_Y_VELOCITY;
    this.boss.play('fly');
  }
};