
BasicGame.Game2 = function (game) {

};

BasicGame.Game2.prototype = {

  create: function () {
    this.setbak();
    this.setplayer();
    this.setenemies();
    this.setbullets();
    this.setexplosions();
    this.setupPlayerIcons();
    this.setuptext();
  },

  update: function () {
    //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
    this.checkCollisions();
    this.spawnEnemies();
    this.enemyFire();
    this.processPlayerInput();
    this.processDelayedEffects();
    if(BasicGame.LEVEL_NUMBER === null) {
      BasicGame.LEVEL_NUMBER = 1;
    };
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
        }
      }, this);
    if (this.bossApproaching === false && this.boss.alive && this.boss.nextShotAt < this.time.now && this.BossBulletPool.countDead() >= 10) {
      this.boss.nextShotAt = this.time.now + BasicGame.BOSS_SHOT_DELAY;
      for (var i = 0; i < 5; i++) {
        var leftBullet = this.BossBulletPool.getFirstExists(false);
        leftBullet.reset(this.boss.x - 10 - i * 10, this.boss.y + 20);
        var rightBullet = this.BossBulletPool.getFirstExists(false);
        rightBullet.reset(this.boss.x + 10 + i * 10, this.boss.y + 20);
        if (this.boss.health > BasicGame.BOSS_HEALTH / 2) {
          // aim directly at the player
          this.physics.arcade.moveToObject(
            leftBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
          );
          this.physics.arcade.moveToObject(
            rightBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
          );
          } else {
          // aim slightly off center of the player
          this.physics.arcade.moveToXY(
            leftBullet, this.player.x - i * 100, this.player.y,
            BasicGame.ENEMY_BULLET_VELOCITY
          );
          this.physics.arcade.moveToXY(
            rightBullet, this.player.x + i * 100, this.player.y,
            BasicGame.ENEMY_BULLET_VELOCITY
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
    //this.explode(player);
    //player.kill();
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
    //lives
    this.lives = this.add.group();
    ////////location of first life icon
    var firslifeiconx = this.game.width -80- (BasicGame.PLAYER_EXTRA_LIVES * 30);
    for (var i = 0; i < BasicGame.PLAYER_EXTRA_LIVES; i++) {
      var life = this.lives.create(firslifeiconx + (30*1),30, 'player');
      life.scale.setTo(0.5,0.5);
      life.anchor.setTo(0.5,0.5);
    };
  },
  setbak: function() {
    this.bak = this.add.tileSprite(0.5, 0.5, this.game.width, this.game.height, 'starbak');
    this.bak.autoScroll(0,-40);
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
    this.enemyDelay = 1000;
    //enemy with shooting mechanics
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
    this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 5;
    this.shooterDelay = BasicGame.SPAWN_SHOOTER_DELAY;
    //boss test
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
    this.scoreText = this.add.text(this.game.width/2,30,''+this.score,{font:'20px monospace', fill: '#fff', align: 'center'});
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
          enemy.body.velocity.y = this.rnd.integerInRange(30, 60);
          enemy.play('fly');
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
          this.state.start('Game');
        }else{
          this.fire();
        }
      };      
  },
  processDelayedEffects:function(){
    //part of returning to main menu
    if (this.showReturn && this.time.now > this.showReturn && !this.player.alive) {
      this.returnText = this.add.text(this.game.width/2, this.game.height/2+20, 'Tap to go back to Main Menu', {font:'16px sans-serif',fill:'#fff'}); 
      this.returnText.anchor.setTo(0.5,0.5);
      this.overtext = this.add.text(this.game.world.centerX, this.game.world.centerY, 'Game Over', {font:'16px sans-serif',fill:'#fff'});
      this.overtext.anchor.setTo(0.5,0.5);
      this.showReturn = false;
    };
    if (this.ghostUntil && this.ghostUntil < this.time.now) {
      this.ghostUntil = null;
      this.player.play('fly');
    };
    if (this.showReturn && this.time.now > this.showReturn && !this.boss.alive) {
      this.returnText = this.add.text(this.game.width/2, this.game.height/2+20, 'Tap to go back to Main Menu', {font:'16px sans-serif',fill:'#fff'}); 
      this.returnText.anchor.setTo(0.5,0.5);
      this.overtext = this.add.text(this.game.world.centerX, this.game.world.centerY, 'You Win!!!', {font:'16px sans-serif',fill:'#fff'});
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
      this.spawnPowerUp(enemy);
      this.addToScore(enemy.reward);
      if (enemy.key === 'boss') {
        this.enemyPool.destroy();
        this.shooterPool.destroy();
        this.bossPool.destroy();
        this.enemyBulletPool.destroy();
        this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
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
    /*if (this.score >= 20000) {
      this.enemyPool.destroy();
      this.shooterPool.destroy();
      this.enemyBulletPool.destroy();
      this.displayend(true);
    }*/
     if (this.score >= 200 && this.bossPool.countDead() == 1) {
      this.spawnBoss();
    }
  },
  playerPowerUp: function(player,powerUp) {
    this.addToScore(powerUp.reward);
    powerUp.kill();
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
  },
};

/////////////////////////////////////////////////////////////////////////