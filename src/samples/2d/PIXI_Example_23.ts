import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Point } from "laya/maths/Point";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";

/**
 * ...
 * @author Survivor
 */
export class PIXI_Example_23 {
	private viewWidth: number = Browser.width;
	private viewHeight: number = Browser.height;
	private lasers: any[] = [];
	private tick: number = 0;
	private frequency: number = 80;
	private type: number = 0;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(this.viewWidth, this.viewHeight).then(() => {
			Laya.stage.screenMode = Stage.SCREEN_HORIZONTAL;
			Laya.stage.bgColor = '#181818';
			// create a background texture
			let bgsp = new Sprite();
			bgsp.loadImage("res/pixi/laserBG.jpg");
			this.Main.box2D.addChild(bgsp);
			Laya.stage.frameLoop(1, this, this.animate);
		});
	}

	private animate(): void {
		if (this.tick > this.frequency) {
			this.tick = 0;
			// iterate through the dudes and update the positions
			var laser: Laser = new Laser();
			laser.loadImage("res/pixi/laser0" + ((this.type % 5) + 1) + ".png");
			this.type++;

			laser.life = 0;

			var pos1: Point;
			var pos2: Point;
			if (this.type % 2) {
				pos1 = new Point(-20, Math.random() * this.viewHeight);
				pos2 = new Point(this.viewWidth, Math.random() * this.viewHeight + 20);

			}
			else {
				pos1 = new Point(Math.random() * this.viewWidth, -20);
				pos2 = new Point(Math.random() * this.viewWidth, this.viewHeight + 20);
			}

			var distX: number = pos1.x - pos2.x;
			var distY: number = pos1.y - pos2.y;

			var dist: number = Math.sqrt(distX * distX + distY * distY) + 40;

			laser.scaleX = dist / 20;
			laser.pos(pos1.x, pos1.y);
			laser.pivotY = 43 / 2;
			laser.blendMode = "lighter";

			laser.rotation = (Math.atan2(distY, distX) + Math.PI) * 180 / Math.PI;

			this.lasers.push(laser);

			this.Main.box2D.addChild(laser);

			this.frequency *= 0.9;
		}

		for (var i: number = 0; i < this.lasers.length; i++) {
			laser = this.lasers[i];
			laser.life++;
			if (laser.life > 60 * 0.3) {
				laser.alpha *= 0.9;
				laser.scaleY = laser.alpha;
				if (laser.alpha < 0.01) {
					this.lasers.splice(i, 1);
					Laya.stage.removeChild(laser);
					i--;
				}
			}
		}
		// increment the ticker
		this.tick += 1;
	}

	dispose(){
		Laya.timer.clear(this, this.animate);
	}
}




class Laser extends Sprite {
	life: number;
}
