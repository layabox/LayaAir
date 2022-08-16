import { Graphics } from "laya/display/Graphics"
import { Sprite } from "laya/display/Sprite"

/**
 * 自动根据大小填充自己全部区域的显示对象
 * @author ww
 */
export class AutoFillRec extends Sprite {
	type: number;
	constructor(type: string) {
		super();

		//super(type);
	}



	set width(value: number) {
		super.width = value;
		this.changeSize();
	}


	set height(value: number) {
		super.height = value;
		this.changeSize();
	}
	protected changeSize(): void {
		// TODO Auto Generated method stub

		var g: Graphics = this.graphics;
		g.clear();
		g.drawRect(0, 0, this.width, this.height, "#33c5f5");
	}
	preX: number;
	preY: number;
	record(): void {
		this.preX = this.x;
		this.preY = this.y;
	}
	getDx(): number {
		return this.x - this.preX;
	}
	getDy(): number {
		return this.y - this.preY;
	}

}


