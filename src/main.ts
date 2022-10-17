import { Application, IPointData, SCALE_MODES, Sprite, Spritesheet } from "pixi.js";
import { Assets } from "@pixi/assets";
import { Bodies, Body, Composite, Detector } from "matter-js";
import { PhysicsManager } from "./physics";

Assets.add("sheet", "packed/spritesheet.json?url");
const rootElement = document.getElementById("app")!;

const app = new Application({
  backgroundColor: 0x1099bb,
  resizeTo: rootElement,
  resolution: 1,
});
const physics = new PhysicsManager(app);
rootElement.appendChild(app.view);
start();

function randomVectorCircle(r: number = 1): IPointData {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
  };
}

// Super simple screen shake
function shake(shakeAmount: number, decreaseFactor: number = 1): void {
  let amountLeft = shakeAmount;
  const shaker = (delta: number) => {
    if (amountLeft <= 0) {
      app.stage.x = 0;
      app.stage.y = 0;
      app.stage.position;
      app.ticker.remove(shaker);
      return;
    }

    const v = randomVectorCircle();
    app.stage.position.set(v.x * amountLeft, v.y * amountLeft);
    amountLeft -= delta * decreaseFactor;
  };
  app.ticker.add(shaker);
}

async function start(): Promise<void> {
  const sheet = (await Assets.load("sheet")) as Spritesheet;
  sheet.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  sheet.baseTexture.update();
  const sprite = Sprite.from(sheet.textures["weapon_arrow.png"]);
  sprite.anchor.set(0.5);
  sprite.scale.set(4, -4);
  sprite.x = app.screen.width / 2;
  sprite.y = app.screen.height / 2;
  app.stage.addChild(sprite);

  const knifeBody = Bodies.rectangle(sprite.x, sprite.y, sprite.width, sprite.height);
  const ground = Bodies.rectangle(app.screen.width / 2, app.screen.height - 50, 300, 100, {
    isStatic: true,
  });

  // add all of the bodies to the world
  Composite.add(physics.engine.world, [knifeBody, ground]);
  const d = Detector.create({
    bodies: [knifeBody, ground],
  });

  Body.rotate(knifeBody, Math.PI / 10);

  let hasLanded = false;
  app.ticker.add(() => {
    sprite.x = knifeBody.position.x;
    sprite.y = knifeBody.position.y;
    sprite.rotation = knifeBody.angle;
    if (!hasLanded && Detector.collisions(d).length > 0) {
      hasLanded = true;
      knifeBody.isStatic = true;
      shake(10);
    }
  });
}
