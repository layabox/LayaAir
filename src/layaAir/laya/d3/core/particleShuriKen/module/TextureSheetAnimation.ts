import { FrameOverTime } from "./FrameOverTime";
import { StartFrame } from "./StartFrame";
import { IClone } from "../../../../utils/IClone"
import { Vector2 } from "../../../../maths/Vector2";

/**
 * @en The `TextureSheetAnimation` class is used to create particle frame animations.
 * @zh `TextureSheetAnimation` 类用于创建粒子帧动画。
 */
export class TextureSheetAnimation implements IClone {
	/**@internal */
	private _frame: FrameOverTime;
	/**@internal */
	private _startFrame: StartFrame;

	/**
	 * @en Texture tiling.
	 * @zh 纹理平铺。
	 */
	tiles: Vector2;
	/**
	 * @en Type, 0 for whole sheet, 1 for single row.
	 * @zh 类型，0 表示整个纹理表，1 表示纹理表中的某一行。
	 */
	type: number = 0;
	/**
	 * @en Whether to use random row, effective when type is 1.
	 * @zh 是否随机行，type属性 为 1 时，该属性才会生效。
	 */
	randomRow: boolean = false;
	/**
	 * @en Row index, effective when type is 1.
	 * @zh 行索引，type属性 为 1 时，该属性才会生效。
	 */
	rowIndex: number = 0;
	/**
	 * @en Number of cycles.
	 * @zh 循环次数。
	 */
	cycles: number = 0;
	/**
	 * @en UV channel type, 0 for Nothing, 1 for Everything. 
	 * @zh UV 通道类型，0 表示 Nothing，1 表示 Everything。
	 */
	enableUVChannels: number = 0;
	/**
	 * @en Whether enabled.
	 * @zh 是否启用。
	 */
	enable: boolean = false;

	/**
	 * @en The time frame rate.
	 * @zh 时间帧率。
	 */
	get frame(): FrameOverTime {
		return this._frame;
	}

	/**
	 * @en The start frame rate.
	 * @zh 开始帧率。
	 */
	get startFrame(): StartFrame {
		return this._startFrame;
	}

	/**
	 * @en Creates an instance of the `TextureSheetAnimation` class.
	 * @param frame Animation frames.
	 * @param  startFrame Start frame.
	 * @zh 创建一个 `TextureSheetAnimation` 类的实例。
	 * @param frame 动画帧。
	 * @param  startFrame 开始帧。
	 */
	constructor(frame: FrameOverTime, startFrame: StartFrame) {
		this.tiles = new Vector2(1, 1);
		this.type = 0;
		this.randomRow = true;
		this.rowIndex = 0;
		this.cycles = 1;
		this.enableUVChannels = 1;//TODO:待补充
		this._frame = frame;
		this._startFrame = startFrame;
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: TextureSheetAnimation): void {
		this.tiles.cloneTo(destObject.tiles);
		destObject.type = this.type;
		destObject.randomRow = this.randomRow;
		destObject.rowIndex = this.rowIndex;
		destObject.cycles = this.cycles;
		destObject.enableUVChannels = this.enableUVChannels;
		destObject.enable = this.enable;
		this._frame.cloneTo(destObject._frame);
		this._startFrame.cloneTo(destObject._startFrame);
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destFrame: FrameOverTime;
		switch (this._frame.type) {
			case 0:
				destFrame = FrameOverTime.createByConstant(this._frame.constant);
				break;
			case 1:
				destFrame = FrameOverTime.createByOverTime(this._frame.frameOverTimeData.clone());
				break;
			case 2:
				destFrame = FrameOverTime.createByRandomTwoConstant(this._frame.constantMin, this._frame.constantMax);
				break;
			case 3:
				destFrame = FrameOverTime.createByRandomTwoOverTime(this._frame.frameOverTimeDataMin.clone(), this._frame.frameOverTimeDataMax.clone());
				break;
		}

		var destStartFrame: StartFrame;
		switch (this._startFrame.type) {
			case 0:
				destStartFrame = StartFrame.createByConstant(this._startFrame.constant);
				break;
			case 1:
				destStartFrame = StartFrame.createByRandomTwoConstant(this._startFrame.constantMin, this._startFrame.constantMax);
				break;
		}

		var destTextureSheetAnimation: TextureSheetAnimation = new TextureSheetAnimation(destFrame, destStartFrame);
		this.cloneTo(destTextureSheetAnimation);
		return destTextureSheetAnimation;
	}

}


