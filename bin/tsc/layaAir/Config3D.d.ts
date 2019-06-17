import { IClone } from "./laya/d3/core/IClone";
import { Vector3 } from "./laya/d3/math/Vector3";
/**
 * <code>Config3D</code> 类用于创建3D初始化配置。
 */
export declare class Config3D implements IClone {
    /**@private	*/
    static _default: Config3D;
    /**@private	*/
    private _defaultPhysicsMemory;
    /**@private	*/
    _editerEnvironment: boolean;
    /** 是否开启抗锯齿。*/
    isAntialias: boolean;
    /** 设置画布是否透明。*/
    isAlpha: boolean;
    /** 设置画布是否预乘。*/
    premultipliedAlpha: boolean;
    /** 设置画布的是否开启模板缓冲。*/
    isStencil: boolean;
    /** 是否开启八叉树裁剪。*/
    octreeCulling: boolean;
    /** 八叉树初始化尺寸。*/
    octreeInitialSize: number;
    /** 八叉树初始化中心。*/
    octreeInitialCenter: Vector3;
    /** 八叉树最小尺寸。*/
    octreeMinNodeSize: number;
    /** 八叉树松散值。*/
    octreeLooseness: number;
    /**
     * 是否开启视锥裁剪调试。
     * 如果开启八叉树裁剪,使用红色绘制高层次八叉树节点包围盒,使用蓝色绘制低层次八叉节点包围盒,精灵包围盒和八叉树节点包围盒颜色一致,但Alpha为半透明。如果视锥完全包含八叉树节点,八叉树节点包围盒和精灵包围盒变为蓝色,同样精灵包围盒的Alpha为半透明。
     * 如果不开启八叉树裁剪,使用绿色像素线绘制精灵包围盒。
     */
    debugFrustumCulling: boolean;
    /**
     * 获取默认物理功能初始化内存，单位为M。
     * @return 默认物理功能初始化内存。
     */
    /**
    * 设置默认物理功能初始化内存，单位为M。
    * @param value 默认物理功能初始化内存。
    */
    defaultPhysicsMemory: number;
    /**
     * 创建一个 <code>Config3D</code> 实例。
     */
    constructor();
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(dest: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
