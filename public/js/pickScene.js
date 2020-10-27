class PickScene extends Phaser.Scene {
  constructor(){
    super("pickMusic");
  }



  create() {
    // add background
    this.sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(4).setScrollFactor(0);

    // create buttons
    var button1 = this.add.image(900, 200, 'feeling', 0).setOrigin(0, 0).setScale(2).setInteractive();
    button1.x = 900 - (button1.width/2);
    var button2 = this.add.image(button1.x, 200 + button1.height + 60, 'numb', 0).setOrigin(0, 0).setScale(2).setInteractive();
    var button3 = this.add.image(button1.x, 200 + button1.height + button2.height + 120, 'roar', 0).setScale(2).setOrigin(0, 0).setInteractive();

    button1.on('pointerup', function () {
      this.scene.start("playGame", {song: 0});

    }, this);

    button2.on('pointerup', function () {
      this.scene.start("playGame", {song: 1});

    }, this);

    button3.on('pointerup', function () {
      this.scene.start("playGame", {song: 2});

    }, this);
  }





}
