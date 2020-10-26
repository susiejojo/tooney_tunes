class RestartScene extends Phaser.Scene {
  constructor(){
    super("restartGame");
  }

  init(data){
    this.score = data.score;
    this.song = data.song;

  }

  create() {
    this.sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(2.3).setScrollFactor(0);

    var scoreText = this.add.text(0, 20, "Your Final Score: " + this.score, {font: "50px", fill: "black"});
    scoreText.x = 400 - scoreText.width/2;
    var button1 = this.add.image(0, 200, 'restart', 0).setOrigin(0, 0).setInteractive();
    button1.x = (button1.width/4);

    button1.on('pointerup', function () {
      this.scene.start("playGame", {song: this.song});

    }, this);


    var button2 = this.add.image(0, 200, 'new_song', 0).setOrigin(0, 0).setInteractive();
    button2.x = button1.x + button1.width + 100;

    button2.on('pointerup', function () {
      this.scene.start("pickMusic");

    }, this);

  }






}
