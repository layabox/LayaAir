import { IClone } from "../utils/IClone";

export interface TypeAniKey {
    /**第几帧 */
    f: number,
    val: number | string | boolean,
    /**目前用于2D动画，用于记录动画补间的类型，比如(Linear|Quad_EaseIn)... */
    tweenType?: string,
    /**扩展，如果有一些其它数据需要加入到关键帧中可以写在这里 */
    extend?: any,
    /**tween的信息 */
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

export class Keyframe2D implements IClone {
    static defaultWeight = 0.33333;
    /**时间。*/
    time: number;
    /**帧里面的具体数据 */
    data: TypeAniKey;



    clone() {
        var dest = new Keyframe2D();
        this.cloneTo(dest);
        return dest;
    }
    cloneTo(destObject: any): void {
        var destKeyFrame: Keyframe2D = (<Keyframe2D>destObject);
        destKeyFrame.time = this.time;
    }

}