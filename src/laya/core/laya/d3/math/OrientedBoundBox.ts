import { Vector3 } from "././Vector3";
import { Matrix4x4 } from "././Matrix4x4";
import { Ray } from "././Ray";
import { BoundBox } from "././BoundBox";
import { MathUtils3D } from "././MathUtils3D";
import { ContainmentType } from "././ContainmentType";
import { BoundSphere } from "././BoundSphere";
import { CollisionUtils } from "././CollisionUtils";
/**
	 * <code>OrientedBoundBox</code> 类用于创建OBB包围盒。
	 */
	export class OrientedBoundBox {
		
		/**每个轴长度的一半*/
		 extents:Vector3;
		/**这个矩阵表示包围盒的位置和缩放,它的平移向量表示该包围盒的中心*/
		 transformation:Matrix4x4;
		/** @private */
		private static _tempV30:Vector3 = new Vector3();
		/** @private */
		private static _tempV31:Vector3 = new Vector3();
		/** @private */
		private static _tempV32:Vector3 = new Vector3();
		/** @private */
		private static _tempV33:Vector3 = new Vector3();
		/** @private */
		private static _tempV34:Vector3 = new Vector3();
		/** @private */
		private static _tempV35:Vector3 = new Vector3();
		/** @private */
		private static _tempV36:Vector3 = new Vector3();
		
		/** @private */
		private static _tempM0:Matrix4x4 = new Matrix4x4();
		/** @private */
		private static _tempM1:Matrix4x4 = new Matrix4x4();
		
		/** @private */
		private static _corners:any = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
		
		/** @private */
		private static _rows1:Vector3[] = [new Vector3(), new Vector3(), new Vector3()];
		/** @private */
		private static _rows2:Vector3[] = [new Vector3(), new Vector3(), new Vector3()];
		
		/** @private */
		private static _ray:Ray = new Ray(new Vector3(), new Vector3());
		
		/** @private */
		private static _boxBound1:BoundBox = new BoundBox(new Vector3(), new Vector3());
		/** @private */
		private static _boxBound2:BoundBox = new BoundBox(new Vector3(), new Vector3());
		/** @private */
		private static _boxBound3:BoundBox = new BoundBox(new Vector3(), new Vector3());
		/** @private */
		private static _vsepAe:Float32Array = new Float32Array();
		/** @private */
		private static _sizeBe:Float32Array = new Float32Array();
		/** @private */
		private static _sizeAe:Float32Array = new Float32Array();
		
		/**
		 * 创建一个 <code>OrientedBoundBox</code> 实例。
		 * @param	extents 每个轴长度的一半
		 * @param	transformation  包围盒的位置和缩放,
		 */
		constructor(extents:Vector3, transformation:Matrix4x4){
			
			this.extents = extents;
			this.transformation = transformation;
		}
		
		/**
		 * 根据AABB包围盒创建一个 <code>OrientedBoundBox</code> 实例。
		 * @param	box AABB包围盒。
		 */
		 static createByBoundBox(box:BoundBox, out:OrientedBoundBox):void {
			var min:Vector3 = box.min;
			var max:Vector3 = box.max;
			
			Vector3.subtract(max, min, OrientedBoundBox._tempV30);
			Vector3.scale(OrientedBoundBox._tempV30, 0.5, OrientedBoundBox._tempV30);
			Vector3.add(min, OrientedBoundBox._tempV30, OrientedBoundBox._tempV31);
			
			Vector3.subtract(max, OrientedBoundBox._tempV31, OrientedBoundBox._tempV32);
			Matrix4x4.translation(OrientedBoundBox._tempV31, OrientedBoundBox._tempM0);
			
			var extents:Vector3 = OrientedBoundBox._tempV32.clone();
			var transformation:Matrix4x4 = OrientedBoundBox._tempM0.clone();
			
			out.extents = extents;
			out.transformation = transformation;
		}
		
		/**
		 * 根据包围盒的最大最小两顶点创建一个 <code>OrientedBoundBox</code> 实例。
		 * @param	min 包围盒的最小顶点。
		 * @param	max 包围盒的最大顶点。
		 */
		 static createByMinAndMaxVertex(min:Vector3, max:Vector3):OrientedBoundBox {
			
			Vector3.subtract(max, min, OrientedBoundBox._tempV30);
			Vector3.scale(OrientedBoundBox._tempV30, 0.5, OrientedBoundBox._tempV30);
			Vector3.add(min, OrientedBoundBox._tempV30, OrientedBoundBox._tempV31);
			
			Vector3.subtract(max, OrientedBoundBox._tempV31, OrientedBoundBox._tempV32);
			Matrix4x4.translation(OrientedBoundBox._tempV31, OrientedBoundBox._tempM0);
			
			var obb:OrientedBoundBox = new OrientedBoundBox(OrientedBoundBox._tempV32, OrientedBoundBox._tempM0);
			return obb;
		}
		
		/**
		 * 获取OBB包围盒的8个顶点。
		 * @param	corners 返回顶点的输出队列。
		 */
		 getCorners(corners:Vector3[]):void {

			OrientedBoundBox._tempV30.x = this.extents.x;
			OrientedBoundBox._tempV30.y = OrientedBoundBox._tempV30.z = 0;
			
			OrientedBoundBox._tempV31.y = this.extents.y;
			OrientedBoundBox._tempV31.x = OrientedBoundBox._tempV31.z = 0;
			
			OrientedBoundBox._tempV32.z = this.extents.z;
			OrientedBoundBox._tempV32.x = OrientedBoundBox._tempV32.y = 0;
			
			Vector3.TransformNormal(OrientedBoundBox._tempV30, this.transformation, OrientedBoundBox._tempV30);
			Vector3.TransformNormal(OrientedBoundBox._tempV31, this.transformation, OrientedBoundBox._tempV31);
			Vector3.TransformNormal(OrientedBoundBox._tempV32, this.transformation, OrientedBoundBox._tempV32);
			
			var center:Vector3 = OrientedBoundBox._tempV33;
			this.transformation.getTranslationVector(center);
			
			corners.length = 8;
			Vector3.add(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[0]);
			
			Vector3.add(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[1]);
			
			Vector3.subtract(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[2]);
			
			Vector3.subtract(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[3]);
			
			Vector3.add(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[4]);
			
			Vector3.add(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[5]);
			
			Vector3.subtract(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[6]);
			
			Vector3.subtract(center, OrientedBoundBox._tempV30, OrientedBoundBox._tempV34);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV31, OrientedBoundBox._tempV34);
			Vector3.add(OrientedBoundBox._tempV34, OrientedBoundBox._tempV32, corners[7]);
		
		}
		
		/**
		 * 变换该包围盒的矩阵信息。
		 * @param	mat 矩阵
		 */
		 transform(mat:Matrix4x4):void {
			
			Matrix4x4.multiply(this.transformation, mat, this.transformation);
		}
		
		/**
		 * 缩放该包围盒
		 * @param	scaling 各轴的缩放比。
		 */
		 scale(scaling:Vector3):void {
			
			Vector3.multiply(this.extents, scaling, this.extents);
		}
		
		/**
		 * 平移该包围盒。
		 * @param	translation 平移参数
		 */
		 translate(translation:Vector3):void {
			this.transformation.getTranslationVector(OrientedBoundBox._tempV30);
			Vector3.add(OrientedBoundBox._tempV30, translation, OrientedBoundBox._tempV31);
			this.transformation.setTranslationVector(OrientedBoundBox._tempV31);
		}
		
		/**
		 * 该包围盒的尺寸。
		 * @param	out 输出
		 */
		 Size(out:Vector3):void {
			
			Vector3.scale(this.extents, 2, out);
		}
		
		/**
		 * 该包围盒需要考虑的尺寸
		 * @param	out 输出
		 */
		 getSize(out:Vector3):void {
			

			OrientedBoundBox._tempV30.x = this.extents.x;
			OrientedBoundBox._tempV31.y = this.extents.y;
			OrientedBoundBox._tempV32.z = this.extents.z;
			
			Vector3.TransformNormal(OrientedBoundBox._tempV30, this.transformation, OrientedBoundBox._tempV30);
			Vector3.TransformNormal(OrientedBoundBox._tempV31, this.transformation, OrientedBoundBox._tempV31);
			Vector3.TransformNormal(OrientedBoundBox._tempV31, this.transformation, OrientedBoundBox._tempV32);
			
	
			out.x= Vector3.scalarLength(OrientedBoundBox._tempV30);
			out.y = Vector3.scalarLength(OrientedBoundBox._tempV31);
			out.z = Vector3.scalarLength(OrientedBoundBox._tempV32);
		}
		
		/**
		 * 该包围盒需要考虑尺寸的平方
		 * @param	out 输出
		 */
		 getSizeSquared(out:Vector3):void {
			

			OrientedBoundBox._tempV30.x = this.extents.x;
			OrientedBoundBox._tempV31.y = this.extents.y;
			OrientedBoundBox._tempV32.z = this.extents.z;
			
			Vector3.TransformNormal(OrientedBoundBox._tempV30, this.transformation, OrientedBoundBox._tempV30);
			Vector3.TransformNormal(OrientedBoundBox._tempV31, this.transformation, OrientedBoundBox._tempV31);
			Vector3.TransformNormal(OrientedBoundBox._tempV31, this.transformation, OrientedBoundBox._tempV32);
			

			out.x = Vector3.scalarLengthSquared(OrientedBoundBox._tempV30);
			out.y = Vector3.scalarLengthSquared(OrientedBoundBox._tempV31);
			out.z = Vector3.scalarLengthSquared(OrientedBoundBox._tempV32);
		}
		
		/**
		 * 该包围盒的几何中心
		 */
		 getCenter(center:Vector3):void {
			this.transformation.getTranslationVector(center);
		}
		
		/**
		 * 该包围盒是否包含空间中一点
		 * @param	point 点
		 * @return  返回位置关系
		 */
		 containsPoint(point:Vector3):number {
			
		
			var extentsEX:number = this.extents.x;
			var extentsEY:number = this.extents.y;
			var extentsEZ:number = this.extents.z;
			
			this.transformation.invert(OrientedBoundBox._tempM0);
			
			Vector3.transformCoordinate(point, OrientedBoundBox._tempM0, OrientedBoundBox._tempV30);
			
	
			var _tempV30ex:number = Math.abs(OrientedBoundBox._tempV30.x);
			var _tempV30ey:number = Math.abs(OrientedBoundBox._tempV30.y);
			var _tempV30ez:number = Math.abs(OrientedBoundBox._tempV30.z);
			
			if (MathUtils3D.nearEqual(_tempV30ex, extentsEX) && MathUtils3D.nearEqual(_tempV30ey, extentsEY) && MathUtils3D.nearEqual(_tempV30ez, extentsEZ))
				return ContainmentType.Intersects;
			if (_tempV30ex < extentsEX && _tempV30ey < extentsEY && _tempV30ez < extentsEZ)
				return ContainmentType.Contains;
			else
				return ContainmentType.Disjoint;
		}
		
		/**
		 * 该包围盒是否包含空间中多点
		 * @param	point 点
		 * @return  返回位置关系
		 */
		 containsPoints(points:Vector3[]):number {
			

			var extentsex:number = this.extents.x;
			var extentsey:number = this.extents.y;
			var extentsez:number = this.extents.z;
			
			this.transformation.invert(OrientedBoundBox._tempM0);
			
			var containsAll:boolean = true;
			var containsAny:boolean = false;
			
			for (var i:number = 0; i < points.length; i++) {
				
				Vector3.transformCoordinate(points[i], OrientedBoundBox._tempM0, OrientedBoundBox._tempV30);
				
	
				var _tempV30ex:number = Math.abs(OrientedBoundBox._tempV30.x);
				var _tempV30ey:number = Math.abs(OrientedBoundBox._tempV30.y);
				var _tempV30ez:number = Math.abs(OrientedBoundBox._tempV30.z);
				
				if (MathUtils3D.nearEqual(_tempV30ex, extentsex) && MathUtils3D.nearEqual(_tempV30ey, extentsey) && MathUtils3D.nearEqual(_tempV30ez, extentsez))
					containsAny = true;
				if (_tempV30ex < extentsex && _tempV30ey < extentsey && _tempV30ez < extentsez)
					containsAny = true;
				else
					containsAll = false;
			}
			
			if (containsAll)
				return ContainmentType.Contains;
			else if (containsAny)
				return ContainmentType.Intersects;
			else
				return ContainmentType.Disjoint;
		}
		
		/**
		 * 该包围盒是否包含空间中一包围球
		 * @param	sphere 包围球
		 * @param	ignoreScale 是否考虑该包围盒的缩放
		 * @return  返回位置关系
		 */
		 containsSphere(sphere:BoundSphere, ignoreScale:boolean = false):number {
			

			var extentsEX:number = this.extents.x;
			var extentsEY:number = this.extents.y;
			var extentsEZ:number = this.extents.z;
			
			var sphereR:number = sphere.radius;
			
			this.transformation.invert(OrientedBoundBox._tempM0);
			Vector3.transformCoordinate(sphere.center, OrientedBoundBox._tempM0, OrientedBoundBox._tempV30);
			
			var locRadius:number;
			
			if (ignoreScale) {
				
				locRadius = sphereR;
			} else {
				
				Vector3.scale(Vector3._UnitX, sphereR, OrientedBoundBox._tempV31);
				Vector3.TransformNormal(OrientedBoundBox._tempV31, OrientedBoundBox._tempM0, OrientedBoundBox._tempV31);
				locRadius = Vector3.scalarLength(OrientedBoundBox._tempV31);
			}
			
			Vector3.scale(this.extents, -1, OrientedBoundBox._tempV32);
			Vector3.Clamp(OrientedBoundBox._tempV30, OrientedBoundBox._tempV32, this.extents, OrientedBoundBox._tempV33);
			var distance:number = Vector3.distanceSquared(OrientedBoundBox._tempV30, OrientedBoundBox._tempV33);
			
			if (distance > locRadius * locRadius)
				return ContainmentType.Disjoint;
			
		
			var tempV30ex:number = OrientedBoundBox._tempV30.x;
			var tempV30ey:number = OrientedBoundBox._tempV30.y;
			var tempV30ez:number = OrientedBoundBox._tempV30.z;
			
		
			var tempV32ex:number = OrientedBoundBox._tempV32.x;
			var tempV32ey:number = OrientedBoundBox._tempV32.y;
			var tempV32ez:number = OrientedBoundBox._tempV32.z;
			
			if ((((tempV32ex + locRadius <= tempV30ex) && (tempV30ex <= extentsEX - locRadius)) && ((extentsEX - tempV32ex > locRadius) && (tempV32ey + locRadius <= tempV30ey))) && (((tempV30ey <= extentsEY - locRadius) && (extentsEY - tempV32ey > locRadius)) && (((tempV32ez + locRadius <= tempV30ez) && (tempV30ez <= extentsEZ - locRadius)) && (extentsEZ - tempV32ez > locRadius)))) {
				return ContainmentType.Contains;
			}
			
			return ContainmentType.Intersects;
		}
		
		private static _getRows(mat:Matrix4x4, out:Vector3[]):void {
			out.length = 3;
			
			var mate:Float32Array = mat.elements;
			

			out[0].x = mate[0];
			out[0].y = mate[1];
			out[0].z = mate[2];
			
			
			out[1].x = mate[4];
			out[1].y = mate[5];
			out[1].z = mate[6];
			
		
			out[2].x = mate[8];
			out[2].y = mate[9];
			out[2].z = mate[10];
		}
		
		/**
		 * 	For accuracy, The transformation matrix for both <see cref="OrientedBoundingBox"/> must not have any scaling applied to it.
		 *  Anyway, scaling using Scale method will keep this method accurate.
		 * 该包围盒是否包含空间中另一OBB包围盒
		 * @param	obb OBB包围盒
		 * @return  返回位置关系
		 */
		 containsOrientedBoundBox(obb:OrientedBoundBox):number {
			var i:number, k:number;
			obb.getCorners(OrientedBoundBox._corners);
			var cornersCheck:number = this.containsPoints(OrientedBoundBox._corners);
			if (cornersCheck != ContainmentType.Disjoint)
				return cornersCheck;
	
			OrientedBoundBox._sizeAe[0] = this.extents.x;
			OrientedBoundBox._sizeAe[1] = this.extents.y;
			OrientedBoundBox._sizeAe[2] = this.extents.z;
			obb.extents.cloneTo(OrientedBoundBox._tempV35);
	
			OrientedBoundBox._sizeBe[0] = OrientedBoundBox._tempV35.x;
			OrientedBoundBox._sizeBe[1] = OrientedBoundBox._tempV35.y;
			OrientedBoundBox._sizeBe[2] = OrientedBoundBox._tempV35.z;
			
			OrientedBoundBox._getRows(this.transformation, OrientedBoundBox._rows1);
			OrientedBoundBox._getRows(obb.transformation, OrientedBoundBox._rows2);
			
			var extentA:number, extentB:number, separation:number, dotNumber:number;
			for (i = 0; i < 4; i++) {
				for (k = 0; k < 4; k++) {
					if (i == 3 || k == 3) {
						OrientedBoundBox._tempM0.setElementByRowColumn(i, k, 0);
						OrientedBoundBox._tempM1.setElementByRowColumn(i, k, 0);
					} else {
						dotNumber = Vector3.dot(OrientedBoundBox._rows1[i], OrientedBoundBox._rows2[k]);
						OrientedBoundBox._tempM0.setElementByRowColumn(i, k, dotNumber);
						OrientedBoundBox._tempM1.setElementByRowColumn(i, k, Math.abs(dotNumber));
					}
				}
			}
			
			obb.getCenter(OrientedBoundBox._tempV34);
			this.getCenter(OrientedBoundBox._tempV36);
			Vector3.subtract(OrientedBoundBox._tempV34, OrientedBoundBox._tempV36, OrientedBoundBox._tempV30);
			
			
			OrientedBoundBox._tempV31.x = Vector3.dot(OrientedBoundBox._tempV30, OrientedBoundBox._rows1[0]);
			OrientedBoundBox._tempV31.y = Vector3.dot(OrientedBoundBox._tempV30, OrientedBoundBox._rows1[1]);
			OrientedBoundBox._tempV31.z = Vector3.dot(OrientedBoundBox._tempV30, OrientedBoundBox._rows1[2]);
		
			OrientedBoundBox._vsepAe[0] = OrientedBoundBox._tempV31.x;
			OrientedBoundBox._vsepAe[1] = OrientedBoundBox._tempV31.y;
			OrientedBoundBox._vsepAe[2] = OrientedBoundBox._tempV31.z;
			
			
			
			for (i = 0; i < 3; i++) {
				
				OrientedBoundBox._tempV32.x = OrientedBoundBox._tempM1.getElementByRowColumn(i, 0);
				OrientedBoundBox._tempV32.y = OrientedBoundBox._tempM1.getElementByRowColumn(i, 1);
				OrientedBoundBox._tempV32.z = OrientedBoundBox._tempM1.getElementByRowColumn(i, 2);
				
				extentA = OrientedBoundBox._sizeAe[i];
				extentB = Vector3.dot(OrientedBoundBox._tempV35, OrientedBoundBox._tempV32);
				separation = Math.abs(OrientedBoundBox._vsepAe[i]);
				
				if (separation > extentA + extentB)
					return ContainmentType.Disjoint;
			}
			
			for (k = 0; k < 3; k++) {
				
				OrientedBoundBox._tempV32.x = OrientedBoundBox._tempM1.getElementByRowColumn(0, k);
				OrientedBoundBox._tempV32.y = OrientedBoundBox._tempM1.getElementByRowColumn(1, k);
				OrientedBoundBox._tempV32.z = OrientedBoundBox._tempM1.getElementByRowColumn(2, k);
				
				OrientedBoundBox._tempV33.x = OrientedBoundBox._tempM0.getElementByRowColumn(0, k);
				OrientedBoundBox._tempV33.y = OrientedBoundBox._tempM0.getElementByRowColumn(1, k);
				OrientedBoundBox._tempV33.z = OrientedBoundBox._tempM0.getElementByRowColumn(2, k);
				
				extentA = Vector3.dot(this.extents, OrientedBoundBox._tempV32);
				extentB = OrientedBoundBox._sizeBe[k];
				separation = Math.abs(Vector3.dot(OrientedBoundBox._tempV31, OrientedBoundBox._tempV33));
				
				if (separation > extentA + extentB)
					return ContainmentType.Disjoint;
			}
			
			for (i = 0; i < 3; i++) {
				
				for (k = 0; k < 3; k++) {
					
					var i1:number = (i + 1) % 3, i2:number = (i + 2) % 3;
					var k1:number = (k + 1) % 3, k2:number = (k + 2) % 3;
					extentA = OrientedBoundBox._sizeAe[i1] * OrientedBoundBox._tempM1.getElementByRowColumn(i2, k) + OrientedBoundBox._sizeAe[i2] * OrientedBoundBox._tempM1.getElementByRowColumn(i1, k);
					extentB = OrientedBoundBox._sizeBe[k1] * OrientedBoundBox._tempM1.getElementByRowColumn(i, k2) + OrientedBoundBox._sizeBe[k2] * OrientedBoundBox._tempM1.getElementByRowColumn(i, k1);
					separation = Math.abs(OrientedBoundBox._vsepAe[i2] * OrientedBoundBox._tempM0.getElementByRowColumn(i1, k) - OrientedBoundBox._vsepAe[i1] * OrientedBoundBox._tempM0.getElementByRowColumn(i2, k));
					if (separation > extentA + extentB)
						return ContainmentType.Disjoint;
				}
			}
			
			return ContainmentType.Intersects;
		
		}
		
		/**
		 * 该包围盒是否包含空间中一条线
		 * @param	point1 点1
		 * @param	point2 点2
		 * @return  返回位置关系
		 */
		 containsLine(point1:Vector3, point2:Vector3):number {
			
			OrientedBoundBox._corners[0] = point1;
			OrientedBoundBox._corners[1] = point2;
			var cornersCheck:number = this.containsPoints(OrientedBoundBox._corners);
			if (cornersCheck != ContainmentType.Disjoint)
				return cornersCheck;
			

			var extentsX:number = this.extents.x;
			var extentsY:number = this.extents.y;
			var extentsZ:number = this.extents.z;
			
			this.transformation.invert(OrientedBoundBox._tempM0);
			Vector3.transformCoordinate(point1, OrientedBoundBox._tempM0, OrientedBoundBox._tempV30);
			Vector3.transformCoordinate(point2, OrientedBoundBox._tempM0, OrientedBoundBox._tempV31);
			
			Vector3.add(OrientedBoundBox._tempV30, OrientedBoundBox._tempV31, OrientedBoundBox._tempV32);
			Vector3.scale(OrientedBoundBox._tempV32, 0.5, OrientedBoundBox._tempV32);
			Vector3.subtract(OrientedBoundBox._tempV30, OrientedBoundBox._tempV32, OrientedBoundBox._tempV33);
			
		
			var _tempV33X:number = OrientedBoundBox._tempV33.x;
			var _tempV33Y:number = OrientedBoundBox._tempV33.y;
			var _tempV33Z:number = OrientedBoundBox._tempV33.z;
			
		
			var _tempV34X:number =OrientedBoundBox._tempV34.x = Math.abs(OrientedBoundBox._tempV33.x);
			var _tempV34Y:number =OrientedBoundBox._tempV34.y = Math.abs(OrientedBoundBox._tempV33.y);
			var _tempV34Z:number =OrientedBoundBox._tempV34.z = Math.abs(OrientedBoundBox._tempV33.z);
			
		
			var _tempV32X:number = OrientedBoundBox._tempV32.x;
			var _tempV32Y:number = OrientedBoundBox._tempV32.y;
			var _tempV32Z:number = OrientedBoundBox._tempV32.z;
			
			if (Math.abs(_tempV32X) > extentsX + _tempV34X)
				return ContainmentType.Disjoint;
			
			if (Math.abs(_tempV32Y) > extentsY + _tempV34Y)
				return ContainmentType.Disjoint;
			
			if (Math.abs(_tempV32Z) > extentsZ + _tempV34Z)
				return ContainmentType.Disjoint;
			
			if (Math.abs(_tempV32Y * _tempV33Z - _tempV32Z * _tempV33Y) > (extentsY * _tempV34Z + extentsZ * _tempV34Y))
				return ContainmentType.Disjoint;
			
			if (Math.abs(_tempV32X * _tempV33Z - _tempV32Z * _tempV33X) > (extentsX * _tempV34Z + extentsZ * _tempV34X))
				return ContainmentType.Disjoint;
			
			if (Math.abs(_tempV32X * _tempV33Y - _tempV32Y * _tempV33X) > (extentsX * _tempV34Y + extentsY * _tempV34X))
				return ContainmentType.Disjoint;
			
			return ContainmentType.Intersects;
		
		}
		
		/**
		 * 该包围盒是否包含空间中另一OBB包围盒
		 * @param	box 包围盒
		 * @return  返回位置关系
		 */
		 containsBoundBox(box:BoundBox):number {
			
			var i:number, k:number;
			var min:Vector3 = box.min;
			var max:Vector3 = box.max;
			
			box.getCorners(OrientedBoundBox._corners);
			var cornersCheck:number = this.containsPoints(OrientedBoundBox._corners);
			if (cornersCheck != ContainmentType.Disjoint)
				return cornersCheck;
			
			Vector3.subtract(max, min, OrientedBoundBox._tempV30);
			Vector3.scale(OrientedBoundBox._tempV30, 0.5, OrientedBoundBox._tempV30);
			Vector3.add(min, OrientedBoundBox._tempV30, OrientedBoundBox._tempV30);
			
			Vector3.subtract(max, OrientedBoundBox._tempV30, OrientedBoundBox._tempV31);
			
	
			OrientedBoundBox._sizeAe[0] = this.extents.x;
			OrientedBoundBox._sizeAe[1] = this.extents.y;
			OrientedBoundBox._sizeAe[2] = this.extents.z;
	
			OrientedBoundBox._sizeBe[0] = OrientedBoundBox._tempV31.x;
			OrientedBoundBox._sizeBe[1] = OrientedBoundBox._tempV31.y;
			OrientedBoundBox._sizeBe[2] = OrientedBoundBox._tempV31.z;
			
			
			OrientedBoundBox._getRows(this.transformation, OrientedBoundBox._rows1);
			this.transformation.invert(OrientedBoundBox._tempM0);
			
			var extentA:number, extentB:number, separation:number, dotNumber:number;
			
			for (i = 0; i < 3; i++) {
				for (k = 0; k < 3; k++) {
					OrientedBoundBox._tempM1.setElementByRowColumn(i, k, Math.abs(OrientedBoundBox._tempM0.getElementByRowColumn(i, k)));
				}
			}
			
			this.getCenter(OrientedBoundBox._tempV35);
			Vector3.subtract(OrientedBoundBox._tempV30, OrientedBoundBox._tempV35, OrientedBoundBox._tempV32);
			

			OrientedBoundBox._tempV31.x = Vector3.dot(OrientedBoundBox._tempV32, OrientedBoundBox._rows1[0]);
			OrientedBoundBox._tempV31.y = Vector3.dot(OrientedBoundBox._tempV32, OrientedBoundBox._rows1[1]);
			OrientedBoundBox._tempV31.z = Vector3.dot(OrientedBoundBox._tempV32, OrientedBoundBox._rows1[2]);

			OrientedBoundBox._vsepAe[0] = OrientedBoundBox._tempV31.x;
			OrientedBoundBox._vsepAe[1] = OrientedBoundBox._tempV31.y;
			OrientedBoundBox._vsepAe[2] = OrientedBoundBox._tempV31.z;
			
	
			
			for (i = 0; i < 3; i++) {
				
				OrientedBoundBox._tempV33.x = OrientedBoundBox._tempM1.getElementByRowColumn(i, 0);
				OrientedBoundBox._tempV33.y = OrientedBoundBox._tempM1.getElementByRowColumn(i, 1);
				OrientedBoundBox._tempV33.z = OrientedBoundBox._tempM1.getElementByRowColumn(i, 2);
				
				extentA = OrientedBoundBox._sizeAe[i];
				extentB = Vector3.dot(OrientedBoundBox._tempV31, OrientedBoundBox._tempV33);
				separation = Math.abs(OrientedBoundBox._vsepAe[i]);
				
				if (separation > extentA + extentB)
					return ContainmentType.Disjoint;
			}
			
			for (k = 0; k < 3; k++) {
				
				OrientedBoundBox._tempV33.x = OrientedBoundBox._tempM1.getElementByRowColumn(0, k);
				OrientedBoundBox._tempV33.y = OrientedBoundBox._tempM1.getElementByRowColumn(1, k);
				OrientedBoundBox._tempV33.z = OrientedBoundBox._tempM1.getElementByRowColumn(2, k);
				
				OrientedBoundBox._tempV34.x = OrientedBoundBox._tempM0.getElementByRowColumn(0, k);
				OrientedBoundBox._tempV34.y = OrientedBoundBox._tempM0.getElementByRowColumn(1, k);
				OrientedBoundBox._tempV34.z = OrientedBoundBox._tempM0.getElementByRowColumn(2, k);
				
				extentA = Vector3.dot(this.extents, OrientedBoundBox._tempV33);
				extentB = OrientedBoundBox._sizeBe[k];
				separation = Math.abs(Vector3.dot(OrientedBoundBox._tempV31, OrientedBoundBox._tempV34));
				
				if (separation > extentA + extentB)
					return ContainmentType.Disjoint;
			}
			
			for (i = 0; i < 3; i++) {
				for (k = 0; k < 3; k++) {
					
					var i1:number = (i + 1) % 3, i2:number = (i + 2) % 3;
					var k1:number = (k + 1) % 3, k2:number = (k + 2) % 3;
					extentA = OrientedBoundBox._sizeAe[i1] * OrientedBoundBox._tempM1.getElementByRowColumn(i2, k) + OrientedBoundBox._sizeAe[i2] * OrientedBoundBox._tempM1.getElementByRowColumn(i1, k);
					extentB = OrientedBoundBox._sizeBe[k1] * OrientedBoundBox._tempM1.getElementByRowColumn(i, k2) + OrientedBoundBox._sizeBe[k2] * OrientedBoundBox._tempM1.getElementByRowColumn(i, k1);
					separation = Math.abs(OrientedBoundBox._vsepAe[i2] * OrientedBoundBox._tempM0.getElementByRowColumn(i1, k) - OrientedBoundBox._vsepAe[i1] * OrientedBoundBox._tempM0.getElementByRowColumn(i2, k));
					if (separation > extentA + extentB)
						return ContainmentType.Disjoint;
				}
			}
			
			return ContainmentType.Intersects;
		}
		
		/**
		 * 该包围盒是否与空间中另一射线相交
		 * @param	ray
		 * @param	out
		 * @return
		 */
		 intersectsRay(ray:Ray, out:Vector3):number {
			
			Vector3.scale(this.extents, -1, OrientedBoundBox._tempV30);
			
			this.transformation.invert(OrientedBoundBox._tempM0);
			
			Vector3.TransformNormal(ray.direction, OrientedBoundBox._tempM0, OrientedBoundBox._ray.direction);
			Vector3.transformCoordinate(ray.origin, OrientedBoundBox._tempM0, OrientedBoundBox._ray.origin);
			
			OrientedBoundBox._boxBound1.min = OrientedBoundBox._tempV30;
			OrientedBoundBox._boxBound1.max = this.extents;
			
			var intersects:number = CollisionUtils.intersectsRayAndBoxRP(OrientedBoundBox._ray, OrientedBoundBox._boxBound1, out);
			
			if (intersects !== -1)
				Vector3.transformCoordinate(out, this.transformation, out);
			
			return intersects;
		}
		
		private _getLocalCorners(corners:Vector3[]):void {
			
			corners.length = 8;
			
	
			
			OrientedBoundBox._tempV30.x = this.extents.x;
			OrientedBoundBox._tempV31.y = this.extents.y;
			OrientedBoundBox._tempV32.z = this.extents.z;
			
			Vector3.add(OrientedBoundBox._tempV30, OrientedBoundBox._tempV31, OrientedBoundBox._tempV33);
			Vector3.add(OrientedBoundBox._tempV33, OrientedBoundBox._tempV32, corners[0]);
			
			Vector3.add(OrientedBoundBox._tempV30, OrientedBoundBox._tempV31, OrientedBoundBox._tempV33);
			Vector3.subtract(OrientedBoundBox._tempV33, OrientedBoundBox._tempV32, corners[1]);
			
			Vector3.subtract(OrientedBoundBox._tempV31, OrientedBoundBox._tempV30, OrientedBoundBox._tempV33);
			Vector3.subtract(OrientedBoundBox._tempV33, OrientedBoundBox._tempV30, corners[2]);
			
			Vector3.subtract(OrientedBoundBox._tempV31, OrientedBoundBox._tempV30, OrientedBoundBox._tempV33);
			Vector3.add(OrientedBoundBox._tempV33, OrientedBoundBox._tempV32, corners[3]);
			
			Vector3.subtract(OrientedBoundBox._tempV30, OrientedBoundBox._tempV31, OrientedBoundBox._tempV33);
			Vector3.add(OrientedBoundBox._tempV33, OrientedBoundBox._tempV32, corners[4]);
			
			Vector3.subtract(OrientedBoundBox._tempV30, OrientedBoundBox._tempV31, OrientedBoundBox._tempV33);
			Vector3.subtract(OrientedBoundBox._tempV33, OrientedBoundBox._tempV32, corners[5]);
			
			Vector3.scale(corners[0], -1, corners[6]);
			
			Vector3.subtract(OrientedBoundBox._tempV32, OrientedBoundBox._tempV30, OrientedBoundBox._tempV33);
			Vector3.subtract(OrientedBoundBox._tempV33, OrientedBoundBox._tempV31, corners[7]);
		
		}
		
		/**
		 * 计算Obb包围盒变换到另一Obb包围盒的矩阵
		 * @param	a Obb包围盒
		 * @param	b Obb包围盒
		 * @param	noMatrixScaleApplied 是否考虑缩放
		 * @param	out 输出变换矩阵
		 */
		 static getObbtoObbMatrix4x4(a:OrientedBoundBox, b:OrientedBoundBox, noMatrixScaleApplied:boolean, out:Matrix4x4):void {
			
			var at:Matrix4x4 = a.transformation;
			var bt:Matrix4x4 = b.transformation;
			
			if (noMatrixScaleApplied) {
				
				OrientedBoundBox._getRows(at, OrientedBoundBox._rows1);
				OrientedBoundBox._getRows(bt, OrientedBoundBox._rows2);
				
				for (var i:number = 0; i < 3; i++) {
					for (var k:number = 0; k < 3; k++) {
						out.setElementByRowColumn(i, k, Vector3.dot(OrientedBoundBox._rows2[i], OrientedBoundBox._rows1[k]));
					}
				}
				
				b.getCenter(OrientedBoundBox._tempV30);
				a.getCenter(OrientedBoundBox._tempV31);
				Vector3.subtract(OrientedBoundBox._tempV30, OrientedBoundBox._tempV31, OrientedBoundBox._tempV32);
				var AtoBMe:Float32Array = out.elements;
				AtoBMe[12] = Vector3.dot(OrientedBoundBox._tempV32, OrientedBoundBox._rows1[0]);
				AtoBMe[13] = Vector3.dot(OrientedBoundBox._tempV32, OrientedBoundBox._rows1[1]);
				AtoBMe[14] = Vector3.dot(OrientedBoundBox._tempV32, OrientedBoundBox._rows1[2]);
				AtoBMe[15] = 1;
				
			} else {
				
				at.invert(OrientedBoundBox._tempM0);
				Matrix4x4.multiply(bt, OrientedBoundBox._tempM0, out);
			}
		}
		
		/**
		 * 把一个Obb类型的包围盒b合入另一Obb型包围盒a
		 * @param	a obb包围盒
		 * @param	b obb包围盒
		 * @param	noMatrixScaleApplied 是否考虑缩放
		 */
		 static merge(a:OrientedBoundBox, b:OrientedBoundBox, noMatrixScaleApplied:boolean):void {
			
			var ae:Vector3 = a.extents;
			var at:Matrix4x4 = a.transformation;
			
			OrientedBoundBox.getObbtoObbMatrix4x4(a, b, noMatrixScaleApplied, OrientedBoundBox._tempM0);
			b._getLocalCorners(OrientedBoundBox._corners);
			
			Vector3.transformCoordinate(OrientedBoundBox._corners[0], OrientedBoundBox._tempM0, OrientedBoundBox._corners[0]);
			Vector3.transformCoordinate(OrientedBoundBox._corners[1], OrientedBoundBox._tempM0, OrientedBoundBox._corners[1]);
			Vector3.transformCoordinate(OrientedBoundBox._corners[2], OrientedBoundBox._tempM0, OrientedBoundBox._corners[2]);
			Vector3.transformCoordinate(OrientedBoundBox._corners[3], OrientedBoundBox._tempM0, OrientedBoundBox._corners[3]);
			Vector3.transformCoordinate(OrientedBoundBox._corners[4], OrientedBoundBox._tempM0, OrientedBoundBox._corners[4]);
			Vector3.transformCoordinate(OrientedBoundBox._corners[5], OrientedBoundBox._tempM0, OrientedBoundBox._corners[5]);
			Vector3.transformCoordinate(OrientedBoundBox._corners[6], OrientedBoundBox._tempM0, OrientedBoundBox._corners[6]);
			Vector3.transformCoordinate(OrientedBoundBox._corners[7], OrientedBoundBox._tempM0, OrientedBoundBox._corners[7]);
			
			Vector3.scale(ae, -1, OrientedBoundBox._boxBound1.min);
			ae.cloneTo(OrientedBoundBox._boxBound1.max);
			
			BoundBox.createfromPoints(OrientedBoundBox._corners, OrientedBoundBox._boxBound2);
			BoundBox.merge(OrientedBoundBox._boxBound2, OrientedBoundBox._boxBound1, OrientedBoundBox._boxBound3);
			
			var box3Min:Vector3 = OrientedBoundBox._boxBound3.min;
			var box3Max:Vector3 = OrientedBoundBox._boxBound3.max;
			
			Vector3.subtract(box3Max, box3Min, OrientedBoundBox._tempV30);
			Vector3.scale(OrientedBoundBox._tempV30, 0.5, OrientedBoundBox._tempV30);
			Vector3.add(box3Min, OrientedBoundBox._tempV30, OrientedBoundBox._tempV32);
			Vector3.subtract(box3Max, OrientedBoundBox._tempV32, ae);
			
			Vector3.transformCoordinate(OrientedBoundBox._tempV32, at, OrientedBoundBox._tempV33);

		
		}
		
		/**
		 * 判断两个包围盒是否相等
		 * @param	obb obb包围盒
		 * @return  Boolean
		 */
		 equals(obb:OrientedBoundBox):boolean {
			
			return this.extents == obb.extents && this.transformation == obb.transformation;
		}
		
		/**
		 * 克隆。
		 * @param	destObject 克隆源。
		 */
		 cloneTo(destObject:any):void {
			var dest:OrientedBoundBox = (<OrientedBoundBox>destObject );
			this.extents.cloneTo(dest.extents);
			this.transformation.cloneTo(dest.transformation);
		}
	
	}


