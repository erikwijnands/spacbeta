var Spacescape = Spacescape || {};

Spacescape.star = function(game, x, y){
	Phaser.Sprite.call(this, game, x, y, 'star');
	this.anchor.setTo(0.5);
	this.checkWorldBounds = true;
	this.outOfBoundsKill = true;
};

Spacescape.star.prototype = Object.create(Phaser.Sprite.prototype);
Spacescape.star.prototype.constructor = Spacescape.star;
