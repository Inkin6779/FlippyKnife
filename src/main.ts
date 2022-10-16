import { b2BodyType, b2PolygonShape, b2World } from "@box2d/core";
import { Application, Sprite } from "pixi.js";
import { Assets } from "@pixi/assets";
import tex from "./assets/weapon_saw_sword.png";
import { Engine } from "matter-js";
import { b2StartDebugDraw, b2ScaleFactor } from "./b2-utils";

const m_world = b2World.Create({
  x: 0,
  y: -1 / b2ScaleFactor,
});

const m_stepConfig = {
  velocityIterations: 8,
  positionIterations: 3,
};

const app = new Application({
  width: 414,
  height: 896,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);
b2StartDebugDraw(app, m_world);
init();

async function init(): Promise<void> {
  const texture = await Assets.load(tex);
  const sprite = Sprite.from(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(2, -2);
  sprite.x = app.screen.width / 2;
  sprite.y = app.screen.height / 2;
  app.stage.addChild(sprite);

  const box = new b2PolygonShape();
  box.SetAsBox(
    sprite.width / 2 / b2ScaleFactor,
    sprite.height / 2 / b2ScaleFactor,
    {
      x: 0,
      y: 0,
    },
    0
  );
  const body = m_world.CreateBody({
    position: {
      x: sprite.x / b2ScaleFactor,
      y: sprite.y / b2ScaleFactor,
    },
  });
  body.SetType(b2BodyType.b2_dynamicBody);
  body.CreateFixture({
    shape: box,
    density: 1,
  });

  app.ticker.add((delta) => {
    m_world.Step(delta, m_stepConfig);
    const pos = body.GetPosition();
    sprite.x = pos.x * b2ScaleFactor;
    sprite.y = app.view.height - pos.y * b2ScaleFactor;
    sprite.rotation = -body.GetAngle();
  });
}
