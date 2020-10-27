class GameScene extends Phaser.Scene{
  constructor(){
    super("playGame");
  }

  init(data){
    // set global variables
    this.score = 0;
    this.scoreText;
    this.old_score = 0;
    this.health = 4;
    this.speed;
    this.old_time = 0;
    this.tint_time = 0;
    this.obs_prob = 30;

    // add in specific song information
    var songs = [['song.mp3','song_conb.mp3', 'song_drums.mp3', 'song_other.mp3'],
      ['song2.mp3', 'song2_vocals.mp3', 'song2_drums.mp3', 'song2_bass.mp3'],
      ['song1.mp3', 'song1_vocals.mp3', 'song1_drums.mp3', 'song1_bass.mp3']]
    this.song_num = data.song;
    this.song_info = songs[this.song_num];
  }

  preload(){
    this.load.image('sky', 'assets/images/background.png');
    this.load.image('ground', 'assets/images/platform2.png');
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
    this.load.json('ctrls', 'assets/info.json');
    this.load.image('dude', 'assets/images/dino.png');
    this.load.audio('music', 'assets/music/' + this.song_info[0]);
    this.load.audio('music1', 'assets/music/' + this.song_info[1]);
    this.load.audio('music2', 'assets/music/' + this.song_info[2]);
    this.load.audio('music3', 'assets/music/' + this.song_info[3]);

  }

  create(){
    this.clock = this.plugins.get('rexclockplugin').add(this, config);
    this.clock.start();
    this.music = this.sound.add('music');
    this.music1 = this.sound.add('music1');
    this.music2 = this.sound.add('music2');
    this.music3 = this.sound.add('music3');
    this.music.play();
    this.music1.play();
    this.music2.play();
    this.music3.play();
    this.music1.setMute(true);
    this.music2.setMute(true);
    this.music3.setMute(true);
    // add sky
    this.sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(2.3).setScrollFactor(0);

    // create ground
    this.ground = this.physics.add.staticGroup();
    this.ground_1 = this.ground.create(0, window.innerHeight, 'ground').setScale(2).refreshBody();
    var newvar = this.cache.json.get('ctrls');
    if(this.song_num == 0){
      var tempo = parseFloat(newvar.tempo);
      this.speed = tempo/30;
      this.beats = newvar.beats;
    } else if(this.song_num == 1){
      var tempo = parseFloat(newvar.tempo1);
      this.speed = tempo/30;
      this.beats = newvar.beats1;
    } else {
      var tempo = parseFloat(newvar.tempo2);
      this.speed = tempo/30;
      this.beats = newvar.beats2;
      console.log(this.beats)
    }


    // create platforms
    this.platforms = this.physics.add.staticGroup();
    this.platform_1 = this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(700, 220, 'ground');

    // create player

    this.player = this.physics.add.sprite(0, 0, 'dude').setScale(2.3).refreshBody();
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);





    // setting the gravity of the player

    this.player.body.setGravityY(300);

    // add collider between the player and any platforms
    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.collider(this.player, this.ground);



    // create stars

    this.stars = this.physics.add.group({
      key: 'blue',
      repeat: 5,
      setXY: {
        x: 160,
        y: 0,
        stepX: 160
      }
    });

    var star_colors = ['blue', 'pink', 'orange', 'green'];
    var index = 0;
    this.star_colors = star_colors;
    this.stars.children.iterate(function (child) {
      child.key = star_colors[index];
      child.setScale(.2).refreshBody();
      index += 1;

    });


    // add star collider with platforms

    this.physics.add.collider(this.stars, this.ground);
    this.physics.add.collider(this.stars, this.platforms);

    // let the user collect stars

    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    // create obstacles

    this.obstacles = this.physics.add.group();


    this.physics.add.collider(this.obstacles, this.ground);
    this.physics.add.collider(this.obstacles, this.platforms);

    this.physics.add.collider(this.player, this.obstacles, this.loseHealth, null, this);



    // create text for the score
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#000'
    });
    this.scoreText.setScrollFactor(0);

    // create health bar
    this.health_imgs = ['heart_0', 'heart_1', 'heart_2', 'heart_3', 'heart_4']

    this.health_bar = this.add.image(700, 30, this.health_imgs[this.health]).setScale(1.3);
    this.health_bar.setScrollFactor(0);
  }

  update(){
    var cam = this.cameras.main;
    cam.scrollX += this.speed;
    this.physics.world.bounds.left = cam.worldView.left + 30;
    this.physics.world.bounds.right = cam.worldView.right;

    Phaser.Actions.Call(this.stars.getChildren(), function (sprite) {
      if (sprite.x + 30 < this.physics.world.bounds.left) {
        sprite.destroy();
      }
    }, this);

    Phaser.Actions.Call(this.ground.getChildren(), function (sprite) {
      if (sprite.x + 30 < this.physics.world.bounds.left) {

        sprite.destroy();
      }
    }, this);

    Phaser.Actions.Call(this.obstacles.getChildren(), function (sprite) {
      if (sprite.x + 30 < this.physics.world.bounds.left) {
        sprite.destroy();
      }
    }, this);

    Phaser.Actions.Call(this.platforms.getChildren(), function (sprite) {
      if (sprite.x + 30 + sprite.width < this.physics.world.bounds.left) {
        sprite.destroy();
      }
    }, this);

    if (this.ground.getFirst(true).x <= this.physics.world.bounds.left) {
      this.ground.create(this.physics.world.bounds.left, 600, 'ground').setScale(4).refreshBody();
    }

    // creates new plaforms every 3 seconds

   if (this.clock.now - this.old_time > 6000 / this.speed) {
      var platform_resize = Phaser.Math.Between(2, 18);
      var platform_y = Phaser.Math.Between(100, 600 - this.ground_1.height - this.platform_1.height - this.player.displayHeight -150);
      var new_platform = this.platforms.create(this.physics.world.bounds.right, platform_y + 71, 'ground').setScale(platform_resize / 20, 1);
      new_platform.x = this.physics.world.bounds.right + new_platform.width;
      new_platform.body.updateFromGameObject();
      if(this.obs_prob > 10){
        this.obs_prob -= 1;
      }
      this.old_time = this.clock.now;

    }

    // lets the player jump using the spacebar
    var cursors = this.input.keyboard.createCursorKeys();

    if (cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-600);
      this.player.setVelocityX(0);
    }

    // clears tint after 1s
    if(this.clock.now - this.tint_time > 1000){
      this.player.clearTint();
    }


    // adds a note or an obstacle on the beat based on a random probability
    for(var i = 0; i < this.beats.length; i++){
      if (Math.abs((this.clock.now) - (this.beats[i]*1000.0)) <= 10) {
        var decide = Phaser.Math.Between(0, this.obs_prob)
        if(decide > this.obs_prob - 1){
          var new_obstacle = this.obstacles.create(this.physics.world.bounds.right, 0, 'bomb').setScale(2).refreshBody();
        } else {
          var star_color = Phaser.Math.Between(0, 3);
          this.stars.create(this.physics.world.bounds.right - 10, 0, this.star_colors[star_color]).setScale(.2).refreshBody();
        }
        this.beats.splice(i, 1);
        break;
      }
  }

    // no health, game over
    if (this.health <= 0) {
      this.end();
    }

  }

  end(){
    this.clock.stop();
    this.music.stop();
    this.music1.stop();
    this.music2.stop();
    this.music3.stop();
    this.scene.start("restartGame", {score: this.score, song: this.song_num});
  }

  loseHealth(player, obstacle) {
    obstacle.destroy();
    this.health -= 1;
    this.health_bar.destroy();
    player.setTint(0xff0000);
    this.tint_time = this.clock.now;
    var curtime = this.music.seek;
    if (this.health==3){
      this.music.setMute(true);
      this.music1.setMute(false);
      this.music1.setSeek(curtime);
    }
    if (this.health==2){
      this.music1.setMute(true);
      this.music2.setMute(false);
      this.music2.setSeek(curtime);
    }
    if (this.health==1){
      this.music2.setMute(true);
      this.music3.setMute(false);
      this.music3.setSeek(curtime);
    }
    this.health_bar = this.add.image(700, 30, this.health_imgs[this.health]).setScale(1.3);
    this.health_bar.setScrollFactor(0);
  }

  collectStar(player, star) {

    // destroy the star
    star.destroy();

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);




  }


}
