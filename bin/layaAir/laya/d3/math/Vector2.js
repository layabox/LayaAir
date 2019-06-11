/**
 * <code>Vector2</code> 类用于创建二维向量。
 */
export class Vector2 {
    /**
     * 创建一个 <code>Vector2</code> 实例。
     * @param	x  X轴坐标。
     * @param	y  Y轴坐标。
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    /**
     * 设置xy值。
     * @param	x X值。
     * @param	y Y值。
     */
    setValue(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * 缩放二维向量。
     * @param	a 源二维向量。
     * @param	b 缩放值。
     * @param	out 输出二维向量。
     */
    static scale(a, b, out) {
        out.x = a.x * b;
        out.y = a.y * b;
    }
    /**
     * 从Array数组拷贝值。
     * @param  array 数组。
     * @param  offset 数组偏移。
     */
    fromArray(array, offset = 0) {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destVector2 = destObject;
        destVector2.x = this.x;
        destVector2.y = this.y;
    }
    /**
     * 求两个二维向量的点积。
     * @param	a left向量。
     * @param	b right向量。
     * @return   点积。
     */
    static dot(a, b) {
        return (a.x * b.x) + (a.y * b.y);
    }
    /**
     * 归一化二维向量。
     * @param	s 源三维向量。
     * @param	out 输出三维向量。
     */
    static normalize(s, out) {
        var x = s.x, y = s.y;
        var len = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out.x = x * len;
            out.y = y * len;
        }
    }
    /**
     * 计算标量长度。
     * @param	a 源三维向量。
     * @return 标量长度。
     */
    static scalarLength(a) {
        var x = a.x, y = a.y;
        return Math.sqrt(x * x + y * y);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destVector2 = new Vector2();
        this.cloneTo(destVector2);
        return destVector2;
    }
    forNativeElement(nativeElements = null) {
        if (nativeElements) {
            this.elements = nativeElements;
            this.elements[0] = this.x;
            this.elements[1] = this.y;
        }
        else {
            this.elements = new Float32Array([this.x, this.y]);
        }
        Vector2.rewriteNumProperty(this, "x", 0);
        Vector2.rewriteNumProperty(this, "y", 1);
    }
    static rewriteNumProperty(proto, name, index) {
        Object["defineProperty"](proto, name, {
            "get": function () {
                return this.elements[index];
            },
            "set": function (v) {
                this.elements[index] = v;
            }
        });
    }
}
/**零向量,禁止修改*/
Vector2.ZERO = new Vector2(0.0, 0.0);
/**一向量,禁止修改*/
Vector2.ONE = new Vector2(1.0, 1.0);
