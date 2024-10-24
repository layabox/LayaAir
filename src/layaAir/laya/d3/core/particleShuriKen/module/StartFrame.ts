import { IClone } from "../../../../utils/IClone"

/**
 * @en The `StartFrame` class is used to create start frames.
 * @zh `StartFrame` 类用于创建起始帧。
 */
export class StartFrame implements IClone {
	/**
	 * @en Create a `StartFrame` instance with a constant frame value.
	 * @param constant The fixed frame value. Default is 0.
	 * @returns A new StartFrame instance.
	 * @zh 通过固定帧值创建一个 `StartFrame` 实例。
	 * @param constant 固定帧值。默认为0。
	 * @returns 新的 StartFrame 实例。
	 */
	static createByConstant(constant: number = 0): StartFrame {
		var rotationOverLifetime: StartFrame = new StartFrame();
		rotationOverLifetime._type = 0;
		rotationOverLifetime._constant = constant;
		return rotationOverLifetime;
	}

	/**
	 * @en Create a `StartFrame` instance with a random range between two constant frame values.
	 * @param constantMin The minimum fixed frame value. Default is 0.
	 * @param constantMax The maximum fixed frame value. Default is 0.
	 * @returns A new StartFrame instance.
	 * @zh 通过随机范围在两个固定帧值之间创建一个 `StartFrame` 实例。
	 * @param constantMin 最小固定帧值。默认为0。
	 * @param constantMax 最大固定帧值。默认为0。
	 * @returns 新的 StartFrame 实例。
	 */
	static createByRandomTwoConstant(constantMin: number = 0, constantMax: number = 0): StartFrame {
		var rotationOverLifetime: StartFrame = new StartFrame();
		rotationOverLifetime._type = 1;
		rotationOverLifetime._constantMin = constantMin;
		rotationOverLifetime._constantMax = constantMax;
		return rotationOverLifetime;
	}


	private _type: number = 0;
	private _constant: number = 0;
	private _constantMin: number = 0;
	private _constantMax: number = 0;

	/**
	 * @en The start frame type. 0 for constant mode, 1 for random between two constants mode.
	 * @zh 起始帧类型。0表示常量模式，1表示随机双常量模式。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * @en The constant frame value.
	 * @zh 固定帧值。
	 */
	get constant(): number {
		return this._constant;
	}

	/**
	 * @en The minimum constant frame value.
	 * @zh 最小固定帧值。
	 */
	get constantMin(): number {
		return this._constantMin;
	}

	/**
	 * @en The maximum constant frame value.
	 * @zh 最大固定帧值。
	 */
	get constantMax(): number {
		return this._constantMax;
	}

	/**
	 * @ignore
	 * @en Constructor, not allowed to use "new", please use the static creation function.
	 * @zh 构造方法。不允许new，请使用静态创建函数。
	 */
	constructor() {

	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: StartFrame): void {
		destObject._type = this._type;
		destObject._constant = this._constant;
		destObject._constantMin = this._constantMin;
		destObject._constantMax = this._constantMax;
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destStartFrame: StartFrame = new StartFrame();
		this.cloneTo(destStartFrame);
		return destStartFrame;
	}
}