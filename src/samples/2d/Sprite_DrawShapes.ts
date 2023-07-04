import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Main } from "./../Main";

export class Sprite_DrawShapes {
	private sp: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(740, 400).then(() => {
			//
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			//
			Laya.stage.scaleMode = "showall";
			Laya.stage.bgColor = "#232628";

			this.drawSomething();
		});
	}

	private drawSomething(): void {
		this.sp = new Sprite();
		this.Main.box2D.addChild(this.sp);
		//画线
		this.sp.graphics.drawLine(10, 58, 146, 58, "#ff0000", 3);
		//画连续直线
		this.sp.graphics.drawLines(176, 58, [0, 0, 39, -50, 78, 0, 117, 50, 156, 0], "#ff0000", 5);
		//画曲线
		this.sp.graphics.drawCurves(352, 58, [0, 0, 19, -100, 39, 0, 58, 100, 78, 0, 97, -100, 117, 0, 136, 100, 156, 0], "#ff0000", 5);
		//画矩形
		this.sp.graphics.drawRect(10, 166, 166, 90, "#ffff00");
		//画多边形
		this.sp.graphics.drawPoly(264, 166, [0, 0, 60, 0, 78.48, 57, 30, 93.48, -18.48, 57], "#ffff00");
		//画三角形
		this.sp.graphics.drawPoly(400, 166, [0, 100, 50, 0, 100, 100], "#ffff00");
		//画圆
		this.sp.graphics.drawCircle(98, 332, 50, "#00ffff");
		//画扇形
		this.sp.graphics.drawPie(240, 290, 100, 10, 60, "#00ffff");
		//绘制圆角矩形，自定义路径
		this.sp.graphics.drawPath(400, 310, [["moveTo", 5, 0], ["lineTo", 105, 0], ["arcTo", 110, 0, 110, 5, 5], ["lineTo", 110, 55], ["arcTo", 110, 60, 105, 60, 5], ["lineTo", 5, 60], ["arcTo", 0, 60, 0, 55, 5], ["lineTo", 0, 5], ["arcTo", 0, 0, 5, 0, 5], ["closePath"]], { fillStyle: "#00ffff" });
	}
}


