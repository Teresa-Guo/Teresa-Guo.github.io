var game = new Phaser.Game(399, 399, Phaser.AUTO, 'container1',
    { preload: preload, create: create, update: update });
//https://hackmd.io/@NrgG4-TCS42pma6IfQW84A/rkR_9r4Qe?type=slide#/1
var player;
var keyboard;

var platforms = [];
var grass;

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

var countdownSeconds = 180; //倒數計時的秒數
var startTime = Date.now();
var countdownInterval = null;
var remainingSeconds = null;

// window.alert("以下是小朋友下樓梯的遊戲規則：\n控制鍵盤左右鍵移動角色\n碰到釘子會扣一條命\n當生命小於0時 遊戲結束")

var touchLeft = false;
var touchRight = false;

function preload () {
    //game.load.baseURL = 'https://yesfish1010.github.io/Brian591757.github.io/assets/';
    game.load.baseURL = 'https://Brian591757.github.io/assets/';
    //game.load.baseURL = 'https://wacamoto.github.io/NS-Shaft-Tutorial/assets/';
    game.load.crossOrigin = 'anonymous';
    game.load.spritesheet('player', 'player.png', 32, 32);
    game.load.image('wall_new', 'wall_new.png');
    game.load.image('ceiling_new', 'ceiling_new.png');
    game.load.image('grass', 'grass.png');
    game.load.image('normal', 'normal.png');
    game.load.image('nails_new', 'nails_new.png');
    game.load.spritesheet('conveyorRight', 'conveyor_right.png', 73, 12);
    game.load.spritesheet('conveyorLeft', 'conveyor_left.png', 72, 12);
    game.load.spritesheet('trampoline', 'trampoline.png', 72, 22);
    game.load.spritesheet('fake', 'fake.png', 72, 36);
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

    ///加觸控
    game.input.touch.preventDefault = false;
    game.input.onDown.add(handleTouchStart, this)
    game.input.onUp.add(handleTouchEnd, this)


}
//觸控
function handleTouchStart(pointer) {
    if (status == 'running') {
        if (pointer.x < game.width / 2) {
            touchLeft = true;
            touchRight = false;
        }
        else if (pointer.x > game.width / 2) {
            touchLeft = false;
            touchRight = true;
        }
        else {
            touchLeft = false;
            touchRight = false;
        }
    }
    else if (status == 'gameOver') {
        restart();
    }
}
//觸控放開
function handleTouchEnd(pointer) {
        touchLeft = false;
        touchRight = false;    
}
function update () {
    console.log(status);
 //   console.log("A");
    updateTextsBoard();
 //   console.log(status)
    if(status == 'finish') return;
    // bad
    if (status == 'gameOver' && keyboard.enter.isDown) restart();

 //   game.input.onDown.add(handleTouchStart, this)
    if(status != 'running') return;


    this.physics.arcade.collide(player, platforms, effect);
    this.physics.arcade.collide(player, [leftWall, rightWall, rightWall2, leftWall2]);
    checkTouchCeiling(player);
    checkGameOver();

    updatePlayer();
    updatePlatforms();
    // updateTextsBoard();

    createPlatforms();
}

function createBounders () {
    leftWall = game.add.sprite(0, 0, 'wall_new');
    leftWall2 = game.add.sprite(0, 400, 'wall_new');
    game.physics.arcade.enable(leftWall);
    game.physics.arcade.enable(leftWall2);
    leftWall.body.immovable = true;
    leftWall2.body.immovable = true;

    rightWall = game.add.sprite(382, 0, 'wall_new');
    game.physics.arcade.enable(rightWall);
    rightWall.body.immovable = true;
    rightWall2 = game.add.sprite(382, 400, 'wall_new');
    game.physics.arcade.enable(rightWall2);
    rightWall2.body.immovable = true;

    ceiling = game.add.image(18, 0, 'ceiling_new');
    //ceiling = game.add.image(399, 0, 'ceiling_new');
}

var lastTime = 0;
var startfloor = 0
function createPlatforms() {
 //   console.log(game.time)
    if (lastTime == 0) {
        lastTime = game.time.now;
        createOnePlatform(320);
        createOnePlatform(400);
      
    }
    if(game.time.now > lastTime + 500) {
        lastTime = game.time.now;
        createOnePlatform(400);
        distance += 1;
    }
}


function createOnePlatform (h) {

    var platform;
    var x = Math.random()*(399 - 96 - 40) + 20;
    var y = h;
    var rand = Math.random() * 100;

    if(rand < 30) {
        platform = game.add.sprite(x, y, 'grass');
    } else if (rand < 40) {
        platform = game.add.sprite(x, y, 'nails_new');
        game.physics.arcade.enable(platform);
        platform.body.setSize(72, 15, 0, 0);
        //platform.body.setSize(72, 15, 0, 15);
    } else if (rand < 50) {
        platform = game.add.sprite(x, y, 'conveyorLeft');
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        platform.play('scroll');
    } else if (rand < 60) {
        platform = game.add.sprite(x, y, 'conveyorRight');
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        platform.play('scroll');
    } else if (rand < 90) {
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
    player = game.add.sprite(200, 50, 'player');
    game.physics.arcade.enable(player);
    player.body.gravity.y = 450;
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
    text1 = game.add.text(10, 10, '', style);
    text2 = game.add.text(345, 10, '', style);
    text3 = game.add.text(78, 180, 'Enter 鍵或點擊螢幕重新開始', style);
    text3.visible = false;
}

function updatePlayer () {
    if(keyboard.left.isDown)  {
        player.body.velocity.x = -500;
    } else if (touchLeft == true) {
        player.body.velocity.x = -500;
    } else if (touchRight == true) {
        player.body.velocity.x = 500;
    } else if (keyboard.right.isDown) {
        player.body.velocity.x = 500;
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
        platform.body.position.y -= 3;
        if(platform.body.position.y <= 18) {
            platform.destroy();
            platforms.splice(i, 1);
        }
    }
}

function updateTextsBoard () {
    text1.setText('life:' + player.life);

    var currentTime = Date.now();
    var elapsedTime = currentTime - startTime;

    var remainingSeconds = Math.max(0, countdownSeconds - Math.floor(elapsedTime / 1000));
    if(remainingSeconds == 0){
        status = 'finish';
        showMyDialog(); // 彈出 <dialog>
        setTimeout(function() {
            window.location.href = 'https://www.surveycake.com/s/KO9Lv';
        }, 2000);
    }

    var minutes = Math.floor(remainingSeconds / 60);
    var seconds = remainingSeconds % 60;

    // 轉為 mm:ss 的形式
    var formattedTime = ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
    text2.setText(formattedTime);
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
    if(platform.key == 'nails_new') {
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
    player.body.x += 2;
}

function conveyorLeftEffect(player, platform) {
    player.body.x -= 2;
}

function trampolineEffect(player, platform) {
    platform.animations.play('jump');
    player.body.velocity.y = -300;
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
    if(player.life <= 0 || player.body.y > 399) {
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

// 關於時間結束後的彈出視窗之設定
function showMyDialog() {
    var dialog = document.getElementById('myDialog');
    dialog.style.display = 'block'; // 顯示 <dialog>
    dialog.showModal(); // 啟用模態對話框
}

// 在特定條件滿足時隱藏 <dialog>
function hideMyDialog() {
    var dialog = document.getElementById('myDialog');
    dialog.close(); // 隱藏 <dialog>
}
