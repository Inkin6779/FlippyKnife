import { defineConfig } from "vite";
import { normalizePath } from "vite";
import SpriteSheet from "spritesheet-game";
import minimatch from "minimatch";

export function packSpritesheetsPlugin() {
  const spritesheet = new SpriteSheet();
  async function packSpritesheets() {
    await spritesheet.exec("./src/assets/*.png", {
      format: "pixi.js",
      trim: true,
      padding: 2,
      path: "./public/packed",
    });
  }

  return {
    name: "pack-spritesheets",
    async buildStart(options) {
      await packSpritesheets();
    },

    async handleHotUpdate({ file }) {
      const p = normalizePath(file);
      if (minimatch(p, "**/assets/*.png")) {
        await packSpritesheets();
      }
    },
  };
}
export default defineConfig({
  plugins: [packSpritesheetsPlugin()],
});
