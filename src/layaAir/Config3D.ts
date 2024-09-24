import { Vector3 } from "./laya/maths/Vector3";

/**
 * @en Config3D class is used to create 3D initialization configuration.
 * @zh Config3D 类用于创建3D初始化配置。
 */
export class Config3D {
    /**
     * @en Whether to enable dynamic batch
     * @zh 是否启用动态合并
     */
    static enableDynamicBatch: boolean = true;

    /**
     * @en Whether to enable static batch
     * @zh 是否启用静态合并
     */
    static enableStaticBatch: boolean = true;

    /** 
     * @en Whether to enable UniformBuffer
     * @zh 是否启用UniformBuffer
     */
    static enableUniformBufferObject = true;

    /**
     * @en Set 3D RT resolution multiplier
     * @zh 设置3D RT分辨率倍数
     */
    static pixelRatio: number = 1;

    /**
     * @en Set custom resolution
     * @zh 设置自定义分辨率
     */
    static customResolution: boolean = false;

    /**
     * @en Set the maximum value cached by RendertexturePool
     * @zh 设置最大RendertexturePool缓存的值
     */
    static defaultCacheRTMemory: number = 256;

    /**
     * @en Default physics function initialization memory, in MB.
     * @zh 默认物理功能初始化内存，单位为M。
     */
    static defaultPhysicsMemory: number = 16;

    /**
     * @en Whether to enable multiple lights. If the scene doesn't need multiple lights, turning it off can improve performance.
     * @zh 是否启用多光源。如果场景不需要多光源，关闭后可提升性能。
     */
    static enableMultiLight: boolean = true;

    /**
     * @en Maximum number of lights.
     * @zh 最大光源数量。
     */
    static maxLightCount: number = 32;

    /**
     * @en Number of light clusters on X, Y, Z axes. The Z value affects the number of area lights (point lights, spotlights) that a Cluster can receive. Math.floor(2048 / lightClusterCount.z - 1) * 4 is the maximum average number of area lights each Cluster can receive. If the average number of light sources affecting each Cluster is greater than this value, the more distant Clusters will ignore the excess light effects.
     * @zh X、Y、Z轴的光照集群数量。Z值会影响Cluster接受区域光（点光、聚光）影响的数量。Math.floor(2048 / lightClusterCount.z - 1) * 4 为每个Cluster的最大平均接受区域光数量。如果每个Cluster所接受光源影响的平均数量大于该值，则较远的Cluster会忽略其中多余的光照影响。
     */
    static lightClusterCount: Vector3 = new Vector3(12, 12, 12);

    /**
     * @en Maximum number of morph targets
     * @zh 最大形变数量
     */
    static maxMorphTargetCount: number = 32;

    /**
     * @en Set resolution size (not the actual rendering resolution)
     * @param width Set resolution width, unit: pixel
     * @param height Set resolution height, unit: pixel
     * @zh 设置分辨率大小（并不是实际渲染分辨率）
     * @param width 设置分辨率宽度，单位为像素
     * @param height 设置分辨率高度，单位为像素
     */
    static setResolution(width: number, height: number) {
        Config3D.customResolution = true;
        Config3D._resoluWidth = width;
        Config3D._resoluHeight = height;
    }

    /**
     * @en Whether to use BVH culling
     * @zh 是否使用BVH裁剪
     */
    static useBVHCull: boolean = false;

    /**
     * @en Maximum number of cells in a BVH node, nodes exceeding this number will be separated
     * @zh 一个BVH节点最大的cell数，超过这个数会分离
     */
    static BVH_max_SpatialCount = 7;

    /**
     * @en Maximum size of BVH node
     * @zh 最大BVH节点的大小
     */
    static BVH_limit_size = 32;

    /**
     * @en Minimum number of cellbuilds, if less than this number, BVH construction will not occur
     * @zh 最小cellbuild数，如果小于这个数，不会进行BVH构建
     */
    static BVH_Min_Build_nums = 10


    //----引擎内部使用,不暴露给开发者----
    /**@internal */
    static _uniformBlock: boolean;
    /**@internal 设置分辨率宽度*/
    static _resoluWidth: number = -1;
    /**@internal 设置分辨率高度*/
    static _resoluHeight: number = -1;
    /**@internal */
    static _maxAreaLightCountPerClusterAverage: number;
    /**@internal */
    static _multiLighting: boolean;
    /**@internal 是否开启视锥裁剪调试 */
    static debugFrustumCulling: boolean = false;
}