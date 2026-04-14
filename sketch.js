/**
 * p5_audio_visualizer
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形在視窗內移動反彈，且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數
let shapes = [];
let song;
let amplitude;
// 外部定義的二維陣列，做為多邊形頂點的基礎座標
let points = [[-3, 5], [5, 6], [8, 0], [5, -6], [-3, -5], [-6, 0]];

function preload() {
  // 在程式開始前預載入外部音樂資源
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布
  createCanvas(windowWidth, windowHeight);
  
  // 循環播放音樂 (瀏覽器可能會阻擋自動播放，通常需要使用者互動才能開始)
  if (song.isLoaded()) {
    song.loop();
  }

  // 初始化振幅物件
  amplitude = new p5.Amplitude();

  // 產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    let shape = {
      x: random(0, windowWidth),      // 初始 X 座標
      y: random(0, windowHeight),     // 初始 Y 座標
      dx: random(-3, 3),              // X 軸水平移動速度
      dy: random(-3, 3),              // Y 軸垂直移動速度
      scale: random(1, 10),           // 縮放比例 (雖然 draw 中主要使用 sizeFactor，但此屬性保留於物件結構中)
      color: color(random(255), random(255), random(255)), // 隨機生成的 RGB 顏色
      // 透過 map() 讀取全域陣列 points，產生變形
      points: points.map(pt => {
        return {
          x: pt[0] * random(10, 30),
          y: pt[1] * random(10, 30)
        };
      })
    };
    shapes.push(shape);
  }
}

function draw() {
  // 設定背景顏色
  background('#ffcdb2');
  
  // 設定邊框粗細
  strokeWeight(2);

  // 取得當前音量大小 (0 到 1)
  let level = amplitude.getLevel();
  
  // 將音量映射到縮放倍率 (0.5 到 2)
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 走訪 shapes 陣列進行更新與繪製
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push();
    translate(shape.x, shape.y);
    scale(sizeFactor); // 依照音樂音量縮放圖形

    // 繪製多邊形
    beginShape();
    for (let pt of shape.points) {
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);

    // 狀態還原
    pop();
  }
}

// 視窗大小改變時調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 點擊滑鼠以確保音訊 context 啟動 (處理瀏覽器自動播放策略)
function mousePressed() {
  if (song.isLoaded() && !song.isPlaying()) {
    song.loop();
  }
  userStartAudio();
}
