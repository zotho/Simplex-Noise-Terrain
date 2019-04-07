let canvasWidth = 600,
    canvasHeight = 600;

let textureSize = 40;
let textureWidth = textureSize,
    textureHeight = textureSize;

let cellSize = 18.5;

let textureNoise;
let terrainSeed = Date.now();
let textureZ = [];
let increment = 0.08;
let offsetX = 10.5,
    offsetY = 20.5;
// let offsetZ = 30;

let terrainPow = 3.5;
let multiplier = 7;
let scaleZ = 150.5;
let doFloor = false;
let floorFactor = 25;

let isDesktop = false;

let settings = function() {
  this.cellSize = cellSize;
  this.increment = increment;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
  this.scaleZ = scaleZ;
  this.terrainPow = terrainPow;
  this.multiplier = multiplier;
  this.doFloor = doFloor;
  this.floorFactor = floorFactor;
  this.terrainSeed = terrainSeed;
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
  multiplier = sett.multiplier;
  doFloor = sett.doFloor;
  floorFactor = sett.floorFactor;

  updateTexture();
  drawTerrain();
}

function seedChanged() {
  terrainSeed = sett.terrainSeed;
  noise = new OpenSimplexNoise(terrainSeed);
}

function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  canvas = createCanvas(canvasWidth, canvasHeight, WEBGL).canvas;
  setAttributes('antialias', true);
  textureNoise = createImage(textureWidth, textureHeight);
  noise = new OpenSimplexNoise(terrainSeed);

  sett = new settings();
  gui = new dat.GUI();
  gui.add(sett, 'terrainSeed').onChange(seedChanged);
  gui.add(sett, 'cellSize',1,100).onChange(settingsChanged).min(1).max(200).step(0.025);
  gui.add(sett, 'increment',0.025,1.5).onChange(settingsChanged).min(0.025).max(1.5).step(0.025);
  gui.add(sett, 'offsetX',-20,20).onChange(settingsChanged).min(-20).max(20).step(0.025);
  gui.add(sett, 'offsetY',-20,20).onChange(settingsChanged).min(-20).max(20).step(0.025);
  gui.add(sett, 'scaleZ',10,1500).onChange(settingsChanged).min(10).max(1500).step(0.025);
  gui.add(sett, 'terrainPow',0.025,10).onChange(settingsChanged).min(0.025).max(10).step(0.025);
  gui.add(sett, 'multiplier',0.5,10).onChange(settingsChanged).min(0.5).max(10).step(0.025);
  gui.add(sett, 'doFloor').onChange(settingsChanged);
  gui.add(sett, 'floorFactor',1,255).onChange(settingsChanged).min(1).max(255).step(1);
  gui.close();

  updateTexture();
  drawTerrain();
}

function draw() {
  updateTexture();
  drawTerrain();
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

      // Floor
      // let bright = Math.floor(map(n, -1, 1, 0, 10))/10*255;

      // Pow
      // let bright = map(n, -1, 1, 0, 255);
      // bright = Math.pow(bright/255, sett.terrainPow)*255;

      // Arcsin
      let bright = Math.asin(map(n, -1, 1, 0, 1))/HALF_PI;
      bright = Math.pow(bright, sett.terrainPow);
      if (sett.doFloor) {
        bright = Math.floor(bright*sett.floorFactor)/sett.floorFactor;
      }
      bright = Math.asin(bright)/HALF_PI;
      bright *= 255 * multiplier;

      let index = (x + y * textureWidth) * 4;
      textureNoise.pixels[index] = bright;
      textureNoise.pixels[index + 1] = bright;
      textureNoise.pixels[index + 2] = bright;
      textureNoise.pixels[index + 3] = 255;
      textureZ[index/4] = bright/255; 
    }
  }
  textureNoise.updatePixels();
}

function drawTerrain() {
    // image(textureNoise, 0, 0, canvasWidth, canvasHeight, 0, 0, textureWidth, textureHeight);
    background(50);
    translate(0, 50, -1000);
    rotateX(PI/6 + map(rotationX, -180, 180, -PI, PI));
    translate(0, mouseY, mouseY)
    rotateZ(map(mouseX, 0, width, -HALF_PI, HALF_PI)+map(rotationZ, -180, 180, -PI, PI));
    translate(-textureWidth*sett.cellSize/2, -textureHeight*sett.cellSize/2);
    let tex = createGraphics(textureWidth, textureHeight);
    tex.image(textureNoise, 0, 0)
    for (let y = 0; y < textureHeight-1; y++) {
      beginShape(TRIANGLE_STRIP);
      texture(tex);
      for (let x = 0; x < textureWidth; x++) {
        let index = x + y * textureWidth;
        vertex(x * sett.cellSize, y * sett.cellSize,       textureZ[index]*sett.scaleZ, x, y);
        vertex(x * sett.cellSize, (y + 1) * sett.cellSize, textureZ[index+textureWidth]*sett.scaleZ, x, (y+1));
      }
      endShape(CLOSE);
    }
}

function touchMoved() {
  // prevent default
  return false;
}
