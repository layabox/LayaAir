import { CurvePath } from "../tween/CurvePath";
import { Keyframe } from "./Keyframe";
export class PathPointKeyframe extends Keyframe {
    /**
     * @en The value of the keyframe.
     * @zh 关键帧的值。
     */
    value: CurvePath;

    /**
     * @inheritDoc
     * @override
     * @en Clones the data to another object.
     * @param destObject The target object to clone to.
     * @zh 克隆数据到目标对象。
     * @param destObject 拷贝数据结构
     */
    cloneTo(destObject: PathPointKeyframe): void {
        super.cloneTo(destObject);
        if (!destObject.value) {
            destObject.value = new CurvePath();
        }
        destObject.value.is2D = this.value.is2D;
        console.warn("暂时不支持PathPointKeyframe的数据克隆");
        // const srcPoints = this.value.srcPoints;
        // if (srcPoints)
        //     destObject.value.create(...srcPoints);
    }

    /**
     * @en Clones.
     * @zh 克隆
     */
    clone() {
        let f = new PathPointKeyframe();
        this.cloneTo(f);
        return f;
    }
}