
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
    this.add.image(400,300,'sky');

    // create group of platforms
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // create player

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // creating the animation of the sprite

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });


  // setting the gravity of the player

  player.body.setGravityY(300);

  // add collider between the player and any platforms

  this.physics.add.collider(player, platforms);

  // create stars

  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: {x: 12, y: 0, stepX: 70}
  });

 // add star collider with platforms

 this.physics.add.collider(stars, platforms);

 // let the user collect stars

 this.physics.add.overlap(player, stars, collectStar, null, this);

  stars.children.iterate(function (child){
  child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
});

  // create text for the score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  // create bomb group and colliders

  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);

}

function update ()
{
  cursors = this.input.keyboard.createCursorKeys();

  if(cursors.left.isDown){
    player.setVelocityX(-300);
    player.anims.play('left', true);
  } else if (cursors.right.isDown){
    player.setVelocityX(300);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if(cursors.space.isDown && player.body.touching.down){
    player.setVelocityY(-500);
  }
}


function collectStar(player, star){

  // disable the star's physics body and make it invisible
  star.disableBody(true, true);

  score += 10;

  scoreText.setText('Score: ' + score);

  // refills stars if they're all gone

  if(stars.countActive(true) === 0){
    stars.children.iterate(function(child){
      child.enableBody(true, child.x, 0, true, true);
    });

  // creates a random bomb

  var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }


}

function hitBomb(player, bomb){
  // ends the game and turns the player red

  this.physics.pause();

  player.setTint(0xff0000);
  player.anims.play('turn');
  gameOver = true;
}
