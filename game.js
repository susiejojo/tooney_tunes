
  var config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
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
  var star_dist = 5;
  var old_score = 0;
  var obstacle_prob = 10;
  var health = 4;
  var platform_num = 1;

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
    this.add.image(config.width/2,config.height/2,'sky').setScrollFactor(0);

    // create ground
    ground = this.physics.add.staticGroup();
    ground.create(0, config.height, 'ground').setScale(window.innerWidth/).refreshBody();

    // create platforms
    platforms = this.physics.add.staticGroup();


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

  this.physics.add.collider(player, platforms);

  this.physics.add.collider(player, ground);


  // create stars

  stars = this.physics.add.group({
    key: 'star',
    repeat: 5,
    setXY: {x: 0, y: config.height - 80, stepX: 160}
  });

 // add star collider with platforms

 this.physics.add.collider(stars, ground);
 this.physics.add.collider(stars, platforms);

 // let the user collect stars

 this.physics.add.overlap(player, stars, collectStar, null, this);

 // create obstacles

 obstacles = this.physics.add.group();

 obstacles.create(this.physics.world.bounds.right, 16, 'bomb');

 this.physics.add.collider(obstacles, ground);
 this.physics.add.collider(obstacles, platforms);

 this.physics.add.collider(player, obstacles, loseHealth, null, this);



  // create text for the score
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
  scoreText.setScrollFactor(0)

  // create text for health
  healthText = this.add.text(config.width/2, 16, 'Health: 4', { fontSize: '32px', fill: '#000' });
  healthText.setScrollFactor(0)



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

    Phaser.Actions.Call(obstacles.getChildren(), function(sprite) {
      if(sprite.x + 30 < this.physics.world.bounds.left){
          sprite.destroy();
      }
    }, this);

    if(ground.getFirst(true).x <= this.physics.world.bounds.left){
      ground.create(this.physics.world.bounds.left, config.height, 'ground').setScale(4).refreshBody();
    }

    // creates a new star if the number of stars dips below the distribution
    // need to change with music implementation

    if(stars.getChildren().length <= star_dist - 1){
      stars.create(this.physics.world.bounds.right - 10, config.height-85, 'star');
    }


    cursors = this.input.keyboard.createCursorKeys();

    if(cursors.space.isDown && player.body.touching.down){
      player.setVelocityY(-600);
      player.setVelocityX(0);
    } else if(player.body.touching.down){
      player.setVelocityX(0);
    }


    // speeds up the scrolling every 50 points, changes the distribution of stars randomly, and adds an obstacle
    // need to change for music implementation

    if(score >= old_score + 50){
      speed += .5;
      if(star_dist > 1){
        star_dist -= 1;
      }
      old_score = score;
      obstacles.create(this.physics.world.bounds.right, 16, 'bomb');
    }

    // o health, game over
    if(health <= 0){
      gameOver = true;
    }

}




function loseHealth(player, obstacle){
  obstacle.destroy();
  player.setTint(0xff0000);
  health -= 1;

  healthText.setText('Health: ' + health);


}

function collectStar(player, star){

  // destroy the star
  star.destroy();

  score += 10;

  scoreText.setText('Score: ' + score);


}
