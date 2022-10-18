import Matter, { Engine, Render, Runner } from "matter-js";
import { Application } from "pixi.js";

export class PhysicsManager {
  readonly engine: Engine;
  private debugRender: Render | undefined;
  readonly isDev: boolean;

  constructor(app: Application, engineOptions?: Matter.IEngineDefinition) {
    this.isDev = true; //import.meta.env.MODE === "development";
    this.engine = Engine.create(engineOptions);
    const runner = Runner.create({
      isFixed: true,
      delta: 8,
    });

    if (this.isDev) {
      const debugCanvas = document.createElement("canvas");
      document.getElementById("app")!.appendChild(debugCanvas);
      debugCanvas.id = "debug-canvas";
      this.debugRender = Render.create({
        engine: this.engine,
        canvas: debugCanvas,
        options: {
          wireframeBackground: "",
          showAxes: true,
          showCollisions: true,
          showDebug: true,
          showIds: true,
        },
      });

      Render.run(this.debugRender);
      Runner.run(runner, this.engine);

      app.ticker.add(() => {
        // Position the debug canvas on top of the true one
        debugCanvas.width = app.view.width;
        debugCanvas.height = app.view.height;
        const { x, y } = app.view.getBoundingClientRect();
        debugCanvas.style.left = x + "px";
        debugCanvas.style.top = y + "px";
      });
    } else {
      Runner.run(this.engine);
    }
  }
}
