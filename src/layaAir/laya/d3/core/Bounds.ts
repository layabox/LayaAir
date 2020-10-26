import { IClone } from "./IClone";
import { BoundBox } from "../math/BoundBox"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Vector3 } from "../math/Vector3"

/**
 * <code>Bounds</code> 类用于创建包围体。
 */
export class Bounds implements IClone {
	/**@internal */
	static _UPDATE_MIN: number = 0x01;
	/**@internal */
	static _UPDATE_MAX: number = 0x02;
	/**@internal */
	static _UPDATE_CENTER: number = 0x04;
	/**@internal */
	static _UPDATE_EXTENT: number = 0x08;

	static TEMP_VECTOR3_MAX0:Vector3 = new Vector3();
	static TEMP_VECTOR3_MAX1:Vector3 = new Vector3();

	private _updateFlag: number = 0;

	/**@internal	*/
	_center: Vector3 = new Vector3();
	/**@internal	*/
	_extent: Vector3 = new Vector3();
	/***/
	_boundBox: BoundBox = new BoundBox(new Vector3(), new Vector3());

	/**
	 * 设置包围盒的最小点。
	 * @param value	包围盒的最小点。
	 */
	setMin(value: Vector3): void {
		var min: Vector3 = this._boundBox.min;
		if (value !== min)
			value.cloneTo(min);
		this._setUpdateFlag(Bounds._UPDATE_CENTER | Bounds._UPDATE_EXTENT, true);
		this._setUpdateFlag(Bounds._UPDATE_MIN, false);
	}

	/**
	 * 获取包围盒的最小点。
	 * @return	包围盒的最小点。
	 */
	getMin(): Vector3 {
		var min: Vector3 = this._boundBox.min;
		if (this._getUpdateFlag(Bounds._UPDATE_MIN)) {
			this._getMin(this.getCenter(), this.getExtent(), min);
			this._setUpdateFlag(Bounds._UPDATE_MIN, false);
		}
		return min;
	}

	/**
	 * 设置包围盒的最大点。
	 * @param value	包围盒的最大点。
	 */
	setMax(value: Vector3): void {
		var max: Vector3 = this._boundBox.max;
		if (value !== max)
			value.cloneTo(max);
		this._setUpdateFlag(Bounds._UPDATE_CENTER | Bounds._UPDATE_EXTENT, true);
		this._setUpdateFlag(Bounds._UPDATE_MAX, false);
	}

	/**
	 * 获取包围盒的最大点。
	 * @return	包围盒的最大点。
	 */
	getMax(): Vector3 {
		var max: Vector3 = this._boundBox.max;
		if (this._getUpdateFlag(Bounds._UPDATE_MAX)) {
			this._getMax(this.getCenter(), this.getExtent(), max);
			this._setUpdateFlag(Bounds._UPDATE_MAX, false);
		}
		return max;
	}

	/**
	 * 设置包围盒的中心点。
	 * @param value	包围盒的中心点。
	 */
	setCenter(value: Vector3): void {
		if (value !== this._center)
			value.cloneTo(this._center);
		this._setUpdateFlag(Bounds._UPDATE_MIN | Bounds._UPDATE_MAX, true);
		this._setUpdateFlag(Bounds._UPDATE_CENTER, false);
	}

	/**
	 * 获取包围盒的中心点。
	 * @return	包围盒的中心点。
	 */
	getCenter(): Vector3 {
		if (this._getUpdateFlag(Bounds._UPDATE_CENTER)) {
			this._getCenter(this.getMin(), this.getMax(), this._center);
			this._setUpdateFlag(Bounds._UPDATE_CENTER, false);
		}
		return this._center;
	}

	/**
	 * 设置包围盒的范围。
	 * @param value	包围盒的范围。
	 */
	setExtent(value: Vector3): void {
		if (value !== this._extent)
			value.cloneTo(this._extent);
		this._setUpdateFlag(Bounds._UPDATE_MIN | Bounds._UPDATE_MAX, true);
		this._setUpdateFlag(Bounds._UPDATE_EXTENT, false);
	}

	/**
	 * 获取包围盒的范围。
	 * @return	包围盒的范围。
	 */
	getExtent(): Vector3 {
		if (this._getUpdateFlag(Bounds._UPDATE_EXTENT)) {
			this._getExtent(this.getMin(), this.getMax(), this._extent);
			this._setUpdateFlag(Bounds._UPDATE_EXTENT, false);
		}
		return this._extent;
	}

	/**
	 * 创建一个 <code>Bounds</code> 实例。
	 * @param	min  min 最小坐标
	 * @param	max  max 最大坐标。
	 */
	constructor(min: Vector3, max: Vector3) {
		min.cloneTo(this._boundBox.min);
		max.cloneTo(this._boundBox.max);
		this._setUpdateFlag(Bounds._UPDATE_CENTER | Bounds._UPDATE_EXTENT, true);
	}


	private _getUpdateFlag(type: number): boolean {
		return (this._updateFlag & type) != 0;
	}


	private _setUpdateFlag(type: number, value: boolean): void {
		if (value)
			this._updateFlag |= type;
		else
			this._updateFlag &= ~type;
	}


	private _getCenter(min: Vector3, max: Vector3, out: Vector3): void {
		Vector3.add(min, max, out);
		Vector3.scale(out, 0.5, out);
	}


	private _getExtent(min: Vector3, max: Vector3, out: Vector3): void {
		Vector3.subtract(max, min, out);
		Vector3.scale(out, 0.5, out);
	}


	private _getMin(center: Vector3, extent: Vector3, out: Vector3): void {
		Vector3.subtract(center, extent, out);
	}


	private _getMax(center: Vector3, extent: Vector3, out: Vector3): void {
		Vector3.add(center, extent, out);
	}

	private _rotateExtents(extents: Vector3, rotation: Matrix4x4, out: Vector3): void {
		var extentsX: number = extents.x;
		var extentsY: number = extents.y;
		var extentsZ: number = extents.z;
		var matE: Float32Array = rotation.elements;
		out.x = Math.abs(matE[0] * extentsX) + Math.abs(matE[4] * extentsY) + Math.abs(matE[8] * extentsZ);
		out.y = Math.abs(matE[1] * extentsX) + Math.abs(matE[5] * extentsY) + Math.abs(matE[9] * extentsZ);
		out.z = Math.abs(matE[2] * extentsX) + Math.abs(matE[6] * extentsY) + Math.abs(matE[10] * extentsZ);
	}

	/**
	 * @internal
	 */
	_tranform(matrix: Matrix4x4, out: Bounds): void {
		var outCen: Vector3 = out._center;
		var outExt: Vector3 = out._extent;

		Vector3.transformCoordinate(this.getCenter(), matrix, outCen);
		this._rotateExtents(this.getExtent(), matrix, outExt);

		out._boundBox.setCenterAndExtent(outCen, outExt);
		out._updateFlag = 0;
	}

	/**
	 * @internal
	 */
	_getBoundBox(): BoundBox {
		if (this._updateFlag & Bounds._UPDATE_MIN) {
			var min: Vector3 = this._boundBox.min;
			this._getMin(this.getCenter(), this.getExtent(), min);
			this._setUpdateFlag(Bounds._UPDATE_MIN, false);
		}
		if (this._updateFlag & Bounds._UPDATE_MAX) {
			var max: Vector3 = this._boundBox.max;
			this._getMax(this.getCenter(), this.getExtent(), max);
			this._setUpdateFlag(Bounds._UPDATE_MAX, false);
		}
		return this._boundBox;
	}

	/**
	 * @returns -1为不相交 不为0的时候返回值为相交体积
	 */
	calculateBoundsintersection(bounds:Bounds):number{
		var ownMax:Vector3 = this.getMax();
		var ownMin:Vector3 = this.getMin();
		var calMax:Vector3 = bounds.getMax();
		var calMin:Vector3 = bounds.getMin();
		var tempV0:Vector3 = Bounds.TEMP_VECTOR3_MAX0;
		var tempV1:Vector3 = Bounds.TEMP_VECTOR3_MAX1;
		var thisExtends:Vector3 = this.getExtent();
		var boundExtends:Vector3 =bounds.getExtent();
		tempV0.setValue(Math.max(ownMax.x,calMax.x)-Math.min(ownMin.x,calMin.x),
			Math.max(ownMax.y,calMax.y)-Math.min(ownMin.y,calMin.y),
			Math.max(ownMax.z,calMax.z)-Math.min(ownMin.z,calMin.z));
		tempV1.setValue((thisExtends.x+boundExtends.x)*2.0,
			(thisExtends.y+boundExtends.y)*2.0,
			(thisExtends.z+boundExtends.z)*2.0); 
		if((tempV0.x)>(tempV1.x)) return -1;
		if((tempV0.y)>(tempV1.y)) return -1;
		if((tempV0.z)>(tempV1.z)) return -1;
		return (tempV1.x-tempV0.x)*(tempV1.y-tempV0.y)*(tempV1.z-tempV0.z);
	}


	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destBounds: Bounds = (<Bounds>destObject);
		this.getMin().cloneTo(destBounds._boundBox.min);
		this.getMax().cloneTo(destBounds._boundBox.max);
		this.getCenter().cloneTo(destBounds._center);
		this.getExtent().cloneTo(destBounds._extent);
		destBounds._updateFlag = 0;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: Bounds = new Bounds(new Vector3(), new Vector3());
		this.cloneTo(dest);
		return dest;
	}

}


