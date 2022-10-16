import { b2AABB, b2World, DrawAABBs, DrawCenterOfMasses, DrawJoints, DrawPairs, DrawShapes, XY } from "@box2d/core";
import { DebugDraw } from "@box2d/debug-draw";
import * as PIXI from "pixi.js";

export const b2ScaleFactor = 32;

export function b2StartDebugDraw(app: PIXI.Application, m_world: b2World): void {
  const debugCanvas = document.createElement("canvas");
  document.body.appendChild(debugCanvas);

  debugCanvas.id = "debug-canvas";

  const ctx = debugCanvas.getContext("2d")!;
  const draw = new DebugDraw(ctx);

  function drawDebug(aabb?: b2AABB) {
    draw.Prepare(app.view.width / 2 / b2ScaleFactor, app.view.height / 2 / b2ScaleFactor, b2ScaleFactor, true);

    // Draw whatever you want here:
    DrawShapes(draw, m_world, aabb);
    //DrawParticleSystems(draw, m_world);
    DrawJoints(draw, m_world);
    DrawAABBs(draw, m_world, aabb);
    DrawPairs(draw, m_world);
    DrawCenterOfMasses(draw, m_world);
    //DrawControllers(draw, m_world);

    draw.Finish();
  }

  app.ticker.add((delta) => {
    // Position the debug canvas on top of the true one
    debugCanvas.width = app.view.width;
    debugCanvas.height = app.view.height;
    const { x, y } = app.view.getBoundingClientRect();
    debugCanvas.style.left = x + "px";
    debugCanvas.style.top = y + "px";

    drawDebug();
  });
}
