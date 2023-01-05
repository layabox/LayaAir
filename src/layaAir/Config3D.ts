import { Config } from "./Config";
import { Vector3 } from "./laya/maths/Vector3";

/**
 * <code>Config3D</code> 类用于创建3D初始化配置。
 */
export class Config3D {
    /**
     * 控制是否动态合并 
     */
    static enableDynamicBatch: boolean = true;
    /**
     * 是否静态合并 
     */
    static enableStaticBatch: boolean = true;
    /** 
     * 是否开启UniformBuffer
     */
    static enableUniformBufferObject = true;
    /**
     * 设置3DRT分辨率倍数
     */
    static pixelRatio: number = 1;
    /**
     *  设置自定义分辨率
     */
    static customResolution: boolean = false;
    /**
     *  设置最大RendertexturePool缓存的值
     */
    static defaultCacheRTMemory: number = 256;
    /**
     * 默认物理功能初始化内存，单位为M。
     */
    static defaultPhysicsMemory: number = 16;
    /**
     *  是否开启多光源,如果场景不需要多光源，关闭后可提升性能。
     */
    static enableMultiLight: boolean = true;
    /**
     * 最大光源数量。
     */
    static maxLightCount: number = 32;
    /**
    * X、Y、Z轴的光照集群数量,Z值会影响Cluster接受区域光(点光、聚光)影响的数量,Math.floor(2048 / lightClusterCount.z - 1) * 4 为每个Cluster的最大平均接受区域光数量,如果每个Cluster所接受光源影响的平均数量大于该值，则较远的Cluster会忽略其中多余的光照影响。
    */
    static lightClusterCount: Vector3 = new Vector3(12, 12, 12);
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

    /**BVHRenderConfig */
    /**是否使用BVH裁剪 */
    static useBVHCull: boolean = false;
    /**一个BVH节点最大的cell数，超过这个数会分离 */
    static BVH_max_SpatialCount = 7;
    /**最大BVH节点的大小 */
    static BVH_limit_size = 32;
    /**最小cellbuild数，如果小于这个数，不会BVH构建 */
    static BVH_Min_Build_nums = 10


    //----引擎内部使用,不暴露给开发者----
    /**@internal */
    static _uniformBlock: boolean;
    /**@internal 设置分辨率宽度*/
    static _resoluWidth: number = -1;
    /**@internal 设置分辨率高度*/
    static _resoluHeight: number = -1;
    /**@internal*/
    static _maxAreaLightCountPerClusterAverage: number;
    /**@internal*/
    static _multiLighting: boolean;
    /** @internal是否开启视锥裁剪调试。
     */
    static debugFrustumCulling: boolean = false;
}

Config.isStencil = true;