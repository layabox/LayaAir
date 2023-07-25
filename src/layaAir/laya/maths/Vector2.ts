import { IClone } from "../utils/IClone";
import { MathUtils3D } from "./MathUtils3D";


/**
 * <code>Vector2</code> 类用于创建二维向量。
 */
export class Vector2 implements IClone {
    /**零向量,禁止修改*/
    static readonly ZERO: Readonly<Vector2> = new Vector2(0.0, 0.0);
    /**一向量,禁止修改*/
    static readonly ONE: Readonly<Vector2> = new Vector2(1.0, 1.0);
    /**上向量,禁止修改*/
    static readonly UP: Readonly<Vector2> = new Vector2(0.0, -1.0);
    /**下向量,禁止修改*/
    static readonly DOWN: Readonly<Vector2> = new Vector2(0.0, 1.0);
    /**左向量,禁止修改*/
    static readonly LEFT: Readonly<Vector2> = new Vector2(-1.0, 0.0);
    /**右向量,禁止修改*/
    static readonly RIGHT: Readonly<Vector2> = new Vector2(1.0, 0.0);

    /**X轴坐标*/
    x: number;
    /**Y轴坐标*/
    y: number;

    /**
     * 创建一个空 <code>Vector2</code> 实例。
     * @param	x = 0  X轴坐标。
     * @param	y = 0  Y轴坐标。
     */
    constructor(); // 无参数构建0向量
    /**
     * 从角度创建一个 <code>Vector2</code> 实例。
     * @param	angle  旋转角度。
     */
    constructor(angle: number); // 从角度构建向量
    /**
     * 创建一个 <code>Vector2</code> 实例。
     * @param	x  X轴坐标。
     * @param	y  Y轴坐标。
     */
    constructor(x: number, y: number); // 有参数构建向量

    constructor(xOrAngle?: number, y?: number) {
        if (xOrAngle === undefined && y === undefined) {
            this.x = 0;
            this.y = 0;
        } else if (y === undefined) {
            const angle = xOrAngle as number;
            const radians = angle * (Math.PI / 180);
            this.x = Math.cos(radians);
            this.y = Math.sin(radians);
        } else {
            this.x = xOrAngle as number;
            this.y = y;
        }
    }
    // constructor(x: number = 0, y: number = 0) {
    //     this.x = x;
    //     this.y = y;
    // }
    /**
     * 设置xy值。
     * @param	x X值。
     * @param	y Y值。
     */
    setValue(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    /**
     * 二维向量标量乘法。
     * @param	a 源二维向量。
     * @param	b 缩放值。
     * @return   缩放后的新向量。
     */
    static scale(a: Vector2, b: number): Vector2 {
        return new Vector2(a.x * b, a.y * b);
    }
    /**
     * 二维向量标量乘法。
     * @param	b 缩放值。
     * @return   缩放后的新向量。
     */
    scale(b: number): Vector2 {
        return new Vector2(this.x * b, this.y * b);
    }

    /**
     * 判断两个二维向量是否相等。
     * @param	a 二维向量。
     * @param	b 二维向量。
     * @return  是否相等。
     */
    static equals(a: Vector2, b: Vector2): boolean {
        return MathUtils3D.nearEqual(a.x, b.x) && MathUtils3D.nearEqual(a.y, b.y);
    }

    /**
     * 从Array数组拷贝值。
     * @param  array 数组。
     * @param  offset 数组偏移。
     */
    fromArray(array: ArrayLike<number>, offset: number = 0): void {
        this.x = array[offset + 0];
        this.y = array[offset + 1];
    }

    /**
     * 转换为Array数组
     * @return 数组
     */
    toArray(): Array<number> {
        return [this.x, this.y];
    }

    /**
     * 写入Float32Array数组
     * @param array 数组。
     * @param offset 数组偏移。 
     */
    writeTo(array: Float32Array, offset: number = 0): void {
        array[offset + 0] = this.x;
        array[offset + 1] = this.y;
    }

    /**
     * 克隆到。
     * @param	destObject 克隆到这里。
     */
    cloneTo(destObject: any): void {
        var destVector2: Vector2 = (<Vector2>destObject);
        destVector2.x = this.x;
        destVector2.y = this.y;
    }

    /**
     * 求两个二维向量的点积。
     * @param	a left向量。
     * @param	b right向量。
     * @return   点积。
     */
    static dot(a: Vector2, b: Vector2): number {
        return (a.x * b.x) + (a.y * b.y);
    }

    /**
     * 求二维向量的点积。
     * @param	b right向量。
     * @return   点积。
     */
    dot(b: Vector2): number {
        return (this.x * b.x) + (this.y * b.y);
    }

    /**
     * 归一化二维向量。
     * @param	a 源二维向量。
     * @return 新的二维向量。
     */
    static normalize(a: Vector2): Vector2 {
        var x: number = a.x, y: number = a.y;
        var len: number = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            return new Vector2(x * len, y * len);
        }
        return a.clone();
    }

    /**
     * 归一化二维向量。
     * @return 新的二维向量。
     */
    normalize(): Vector2 {
        var x: number = this.x, y: number = this.y;
        var len: number = x * x + y * y;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            return new Vector2(x * len, y * len);
        }
        return this.clone();
    }

    /**
     * 计算标量长度。
     * @param	a 源二维向量。
     * @return 标量长度。
     */
    static scalarLength(a: Vector2): number {
        var x: number = a.x, y: number = a.y;
        return Math.sqrt(x * x + y * y);
    }
    /**
     * 计算标量长度。
     * @return 标量长度。
     */
    scalarLength(): number {
        var x: number = this.x, y: number = this.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * 计算二维向量距离。
     * @param	a 二维向量。
     * @param	b 二维向量。
     * @return 标量距离。
     */
    static distance(a: Vector2, b: Vector2): number {
        var x: number = a.x - b.x, y: number = a.y - b.y;
        return Math.sqrt(x * x + y * y);
    }
    /**
     * 计算二维向量距离。
     * @param	b 二维向量。
     * @return 标量距离。
     */
    distance(b: Vector2): number {
        var x: number = this.x - b.x, y: number = this.y - b.y;
        return Math.sqrt(x * x + y * y);
    }
    /**
     * 二维向量加法。
     * @param	a 二维向量。
     * @param	b 二维向量。
     * @return 新的二维向量。
     */
    static add(a: Vector2, b: Vector2): Vector2 {
        var x: number = a.x + b.x, y: number = a.y + b.y;
        return new Vector2(x, y);
    }
    /**
     * 二维向量加法。
     * @param	b 二维向量。
     * @return 新的二维向量。
     */
    add(b: Vector2): Vector2 {
        var x: number = this.x + b.x, y: number = this.y + b.y;
        return new Vector2(x, y);
    }
    /**
     * 二维向量减法。
     * @param	a 二维向量。
     * @param	b 二维向量。
     * @return 新的二维向量。
     */
    static sub(a: Vector2, b: Vector2): Vector2 {
        var x: number = a.x - b.x, y: number = a.y - b.y;
        return new Vector2(x, y);
    }
    /**
     * 二维向量加法。
     * @param	b 二维向量。
     * @return 新的二维向量。
     */
    sub(b: Vector2): Vector2 {
        var x: number = this.x - b.x, y: number = this.y - b.y;
        return new Vector2(x, y);
    }

    /**
     * 克隆。
     * @param	a 源二维向量。
     * @return	 克隆副本。
     */
    static clone(a: Vector2): any {
        return new Vector2(a.x, a.y);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        return new Vector2(this.x, this.y);
    }

    forNativeElement(nativeElements: Float32Array | null = null): void//[NATIVE_TS]
    {
        if (nativeElements) {
            (<any>this).elements = nativeElements;
            (<any>this).elements[0] = this.x;
            (<any>this).elements[1] = this.y;
        }
        else {
            (<any>this).elements = new Float32Array([this.x, this.y]);
        }
        Vector2.rewriteNumProperty(this, "x", 0);
        Vector2.rewriteNumProperty(this, "y", 1);
    }

    static rewriteNumProperty(proto: any, name: string, index: number): void {
        Object["defineProperty"](proto, name, {
            "get": function (): any {
                return this.elements[index];
            },
            "set": function (v: any): void {
                this.elements[index] = v;
            }
        });
    }

}

