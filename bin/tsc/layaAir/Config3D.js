import { Vector3 } from "./laya/d3/math/Vector3";
/**
 * <code>Config3D</code> 类用于创建3D初始化配置。
 */
export class Config3D {
    /**
     * 创建一个 <code>Config3D</code> 实例。
     */
    constructor() {
        /**@private	*/
        this._defaultPhysicsMemory = 16;
        /**@private	*/
        this._editerEnvironment = false;
        /** 是否开启抗锯齿。*/
        this.isAntialias = true;
        /** 设置画布是否透明。*/
        this.isAlpha = false;
        /** 设置画布是否预乘。*/
        this.premultipliedAlpha = true;
        /** 设置画布的是否开启模板缓冲。*/
        this.isStencil = true;
        /** 是否开启八叉树裁剪。*/
        this.octreeCulling = false;
        /** 八叉树初始化尺寸。*/
        this.octreeInitialSize = 64.0;
        /** 八叉树初始化中心。*/
        this.octreeInitialCenter = new Vector3(0, 0, 0);
        /** 八叉树最小尺寸。*/
        this.octreeMinNodeSize = 2.0;
        /** 八叉树松散值。*/
        this.octreeLooseness = 1.25;
        /**
         * 是否开启视锥裁剪调试。
         * 如果开启八叉树裁剪,使用红色绘制高层次八叉树节点包围盒,使用蓝色绘制低层次八叉节点包围盒,精灵包围盒和八叉树节点包围盒颜色一致,但Alpha为半透明。如果视锥完全包含八叉树节点,八叉树节点包围盒和精灵包围盒变为蓝色,同样精灵包围盒的Alpha为半透明。
         * 如果不开启八叉树裁剪,使用绿色像素线绘制精灵包围盒。
         */
        this.debugFrustumCulling = false;
    }
    /**
     * 获取默认物理功能初始化内存，单位为M。
     * @return 默认物理功能初始化内存。
     */
    get defaultPhysicsMemory() {
        return this._defaultPhysicsMemory;
    }
    /**
     * 设置默认物理功能初始化内存，单位为M。
     * @param value 默认物理功能初始化内存。
     */
    set defaultPhysicsMemory(value) {
        if (value < 16) //必须大于16M
            throw "defaultPhysicsMemory must large than 16M";
        this._defaultPhysicsMemory = value;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(dest) {
        var destConfig3D = dest;
        destConfig3D._defaultPhysicsMemory = this._defaultPhysicsMemory;
        destConfig3D._editerEnvironment = this._editerEnvironment;
        destConfig3D.isAntialias = this.isAntialias;
        destConfig3D.isAlpha = this.isAlpha;
        destConfig3D.premultipliedAlpha = this.premultipliedAlpha;
        destConfig3D.isStencil = this.isStencil;
        destConfig3D.octreeCulling = this.octreeCulling;
        this.octreeInitialCenter.cloneTo(destConfig3D.octreeInitialCenter);
        destConfig3D.octreeMinNodeSize = this.octreeMinNodeSize;
        destConfig3D.octreeLooseness = this.octreeLooseness;
        destConfig3D.debugFrustumCulling = this.debugFrustumCulling;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new Config3D();
        this.cloneTo(dest);
        return dest;
    }
}
/**@private	*/
Config3D._default = new Config3D();
