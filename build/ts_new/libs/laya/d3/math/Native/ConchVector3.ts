import { ConchVector4 } from "./ConchVector4";
import { ConchQuaternion } from "./ConchQuaternion";
import { IClone } from "../../core/IClone"
	import { MathUtils3D } from "../MathUtils3D"
	
	/**
	 * <code>Vector3</code> 类用于创建三维向量。
	 */
	export class ConchVector3 implements IClone {
		/*[FILEINDEX:10000]*/
		/**@internal	*/
		 static _tempVector4:ConchVector4 = new ConchVector4();
		
		/**零向量，禁止修改*/
		 static ZERO:ConchVector3 = new ConchVector3(0.0, 0.0, 0.0);
		/**一向量，禁止修改*/
		 static ONE:ConchVector3 = new ConchVector3(1.0, 1.0, 1.0);
		/**X轴单位向量，禁止修改*/
		 static NegativeUnitX:ConchVector3 = new ConchVector3(-1, 0, 0);
		/**X轴单位向量，禁止修改*/
		 static UnitX:ConchVector3 = new ConchVector3(1, 0, 0);
		/**Y轴单位向量，禁止修改*/
		 static UnitY:ConchVector3 = new ConchVector3(0, 1, 0);
		/**Z轴单位向量，禁止修改*/
		 static UnitZ:ConchVector3 = new ConchVector3(0, 0, 1);
		/**右手坐标系统前向量，禁止修改*/
		 static ForwardRH:ConchVector3 = new ConchVector3(0, 0, -1);
		/**左手坐标系统前向量,禁止修改*/
		 static ForwardLH:ConchVector3 = new ConchVector3(0, 0, 1);
		/**上向量,禁止修改*/
		 static Up:ConchVector3 = new ConchVector3(0, 1, 0);
		/**无效矩阵,禁止修改*/
		 static NAN:ConchVector3 = new ConchVector3(NaN, NaN, NaN);
		/**[只读]向量元素集合。*/
		 elements:Float32Array;
		/**
		 * 两个三维向量距离的平方。
		 * @param	value1 向量1。
		 * @param	value2 向量2。
		 * @return	距离的平方。
		 */
		 static distanceSquared(value1:ConchVector3, value2:ConchVector3):number {
			var value1e:Float32Array = value1.elements;
			var value2e:Float32Array = value2.elements;
			var x:number = value1e[0] - value2e[0];
			var y:number = value1e[1] - value2e[1];
			var z:number = value1e[2] - value2e[2];
			return (x * x) + (y * y) + (z * z);
		}
		
		/**
		 * 两个三维向量距离。
		 * @param	value1 向量1。
		 * @param	value2 向量2。
		 * @return	距离。
		 */
		 static distance(value1:ConchVector3, value2:ConchVector3):number {
			var value1e:Float32Array = value1.elements;
			var value2e:Float32Array = value2.elements;
			var x:number = value1e[0] - value2e[0];
			var y:number = value1e[1] - value2e[1];
			var z:number = value1e[2] - value2e[2];
			return Math.sqrt((x * x) + (y * y) + (z * z));
		}
		
		/**
		 * 分别取两个三维向量x、y、z的最小值计算新的三维向量。
		 * @param	a。
		 * @param	b。
		 * @param	out。
		 */
		 static min(a:ConchVector3, b:ConchVector3, out:ConchVector3):void {
			var e:Float32Array = out.elements;
			var f:Float32Array = a.elements;
			var g:Float32Array = b.elements
			e[0] = Math.min(f[0], g[0]);
			e[1] = Math.min(f[1], g[1]);
			e[2] = Math.min(f[2], g[2]);
		}
		
		/**
		 * 分别取两个三维向量x、y、z的最大值计算新的三维向量。
		 * @param	a a三维向量。
		 * @param	b b三维向量。
		 * @param	out 结果三维向量。
		 */
		 static max(a:ConchVector3, b:ConchVector3, out:ConchVector3):void {
			var e:Float32Array = out.elements;
			var f:Float32Array = a.elements;
			var g:Float32Array = b.elements
			e[0] = Math.max(f[0], g[0]);
			e[1] = Math.max(f[1], g[1]);
			e[2] = Math.max(f[2], g[2]);
		}
		
		/**
		 * 根据四元数旋转三维向量。
		 * @param	source 源三维向量。
		 * @param	rotation 旋转四元数。
		 * @param	out 输出三维向量。
		 */
		 static transformQuat(source:ConchVector3, rotation:ConchQuaternion, out:ConchVector3):void {
			var destination:Float32Array = out.elements;
			var se:Float32Array = source.elements;
			var re:Float32Array = rotation.elements;
			
			var x:number = se[0], y:number = se[1], z:number = se[2], qx:number = re[0], qy:number = re[1], qz:number = re[2], qw:number = re[3],
			
			ix:number = qw * x + qy * z - qz * y, iy:number = qw * y + qz * x - qx * z, iz:number = qw * z + qx * y - qy * x, iw:number = -qx * x - qy * y - qz * z;
			
			destination[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			destination[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			destination[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
		}
		
		/**
		 * 计算标量长度。
		 * @param	a 源三维向量。
		 * @return 标量长度。
		 */
		 static scalarLength(a:ConchVector3):number {
			var f:Float32Array = a.elements;
			var x:number = f[0], y:number = f[1], z:number = f[2];
			return Math.sqrt(x * x + y * y + z * z);
		}
		
		/**
		 * 计算标量长度的平方。
		 * @param	a 源三维向量。
		 * @return 标量长度的平方。
		 */
		 static scalarLengthSquared(a:ConchVector3):number {
			var f:Float32Array = a.elements;
			var x:number = f[0], y:number = f[1], z:number = f[2];
			return x * x + y * y + z * z;
		}
		
		/**
		 * 归一化三维向量。
		 * @param	s 源三维向量。
		 * @param	out 输出三维向量。
		 */
		 static normalize(s:ConchVector3, out:ConchVector3):void {
			var se:Float32Array = s.elements;
			var oe:Float32Array = out.elements;
			var x:number = se[0], y:number = se[1], z:number = se[2];
			var len:number = x * x + y * y + z * z;
			if (len > 0) {
				len = 1 / Math.sqrt(len);
				oe[0] = se[0] * len;
				oe[1] = se[1] * len;
				oe[2] = se[2] * len;
			}
		}
		
		/**
		 * 计算两个三维向量的乘积。
		 * @param	a left三维向量。
		 * @param	b right三维向量。
		 * @param	out 输出三维向量。
		 */
		 static multiply(a:ConchVector3, b:ConchVector3, out:ConchVector3):void {
			var e:Float32Array = out.elements;
			var f:Float32Array = a.elements;
			var g:Float32Array = b.elements
			e[0] = f[0] * g[0];
			e[1] = f[1] * g[1];
			e[2] = f[2] * g[2];
		}
		
		/**
		 * 缩放三维向量。
		 * @param	a 源三维向量。
		 * @param	b 缩放值。
		 * @param	out 输出三维向量。
		 */
		 static scale(a:ConchVector3, b:number, out:ConchVector3):void {
			var e:Float32Array = out.elements;
			var f:Float32Array = a.elements;
			e[0] = f[0] * b;
			e[1] = f[1] * b;
			e[2] = f[2] * b;
		}
		
		/**
		 * 插值三维向量。
		 * @param	a left向量。
		 * @param	b right向量。
		 * @param	t 插值比例。
		 * @param	out 输出向量。
		 */
		 static lerp(a:ConchVector3, b:ConchVector3, t:number, out:ConchVector3):void {
			var e:Float32Array = out.elements;
			var f:Float32Array = a.elements;
			var g:Float32Array = b.elements;
			var ax:number = f[0], ay:number = f[1], az:number = f[2];
			e[0] = ax + t * (g[0] - ax);
			e[1] = ay + t * (g[1] - ay);
			e[2] = az + t * (g[2] - az);
		}
		
		/**
		 * 通过矩阵转换一个三维向量到另外一个三维向量。
		 * @param	vector 源三维向量。
		 * @param	transform  变换矩阵。
		 * @param	result 输出三维向量。
		 */
		 static transformV3ToV3(vector:ConchVector3, transform:any, result:ConchVector3):void {
			var intermediate:ConchVector4 = ConchVector3._tempVector4;
			ConchVector3.transformV3ToV4(vector, transform, intermediate);
			var intermediateElem:Float32Array = intermediate.elements;
			var resultElem:Float32Array = result.elements;
			resultElem[0] = intermediateElem[0];
			resultElem[1] = intermediateElem[1];
			resultElem[2] = intermediateElem[2];
		}
		
		/**
		 * 通过矩阵转换一个三维向量到另外一个四维向量。
		 * @param	vector 源三维向量。
		 * @param	transform  变换矩阵。
		 * @param	result 输出四维向量。
		 */
		 static transformV3ToV4(vector:ConchVector3, transform:any, result:ConchVector4):void {
			var vectorElem:Float32Array = vector.elements;
			var vectorX:number = vectorElem[0];
			var vectorY:number = vectorElem[1];
			var vectorZ:number = vectorElem[2];
			
			var transformElem:Float32Array = transform.elements;
			var resultElem:Float32Array = result.elements;
			resultElem[0] = (vectorX * transformElem[0]) + (vectorY * transformElem[4]) + (vectorZ * transformElem[8]) + transformElem[12];
			resultElem[1] = (vectorX * transformElem[1]) + (vectorY * transformElem[5]) + (vectorZ * transformElem[9]) + transformElem[13];
			resultElem[2] = (vectorX * transformElem[2]) + (vectorY * transformElem[6]) + (vectorZ * transformElem[10]) + transformElem[14];
			resultElem[3] = (vectorX * transformElem[3]) + (vectorY * transformElem[7]) + (vectorZ * transformElem[11]) + transformElem[15];
		}
		
		/**
		 * 通过法线矩阵转换一个法线三维向量到另外一个三维向量。
		 * @param	normal 源法线三维向量。
		 * @param	transform  法线变换矩阵。
		 * @param	result 输出法线三维向量。
		 */
		 static TransformNormal(normal:ConchVector3, transform:any, result:ConchVector3):void {
			var normalElem:Float32Array = normal.elements;
			var normalX:number = normalElem[0];
			var normalY:number = normalElem[1];
			var normalZ:number = normalElem[2];
			
			var transformElem:Float32Array = transform.elements;
			var resultElem:Float32Array = result.elements;
			resultElem[0] = (normalX * transformElem[0]) + (normalY * transformElem[4]) + (normalZ * transformElem[8]);
			resultElem[1] = (normalX * transformElem[1]) + (normalY * transformElem[5]) + (normalZ * transformElem[9]);
			resultElem[2] = (normalX * transformElem[2]) + (normalY * transformElem[6]) + (normalZ * transformElem[10]);
		}
		
		/**
		 * 通过矩阵转换一个三维向量到另外一个归一化的三维向量。
		 * @param	vector 源三维向量。
		 * @param	transform  变换矩阵。
		 * @param	result 输出三维向量。
		 */
		 static transformCoordinate(coordinate:ConchVector3, transform:any, result:ConchVector3):void {
			var coordinateElem:Float32Array = coordinate.elements;
			var coordinateX:number = coordinateElem[0];
			var coordinateY:number = coordinateElem[1];
			var coordinateZ:number = coordinateElem[2];
			
			var transformElem:Float32Array = transform.elements;
			var w:number = ((coordinateX * transformElem[3]) + (coordinateY * transformElem[7]) + (coordinateZ * transformElem[11]) + transformElem[15]);
			var resultElem:Float32Array = result.elements;
			resultElem[0] = (coordinateX * transformElem[0]) + (coordinateY * transformElem[4]) + (coordinateZ * transformElem[8]) + transformElem[12] / w;
			resultElem[1] = (coordinateX * transformElem[1]) + (coordinateY * transformElem[5]) + (coordinateZ * transformElem[9]) + transformElem[13] / w;
			resultElem[2] = (coordinateX * transformElem[2]) + (coordinateY * transformElem[6]) + (coordinateZ * transformElem[10]) + transformElem[14] / w;
		}
		
		/**
		 * 求一个指定范围的向量
		 * @param	value clamp向量
		 * @param	min  最小
		 * @param	max  最大
		 * @param   out 输出向量
		 */
		 static Clamp(value:ConchVector3, min:ConchVector3, max:ConchVector3, out:ConchVector3):void {
			
			var valuee:Float32Array = value.elements;
			var x:number = valuee[0];
			var y:number = valuee[1];
			var z:number = valuee[2];
			
			var mine:Float32Array = min.elements;
			var mineX:number = mine[0];
			var mineY:number = mine[1];
			var mineZ:number = mine[2];
			
			var maxe:Float32Array = max.elements;
			var maxeX:number = maxe[0];
			var maxeY:number = maxe[1];
			var maxeZ:number = maxe[2];
			
			var oute:Float32Array = out.elements;
			
			x = (x > maxeX) ? maxeX : x;
			x = (x < mineX) ? mineX : x;
			
			y = (y > maxeY) ? maxeY : y;
			y = (y < mineY) ? mineY : y;
			
			z = (z > maxeZ) ? maxeZ : z;
			z = (z < mineZ) ? mineZ : z;
			
			oute[0] = x;
			oute[1] = y;
			oute[2] = z;
		}
		
		/**
		 * 求两个三维向量的和。
		 * @param	a left三维向量。
		 * @param	b right三维向量。
		 * @param	out 输出向量。
		 */
		 static add(a:ConchVector3, b:ConchVector3, out:ConchVector3):void {
			var e:Float32Array = out.elements;
			var f:Float32Array = a.elements;
			var g:Float32Array = b.elements
			e[0] = f[0] + g[0];
			e[1] = f[1] + g[1];
			e[2] = f[2] + g[2];
		}
		
		/**
		 * 求两个三维向量的差。
		 * @param	a  left三维向量。
		 * @param	b  right三维向量。
		 * @param	o out 输出向量。
		 */
		 static subtract(a:ConchVector3, b:ConchVector3, o:ConchVector3):void {
			var oe:Float32Array = o.elements;
			var ae:Float32Array = a.elements;
			var be:Float32Array = b.elements;
			oe[0] = ae[0] - be[0];
			oe[1] = ae[1] - be[1];
			oe[2] = ae[2] - be[2];
		}
		
		/**
		 * 求两个三维向量的叉乘。
		 * @param	a left向量。
		 * @param	b right向量。
		 * @param	o 输出向量。
		 */
		 static cross(a:ConchVector3, b:ConchVector3, o:ConchVector3):void {
			var ae:Float32Array = a.elements;
			var be:Float32Array = b.elements;
			var oe:Float32Array = o.elements;
			var ax:number = ae[0], ay:number = ae[1], az:number = ae[2], bx:number = be[0], by:number = be[1], bz:number = be[2];
			oe[0] = ay * bz - az * by;
			oe[1] = az * bx - ax * bz;
			oe[2] = ax * by - ay * bx;
		}
		
		/**
		 * 求两个三维向量的点积。
		 * @param	a left向量。
		 * @param	b right向量。
		 * @return   点积。
		 */
		 static dot(a:ConchVector3, b:ConchVector3):number {
			var ae:Float32Array = a.elements;
			var be:Float32Array = b.elements;
			var r:number = (ae[0] * be[0]) + (ae[1] * be[1]) + (ae[2] * be[2]);
			return r;
		}
		
		/**
		 * 判断两个三维向量是否相等。
		 * @param	a 三维向量。
		 * @param	b 三维向量。
		 * @return  是否相等。
		 */
		 static equals(a:ConchVector3, b:ConchVector3):boolean {
			var ae:Float32Array = a.elements;
			var be:Float32Array = b.elements;
			return MathUtils3D.nearEqual(ae[0], be[0]) && MathUtils3D.nearEqual(ae[1], be[1]) && MathUtils3D.nearEqual(ae[2], be[2]);
		}
		
		/**
		 * 获取X轴坐标。
		 * @return	X轴坐标。
		 */
		 get x():number {
			return this.elements[0];
		}
		
		/**
		 * 设置X轴坐标。
		 * @param	value  X轴坐标。
		 */
		 set x(value:number) {
			this.elements[0] = value;
		}
		
		/**
		 * 获取Y轴坐标。
		 * @return	Y轴坐标。
		 */
		 get y():number {
			return this.elements[1];
		}
		
		/**
		 * 设置Y轴坐标。
		 * @param	value  Y轴坐标。
		 */
		 set y(value:number) {
			this.elements[1] = value;
		}
		
		/**
		 * 获取Z轴坐标。
		 * @return	Z轴坐标。
		 */
		 get z():number {
			return this.elements[2];
		}
		
		/**
		 * 设置Z轴坐标。
		 * @param	value  Z轴坐标。
		 */
		 set z(value:number) {
			this.elements[2] = value;
		}
		
		/**
		 * 创建一个 <code>Vector3</code> 实例。
		 * @param	x  X轴坐标。
		 * @param	y  Y轴坐标。
		 * @param	z  Z轴坐标。
		 */
		constructor(x:number = 0, y:number = 0, z:number = 0, nativeElements:Float32Array = null/*[NATIVE]*/){
			var v:Float32Array;
			if (nativeElements) {///*[NATIVE]*/
				v = nativeElements;
			} else {
				v = new Float32Array(3);
			}
			this.elements = v;
			v[0] = x;
			v[1] = y;
			v[2] = z;
		}
		
		/**
		 * 设置xyz值。
		 * @param	x X值。
		 * @param	y Y值。
		 * @param	z Z值。
		 */
		 setValue(x:number, y:number, z:number):void {
			this.elements[0] = x;
			this.elements[1] = y;
			this.elements[2] = z;
		}
		
		/**
		 * 从Array数组拷贝值。
		 * @param  array 数组。
		 * @param  offset 数组偏移。
		 */
		 fromArray(array:any[], offset:number = 0):void {
			this.elements[0] = array[offset + 0];
			this.elements[1] = array[offset + 1];
			this.elements[2] = array[offset + 2];
		}
		
		/**
		 * 克隆。
		 * @param	destObject 克隆源。
		 */
		 cloneTo(destObject:any):void {
			var destVector3:ConchVector3 = (<ConchVector3>destObject );
			var destE:Float32Array = destVector3.elements;
			var s:Float32Array = this.elements;
			destE[0] = s[0];
			destE[1] = s[1];
			destE[2] = s[2];
		}
		
		/**
		 * 克隆。
		 * @return	 克隆副本。
		 */
		 clone():any {
			var destVector3:ConchVector3 = new ConchVector3();
			this.cloneTo(destVector3);
			return destVector3;
		}
		
		 toDefault():void {
			this.elements[0] = 0;
			this.elements[1] = 0;
			this.elements[2] = 0;
		}
	
	}

