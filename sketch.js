let canvasWidth = 600,
    canvasHeight = 600;

let textureSize = 200;
let textureWidth = textureSize,
    textureHeight = textureSize;

let cellSize = 18.001;

let textureNoise;
let increment = 0.08;
let offsetX = 10.001,
    offsetY = 20.001;
// let offsetZ = 30;
let terrainPow = 3.001;

let scaleZ = 150.001;

let settings = function() {
  this.cellSize = cellSize;
  this.increment = increment;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
  this.scaleZ = scaleZ;
  this.terrainPow = terrainPow;
}
let sett;
let gui;
let img;

function settingsChanged() {
  cellSize = sett.cellSize;
  increment = sett.increment;
  offsetX = sett.offsetX;
  offsetY = sett.offsetY;
  scaleZ = sett.scaleZ;
  terrainPow = sett.terrainPow;

  updateTexture();
  drawTerrain();
}

function setup() {
  canvas = createCanvas(canvasWidth, canvasHeight, WEBGL).canvas;
  textureNoise = createImage(textureWidth, textureHeight);
  noise = new OpenSimplexNoise(Date.now());

  sett = new settings();
  gui = new dat.GUI();
  gui.add(sett, 'cellSize',1,100).onChange(settingsChanged);
  gui.add(sett, 'increment',0.01,5).onChange(settingsChanged);
  gui.add(sett, 'offsetX',-10,20).onChange(settingsChanged);
  gui.add(sett, 'offsetY',-10,20).onChange(settingsChanged);
  gui.add(sett, 'scaleZ',10,500).onChange(settingsChanged);
  gui.add(sett, 'terrainPow',0.01,3).onChange(settingsChanged);

  updateTexture();
  drawTerrain();
}

function draw() {
  // updateTexture();
  // drawTerrain();
}

function updateTexture() {
  textureNoise.loadPixels();
  let yoff = sett.offsetY;
  for (let y = 0; y < textureHeight; y++) {
    let xoff = sett.offsetX;
    for (let x = 0; x < textureWidth; x++) {
      let n;
      n = noise.noise2D(xoff + (x - textureWidth / 2)  * sett.increment,
                        yoff + (y - textureHeight / 2) * sett.increment);

      let bright = Math.floor(map(n, -1, 1, 0, 10))/10*255;
      bright = Math.pow(bright/255, sett.terrainPow)*255;
      let index = (x + y * textureWidth) * 4;
      textureNoise.pixels[index] = bright;
      textureNoise.pixels[index + 1] = bright;
      textureNoise.pixels[index + 2] = bright;
      textureNoise.pixels[index + 3] = 255;
    }
  }
  textureNoise.updatePixels();
}

function drawTerrain() {
    // image(textureNoise, 0, 0, canvasWidth, canvasHeight, 0, 0, textureWidth, textureHeight);
    background(50);
    translate(0, 50, -1000);
    rotateX(PI/3);
    translate(-textureWidth*sett.cellSize/2, -textureHeight*sett.cellSize/2);
    let tex = createGraphics(textureWidth, textureHeight);
    tex.image(textureNoise, 0, 0)
    for (let y = 0; y < textureHeight-1; y++) {
      beginShape(TRIANGLE_STRIP);
      texture(tex);
      for (let x = 0; x < textureWidth; x++) {
        vertex(x * sett.cellSize, y * sett.cellSize,       textureNoise.get(x, y)[0]/255*sett.scaleZ, x/textureWidth*textureNoise.width, y/textureHeight*textureNoise.height);
        vertex(x * sett.cellSize, (y + 1) * sett.cellSize, textureNoise.get(x, y+1)[0]/255*sett.scaleZ, x/textureWidth*textureNoise.width, (y+1)/textureHeight*textureNoise.height);
      }
      endShape(CLOSE);
    }
}
