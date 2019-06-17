/**
     * <code>KeyFrame</code> 类用于创建关键帧实例。
     */
export class Keyframe {
    /**
     * 创建一个 <code>KeyFrame</code> 实例。
     */
    constructor() {
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destKeyFrame = destObject;
        destKeyFrame.time = this.time;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new Keyframe();
        this.cloneTo(dest);
        return dest;
    }
}
