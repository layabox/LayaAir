import { Bounds } from "../Bounds";
import { BaseMaterial } from "../material/BaseMaterial";
import { BoundsOctreeNode } from "../scene/BoundsOctreeNode";
import { IOctreeObject } from "../scene/IOctreeObject";
import { Vector4 } from "../../math/Vector4";
import { EventDispatcher } from "../../../events/EventDispatcher";
import { ISingletonElement } from "../../../resource/ISingletonElement";
/**
 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
 */
export declare class BaseRender extends EventDispatcher implements ISingletonElement, IOctreeObject {
    _supportOctree: boolean;
    /**排序矫正值。*/
    sortingFudge: number;
    /**
     * 获取唯一标识ID,通常用于识别。
     */
    readonly id: number;
    /**
     * 获取光照贴图的索引。
     * @return 光照贴图的索引。
     */
    /**
    * 设置光照贴图的索引。
    * @param value 光照贴图的索引。
    */
    lightmapIndex: number;
    /**
     * 获取光照贴图的缩放和偏移。
     * @return  光照贴图的缩放和偏移。
     */
    /**
    * 设置光照贴图的缩放和偏移。
    * @param  光照贴图的缩放和偏移。
    */
    lightmapScaleOffset: Vector4;
    /**
     * 获取是否可用。
     * @return 是否可用。
     */
    /**
    * 设置是否可用。
    * @param value 是否可用。
    */
    enable: boolean;
    /**
     * 返回第一个实例材质,第一次使用会拷贝实例对象。
     * @return 第一个实例材质。
     */
    /**
    * 设置第一个实例材质。
    * @param value 第一个实例材质。
    */
    material: BaseMaterial;
    /**
     * 获取潜拷贝实例材质列表,第一次使用会拷贝实例对象。
     * @return 浅拷贝实例材质列表。
     */
    /**
    * 设置实例材质列表。
    * @param value 实例材质列表。
    */
    materials: BaseMaterial[];
    /**
     * 返回第一个材质。
     * @return 第一个材质。
     */
    /**
    * 设置第一个材质。
    * @param value 第一个材质。
    */
    sharedMaterial: BaseMaterial;
    /**
     * 获取浅拷贝材质列表。
     * @return 浅拷贝材质列表。
     */
    /**
    * 设置材质列表。
    * @param value 材质列表。
    */
    sharedMaterials: BaseMaterial[];
    /**
     * 获取包围盒,只读,不允许修改其值。
     * @return 包围盒。
     */
    readonly bounds: Bounds;
    /**
     * 设置是否接收阴影属性
     */
    /**
    * 获得是否接收阴影属性
    */
    receiveShadow: boolean;
    /**
     * 获取是否产生阴影。
     * @return 是否产生阴影。
     */
    /**
    *	设置是否产生阴影。
    * 	@param value 是否产生阴影。
    */
    castShadow: boolean;
    /**
     * 是否是静态的一部分。
     */
    readonly isPartOfStaticBatch: boolean;
    /**
     *
     */
    _getOctreeNode(): BoundsOctreeNode;
    /**
     *
     */
    _setOctreeNode(value: BoundsOctreeNode): void;
    /**
     *
     */
    _getIndexInMotionList(): number;
    /**
     *
     */
    _setIndexInMotionList(value: number): void;
    /**
     *  [实现ISingletonElement接口]
     */
    _getIndexInList(): number;
    /**
     *  [实现ISingletonElement接口]
     */
    _setIndexInList(index: number): void;
}
