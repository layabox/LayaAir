import { Laya } from "Laya";
import { Graphics } from "laya/display/Graphics";
import { Sprite } from "laya/display/Sprite";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

/**
 * ...
 * @author Survivor
 * 
 * 
 */
export class PIXI_Example_21 {
	private colors: any[] = ["#5D0776", "#EC8A49", "#AF3666", "#F6C84C", "#4C779A"];
	private colorCount: number = 0;
	private isDown: boolean = false;
	private path: any[] = [];
	private color: string = this.colors[0];
	private liveGraphics: Graphics;
	private canvasGraphics: Graphics;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;
		Laya.init(Browser.width, Browser.height).then(() => {
			Laya.stage.bgColor = "#3da8bb";

			this.createCanvases();

			Laya.timer.frameLoop(1, this, this.animate);

			Laya.stage.on('mousedown', this, this.onMouseDown);
			Laya.stage.on('mousemove', this, this.onMouseMove);
			Laya.stage.on('mouseup', this, this.onMouseUp);
		});
	}

	private createCanvases(): void {
		var graphicsCanvas: Sprite = new Sprite();
		this.Main.box2D.addChild(graphicsCanvas);
		var liveGraphicsCanvas: Sprite = new Sprite();
		this.Main.box2D.addChild(liveGraphicsCanvas);

		this.liveGraphics = liveGraphicsCanvas.graphics;
		this.canvasGraphics = graphicsCanvas.graphics;
	}

	private onMouseDown(e: any = null): void {
		this.isDown = true;
		this.color = this.colors[this.colorCount++ % this.colors.length];
		this.path.length = 0;
	}

	private onMouseMove(e: any = null): void {
		if (!this.isDown) return;

		this.path.push(Laya.stage.mouseX);
		this.path.push(Laya.stage.mouseY);
	}

	private onMouseUp(e: any = null): void {
		this.isDown = false;
		this.canvasGraphics.drawPoly(0, 0, this.path.concat(), this.color);
	}

	private animate(): void {
		this.liveGraphics.clear();
		this.liveGraphics.drawPoly(0, 0, this.path, this.color);
	}

	dispose(){
		Laya.timer.clear(this, this.animate);
	}
}

