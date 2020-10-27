var config = {
	type: Phaser.AUTO,
	width: window.innerWidth,
	height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  backgroundColor: 0x000000,
  scene: [StartScene, PickScene, GameScene, RestartScene]
};



var game = new Phaser.Game(config);
