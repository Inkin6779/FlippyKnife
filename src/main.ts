import spritesheetSrc from "./assets/packed/spritesheet.json?url";
import { Application, SCALE_MODES, Sprite, Spritesheet } from "pixi.js";
import { Assets } from "@pixi/assets";
import { Bodies, Composite } from "matter-js";
import { PhysicsManager } from "./physics";

Assets.add("sheet", spritesheetSrc);

const app = new Application({
  width: 414,
  height: 896,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});
const physics = new PhysicsManager(app);
document.body.appendChild(app.view);
start();

async function start(): Promise<void> {
  const sheet = (await Assets.load("sheet")) as Spritesheet;
  sheet.baseTexture.scaleMode = 0;
  sheet.baseTexture.update();
  const sprite = Sprite.from(sheet.textures["weapon_arrow.png"]);
  sprite.anchor.set(0.5);
  sprite.scale.set(4, -4);
  sprite.x = app.screen.width / 2;
  sprite.y = app.screen.height / 2;
  app.stage.addChild(sprite);

  const body = Bodies.rectangle(sprite.x, sprite.y, sprite.width, sprite.height);
  const ground = Bodies.rectangle(
    app.screen.width / 2,
    app.screen.height - 50,
    app.screen.width - app.screen.width * 0.1,
    100,
    {
      isStatic: true,
    }
  );

  // add all of the bodies to the world
  Composite.add(physics.engine.world, [body, ground]);

  app.ticker.add(() => {
    sprite.x = body.position.x;
    sprite.y = body.position.y;
  });
}
