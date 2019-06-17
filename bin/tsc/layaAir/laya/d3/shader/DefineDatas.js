/**
 * <code>DefineDatas</code> 类用于创建宏定义数据。
 */
export class DefineDatas {
    /**
     * 创建一个 <code>DefineDatas</code> 实例。
     */
    constructor() {
        this.value = 0;
    }
    /**
     * @private
     */
    add(define) {
        this.value |= define;
    }
    /**
     * @private
     */
    remove(define) {
        this.value &= ~define;
    }
    /**
     * @private
     */
    has(define) {
        return (this.value & define) > 0;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destDefineData = destObject;
        destDefineData.value = this.value;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new DefineDatas();
        this.cloneTo(dest);
        return dest;
    }
}
