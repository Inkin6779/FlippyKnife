import { Engine, IEngineDefinition, Render, Runner } from "matter-js";
import { Application, Ticker } from "pixi.js";

interface DeltaCorrection {
  delta: number;
  correction: number;
}

function mean(values: number[]): number {
  var result = 0;
  for (var i = 0; i < values.length; i += 1) {
    result += values[i];
  }
  return result / values.length || 0;
}

export class PhysicsManager {
  readonly engine: Engine;
  private debugRender: Render | undefined;
  readonly isDev: boolean;
  private runner = Runner.create();

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
      this.engine.timing.lastElapsed;

      app.ticker.add(() => {
        // Position the debug canvas on top of the true one
        debugCanvas.width = app.view.width;
        debugCanvas.height = app.view.height;
        const { x, y } = app.view.getBoundingClientRect();
        debugCanvas.style.left = x + "px";
        debugCanvas.style.top = y + "px";
      });
    }

    let last_run = 0;
    let last_delta = 0;
    function getDeltaCorrection(): DeltaCorrection {
      let delta = 1000 / 60; //default used on first loop only
      let correction = 1.0; //also default for first iterations
      if (last_run == 0) {
        //first run -> no delta, no correction
        const this_run = Date.now();
        last_run = this_run;
      } else {
        if (last_delta == 0) {
          //second run -> first delta but no correction yet
          const this_run = Date.now();
          delta = this_run - last_run;
          if (delta > 100) {
            //avoids instabilities after pause (window in background) or with slow cpu
            delta = 100;
          }
          last_run = this_run;
          last_delta = delta;
        } else {
          //run > 2 => delta + correction
          const this_run = Date.now();
          delta = this_run - last_run;
          if (delta > 100) {
            //avoids instabilities after pause (window in background) or with slow cpu
            delta = 100;
          }
          correction = delta / last_delta;
          last_run = this_run;
          last_delta = delta;
        }
      }
      return { delta, correction };
    }

    // Hack to dynamically set timeScale proportial to fps
    // Runner expects an fps of 60 so we modify the simulation speed to suit this
    // i.e. if we average 240fps we set the sim speed to 0.25x
    // This means phys timestep (dt) can adapt (smooth etc.) but the scene won't update too quickly
    app.ticker.add(() => {
      // TODO replace with my own tracked deltaHistory
      const deltaMean = mean(this.debugRender.timing.deltaHistory);
      const fps = 1000 / deltaMean || 0;
      this.engine.timing.timeScale = 1 / (fps / 60);
    });

    Runner.run(this.runner, this.engine);
  }
}
