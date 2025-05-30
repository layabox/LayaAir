import { Keyframe } from "./Keyframe";
export class BooleanKeyframe extends Keyframe {
    /**
     * @en The value of the keyframe.
     * @zh 关键帧的值。
     */
    value: boolean;

    /**
     * @inheritDoc
     * @override
     * @en Clones the data to another object.
     * @param destObject The target object to clone to.
     * @zh 克隆数据到目标对象。
     * @param destObject 拷贝数据结构
     */
    cloneTo(destObject: BooleanKeyframe): void {
        super.cloneTo(destObject);;
        destObject.value = this.value;
    }

    /**
     * @en Clones.
     * @zh 克隆
     */
    clone() {
        let f = new BooleanKeyframe();
        this.cloneTo(f);
        return f;
    }
}