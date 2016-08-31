var game = new Phaser.Game(640, 360, Phaser.AUTO);

var GameState = {

	preload: function(){
		this.load.image('background','assets/images/countryfield.png')
		//this.load.image('chinook','assets/images/chinook.png');
		//this.load.image('soldier','assets/images/soldierforward.png');
		//this.load.image('hind','assets/images/hind.png');
		//this.load.image('tank','assets/images/tank1.png');
		this.load.image('arrow','assets/images/arrow.png');
		this.load.spritesheet('chinook', 'assets/images/chinook_hover_sheet.png',600,200,3);
		this.load.spritesheet('soldier', 'assets/images/soldierforward_sheet.png',224,32,7);
		this.load.spritesheet('hind', 'assets/images/hind_sheet.png',160,80,2);
		this.load.spritesheet('tank','assets/images/tank1forward_sheet.png',320,80,4);
		//this.load.audio('KEY',['src']);
	},
	create: function(){
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		//background
		this.background = this.game.add.sprite(0, 0, 'background');
		//this.background.scale.setTo(1,1); un-comment as needed
		//images
		//this.chinook = this.game.add.sprite(this.game.world.centerX,this.game.world.centerY, 'chinook');
		//this.chinook.anchor.setTo(0.5,0.5);
		//this.chinook.inputEnabled = true;
		//this.chinook.input.pixelPerfectClick = true;
		//this.chinook.events.onInputDown.add(this.animatesprite, this);

		var allimages = [
			{key: 'chinook', text: 'chinook'},
			{key: 'soldier', text: 'soldier'},
			{key: 'hind', text: 'hind'},
			{key: 'tank', text: 'tank'}
		];

		var self = this;
		this.images = this.game.add.group();
		allimages.forEach(function(element){
			images = self.images.create(-1000,self.game.world.centerY, element.key, 0);
			images.anchor.setTo(0.5);
			images.customParams = {text: element.text};
			images.inputEnabled = true;
			images.input.pixelPerfectClick = true;
			images.events.onInputDown.add(self.animatesprite, self);
			images.animations.add('animate', [0,1],3,false); 
		});
		this.currentitem = this.images.next();
		this.currentitem.position.setTo(this.game.world.centerX, this.game.world.centerY);


		//arrows
		this.arrowright = this.game.add.sprite(600,180, 'arrow');
		this.arrowright.anchor.setTo(0.5,0.5);
		this.arrowright.scale.setTo(1.5);
		this.arrowright.customParams = {direction: 1};
		this.arrowright.inputEnabled = true;
		this.arrowright.input.pixelPerfectClick = true;
		this.arrowright.events.onInputDown.add(this.switchpic, this);

		this.arrowleft = this.game.add.sprite(40,180, 'arrow');
		this.arrowleft.anchor.setTo(0.5,0.5);
		this.arrowleft.scale.setTo(-1.5,1.5);
		this.arrowleft.customParams = {direction: -1};
		this.arrowleft.inputEnabled = true;
		this.arrowleft.input.pixelPerfectClick = true;
		this.arrowleft.events.onInputDown.add(this.switchpic, this);
	},
	update: function(){

	},
	switchpic: function(sprite,event){
		if(this.isMoving) {
			return false;
		}
		this.isMoving = true;
		var newitem, endX;
		if (sprite.customParams.direction > 0){
			newitem = this.images.next();
			endX = 640 + this.currentitem.width/2;
			newitem.x = -newitem.width/2;
		}
		else{
			newitem = this.images.previous();
			endX = -this.currentitem.width/2;
			newitem.x = 640 + newitem.width/2;
		};		
		var newitemmove = this.game.add.tween(newitem);
		newitemmove.to({x: this.game.world.centerX}, 1000);
		newitemmove.onComplete.add(function(){
			this.isMoving = false;
		},this);
		newitemmove.start();
		var currentitemmove = this.game.add.tween(this.currentitem);
		currentitemmove.to({x: endX}, 1000);
		currentitemmove.start();

		this.currentitem = newitem;
	},
	animatesprite: function(sprite,event){
		sprite.play('animate');
	}
};

game.state.add('GameState', GameState);
game.state.start('GameState');