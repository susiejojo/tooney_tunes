
  var config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {y:300},
          debug: false,
        }
      },
      scene: {
          preload: preload,
          create: create,
          update: update
      }
  };

  var game = new Phaser.Game(config);

  var score = 0;
  var scoreText;
  var speed = 1;

  function preload ()
  {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png',
          { frameWidth: 32, frameHeight: 48});
  }

  function create ()
  {
    // add sky
    this.add.image(400,300,'sky').setScrollFactor(0);

    // create ground using tileSprite
    ground = this.physics.add.staticGroup();

    // add physics, set gravity to zero
    ground.create(0, config.height, 'ground').setScale(4).refreshBody();


    // create player

    player = this.physics.add.sprite(0, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);


    // creating the animation of the sprite

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    player.anims.play('right', true);




  // setting the gravity of the player

  player.body.setGravityY(300);

  // add collider between the player and any platforms

  this.physics.add.collider(player, ground);


  // create stars

  stars = this.physics.add.group({
    key: 'star',
    repeat: 5,
    setXY: {x: 0, y: config.height - 80, stepX: 160}
  });

 // add star collider with platforms

 this.physics.add.collider(stars, ground);

 // let the user collect stars

 this.physics.add.overlap(player, stars, collectStar, null, this);

  stars.children.iterate(function (child){
  child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
});

  // create text for the score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
  scoreText.setScrollFactor(0)



}

function update ()
{
    var cam = this.cameras.main;
    cam.scrollX += speed;
    this.physics.world.bounds.left = cam.worldView.left + 30;
    this.physics.world.bounds.right = cam.worldView.right;

    Phaser.Actions.Call(stars.getChildren(), function(sprite) {
      if(sprite.x + 30 < this.physics.world.bounds.left){
          sprite.destroy();
      }
    }, this);

    Phaser.Actions.Call(ground.getChildren(), function(sprite) {
      if(sprite.x + 30 < this.physics.world.bounds.left){
          sprite.destroy();
      }
    }, this);

    if(ground.getFirst(true).x <= this.physics.world.bounds.left){
      ground.create(this.physics.world.bounds.left, config.height, 'ground').setScale(4).refreshBody();
    }

    if(stars.getChildren().length <= 4){
      stars.create(this.physics.world.bounds.right - 10, config.height-85, 'star');

    }


    cursors = this.input.keyboard.createCursorKeys();

    if(cursors.space.isDown && player.body.touching.down){
      player.setVelocityY(-600);
      player.setVelocityX(0);
    } else if(player.body.touching.down){
      player.setVelocityX(0);
    }
}


function collectStar(player, star){

  // disable the star's physics body and make it invisible
  star.destroy();

  score += 10;

  scoreText.setText('Score: ' + score);

  // refills stars if they're all gone

}
