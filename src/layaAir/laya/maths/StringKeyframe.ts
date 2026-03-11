import { Keyframe } from "./Keyframe";
export class StringKeyframe extends Keyframe {
    /**
     * @en The value of the keyframe.
     * @zh 关键帧的值。
     */
    value: string = "";

    /**
     * @inheritDoc
     * @override
     * @en Clones the data to another object.
     * @param destObject The target object to clone to.
     * @zh 克隆数据到目标对象。
     * @param destObject 拷贝数据结构
     */
    cloneTo(destObject: StringKeyframe): void {
        super.cloneTo(destObject);
        destObject.value = this.value;
    }

    /**
     * @en Clones.
     * @zh 克隆
     */
    clone() {
        let f = new StringKeyframe();
        this.cloneTo(f);
        return f;
    }
}
