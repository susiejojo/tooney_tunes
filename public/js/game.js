var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// $.ajax({
//   type: 'GET',
//   url: '/fetch',
//   success: function(data) {
//     tempo = data;
//     console.log(tempo);
//   },
//   error: function(xhr) {
//     console.log(xhr);
//   }
// });

var game = new Phaser.Game(config);
var score = 0;
var scoreText;
var star_dist = 5;
var old_score = 0;
var health = 1;
var speed;
var old_time = 0;



function preload() {
  this.load.plugin('rexclockplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclockplugin.min.js', true);
  this.load.image('sky', 'assets/background.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('green', 'assets/green.png');
  this.load.image('orange', 'assets/orange.png');
  this.load.image('pink', 'assets/pink.png');
  this.load.image('blue', 'assets/blue.png');
  this.load.image('heart_0', 'assets/hearts0.png');
  this.load.image('heart_1', 'assets/hearts20.png');
  this.load.image('heart_2', 'assets/hearts40.png');
  this.load.image('heart_3', 'assets/hearts60.png');
  this.load.image('heart_4', 'assets/hearts80.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.json('ctrls', 'assets/info.json');
  this.load.image('dude', 'assets/dino.png');
  this.load.audio('music', 'assets/music/song.mp3');

}

function create() {
  clock = this.plugins.get('rexclockplugin').add(this, config);
  clock.start();
  music = this.sound.add('music');
  music.play();
  // add sky
  sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(2.3).setScrollFactor(0);

  // create ground
  ground = this.physics.add.staticGroup();
  ground_1 = ground.create(0, window.innerHeight, 'ground').setScale(2).refreshBody();
  var newvar = this.cache.json.get('ctrls');
  var tempo = parseFloat(newvar.tempo);
  console.log(JSON.stringify(newvar.tempo));
  speed = tempo/30;

  // create platforms
  platforms = this.physics.add.staticGroup();
  platform_1 = platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(700, 220, 'ground');

  // create player

  player = this.physics.add.sprite(0, 0, 'dude').setScale(2.3).refreshBody();
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);





  // setting the gravity of the player

  player.body.setGravityY(300);

  // add collider between the player and any platforms

  this.physics.add.collider(player, platforms);

  this.physics.add.collider(player, ground);



  // create stars

  stars = this.physics.add.group({
    key: 'blue',
    repeat: 5,
    setXY: {
      x: 0,
      y: 0,
      stepX: 160
    }
  });

  star_colors = ['blue', 'pink', 'orange', 'green'];
  index = 0;

  stars.children.iterate(function (child) {
    child.key = star_colors[index];
    child.setScale(.2).refreshBody();
    index += 1;

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
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fill: '#000'
  });
  scoreText.setScrollFactor(0);

  // create health bar
  health_imgs = ['heart_0', 'heart_1', 'heart_2', 'heart_3', 'heart_4']

  health_bar = this.add.image(700, 30, health_imgs[health]).setScale(1.3);
  health_bar.setScrollFactor(0);








}

function update() {
  var cam = this.cameras.main;
  cam.scrollX += speed;
  this.physics.world.bounds.left = cam.worldView.left + 30;
  this.physics.world.bounds.right = cam.worldView.right;

  Phaser.Actions.Call(stars.getChildren(), function (sprite) {
    if (sprite.x + 30 < this.physics.world.bounds.left) {
      sprite.destroy();
    }
  }, this);

  Phaser.Actions.Call(ground.getChildren(), function (sprite) {
    if (sprite.x + 30 < this.physics.world.bounds.left) {

      sprite.destroy();
    }
  }, this);

  Phaser.Actions.Call(obstacles.getChildren(), function (sprite) {
    if (sprite.x + 30 < this.physics.world.bounds.left) {
      sprite.destroy();
    }
  }, this);

  Phaser.Actions.Call(platforms.getChildren(), function (sprite) {
    if (sprite.x + 30 + sprite.width < this.physics.world.bounds.left) {
      sprite.destroy();
    }
  }, this);

  if (ground.getFirst(true).x <= this.physics.world.bounds.left) {
    ground.create(this.physics.world.bounds.left, 600, 'ground').setScale(4).refreshBody();
  }

  // creates a new star if the number of stars dips below the distribution
  // need to change with music implementation

  if (stars.getChildren().length <= star_dist - 1) {
    var star_x = Phaser.Math.Between(this.physics.world.bounds.left, this.physics.world.bounds.right);
    var star_color = Phaser.Math.Between(0,3);
    stars.create(this.physics.world.bounds.right - 10, 0, star_colors[star_color]).setScale(.2).refreshBody();


  }

  // creates new plaforms every 3 seconds
  // need to change with music implementation

 if (clock.now - old_time > 6000 / speed) {
    var platform_resize = Phaser.Math.Between(2, 20);
    var platform_y = Phaser.Math.Between(100, config.height - ground_1.height - platform_1.height - player.height - 100);
    new_platform = platforms.create(this.physics.world.bounds.right, platform_y + 71, 'ground').setScale(platform_resize / 20, 1);
    new_platform.x = this.physics.world.bounds.right + new_platform.width;
    new_platform.body.updateFromGameObject();
    old_time = clock.now;

  }






  cursors = this.input.keyboard.createCursorKeys();

  if (cursors.space.isDown && player.body.touching.down) {
    player.setVelocityY(-600);
    player.setVelocityX(0);
  } else if (player.body.touching.down) {
    player.setVelocityX(0);
  }


  // speeds up the scrolling every 50 points, changes the distribution of stars randomly, and adds an obstacle
  // need to change for music implementation

  if (score >= old_score + 50) {
    if (star_dist > 1) {
      star_dist -= 1;
    }
    old_score = score;
    new_obstacle = obstacles.create(this.physics.world.bounds.right, 0, 'bomb');


  }



  // no health, game over
  if (health <= 0) {
    music.stop();
    this.cameras.main.fade(2000, 0, 0, 0);
    this.scene.stop();
    health = 4;
    score = 0;
    music.stop();
  }









}



function loseHealth(player, obstacle) {
  obstacle.destroy();
  player.setTint(0xff0000);
  health -= 1;
  health_bar.destroy();
  health_bar = this.add.image(700, 30, health_imgs[health]).setScale(1.3);
  health_bar.setScrollFactor(0);


}

function collectStar(player, star) {

  // destroy the star
  star.destroy();

  score += 10;
  scoreText.setText('Score: ' + score);




}
