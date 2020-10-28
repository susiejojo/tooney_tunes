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

    var scoreText = this.add.text(0, 200, "Your Final Score: " + this.score, {font: "50px", fill: "black"});
    scoreText.x = 400 - scoreText.width/2;


    var button2 = this.add.image(400, scoreText.y + 100, 'restart', 0).setOrigin(0, 0).setInteractive();
    button2.x = 400 - button2.width/2;
    button2.on('pointerup', function () {
      this.scene.start("pickMusic");

    }, this);

  }






}
