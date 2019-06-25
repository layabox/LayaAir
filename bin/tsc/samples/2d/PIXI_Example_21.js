import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Browser } from "laya/utils/Browser";
import { WebGL } from "laya/webgl/WebGL";
/**
 * ...
 * @author Survivor
 *
 *
 */
export class PIXI_Example_21 {
    constructor(maincls) {
        this.colors = ["#5D0776", "#EC8A49", "#AF3666", "#F6C84C", "#4C779A"];
        this.colorCount = 0;
        this.isDown = false;
        this.path = [];
        this.color = this.colors[0];
        this.Main = null;
        this.Main = maincls;
        Laya.init(Browser.width, Browser.height, WebGL);
        Laya.stage.bgColor = "#3da8bb";
        this.createCanvases();
        Laya.timer.frameLoop(1, this, this.animate);
        Laya.stage.on('mousedown', this, this.onMouseDown);
        Laya.stage.on('mousemove', this, this.onMouseMove);
        Laya.stage.on('mouseup', this, this.onMouseUp);
    }
    createCanvases() {
        var graphicsCanvas = new Sprite();
        this.Main.box2D.addChild(graphicsCanvas);
        var liveGraphicsCanvas = new Sprite();
        this.Main.box2D.addChild(liveGraphicsCanvas);
        this.liveGraphics = liveGraphicsCanvas.graphics;
        this.canvasGraphics = graphicsCanvas.graphics;
    }
    onMouseDown(e = null) {
        this.isDown = true;
        this.color = this.colors[this.colorCount++ % this.colors.length];
        this.path.length = 0;
    }
    onMouseMove(e = null) {
        if (!this.isDown)
            return;
        this.path.push(Laya.stage.mouseX);
        this.path.push(Laya.stage.mouseY);
    }
    onMouseUp(e = null) {
        this.isDown = false;
        this.canvasGraphics.drawPoly(0, 0, this.path.concat(), this.color);
    }
    animate() {
        this.liveGraphics.clear();
        this.liveGraphics.drawPoly(0, 0, this.path, this.color);
    }
}
