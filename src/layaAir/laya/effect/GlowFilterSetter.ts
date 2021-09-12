import { FilterSetterBase } from "././FilterSetterBase";
import { GlowFilter } from "../filters/GlowFilter";
import { ClassUtils } from "../utils/ClassUtils";
/**
 * ...
 * @author ww
 */
export class GlowFilterSetter extends FilterSetterBase {
	/**
	 * 滤镜的颜色
	 */
	private _color: string = "#ff0000";
	/**
	 * 边缘模糊的大小 0~20
	 */
	private _blur: number = 4;
	/**
	 * X轴方向的偏移
	 */
	private _offX: number = 6;
	/**
	 * Y轴方向的偏移
	 */
	private _offY: number = 6;
	constructor() {
		super();
		this._filter = new GlowFilter(this._color);
	}
	/**
 	* @override
	 */
	protected buildFilter(): void {

		this._filter = new GlowFilter(this.color, this.blur, this.offX, this.offY);
		super.buildFilter();
	}

	get color(): string {
		return this._color;
	}

	set color(value: string) {
		this._color = value;
		this.paramChanged();
	}

	get blur(): number {
		return this._blur;
	}

	set blur(value: number) {
		this._blur = value;
		this.paramChanged();
	}

	get offX(): number {
		return this._offX;
	}

	set offX(value: number) {
		this._offX = value;
		this.paramChanged();
	}

	get offY(): number {
		return this._offY;
	}

	set offY(value: number) {
		this._offY = value;
		this.paramChanged();
	}
}


ClassUtils.regClass("laya.effect.GlowFilterSetter", GlowFilterSetter);
ClassUtils.regClass("Laya.GlowFilterSetter", GlowFilterSetter);