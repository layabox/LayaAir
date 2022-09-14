import { LayaGL } from "../../layagl/LayaGL";
import { IClone } from "../../utils/IClone";
import { BoundBox } from "./BoundBox";
import { Matrix4x4 } from "./Matrix4x4";
import { Vector3 } from "./Vector3";

/**
 * <code>Bounds</code> 类用于创建包围体。
 */
export class Bounds implements IClone {
    /**
	 * 合并两个包围盒。
	 * @param	box1 包围盒1。
	 * @param	box2 包围盒2。
	 * @param	out 生成的包围盒。
	 */
	static merge(box1: Bounds, box2:Bounds, out: Bounds): void {
		Vector3.min(box1.min, box2.min, out.min);
		Vector3.max(box1.max, box2.max, out.max);
	}
    /**@internal */
    static _UPDATE_MIN: number = 0x01;
    /**@internal */
    static _UPDATE_MAX: number = 0x02;
    /**@internal */
    static _UPDATE_CENTER: number = 0x04;
    /**@internal */
    static _UPDATE_EXTENT: number = 0x08;

	/**@internal	*/
    _imp: any;
	
    get min() {
        return this.getMin();
    }

    set min(value: Vector3) {
        this.setMin(value);
    }

    get max() {
        return this.getMax();
    }

    set max(value: Vector3) {
        this.setMax(value);
    }

    /**
     * 设置包围盒的最小点。
     * @param value	包围盒的最小点。
     */
    setMin(value: Vector3): void {
        this._imp.setMin(value);
    }

    /**
     * 获取包围盒的最小点。
     * @return	包围盒的最小点。
     */
    getMin(): Vector3 {
        return this._imp.getMin();
    }

    /**
     * 设置包围盒的最大点。
     * @param value	包围盒的最大点。
     */
    setMax(value: Vector3): void {
        this._imp.setMax(value);
    }

    /**
     * 获取包围盒的最大点。
     * @return	包围盒的最大点。
     */
    getMax(): Vector3 {
        return this._imp.getMax();
    }

    /**
     * 设置包围盒的中心点。
     * @param value	包围盒的中心点。
     */
    setCenter(value: Vector3): void {
        this._imp.setCenter(value);
    }

    /**
     * 获取包围盒的中心点。
     * @return	包围盒的中心点。
     */
    getCenter(): Vector3 {
        return this._imp.getCenter();
    }

    /**
     * 设置包围盒的范围。
     * @param value	包围盒的范围。
     */
    setExtent(value: Vector3): void {
        this._imp.setExtent(value);
    }

    /**
     * 获取包围盒的范围。
     * @return	包围盒的范围。
     */
    getExtent(): Vector3 {
        return this._imp.getExtent();
    }

    /**
     * 创建一个 <code>Bounds</code> 实例。
     * @param	min  min 最小坐标
     * @param	max  max 最大坐标。
     */
    constructor(min?: Vector3, max?: Vector3) {
        this._imp = LayaGL.renderOBJCreate.createBounds(min, max);
    }

    protected _getUpdateFlag(type: number): boolean {
        return this._imp._getUpdateFlag(type);
    }


    protected _setUpdateFlag(type: number, value: boolean): void {
        this._imp._setUpdateFlag(type, value);
    }


    protected _getCenter(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.add(min, max, out);
        Vector3.scale(out, 0.5, out);
    }


    protected _getExtent(min: Vector3, max: Vector3, out: Vector3): void {
        Vector3.subtract(max, min, out);
        Vector3.scale(out, 0.5, out);
    }


    protected _getMin(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.subtract(center, extent, out);
    }


    protected _getMax(center: Vector3, extent: Vector3, out: Vector3): void {
        Vector3.add(center, extent, out);
    }

    protected _rotateExtents(extents: Vector3, rotation: Matrix4x4, out: Vector3): void {
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
        this._imp._tranform(matrix, out._imp);
    }

    getCorners(corners: Vector3[]){
        this._imp.getCorners(corners);
    }

    /**
     * TODO
     * @param box 
     */
    getBoundBox(box:BoundBox):void {
       this._imp._getBoundBox().cloneTo(box);
    }

    /**
     * @returns -1为不相交 不为0的时候返回值为相交体积
     */
    calculateBoundsintersection(bounds: Bounds): number {
        return this._imp.calculateBoundsintersection(bounds._imp);
    }


    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        this._imp.cloneTo(destObject._imp);
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

const TEMP_VECTOR3_MAX0 = new Vector3();
const TEMP_VECTOR3_MAX1 = new Vector3();