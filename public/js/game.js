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
var health = 4;
var speed;
var old_time = 0;
var tint_time = 0;
var obs_prob = 50;



function preload() {
  this.load.plugin('rexclockplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclockplugin.min.js', true);
  this.load.image('sky', 'assets/images/background.png');
  this.load.image('ground', 'assets/images/platform.png');
  this.load.image('green', 'assets/images/green.png');
  this.load.image('orange', 'assets/images/orange.png');
  this.load.image('pink', 'assets/images/pink.png');
  this.load.image('blue', 'assets/images/blue.png');
  this.load.image('heart_0', 'assets/images/hearts0.png');
  this.load.image('heart_1', 'assets/images/hearts20.png');
  this.load.image('heart_2', 'assets/images/hearts40.png');
  this.load.image('heart_3', 'assets/images/hearts60.png');
  this.load.image('heart_4', 'assets/images/hearts80.png');
  this.load.image('bomb', 'assets/images/bomb.png');
  this.load.json('ctrls', 'assets/data/info.json');
  this.load.image('dude', 'assets/images/dino.png');
  this.load.audio('music', 'assets/music/song.mp3');
  this.load.audio('music1', 'assets/music/song_conb.mp3');
  this.load.audio('music2', 'assets/music/song_drums.mp3');
  this.load.audio('music3', 'assets/music/song_other.mp3');

}

function create() {
  clock = this.plugins.get('rexclockplugin').add(this, config);
  clock.start();
  music = this.sound.add('music');
  music1 = this.sound.add('music1');
  music2 = this.sound.add('music2');
  music3 = this.sound.add('music3');
  music.play();
  // add sky
  sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(2.3).setScrollFactor(0);

  // create ground
  ground = this.physics.add.staticGroup();
  ground_1 = ground.create(0, window.innerHeight, 'ground').setScale(2).refreshBody();
  var newvar = this.cache.json.get('ctrls');
  var tempo = parseFloat(newvar.tempo);
  speed = tempo/30;
  beats = newvar.beats;

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

  // creates new plaforms every 3 seconds

 if (clock.now - old_time > 6000 / speed) {
    var platform_resize = Phaser.Math.Between(2, 18);
    var platform_y = Phaser.Math.Between(100, config.height - ground_1.height - platform_1.height - player.height - 100);
    new_platform = platforms.create(this.physics.world.bounds.right, platform_y + 71, 'ground').setScale(platform_resize / 20, 1);
    new_platform.x = this.physics.world.bounds.right + new_platform.width;
    new_platform.body.updateFromGameObject();
    if(obs_prob > 10){
      obs_prob -= 1;
    }
    old_time = clock.now;

  }

  // lets the player jump using the spacebar
  cursors = this.input.keyboard.createCursorKeys();

  if (cursors.space.isDown && player.body.touching.down) {
    player.setVelocityY(-600);
    player.setVelocityX(0);
  }

  // clears tint after 1s
  if(clock.now - tint_time > 1000){
    player.clearTint();
  }


  // adds a note or an obstacle on the beat based on a random probability
  for(beat in beats){
    if (Math.abs((clock.now) - (beat*1000.0)) <= 10) {
      var decide = Phaser.Math.Between(0, obs_prob)
      if(decide > obs_prob - 1){
        new_obstacle = obstacles.create(this.physics.world.bounds.right, 0, 'bomb').setScale(2).refreshBody();
      } else {
        var star_color = Phaser.Math.Between(0, 3);
        stars.create(this.physics.world.bounds.right - 10, 0, star_colors[star_color]).setScale(.2).refreshBody();
      }
      beats.splice(beats.indexOf(beat), 1);
      break;
    }
}

  // no health, game over
  if (health <= 0) {
    this.cameras.main.fade(2000, 0, 0, 0);
    music.stop();
    music1.stop();
    music2.stop();
    music3.stop();
    this.scene.stop();
    health = 4;
    score = 0;
  }
}

function loseHealth(player, obstacle) {
  obstacle.destroy();
  health -= 1;
  health_bar.destroy();
  player.setTint(0xff0000);
  tint_time = clock.now;
  if (health==3){
    var curtime = music.seek;
    music.stop();
    music1.play();
    music1.setSeek(curtime);
  }
  if (health==2){
    var curtime = music1.seek;
    music1.stop();
    music2.play();
    music2.setSeek(curtime);
  }
  if (health==1){
    var curtime = music2.seek;
    music2.stop();
    music3.play();
    music3.setSeek(curtime);
  }
  health_bar = this.add.image(700, 30, health_imgs[health]).setScale(1.3);
  health_bar.setScrollFactor(0);
}

function collectStar(player, star) {

  // destroy the star
  star.destroy();

  score += 10;
  scoreText.setText('Score: ' + score);




}
