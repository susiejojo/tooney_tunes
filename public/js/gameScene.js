class GameScene extends Phaser.Scene{
  constructor(){
    super("playGame");
  }

  init(data){
    // set global variables
    this.score = 0;
    this.scoreText;
    this.health = 4;
    this.speed;
    this.old_time = 0;
    this.tint_time = 0;
    this.obs_prob = 20;
    this.old_shield_score = 0;
    this.old_powerup_score = 0;
    this.shielded = false;
    this.finishTime = 0;
    this.isFinished = false;

    // get song number from pickMusic scene
    this.songs = [['song.mp3','song_conb.mp3', 'song_drums.mp3', 'song_other.mp3'],
      ['song2.mp3', 'song2_vocals.mp3', 'song2_drums.mp3', 'song2_bass.mp3'],
      ['song1.mp3', 'song1_vocals.mp3', 'song1_drums.mp3', 'song1_bass.mp3'],
      ['song3.m4a', 'song3_vocals.mp3', 'song3_drums.mp3', 'song3_bass.mp3']];
    this.song_num = data.song;
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
    this.load.json('ctrls', 'assets/data/info.json');
    this.load.spritesheet('dude',
        'assets/images/dinoSprite.png',
        { frameWidth: 24, frameHeight: 24 }
    );
    this.music_list = [this.load.audio('music0', 'assets/music/' + this.songs[0][0]),
    this.load.audio('music1', 'assets/music/' + this.songs[0][1]),
    this.load.audio('music2', 'assets/music/' + this.songs[0][2]),
    this.load.audio('music3', 'assets/music/' + this.songs[0][3]),
    this.load.audio('music4', 'assets/music/' + this.songs[1][0]),
    this.load.audio('music5', 'assets/music/' + this.songs[1][1]),
    this.load.audio('music6', 'assets/music/' + this.songs[1][2]),
    this.load.audio('music7', 'assets/music/' + this.songs[1][3]),
    this.load.audio('music8', 'assets/music/' + this.songs[2][0]),
    this.load.audio('music9', 'assets/music/' + this.songs[2][1]),
    this.load.audio('music10', 'assets/music/' + this.songs[2][2]),
    this.load.audio('music11', 'assets/music/' + this.songs[2][3]),
    this.load.audio('music12', 'assets/music/' + this.songs[3][0]),
    this.load.audio('music13', 'assets/music/' + this.songs[3][1]),
    this.load.audio('music14', 'assets/music/' + this.songs[3][2]),
    this.load.audio('music15', 'assets/music/' + this.songs[3][3])]



  }

  create(){
    this.clock = this.plugins.get('rexclockplugin').add(this, config);
    this.clock.start();
    this.music = this.sound.add('music' + this.song_num*4);
    this.music1 = this.sound.add('music' + (this.song_num*4+1));
    this.music2 = this.sound.add('music' + (this.song_num*4+2));
    this.music3 = this.sound.add('music' + (this.song_num*4+3));
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
    var tempo;
    if(this.song_num == 0){
      tempo = parseFloat(newvar.tempo);
      this.speed = tempo/30;
      this.beats = newvar.beats;
    } else if(this.song_num == 1){
      tempo = parseFloat(newvar.tempo1);
      this.speed = tempo/30;
      this.beats = newvar.beats1;
    } else if(this.song_num == 2){
      tempo = parseFloat(newvar.tempo2);
      this.speed = tempo/30;
      this.beats = newvar.beats2;
    } else{
      tempo = parseFloat(newvar.tempo2);
      this.speed = 96.9/30;
      this.beats = newvar.beats;

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

    this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 9 }),
    frameRate: tempo/10,
    repeat: -1
    });

    this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNumbers('dude', { start: 10, end: 13 }),
    frameRate: (tempo/10)/3
    });

    this.player.anims.play('right', true);







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
      this.player.anims.play('jump', true);
      this.player.setVelocityY(-600);
      this.player.setVelocityX(0);
    } else if(this.player.body.touching.down){
      this.player.anims.play('right', true);
    }


    // clears tint after 1s
    if(!this.shielded && this.clock.now - this.tint_time > 1000){
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
  // gives the player one of two powerups
  if(this.score - this.old_powerup_score > 550){
      this.powerUp();
      this.old_powerup_score = this.score;
  }
  if(this.score - this.old_shield_score > 300){
      this.shield();
      this.old_shield_score = this.score;
  }

    // no health, game over
    if (this.health <= 0) {
      this.end();
    }

    // start ending the game when the music stops
    if (!this.music.isPlaying){
      this.scoreText.setText('Level Complete!');
      this.isFinished = true;
      this.finishTime = this.clock.now;

    }

    // let the player see that they have won, then end game
    if (this.isFinished && this.clock.now - this.finishTime > 2000){
      this.end();
    }

  }

  end(){
    // stop everything and return to restart menu
    this.clock.stop();
    this.music.stop();
    this.music1.stop();
    this.music2.stop();
    this.music3.stop();
    this.scene.start("restartGame", {score: this.score, song: this.song_num});
  }

  shield(){
    this.player.setTint(0x00fc1d);
    this.shielded = true;
  }

  loseHealth(player, obstacle) {
    obstacle.destroy();
    player.clearTint();
    if(!this.shielded){
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

  } else {
    this.shielded = false;
  }
  }

  powerUp() {
    if(this.health < 4){
    this.health += 1;
    }
    this.health_bar.destroy();
    if(!this.shielded){
      this.player.setTint(0x8de8fc);
    }
    this.tint_time = this.clock.now;
    var curtime = this.music.seek;
    if (this.health==4){
      this.music.setMute(false);
      this.music1.setMute(true);
      this.music.setSeek(curtime);
    }
    if (this.health==3){
      this.music2.setMute(true);
      this.music1.setMute(false);
      this.music1.setSeek(curtime);
    }
    if (this.health==2){
      this.music3.setMute(true);
      this.music2.setMute(false);
      this.music2.setSeek(curtime);
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
