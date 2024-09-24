import { IClone } from "../../utils/IClone";
/**
 * @en Animation weight mode
 * @zh 动画权重模式
 */
 export enum WeightedMode {
	
	
	None = 0,
	In = 1,
	Out = 2,
	Both = 3,
}
/**
 * @en The `Keyframe` class is used to create keyframe instances.
 * @zh `Keyframe` 类用于创建关键帧实例。
 */
export class Keyframe implements IClone {
    /**
     * @en The default weight value for keyframes.
     * @zh 关键帧的默认权重值。
     */
	static defaultWeight:number = 0.33333;
    /**
     * @en The time of the keyframe.
     * @zh 关键帧的时间。
     */
	time: number;

    /** @ignore */
	constructor() {

	}

    /**
     * @en Source of the keyframe.
     * @param destObject The target object to clone to.
     * @zh 克隆到另一个对象。
     * @param destObject 克隆源。
     */
	cloneTo(destObject: any): void {
		var destKeyFrame: Keyframe = (<Keyframe>destObject);
		destKeyFrame.time = this.time;
	}

    /**
     * @en Creates a clone of the current keyframe.
     * @returns A clone of the current keyframe.
     * @zh 克隆。
     * @returns 克隆副本。
     */
	clone(): any {
		var dest: Keyframe = new Keyframe();
		
		this.cloneTo(dest);
		return dest;
	}

}


