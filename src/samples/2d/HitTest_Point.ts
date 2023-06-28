import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Main } from "./../Main";
/**
 * ...
 * @author suvivor
 */
export class HitTest_Point {
	private rect: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(800, 600).then(() => {
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			var size: number = 200;
			var color: string = "orange";
			this.rect = new Sprite();
			this.rect.graphics.drawRect(0, 0, size, size, color);
			this.rect.size(size, size);
			this.rect.x = (Laya.stage.width - this.rect.width) / 2;
			this.rect.y = (Laya.stage.height - this.rect.height) / 2;
			this.Main.box2D.addChild(this.rect);

			Laya.timer.frameLoop(1, this, this.loop);
		});
	}

	private loop(): void {
		var hit: boolean = this.rect.hitTestPoint(Laya.stage.mouseX, Laya.stage.mouseY);
		this.rect.alpha = hit ? 0.5 : 1;
	}

	dispose(){
		Laya.timer.clear(this, this.loop);
	}
}

