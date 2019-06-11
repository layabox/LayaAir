import { Physics } from "../Physics";
import { ColliderShape } from "././ColliderShape";
/**
 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class BoxColliderShape extends ColliderShape {
    /**
    * @private
    */
    static __init__() {
        BoxColliderShape._nativeSize = new Physics._physics3D.btVector3(0, 0, 0);
    }
    /**
     * 获取X轴尺寸。
     */
    get sizeX() {
        return this._sizeX;
    }
    /**
     * 获取Y轴尺寸。
     */
    get sizeY() {
        return this._sizeY;
    }
    /**
     * 获取Z轴尺寸。
     */
    get sizeZ() {
        return this._sizeZ;
    }
    /**
     * 创建一个新的 <code>BoxColliderShape</code> 实例。
     * @param sizeX 盒子X轴尺寸。
     * @param sizeY 盒子Y轴尺寸。
     * @param sizeZ 盒子Z轴尺寸。
     */
    constructor(sizeX = 1.0, sizeY = 1.0, sizeZ = 1.0) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        this._sizeX = sizeX;
        this._sizeY = sizeY;
        this._sizeZ = sizeZ;
        this._type = ColliderShape.SHAPETYPES_BOX;
        BoxColliderShape._nativeSize.setValue(sizeX / 2, sizeY / 2, sizeZ / 2);
        this._nativeShape = new Physics._physics3D.btBoxShape(BoxColliderShape._nativeSize);
    }
    /**
     * @inheritDoc
     */
    clone() {
        var dest = new BoxColliderShape(this._sizeX, this._sizeY, this._sizeZ);
        this.cloneTo(dest);
        return dest;
    }
}
