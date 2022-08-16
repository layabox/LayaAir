import { Vector3 } from "./laya/d3/math/Vector3"
import { PBRRenderQuality } from "./laya/d3/core/material/PBRRenderQuality";
import { Config } from "./Config";

/**
 * <code>Config3D</code> 类用于创建3D初始化配置。
 */
export class Config3D {
    /**控制是否动态合并 */
    static enableDynamicBatch: boolean = true;
    /**是否静态合并 */
    static enableStaticBatch: boolean = true;

    /**
     * 默认物理功能初始化内存，单位为M。
     */
    static defaultPhysicsMemory: number = 16;
    /** 是否使用CANNONJS物理引擎*/
    static useCannonPhysics: boolean = false;

    /** 是否开启UniformBuffer*/
    static enableUniformBufferObject = true;
    /**@internal */
    static _uniformBlock: boolean;

    /** 是否开启八叉树裁剪。*/
    static octreeCulling: boolean = false;
    /** 八叉树初始化尺寸。*/
    static octreeInitialSize: number = 64.0;
    /** 八叉树初始化中心。*/
    static octreeInitialCenter: Vector3 = new Vector3(0, 0, 0);
    /** 八叉树最小尺寸。*/
    static octreeMinNodeSize: number = 2.0;
    /** 八叉树松散值。*/
    static octreeLooseness: number = 1.25;
    /** 
     * 是否开启视锥裁剪调试。
     * 如果开启八叉树裁剪,使用红色绘制高层次八叉树节点包围盒,使用蓝色绘制低层次八叉节点包围盒,精灵包围盒和八叉树节点包围盒颜色一致,但Alpha为非透明。如果视锥完全包含八叉树节点,八叉树节点包围盒和精灵包围盒变为蓝色,同样精灵包围盒的Alpha为非透明。
     * 如果不开启八叉树裁剪,使用绿色像素线绘制精灵包围盒。
     */
    static debugFrustumCulling: boolean = false;

    /** PBR材质渲染质量。*/
    static pbrRenderQuality: PBRRenderQuality = PBRRenderQuality.High;

    /**@internal 设置分辨率宽度*/
    static _resoluWidth: number = -1;
    /**@internal 设置分辨率高度*/
    static _resoluHeight: number = -1;
    /** 设置分辨率倍数 */
    static pixelRatio: number = 1;
    /** 设置分辨率 */
    static customResolution: boolean = false;
    /**
     * 设置分辨率大小（并不是实际渲染分辨率）
     * @param width 
     * @param height 
     */
    static setResolution(width: number, height: number) {
        Config3D.customResolution = true;
        Config3D._resoluWidth = width;
        Config3D._resoluHeight = height;
    }

    /** 是否开启多光源,如果场景不需要多光源，关闭后可提升性能。*/
    static enableMultiLight: boolean = true;
    /**
     * 最大光源数量。
     */
    static maxLightCount: number = 32;
    /**
     * X、Y、Z轴的光照集群数量,Z值会影响Cluster接受区域光(点光、聚光)影响的数量,Math.floor(2048 / lightClusterCount.z - 1) * 4 为每个Cluster的最大平均接受区域光数量,如果每个Cluster所接受光源影响的平均数量大于该值，则较远的Cluster会忽略其中多余的光照影响。
     */
    static lightClusterCount: Vector3 = new Vector3(12, 12, 12);

    /**@internal*/
    static _maxAreaLightCountPerClusterAverage: number;
    /**@internal*/
    static _multiLighting: boolean;
}

Config.isStencil = true;