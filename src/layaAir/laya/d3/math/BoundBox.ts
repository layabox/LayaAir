import { Vector3 } from "./Vector3";
import { Matrix4x4 } from "./Matrix4x4";
import { IClone } from "../core/IClone"
	
	/**
	 * <code>BoundBox</code> 类用于创建包围盒。
	 */
	export class BoundBox implements IClone {
		/**@internal */
		private static _tempVector30:Vector3 = new Vector3();
		/**@internal */
		private static _tempVector31:Vector3 = new Vector3();
		
		/**最小顶点。*/
		 min:Vector3;
		/**最大顶点。*/
		 max:Vector3;
		
		/**
		 * 创建一个 <code>BoundBox</code> 实例。
		 * @param	min 包围盒的最小顶点。
		 * @param	max 包围盒的最大顶点。
		 */
		constructor(min:Vector3, max:Vector3){
			this.min = min;
			this.max = max;
		}
		
		/**
		 * @internal
		 */
		private _rotateExtents(extents:Vector3, rotation:Matrix4x4, out:Vector3):void {
			var extentsX:number = extents.x;
			var extentsY:number = extents.y;
			var extentsZ:number = extents.z;
			var matElements:Float32Array = rotation.elements;
			out.x = Math.abs(matElements[0] * extentsX) + Math.abs(matElements[4] * extentsY) + Math.abs(matElements[8] * extentsZ);
			out.y = Math.abs(matElements[1] * extentsX) + Math.abs(matElements[5] * extentsY) + Math.abs(matElements[9] * extentsZ);
			out.z = Math.abs(matElements[2] * extentsX) + Math.abs(matElements[6] * extentsY) + Math.abs(matElements[10] * extentsZ);
		}
		
		/**
		 * 获取包围盒的8个角顶点。
		 * @param	corners 返回顶点的输出队列。
		 */
		 getCorners(corners:Vector3[]):void {
			corners.length = 8;
			var minX:number = this.min.x;
			var minY:number = this.min.y;
			var minZ:number = this.min.z;
			var maxX:number = this.max.x;
			var maxY:number = this.max.y;
			var maxZ:number = this.max.z;
			corners[0] = new Vector3(minX, maxY, maxZ);
			corners[1] = new Vector3(maxX, maxY, maxZ);
			corners[2] = new Vector3(maxX, minY, maxZ);
			corners[3] = new Vector3(minX, minY, maxZ);
			corners[4] = new Vector3(minX, maxY, minZ);
			corners[5] = new Vector3(maxX, maxY, minZ);
			corners[6] = new Vector3(maxX, minY, minZ);
			corners[7] = new Vector3(minX, minY, minZ);
		}
		
		/**
		 * 获取中心点。
		 * @param	out
		 */
		 getCenter(out:Vector3):void {
			Vector3.add(this.min, this.max, out);
			Vector3.scale(out, 0.5, out);
		}
		
		/**
		 * 获取范围。
		 * @param	out
		 */
		 getExtent(out:Vector3):void {
			Vector3.subtract(this.max, this.min, out);
			Vector3.scale(out, 0.5, out);
		}
		
		/**
		 * 设置中心点和范围。
		 * @param	center
		 */
		 setCenterAndExtent(center:Vector3, extent:Vector3):void {
			Vector3.subtract(center, extent, this.min);
			Vector3.add(center, extent, this.max);
		}
		
		/**
		 * @internal
		 */
		 tranform(matrix:Matrix4x4, out:BoundBox):void {
			var center:Vector3 = BoundBox._tempVector30;
			var extent:Vector3 = BoundBox._tempVector31;
			this.getCenter(center);
			this.getExtent(extent);
			Vector3.transformCoordinate(center, matrix, center);
			this._rotateExtents(extent, matrix,extent);
			out.setCenterAndExtent(center,extent);
		}
		
		 toDefault():void {
			this.min.toDefault();
			this.max.toDefault();
		}
		
		/**
		 * 从顶点生成包围盒。
		 * @param	points 所需顶点队列。
		 * @param	out 生成的包围盒。
		 */
		 static createfromPoints(points:Vector3[], out:BoundBox):void {
			if (points == null)
				throw new Error("points");
			
			var min:Vector3 = out.min;
			var max:Vector3 = out.max;
			min.x = Number.MAX_VALUE;
			min.y = Number.MAX_VALUE;
			min.z = Number.MAX_VALUE;
			max.x = -Number.MAX_VALUE;
			max.y = -Number.MAX_VALUE;
			max.z = -Number.MAX_VALUE;
			
			for (var i:number = 0, n:number = points.length; i < n; ++i) {
				Vector3.min(min, points[i], min);
				Vector3.max(max, points[i], max);
			}
		}
		
		/**
		 * 合并两个包围盒。
		 * @param	box1 包围盒1。
		 * @param	box2 包围盒2。
		 * @param	out 生成的包围盒。
		 */
		 static merge(box1:BoundBox, box2:BoundBox, out:BoundBox):void {
			Vector3.min(box1.min, box2.min, out.min);
			Vector3.max(box1.max, box2.max, out.max);
		}
		
		/**
		 * 克隆。
		 * @param	destObject 克隆源。
		 */
		 cloneTo(destObject:any):void {
			var dest:BoundBox = (<BoundBox>destObject );
			this.min.cloneTo(dest.min);
			this.max.cloneTo(dest.max);
		}
		
		/**
		 * 克隆。
		 * @return	 克隆副本。
		 */
		 clone():any {
			var dest:BoundBox = new BoundBox(new Vector3(),new Vector3());
			this.cloneTo(dest);
			return dest;
		}
	
	}



