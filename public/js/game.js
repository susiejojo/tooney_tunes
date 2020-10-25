var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
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
  var health = 4;
  var old_time = 0;


  function preload ()
  {
    this.load.plugin('rexclockplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclockplugin.min.js', true);
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png',
          { frameWidth: 32, frameHeight: 48});
    this.load.audio('music', 'assets/bensound-goinghigher.mp3');

  }

  function create ()
  {
    clock = this.plugins.get('rexclockplugin').add(this, config);
    clock.start();
    music = this.sound.add('music');
    music.play();
    // add sky
    sky = this.add.image(400, 300,'sky').setScrollFactor(0);




    // create ground
    ground = this.physics.add.staticGroup();
    ground_1 = ground.create(0, 600, 'ground').setScale(2).refreshBody();


    // create platforms
    platforms = this.physics.add.staticGroup();
    platform_1 = platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(700, 220, 'ground');

    // create player

    player = this.physics.add.sprite(0, 0, 'dude');
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
    setXY: {x: 0, y: 0, stepX: 160}
  });

 // add star collider with platforms

 this.physics.add.collider(stars, ground);
 this.physics.add.collider(stars, platforms);

 // let the user collect stars

 this.physics.add.overlap(player, stars, collectStar, null, this);

 // create obstacles

 obstacles = this.physics.add.group();


 this.physics.add.collider(obstacles, ground);
 this.physics.add.collider(obstacles, platforms);

 this.physics.add.collider(player, obstacles, loseHealth, null, this);



  // create text for the score
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
  scoreText.setScrollFactor(0)

  // create text for health
  healthText = this.add.text(scoreText.width*1.5 + scoreText.x, 16, 'Health: 4', { fontSize: '32px', fill: '#000' });
  healthText.setScrollFactor(0);

  var button = this.add.image(800-16, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
  button.setScrollFactor(0);
  button.on('pointerup', function () {

      if (this.scale.isFullscreen)
      {
          button.setFrame(0);

          this.scale.stopFullscreen();

      }
      else
      {
          button.setFrame(1);

          this.scale.startFullscreen();
      }

  }, this);



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

    Phaser.Actions.Call(platforms.getChildren(), function(sprite) {
      if(sprite.x + 30 + sprite.width < this.physics.world.bounds.left){
          sprite.destroy();
      }
    }, this);

    if(ground.getFirst(true).x <= this.physics.world.bounds.left){
      ground.create(this.physics.world.bounds.left, 600, 'ground').setScale(4).refreshBody();
    }

    // creates a new star if the number of stars dips below the distribution
    // need to change with music implementation

    if(stars.getChildren().length <= star_dist - 1){
      var star_x = Phaser.Math.Between(this.physics.world.bounds.left, this.physics.world.bounds.right);
      stars.create(this.physics.world.bounds.right - 10, 0, 'star');


    }

    // creates new plaforms every 3 seconds
    // need to change with music implementation

    if(clock.now - old_time > 6000/speed){
      var platform_resize =  Phaser.Math.Between(1, 20);
      var platform_y = Phaser.Math.Between(100, config.height-ground_1.height-platform_1.height-player.height);
      new_platform = platforms.create(this.physics.world.bounds.right, platform_y + 71, 'ground').setScale(platform_resize/20, 1);
      new_platform.x = this.physics.world.bounds.right + new_platform.width;
      new_platform.body.updateFromGameObject();
      old_time = clock.now;
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

      var obstacle_y = Phaser.Math.Between(100, config.height-ground_1.height-player.height-81);
      new_obstacle = obstacles.create(this.physics.world.bounds.right, obstacle_y, 'bomb');
      var obstacle_platform_resize =  Phaser.Math.Between(1, 20);
      new_obs_platform = platforms.create(this.physics.world.bounds.right, obstacle_y + 71, 'ground');
      new_obs_platform.setScale(obstacle_platform_resize/20, 1);
      new_obs_platform.x = this.physics.world.bounds.right + new_obs_platform.width;
      new_obs_platform.body.updateFromGameObject();
      new_obstacle.x = this.physics.world.bounds.right + new_obs_platform.width;

    }



    // no health, game over
    if(health <= 0){
      music.stop();
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
