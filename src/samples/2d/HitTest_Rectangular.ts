import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Event } from "laya/events/Event";
import { Rectangle } from "laya/maths/Rectangle";
import { Main } from "./../Main";
/**
 * ...
 * @author suvivor
 */
export class HitTest_Rectangular {
	private rect1: Sprite;
	private rect2: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.rect1 = this.createRect(100, "orange");
			this.rect2 = this.createRect(200, "purple");

			Laya.timer.frameLoop(1, this, this.loop);
		});
	}

	private createRect(size: number, color: string): Sprite {
		var rect: Sprite = new Sprite();
		rect.graphics.drawRect(0, 0, size, size, color);
		rect.size(size, size);
		this.Main.box2D.addChild(rect);

		rect.on(Event.MOUSE_DOWN, this, this.startDrag, [rect]);
		rect.on(Event.MOUSE_UP, this, this.stopDrag, [rect]);

		return rect;
	}

	private startDrag(target: Sprite): void {
		target.startDrag();
	}

	private stopDrag(target: Sprite): void {
		target.stopDrag();
	}

	private loop(): void {
		var bounds1: Rectangle = this.rect1.getBounds();
		var bounds2: Rectangle = this.rect2.getBounds();
		var hit: boolean = bounds1.intersects(bounds2);
		this.rect1.alpha = this.rect2.alpha = hit ? 0.5 : 1;
	}

	dispose(){
		Laya.timer.clear(this, this.loop);
	}
}

