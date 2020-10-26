class StartScene extends Phaser.Scene {
  constructor(){
    super("startGame");
  }

  preload() {
    this.load.plugin('rexclockplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclockplugin.min.js', true);
   this.load.image('sky', 'assets/images/background.png');
   this.load.image('start', 'assets/images/start.png');
   this.load.image('restart', 'assets/images/restart.png');
   this.load.image('new_song', 'assets/images/new_song.png');
   this.load.image('feeling', 'assets/images/feeling.png');
   this.load.image('numb', 'assets/images/numb.png');
   this.load.image('roar', 'assets/images/roar.png');
 }

  create() {
    this.sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(2.3).setScrollFactor(0);
    var button = this.add.image(0, 300, 'start', 0).setOrigin(0, 0).setInteractive();
    button.x = 400-(button.width/2);

    button.on('pointerup', function () {
      this.scene.start("pickMusic");

    }, this);

  }





}
