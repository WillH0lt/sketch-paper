import { Application, Assets, Sprite } from "@pixi/node";
import canvas from "canvas";
import { writeFileSync } from "fs";

global.ImageData = canvas.ImageData;

// This package requires the new asset loader to be used.
// Initialize the new assets loader
await Assets.init();

// The application will create a renderer using WebGL. It will also setup the ticker
// and the root stage Container.
const app = new Application();

// load a sprite
const bunnyTexture = await Assets.load(
  "https://pixijs.io/examples/examples/assets/bunny.png"
);
// create sprite from texture
const bunny = Sprite.from(bunnyTexture);

// Setup the position of the bunny
bunny.x = app.renderer.width / 2;
bunny.y = app.renderer.height / 2;

// Rotate around the center
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

bunny.rotation = Math.PI;

// Add the bunny to the scene we are building.
app.stage.addChild(bunny);

// Listen for frame updates
app.ticker.add(() => {
  // each frame we spin the bunny around a bit
  bunny.rotation += 0.01;
});

// extract and save the stage
app.renderer.render(app.stage);
const base64Image = app.renderer.extract
  .canvas(app.stage)
  .toDataURL("image/png");

const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
const output = `./test.png`;

writeFileSync(output, base64Data, "base64");

app.destroy();

console.log("done");
