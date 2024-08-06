import { Point } from "./Point";
import { Pool } from "../utils/Pool"

/**
 * @en Represents a transformation matrix that determines how to map points from one coordinate space to another.
 * You can perform various graphical transformations on a display object by setting the properties of a Matrix object, applying it to the matrix property of a Transform object, and then applying that Transform object as the transform property of the display object. 
 * These transformation functions include translation (x and y repositioning), rotation, scaling, and skewing.
 * @zh 表示一个转换矩阵，它确定如何将点从一个坐标空间映射到另一个坐标空间。
 * 您可以对一个显示对象执行不同的图形转换，方法是设置 Matrix 对象的属性，将该 Matrix 对象应用于 Transform 对象的 matrix 属性，
 * 然后应用该 Transform 对象作为显示对象的 transform 属性。这些转换函数包括平移（x 和 y 重新定位）、旋转、缩放和倾斜。
 */
export class Matrix {

    /**
     * @private
     * @en An initialized Matrix object. The content of this object is not allowed to be modified.
     * @zh 一个初始化的 Matrix 对象，不允许修改此对象内容。
     */
    static EMPTY: Matrix = new Matrix();
    /**
     * @en A Matrix object used for temporary operations.
     * @zh 用于中转使用的 Matrix 对象。
     */
    static TEMP: Matrix = new Matrix();
    /**@internal */
    static _createFun: Function | null = null;

    /**
     * @en The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @zh 缩放或旋转图像时影响像素沿 x 轴定位的值。
     */
    a: number;
    /**
     * @en The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @zh 旋转或倾斜图像时影响像素沿 y 轴定位的值。
     */
    b: number;
    /**
     * @en The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @zh 旋转或倾斜图像时影响像素沿 x 轴定位的值。
     */
    c: number;
    /**
     * @en The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @zh 缩放或旋转图像时影响像素沿 y 轴定位的值。
     */
    d: number;
    /**
     * @en The distance by which to translate each point along the x axis.
     * @zh 沿 x 轴平移每个点的距离。
     */
    tx: number;
    /**
     * @en The distance by which to translate each point along the y axis.
     * @zh 沿 y 轴平移每个点的距离。
     */
    ty: number;
    /**
     * @internal
     * @en Whether there are rotation or scaling operations.
     * @zh 是否有旋转缩放操作。
     */
    _bTransform: boolean = false;

    /**
     * @en Constructs method, initialize matrix.
     * @param a (Optional) The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @param b (Optional) The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @param c (Optional) The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @param d (Optional) The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @param tx (Optional) The distance by which to translate each point along the x axis. 
     * @param ty (Optional) The distance by which to translate each point along the y axis. 
     * @param nums (Optional) Additional parameter. 
     * @zh 构造方法，初始化矩阵。
     * @param a		（可选）缩放或旋转图像时影响像素沿 x 轴定位的值。
     * @param b		（可选）旋转或倾斜图像时影响像素沿 y 轴定位的值。
     * @param c		（可选）旋转或倾斜图像时影响像素沿 x 轴定位的值。
     * @param d		（可选）缩放或旋转图像时影响像素沿 y 轴定位的值。
     * @param tx	（可选）沿 x 轴平移每个点的距离。
     * @param ty	（可选）沿 y 轴平移每个点的距离。
     * @param nums   (可选) 附加参数。
     */
    constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0, nums: number = 0) {
        if (Matrix._createFun != null) {
            return Matrix._createFun(a, b, c, d, tx, ty, nums);
        }
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        this._checkTransform();
    }

    /**
     * @en Sets this matrix to an identity matrix.
     * @returns The current matrix.
     * @zh 将本矩阵设置为单位矩阵。
     * @return 返回当前矩形。
     */
    identity(): Matrix {
        this.a = this.d = 1;
        this.b = this.tx = this.ty = this.c = 0;
        this._bTransform = false;
        return this;
    }

    /**@internal */
    _checkTransform(): boolean {
        return this._bTransform = (this.a !== 1 || this.b !== 0 || this.c !== 0 || this.d !== 1);
    }

    /**
     * @en Sets the translation along the x and y axes.
     * @param x The distance to translate along the x axis.
     * @param y The distance to translate along the y axis.
     * @returns The current matrix object.
     * @zh 设置沿 x 、y 轴平移每个点的距离。
     * @param	x 沿 x 轴平移每个点的距离。
     * @param	y 沿 y 轴平移每个点的距离。
     * @return	返回对象本身
     */
    setTranslate(x: number, y: number): Matrix {
        this.tx = x;
        this.ty = y;
        return this;
    }

    /**
     * @en Translates the matrix along the x and y axes, as specified by the x and y parameters.
     * @param x The amount to move along the x axis (in pixels).
     * @param y The amount to move along the y axis (in pixels).
     * @returns The current matrix object.
     * @zh 沿 x 和 y 轴平移矩阵，平移的变化量由 x 和 y 参数指定。
     * @param	x 沿 x 轴向右移动的量（以像素为单位）。
     * @param	y 沿 y 轴向下移动的量（以像素为单位）。
     * @return 返回此矩形对象。
     */
    translate(x: number, y: number): Matrix {
        this.tx += x;
        this.ty += y;
        return this;
    }

    /**
     * @en Applies a scaling transformation to the matrix.
     * @param x The multiplier used to scale the object along the x axis.
     * @param y The multiplier used to scale the object along the y axis.
     * @returns The current matrix object.
     * @zh 对矩阵应用缩放转换。
     * @param	x 用于沿 x 轴缩放对象的乘数。
     * @param	y 用于沿 y 轴缩放对象的乘数。
     * @return	返回矩阵对象本身
     */
    scale(x: number, y: number): Matrix {
        this.a *= x;
        this.d *= y;
        this.c *= x;
        this.b *= y;
        this.tx *= x;
        this.ty *= y;
        this._bTransform = true;
        return this;
    }

    /**
     * @en Applies a rotation transformation to the Matrix object.
     * @param angle The rotation angle in radians.
     * @returns The current matrix objec.
     * @zh 对 Matrix 对象应用旋转转换。
     * @param	angle 以弧度为单位的旋转角度。
     * @return	返回矩阵对象本身
     */
    rotate(angle: number): Matrix {
        var cos: number = Math.cos(angle);
        var sin: number = Math.sin(angle);
        var a1: number = this.a;
        var c1: number = this.c;
        var tx1: number = this.tx;

        this.a = a1 * cos - this.b * sin;
        this.b = a1 * sin + this.b * cos;
        this.c = c1 * cos - this.d * sin;
        this.d = c1 * sin + this.d * cos;
        this.tx = tx1 * cos - this.ty * sin;
        this.ty = tx1 * sin + this.ty * cos;
        this._bTransform = true;
        return this;
    }

    /**
     * @en Applies a skew transformation to the Matrix object.
     * @param x The 2D skew angle along the X axis in radians.
     * @param y The 2D skew angle along the Y axis in radians.
     * @returns The current Matrix object.
     * @zh 对 Matrix 对象应用倾斜转换。
     * @param	x 沿着 X 轴的 2D 倾斜弧度。
     * @param	y 沿着 Y 轴的 2D 倾斜弧度。
     * @returns 当前 Matrix 对象。
     */
    skew(x: number, y: number): Matrix {
        var tanX: number = Math.tan(x);
        var tanY: number = Math.tan(y);
        var a1: number = this.a;
        var b1: number = this.b;
        this.a += tanY * this.c;
        this.b += tanY * this.d;
        this.c += tanX * a1;
        this.d += tanX * b1;
        return this;
    }

    /**
     * @en Applies the inverse transformation of the current matrix to the specified point and returns this point.
     * @param out The Point object to be transformed.
     * @returns The transformed out Point object.
     * @zh 对指定的点应用当前矩阵的逆转化并返回此点。
     * @param	out 待转化的点 Point 对象。
     * @returns	返回out
     */
    invertTransformPoint(out: Point): Point {
        var a1: number = this.a;
        var b1: number = this.b;
        var c1: number = this.c;
        var d1: number = this.d;
        var tx1: number = this.tx;
        var n: number = a1 * d1 - b1 * c1;

        var a2: number = d1 / n;
        var b2: number = -b1 / n;
        var c2: number = -c1 / n;
        var d2: number = a1 / n;
        var tx2: number = (c1 * this.ty - d1 * tx1) / n;
        var ty2: number = -(a1 * this.ty - b1 * tx1) / n;
        return out.setTo(a2 * out.x + c2 * out.y + tx2, b2 * out.x + d2 * out.y + ty2);
    }

    /**
     * @en Applies the geometric transformation represented by the Matrix object to the specified point.
     * @param out The point used to set the output result.
     * @returns The transformed out Point object.
     * @zh 将 Matrix 对象表示的几何转换应用于指定点。
     * @param	out 用来设定输出结果的点。
     * @returns	返回out
     */
    transformPoint(out: Point): Point {
        return out.setTo(this.a * out.x + this.c * out.y + this.tx, this.b * out.x + this.d * out.y + this.ty);
    }

    /**
     * @en Applies the geometric transformation represented by the Matrix object to the specified point, ignoring tx and ty.
     * @param out The point used to set the output result.
     * @returns The transformed out Point object.
     * @zh 将 Matrix 对象表示的几何转换应用于指定点，忽略tx、ty。
     * @param	out 用来设定输出结果的点。
     * @returns	返回out
     */
    transformPointN(out: Point): Point {
        return out.setTo(this.a * out.x + this.c * out.y /*+ tx*/, this.b * out.x + this.d * out.y /*+ ty*/);
    }

    /**
     * @en Gets the X-axis scaling value.
     * @zh 获取 X 轴缩放值。
     */
    getScaleX(): number {
        return this.b === 0 ? this.a : Math.sqrt(this.a * this.a + this.b * this.b);
    }

    /**
     * @en Gets the Y-axis scaling value.
     * @zh 获取 Y 轴缩放值。
     */
    getScaleY(): number {
        return this.c === 0 ? this.d : Math.sqrt(this.c * this.c + this.d * this.d);
    }

    /**
     * @en Perform the inverse transformation of the original matrix.
     * @returns The current matrix object.
     * @zh 执行原始矩阵的逆转换。
     * @returns 当前矩阵对象。
     */
    invert(): Matrix {
        var a1: number = this.a;
        var b1: number = this.b;
        var c1: number = this.c;
        var d1: number = this.d;
        var tx1: number = this.tx;
        var n: number = a1 * d1 - b1 * c1;
        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = (c1 * this.ty - d1 * tx1) / n;
        this.ty = -(a1 * this.ty - b1 * tx1) / n;
        return this;
    }

    /**
     * @en Sets the members of Matrix to the specified values.
     * @param a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
     * @param b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
     * @param c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
     * @param d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
     * @param tx The distance by which to translate each point along the x axis.
     * @param ty The distance by which to translate each point along the y axis.
     * @returns The current matrix object.
     * @zh 将 Matrix 的成员设置为指定值。
     * @param	a 缩放或旋转图像时影响像素沿 x 轴定位的值。
     * @param	b 旋转或倾斜图像时影响像素沿 y 轴定位的值。
     * @param	c 旋转或倾斜图像时影响像素沿 x 轴定位的值。
     * @param	d 缩放或旋转图像时影响像素沿 y 轴定位的值。
     * @param	tx 沿 x 轴平移每个点的距离。
     * @param	ty 沿 y 轴平移每个点的距离。
     * @return 当前矩阵对象。
     */
    setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix {
        this.a = a, this.b = b, this.c = c, this.d = d, this.tx = tx, this.ty = ty;
        return this;
    }

    /**
     * @en Concatenates the specified matrix with the current matrix, effectively combining the geometric effects of the two.
     * @param matrix The matrix to be concatenated to the source matrix.
     * @returns The current matrix.
     * @zh 将指定矩阵与当前矩阵连接，从而将这两个矩阵的几何效果有效地结合在一起。
     * @param	matrix 要连接到源矩阵的矩阵。
     * @return	当前矩阵。
     */
    concat(matrix: Matrix): Matrix {
        var a: number = this.a;
        var c: number = this.c;
        var tx: number = this.tx;
        this.a = a * matrix.a + this.b * matrix.c;
        this.b = a * matrix.b + this.b * matrix.d;
        this.c = c * matrix.a + this.d * matrix.c;
        this.d = c * matrix.b + this.d * matrix.d;
        this.tx = tx * matrix.a + this.ty * matrix.c + matrix.tx;
        this.ty = tx * matrix.b + this.ty * matrix.d + matrix.ty;
        return this;
    }

    /**
     * @en Multiplies the specified two matrices and assigns the result to the specified output object.
     * @param m1 The first matrix.
     * @param m2 The second matrix.
     * @param out The output object.
     * @returns The result output object out.
     * @zh 将指定的两个矩阵相乘后的结果赋值给指定的输出对象。
     * @param	m1 矩阵一。
     * @param	m2 矩阵二。
     * @param	out 输出对象。
     * @return	结果输出对象 out。
     */
    static mul(m1: Matrix, m2: Matrix, out: Matrix): Matrix {
        var aa: number = m1.a, ab: number = m1.b, ac: number = m1.c, ad: number = m1.d, atx: number = m1.tx, aty: number = m1.ty;
        var ba: number = m2.a, bb: number = m2.b, bc: number = m2.c, bd: number = m2.d, btx: number = m2.tx, bty: number = m2.ty;
        if (bb !== 0 || bc !== 0) {
            out.a = aa * ba + ab * bc;
            out.b = aa * bb + ab * bd;
            out.c = ac * ba + ad * bc;
            out.d = ac * bb + ad * bd;
            out.tx = ba * atx + bc * aty + btx;
            out.ty = bb * atx + bd * aty + bty;
        } else {
            out.a = aa * ba;
            out.b = ab * bd;
            out.c = ac * ba;
            out.d = ad * bd;
            out.tx = ba * atx + btx;
            out.ty = bd * aty + bty;
        }
        return out;
    }

    /**
     * @en Multiplies the specified two matrices and assigns the result to the specified output array of length 16.
     * @param m1 The first matrix.
     * @param m2 The second matrix.
     * @param out The output Array object.
     * @returns The result output object out.
     * @zh 将指定的两个矩阵相乘，结果赋值给指定的输出数组，长度为16。
     * @param m1	矩阵一。
     * @param m2	矩阵二。
     * @param out	输出对象Array。
     * @returns 结果输出对象 out。
     */
    static mul16(m1: Matrix, m2: Matrix, out: any[]): any[] {
        var aa: number = m1.a, ab: number = m1.b, ac: number = m1.c, ad: number = m1.d, atx: number = m1.tx, aty: number = m1.ty;
        var ba: number = m2.a, bb: number = m2.b, bc: number = m2.c, bd: number = m2.d, btx: number = m2.tx, bty: number = m2.ty;
        if (bb !== 0 || bc !== 0) {
            out[0] = aa * ba + ab * bc;
            out[1] = aa * bb + ab * bd;
            out[4] = ac * ba + ad * bc;
            out[5] = ac * bb + ad * bd;
            out[12] = ba * atx + bc * aty + btx;
            out[13] = bb * atx + bd * aty + bty;
        } else {
            out[0] = aa * ba;
            out[1] = ab * bd;
            out[4] = ac * ba;
            out[5] = ad * bd;
            out[12] = ba * atx + btx;
            out[13] = bd * aty + bty;
        }
        return out;
    }

    /**
     * @private
     * @en Applies a scaling transformation to the matrix. Reverse multiplication.
     * @param x The multiplier used to scale the object along the x axis.
     * @param y The multiplier used to scale the object along the y axis.
     * @zh 对矩阵应用缩放转换。反向相乘
     * @param	x 用于沿 x 轴缩放对象的乘数。
     * @param	y 用于沿 y 轴缩放对象的乘数。
     */
    scaleEx(x: number, y: number): void {
        var ba: number = this.a, bb: number = this.b, bc: number = this.c, bd: number = this.d;
        if (bb !== 0 || bc !== 0) {
            this.a = x * ba;
            this.b = x * bb;
            this.c = y * bc;
            this.d = y * bd;
        } else {
            this.a = x * ba;
            this.b = 0 * bd;
            this.c = 0 * ba;
            this.d = y * bd;
        }
        this._bTransform = true;
    }

    /**
     * @private
     * @en Applies a rotation transformation to the Matrix object. Reverse multiplication.
     * @param angle The rotation angle in radians.
     * @zh 对 Matrix 对象应用旋转转换。反向相乘
     * @param angle 以弧度为单位的旋转角度。
     */
    rotateEx(angle: number): void {
        var cos: number = Math.cos(angle);
        var sin: number = Math.sin(angle);
        var ba: number = this.a, bb: number = this.b, bc: number = this.c, bd: number = this.d;
        if (bb !== 0 || bc !== 0) {
            this.a = cos * ba + sin * bc;
            this.b = cos * bb + sin * bd;
            this.c = -sin * ba + cos * bc;
            this.d = -sin * bb + cos * bd;
        } else {
            this.a = cos * ba;
            this.b = sin * bd;
            this.c = -sin * ba;
            this.d = cos * bd;
        }
        this._bTransform = true;
    }

    /**
     * @en Returns a copy of this Matrix object.
     * @returns A new Matrix instance with exactly the same properties as the original instance.
     * @zh 返回此 Matrix 对象的副本。
     * @returns 与原始实例具有完全相同的属性的新 Matrix 实例。
     */
    clone(): Matrix {
        var dec: Matrix = Matrix.create();
        dec.a = this.a;
        dec.b = this.b;
        dec.c = this.c;
        dec.d = this.d;
        dec.tx = this.tx;
        dec.ty = this.ty;
        dec._bTransform = this._bTransform;
        return dec;
    }

    /**
     * @en Copy all matrix data from the current Matrix object to the specified Matrix object.
     * @param dec The Matrix object to copy the current matrix data to.
     * @returns The Matrix object with the copied matrix data.
     * @zh 将当前 Matrix 对象中的所有矩阵数据复制到指定的 Matrix 对象中。
     * @param dec 要复制当前矩阵数据的 Matrix 对象。
     * @returns 已复制当前矩阵数据的 Matrix 对象。
     */
    copyTo(dec: Matrix): Matrix {
        dec.a = this.a;
        dec.b = this.b;
        dec.c = this.c;
        dec.d = this.d;
        dec.tx = this.tx;
        dec.ty = this.ty;
        dec._bTransform = this._bTransform;
        return dec;
    }

    /**
     * @en Return a string that lists the properties of this Matrix object.
     * @returns A string containing the property values of the Matrix object: a, b, c, d, tx, and ty.
     * @zh 返回列出该 Matrix 对象属性的文本值。
     * @returns 一个字符串，它包含 Matrix 对象的属性值：a、b、c、d、tx 和 ty。
     */
    toString(): string {
        return this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.tx + "," + this.ty;
    }

    /**
     * @en Destroy this object.
     * @zh 销毁此对象。
     */
    destroy(): void {
        this.recover();
    }

    /**
     * @en Recycle to the object pool for reuse.
     * @zh 回收到对象池，方便复用。
     */
    recover(): void {
        Pool.recover("Matrix", this.identity());
    }

    /**
     * @en Create a Matrix object from the object pool.
     * @returns A Matrix object.
     * @zh 从对象池中创建一个 Matrix 对象。
     * @returns 返回一个 Matrix 对象。
     */
    static create(): Matrix {
        return Pool.getItemByClass("Matrix", Matrix);
    }
}

