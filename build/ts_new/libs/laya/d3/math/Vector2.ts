import { IClone } from "../core/IClone"

/**
 * <code>Vector2</code> 类用于创建二维向量。
 */
export class Vector2 implements IClone {
	/**零向量,禁止修改*/
	static ZERO: Vector2 = new Vector2(0.0, 0.0);
	/**一向量,禁止修改*/
	static ONE: Vector2 = new Vector2(1.0, 1.0);

	/**X轴坐标*/
	x: number;
	/**Y轴坐标*/
	y: number;

	/**
	 * 创建一个 <code>Vector2</code> 实例。
	 * @param	x  X轴坐标。
	 * @param	y  Y轴坐标。
	 */
	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}
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
	 * 缩放二维向量。
	 * @param	a 源二维向量。
	 * @param	b 缩放值。
	 * @param	out 输出二维向量。
	 */
	static scale(a: Vector2, b: number, out: Vector2): void {
		out.x = a.x * b;
		out.y = a.y * b;
	}

	/**
	 * 从Array数组拷贝值。
	 * @param  array 数组。
	 * @param  offset 数组偏移。
	 */
	fromArray(array: any[], offset: number = 0): void {
		this.x = array[offset + 0];
		this.y = array[offset + 1];
	}

	/**
	 * 写入Array数组
	 * @param array 数组。
	 * @param offset 数组偏移。 
	 */
	toArray(array:Float32Array,offset:number = 0):void{
		array[offset + 0] = this.x;
		array[offset + 1] = this.y;
	}


	/**
	 * 克隆。
	 * @param	destObject 克隆源。
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
	 * 归一化二维向量。
	 * @param	s 源三维向量。
	 * @param	out 输出三维向量。
	 */
	static normalize(s: Vector2, out: Vector2): void {
		var x: number = s.x, y: number = s.y;
		var len: number = x * x + y * y;
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
	static scalarLength(a: Vector2): number {
		var x: number = a.x, y: number = a.y;
		return Math.sqrt(x * x + y * y);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destVector2: Vector2 = new Vector2();
		this.cloneTo(destVector2);
		return destVector2;
	}

	forNativeElement(nativeElements: Float32Array|null = null): void//[NATIVE_TS]
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

