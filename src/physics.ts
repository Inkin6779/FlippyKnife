import { Engine, IEngineDefinition, Render, Runner } from "matter-js";
import { Application } from "pixi.js";

export class PhysicsManager {
  readonly engine: Engine;
  private debugRender: Render | undefined;
  readonly isDev: boolean;
  private interval: number | undefined;

  constructor(app: Application, engineOptions?: IEngineDefinition) {
    this.isDev = true; //import.meta.env.MODE === "development";
    this.engine = Engine.create(engineOptions);

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

      app.ticker.add(() => {
        // Position the debug canvas on top of the true one
        debugCanvas.width = app.view.width;
        debugCanvas.height = app.view.height;
        const { x, y } = app.view.getBoundingClientRect();
        debugCanvas.style.left = x + "px";
        debugCanvas.style.top = y + "px";
      });
    }

    this.interval = setInterval(() => {
      Engine.update(this.engine, 10);
    }, 10);
  }
}
