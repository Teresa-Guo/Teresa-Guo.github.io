var game = new Phaser.Game(600, 600, Phaser.AUTO, '', // 在網頁上的長 寬
    { preload: preload, create: create, update: update });

var player;
var keyboard;

var platforms = []; // 因為遊戲中平台會不斷生成和消失 所以需要用陣列來儲存

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

    game.load.baseURL = 'https://Teresa-Guo.github.io/pictures/'; // 代換自己的線上.io網址
    // game.load.baseURL = 'https://wacamoto.github.io/NS-Shaft-Tutorial/assets/';
    //https://github.com/Teresa-Guo/Donwstairs/tree/main/new_pictures
    game.load.crossOrigin = 'anonymous';

    // spritesheet用在包含多個分別的圖片 image則是單一圖片
    game.load.spritesheet('player', 'player.png', 32, 32); // ('圖片在線上資料夾名稱', '圖片的線上資料夾路徑', 寬像素, 高像素)
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

    this.physics.arcade.collide(player, platforms, effect); // 檢測玩家和平台的碰撞 並執行effect函式
    this.physics.arcade.collide(player, [leftWall,leftWall2, rightWall,rightWall2]);
    checkTouchCeiling(player);
    checkGameOver();

    updatePlayer();
    updatePlatforms();
    updateTextsBoard();

    createPlatforms();
}

function createBounders () {
    leftWall = game.add.sprite(0, 0, 'wall'); // sprite為創造的遊戲精靈 (網頁上座標, '圖片名稱')
    leftWall2 = game.add.sprite(0, 200, 'wall');
    game.physics.arcade.enable(leftWall); // 啟用物理引擎對leftWall和其他物體進行碰撞處理
    game.physics.arcade.enable(leftWall2);
    leftWall.body.immovable = true; // 牆是靜止的
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

var lastTime = 0; // 用來記錄上一次創建平台的時間
function createPlatforms () {
    if(lastTime == 0) { // 一開始就生成兩個平台在450 550的座標
        lastTime = game.time.now;
        createOnePlatform(450);
        createOnePlatform(550);
        distance += 1;
    }

    if(game.time.now > lastTime + 600) { // 生成平台時間越少 平台之間垂直距離越短 每隔600毫秒創造一個新平台
        lastTime = game.time.now;
        createOnePlatform(600);
        distance += 1; // distance用來記錄現在往下到第幾個平台
    }
}

function createOnePlatform (createTime) {

    var platform;
    var x = Math.random()*(600 - 96 - 40) + 20; // 平台生成x座標
    var y = createTime; // 平台生成y座標
    var rand = Math.random() * 100; // Math.random()會隨機產生0 1數字 所以代表隨機生成各種平台之機率

    if(rand < 30) { // 可改機率
        platform = game.add.sprite(x, y, 'normal');
    } else if (rand < 40) {
        platform = game.add.sprite(x, y, 'nails');
        game.physics.arcade.enable(platform);
        platform.body.setSize(96, 15, 0, 15); // (物理碰撞的寬度, 碰撞高度, 相對platform的水平偏移量, 垂直偏移量)
    } else if (rand < 50) {
        platform = game.add.sprite(x, y, 'conveyorLeft');
        // 下行可以達成輸送帶在傳輸的效果
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true); // ('動畫名稱', [conveyerLeft spritesheet上各圖片分別的編號], 動畫播放速度, 無限循環播放)
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
    platform.body.immovable = true; // 一般平台在碰撞時不會移動
    platforms.push(platform);

    platform.body.checkCollision.down = false; // 禁用一般平台與下方物體的碰撞檢測
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
}

function createPlayer() {
    player = game.add.sprite(300, 50, 'player'); // 玩家初始位置
    game.physics.arcade.enable(player);
    player.body.gravity.y = 500; // 重力變小 掉下來速度變小
    player.animations.add('left', [0, 1, 2, 3], 8); // ('動畫名稱', [player spritesheet上各圖片分別的編號], 動畫撥放速度)
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
    text1 = game.add.text(20, 10, '', style); // 地下幾個平台字樣
    text2 = game.add.text(550, 10, '', style); // 生命數字樣
    text3 = game.add.text(225, 280, 'Enter 重新開始', style); // 重新開始字樣
    text3.visible = false;
}

function updatePlayer () {
    if(keyboard.left.isDown) { // isDown代表是否有按下左鍵
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
        if(platform.body.position.y <= -20) { // 平台往上跑到-20之上時 平台上移到天花板了
            platform.destroy(); // 刪掉往上跑的平台
            platforms.splice(i, 1); // 從陣列移出第i個元素
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
    player.body.x += 2; // 輸送帶使玩家右移速度
}

function conveyorLeftEffect(player, platform) {
    player.body.x -= 2; // 輸送帶使玩家左移速度
}

function trampolineEffect(player, platform) {
    platform.animations.play('jump');
    player.body.velocity.y = -300; // 彈跳床使玩家上移速度
}

function nailsEffect(player, platform) {
    if (player.touchOn !== platform) {
        player.life -= 3;
        player.touchOn = platform;
        game.camera.flash(0xff0000, 100); //背景閃爍(顏色色碼, 毫秒)
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
            platform.body.checkCollision.up = false; // 禁用玩家在假平台上方的碰撞檢測 看起來就像直接穿過假平台
        }, 100);
        player.touchOn = platform;
    }
}

function checkTouchCeiling(player) {
    if(player.body.y < 0) { // 若玩家處碰到天花板
        if(player.body.velocity.y < 0) { // 若玩家目前速度是往上
            player.body.velocity.y = 0; // 把玩加速度設成0
        }
        if(game.time.now > player.unbeatableTime) {
            player.life -= 3;
            game.camera.flash(0xff0000, 100);
            player.unbeatableTime = game.time.now + 2000; // unbeatableTime為玩家無敵時間
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
