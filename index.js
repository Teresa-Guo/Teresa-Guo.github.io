var game = new Phaser.Game(600, 600, Phaser.AUTO, '', // 黑框邊界
    { preload: preload, create: create, update: update });

var player;
var keyboard;

var platforms = []; // 紀錄平台的陣列

var leftWall;
var leftWall2;

var rightWall;
var rightWall2;

var ceiling;
var ceiling2;

var text1;
var text2;
var text3;

var distance = 0;
var status = 'running';

window.alert("以下是小朋友下樓梯的遊戲規則：\n控制鍵盤左右鍵移動角色\n碰到釘子會扣一條命\n當生命小於0時 遊戲結束")

function preload () {

    game.load.baseURL = 'https://github.io/Brian591757/assets/';

    game.load.crossOrigin = 'anonymous';
    game.load.spritesheet('player', 'player.png', 32, 32);
    game.load.image('wall', 'wall.png');
    game.load.image('ceiling', 'ceiling.png');
    game.load.image('normal', 'normal.png');
    game.load.image('nails', 'nails.png');
    game.load.spritesheet('conveyorRight', 'conveyor_right.png', 96, 16);
    game.load.spritesheet('conveyorLeft', 'conveyor_left.png', 96, 16);
    game.load.spritesheet('trampoline', 'trampoline.png', 96, 22);
    game.load.spritesheet('fake', 'fake.png', 96, 36);
}

function create () {

    keyboard = game.input.keyboard.addKeys({
        'enter': Phaser.Keyboard.ENTER,
        'up': Phaser.Keyboard.UP,
        'down': Phaser.Keyboard.DOWN,
        'left': Phaser.Keyboard.LEFT,
        'right': Phaser.Keyboard.RIGHT,
        'w': Phaser.Keyboard.W,
        'a': Phaser.Keyboard.A,
        's': Phaser.Keyboard.S,
        'd': Phaser.Keyboard.D
    });

    createBounders();
    createPlayer();
    createTextsBoard();
}

function update () {

    // bad
    if(status == 'gameOver' && keyboard.enter.isDown) restart();
    if(status != 'running') return;

    this.physics.arcade.collide(player, platforms, effect);
    this.physics.arcade.collide(player, [leftWall,leftWall2, rightWall,rightWall2]);
    checkTouchCeiling(player);
    checkGameOver();

    updatePlayer();
    updatePlatforms();
    updateTextsBoard();

    createPlatforms();
}

function createBounders () {
    leftWall = game.add.sprite(0, 0, 'wall'); // 在座標(0,0)的位置生成一張牆壁的圖
    leftWall2 = game.add.sprite(0, 200, 'wall');
    game.physics.arcade.enable(leftWall);
    game.physics.arcade.enable(leftWall2);
    leftWall.body.immovable = true;
    leftWall2.body.immovable = true;

    rightWall = game.add.sprite(583, 0, 'wall');
    rightWall2 = game.add.sprite(583, 200, 'wall');
    game.physics.arcade.enable(rightWall);
    rightWall.body.immovable = true;
    game.physics.arcade.enable(rightWall2);
    rightWall2.body.immovable = true;

    ceiling = game.add.image(0, 0, 'ceiling');
    ceiling2 = game.add.image(200, 0, 'ceiling');
}

var lastTime = 0;
function createPlatforms () {
    if(game.time.now > lastTime + 600) { // 生成平台時間越少 平台之間垂直距離越短
        lastTime = game.time.now;
        createOnePlatform();
        distance += 1;
    }
}

function createOnePlatform () {

    var platform;
    var x = Math.random()*(600 - 96 - 40) + 20; // 平台生成x座標
    var y = 600; // 平台生成y座標
    var rand = Math.random() * 100; // 用rand()生成0~1數字 機率生成各個平台

    if(rand < 30) { // 可改機率
        platform = game.add.sprite(x, y, 'normal');
    } else if (rand < 40) {
        platform = game.add.sprite(x, y, 'nails');
        game.physics.arcade.enable(platform);
        platform.body.setSize(96, 15, 0, 15);
    } else if (rand < 50) {
        platform = game.add.sprite(x, y, 'conveyorLeft');
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        platform.play('scroll');
    } else if (rand < 60) {
        platform = game.add.sprite(x, y, 'conveyorRight');
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        platform.play('scroll');
    } else if (rand < 80) {
        platform = game.add.sprite(x, y, 'trampoline');
        platform.animations.add('jump', [4, 5, 4, 3, 2, 1, 0, 1, 2, 3], 120);
        platform.frame = 3;
    } else {
        platform = game.add.sprite(x, y, 'fake');
        platform.animations.add('turn', [0, 1, 2, 3, 4, 5, 0], 14);
    }

    game.physics.arcade.enable(platform);
    platform.body.immovable = true;
    platforms.push(platform);

    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
}

function createPlayer() {
    player = game.add.sprite(300, 50, 'player'); // 玩家初始位置
    game.physics.arcade.enable(player);
    player.body.gravity.y = 500; // 重力變小 掉下來速度變小
    player.animations.add('left', [0, 1, 2, 3], 8);
    player.animations.add('right', [9, 10, 11, 12], 8);
    player.animations.add('flyleft', [18, 19, 20, 21], 12);
    player.animations.add('flyright', [27, 28, 29, 30], 12);
    player.animations.add('fly', [36, 37, 38, 39], 12);
    player.life = 10;
    player.unbeatableTime = 0;
    player.touchOn = undefined;
}

function createTextsBoard () {
    var style = {fill: '#ff0000', fontSize: '20px'}
    text1 = game.add.text(20, 10, '', style); // life文字位置
    text2 = game.add.text(550, 10, '', style); // 地下幾樓文字位置
    text3 = game.add.text(225, 280, 'Enter 重新開始', style);
    text3.visible = false;
}

function updatePlayer () {
    if(keyboard.left.isDown) {
        player.body.velocity.x = -400; // 玩家控制鍵盤的往左移動速度
    } else if(keyboard.right.isDown) {
        player.body.velocity.x = 400; // 玩家控制鍵盤的往右移動速度
    } else {
        player.body.velocity.x = 0;
    }
    setPlayerAnimate(player);
}

function setPlayerAnimate(player) {
    var x = player.body.velocity.x;
    var y = player.body.velocity.y;

    if (x < 0 && y > 0) {
        player.animations.play('flyleft');
    }
    if (x > 0 && y > 0) {
        player.animations.play('flyright');
    }
    if (x < 0 && y == 0) {
        player.animations.play('left');
    }
    if (x > 0 && y == 0) {
        player.animations.play('right');
    }
    if (x == 0 && y != 0) {
        player.animations.play('fly');
    }
    if (x == 0 && y == 0) {
      player.frame = 8;
    }
}

function updatePlatforms () {
    for(var i=0; i<platforms.length; i++) {
        var platform = platforms[i];
        platform.body.position.y -= 3; // 平台往上的速度
        if(platform.body.position.y <= -20) { // 平台往上跑到-20之上時
            platform.destroy(); // 刪掉往上跑的平台
            platforms.splice(i, 1);
        }
    }
}

function updateTextsBoard () {
    text1.setText('life:' + player.life);
    text2.setText('B' + distance);
}

function effect(player, platform) {
    if(platform.key == 'conveyorRight') {
        conveyorRightEffect(player, platform);
    }
    if(platform.key == 'conveyorLeft') {
        conveyorLeftEffect(player, platform);
    }
    if(platform.key == 'trampoline') {
        trampolineEffect(player, platform);
    }
    if(platform.key == 'nails') {
        nailsEffect(player, platform);
    }
    if(platform.key == 'normal') {
        basicEffect(player, platform);
    }
    if(platform.key == 'fake') {
        fakeEffect(player, platform);
    }
}

function conveyorRightEffect(player, platform) {
    player.body.x += 2; // 往右移動平台的速度
}

function conveyorLeftEffect(player, platform) {
    player.body.x -= 2; // 往左移動平台的速度
}

function trampolineEffect(player, platform) {
    platform.animations.play('jump');
    player.body.velocity.y = -400; // 往上跳的距離
}

function nailsEffect(player, platform) {
    if (player.touchOn !== platform) {
        player.life -= 3;
        player.touchOn = platform;
        game.camera.flash(0xff0000, 100);
    }
}

function basicEffect(player, platform) {
    if (player.touchOn !== platform) {
        if(player.life < 10) {
            player.life += 1;
        }
        player.touchOn = platform;
    }
}

function fakeEffect(player, platform) {
    if(player.touchOn !== platform) {
        platform.animations.play('turn');
        setTimeout(function() {
            platform.body.checkCollision.up = false;
        }, 100);
        player.touchOn = platform;
    }
}

function checkTouchCeiling(player) {
    if(player.body.y < 0) {
        if(player.body.velocity.y < 0) {
            player.body.velocity.y = 0;
        }
        if(game.time.now > player.unbeatableTime) {
            player.life -= 3;
            game.camera.flash(0xff0000, 100);
            player.unbeatableTime = game.time.now + 2000;
        }
    }
}

function checkGameOver () {
    if(player.life <= 0 || player.body.y > 500) { // 到底端會死掉
        gameOver();
    }
}

function gameOver () {
    text3.visible = true;
    platforms.forEach(function(s) {s.destroy()});
    platforms = [];
    status = 'gameOver';
}

function restart () {
    text3.visible = false;
    distance = 0;
    createPlayer();
    status = 'running';
}
