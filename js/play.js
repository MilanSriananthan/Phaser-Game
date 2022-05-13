class Play {
  create() {
    this.player = this.physics.add.sprite(250, 170, "player");
    this.coin = this.physics.add.sprite(60, 130, "coin");
    this.player.body.gravity.y = 500;
    this.arrow = this.input.keyboard.createCursorKeys();
    this.createWorld();
    this.scoreLabel = this.add.text(30, 25, "score: 0", {
      font: "18px Arial",
      fill: "#fff",
    });
    this.score = 0;
    this.enemies = this.physics.add.group();
    this.time.addEvent({
      delay: 2200,
      callback: () => this.addEnemy(),
      loop: true,
    });

    this.jumpSound = this.sound.add("jump");
    this.coinSound = this.sound.add("coin");
    this.deadSound = this.sound.add("dead");

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { frames: [1, 2] }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { frames: [3, 4] }),
      frameRate: 8,
      repeat: -1,
    });

    let particles = this.add.particles("pixel");

    this.emitter = particles.createEmitter({
      quantity: 15,
      speed: { min: -150, max: 150 },
      scale: { start: 2, end: 0.1 },
      lifespan: 800,
      on: false,
    });
  }

  update() {
    //this.player.angle++;
    this.movePlayer();
    this.physics.collide(this.player, this.walls);
    this.physics.collide(this.enemies, this.walls);
    if (!this.player.active) {
      return;
    }
    if (this.player.y > 340 || this.player < 0) {
      this.playerDie();
    }
    if (this.physics.overlap(this.player, this.coin)) {
      this.takeCoin();
    }
    if (this.physics.overlap(this.player, this.enemies)) {
      this.playerDie();

      let now = Date.now();

      if (this.nextEnemy < now) {
        let startDiff = 4000;
        let endDiff = 1000;
        let scoreToReachEndDiff = 100;

        let progress = Math.min(this.score / scoreToReachEndDiff, 1);
        let delay = startDiff - (startDiff - endDiff) * progress;
        this.addEnemy();
        this.nextEnemy = now + delay;
      }
    }
  }

  movePlayer() {
    if (this.arrow.left.isDown) {
      this.player.body.velocity.x = -200;
      this.player.anims.play("left", true);
    } else if (this.arrow.right.isDown) {
      this.player.body.velocity.x = 200;
      this.player.anims.play("right", true);
    } else {
      this.player.body.velocity.x = 0;
      this.player.setFrame(0);
    }

    if (this.arrow.up.isDown && this.player.body.onFloor()) {
      this.player.body.velocity.y = -320;
      this.jumpSound.play();
    }
  }

  createWorld() {
    this.walls = this.physics.add.staticGroup();

    this.walls.create(10, 170, "wallV");
    this.walls.create(490, 170, "wallV");

    this.walls.create(50, 10, "wallH");
    this.walls.create(450, 10, "wallH");
    this.walls.create(50, 330, "wallH");
    this.walls.create(450, 330, "wallH");

    this.walls.create(0, 170, "wallH");
    this.walls.create(500, 170, "wallH");
    this.walls.create(250, 90, "wallH");
    this.walls.create(250, 250, "wallH");
  }

  playerDie() {
    //this.player.destroy();
    this.deadSound.play();
    this.cameras.main.shake(300, 0.02);
    //this.cameras.main.flash(300);
    this.emitter.setPosition(this.player.x, this.player.y);
    this.emitter.explode();
    this.time.addEvent({
      delay: 1000,
      callback: () => this.scene.start("menu", { score: this.score }),
    });
    //this.scene.start("menu", { score: this.score });
  }

  takeCoin() {
    this.score += 5;
    this.scoreLabel.setText("score: " + this.score);
    this.coinSound.play();
    this.updateCoinPosition();
    this.coin.setScale(0);
    this.tweens.add({
      targets: this.coin,
      scale: 1,
      duration: 300,
    });

    this.tweens.add({
      targets: this.player,
      scale: 1.3,
      duration: 100,
      yoyo: true,
    });
  }

  updateCoinPosition() {
    let positions = [
      { x: 140, y: 60 },
      { x: 360, y: 60 },
      { x: 60, y: 140 },
      { x: 440, y: 140 },
      { x: 130, y: 300 },
      { x: 370, y: 300 },
    ];
    positions = positions.filter((coin) => coin.x !== this.coin.x);

    let newPosition = Phaser.Math.RND.pick(positions);
    this.coin.setPosition(newPosition.x, newPosition.y);
  }

  addEnemy() {
    let enemy = this.enemies.create(250, -10, "enemy");

    enemy.body.gravity.y = 500;
    enemy.body.velocity.x = Phaser.Math.RND.pick([-100, 100]);
    enemy.body.bounce.x = 1;
    this.nextEnemy = 0;
    //this.time.addEvent({
    //  delay: 10000,
    //  callback: () => enemy.destroy(),
    //});
  }
}
