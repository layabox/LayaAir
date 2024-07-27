import { IClone } from "../utils/IClone";

export interface TypeAniKey {
    /**
     * @en The frame index.
     * @zh 第几帧 
     */
    f: number,
    val: number | string | boolean,
    /**
     * @en Currently used for 2D animation, it is used to record the types of animation gaps, for example (Linear|Quad_EaseIn)...
     * @zh 目前用于2D动画，用于记录动画补间的类型，比如(Linear|Quad_EaseIn)... 
     */
    tweenType?: string,
    /**
     * @en Extension
     * @zh 扩展，如果有一些其它数据需要加入到关键帧中可以写在这里
     */
    extend?: any,
    /**
     * @en The tween information.
     * @zh tween的信息
     */
    tweenInfo?: TypeTweenInfo,
}

export interface TypeTweenInfo {
    outTangent?: number,
    outWeight?: number,
    inTangent?: number,
    inWeight?: number,
    inWeightLock?: boolean,
    outWeightLock?: boolean,
    broken?: boolean,
}

/**
 * @en Class used to represent 2D animation keyframes
 * @zh 用于表示2D动画关键帧的类
 */
export class Keyframe2D implements IClone {
    static defaultWeight = 0.33333;
    /**
     * @en time
     * @zh 时间。
     */
    time: number;
    /**
     * @en Specific data within the frame
     * @zh 帧里面的具体数据
     */
    data: TypeAniKey;


    /**
     * @en Creates a clone of the current keyframe.
     * @returns A new instance of Keyframe2D that is a clone of the current keyframe.
     * @zh 创建当前关键帧的克隆。
     * @returns 一个新实例的 Keyframe2D，是当前关键帧的克隆。
     */
    clone() {
        var dest = new Keyframe2D();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * @en Copies the properties of the current keyframe to another Keyframe2D instance.
     * @param destObject The Keyframe2D instance to which the properties are copied.
     * @zh 将当前关键帧的属性复制到另一个 Keyframe2D 实例。
     * @param destObject 要复制属性的 Keyframe2D 实例。
     */
    cloneTo(destObject: any): void {
        var destKeyFrame: Keyframe2D = (<Keyframe2D>destObject);
        destKeyFrame.time = this.time;
    }

}