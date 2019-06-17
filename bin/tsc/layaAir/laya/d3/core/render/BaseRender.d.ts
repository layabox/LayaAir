import { RenderElement } from "././RenderElement";
import { RenderContext3D } from "././RenderContext3D";
import { Bounds } from "../Bounds";
import { GeometryElement } from "../GeometryElement";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { Transform3D } from "../Transform3D";
import { BaseMaterial } from "../material/BaseMaterial";
import { BoundsOctreeNode } from "../scene/BoundsOctreeNode";
import { IOctreeObject } from "../scene/IOctreeObject";
import { Scene3D } from "../scene/Scene3D";
import { BoundFrustum } from "../../math/BoundFrustum";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { ShaderData } from "../../shader/ShaderData";
import { EventDispatcher } from "../../../events/EventDispatcher";
import { ISingletonElement } from "../../../resource/ISingletonElement";
/**
 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
 */
export declare class BaseRender extends EventDispatcher implements ISingletonElement, IOctreeObject {
    /**@private */
    static _tempBoundBoxCorners: Vector3[];
    /**@private */
    private static _uniqueIDCounter;
    /**@private */
    private _id;
    /** @private */
    private _lightmapScaleOffset;
    /** @private */
    private _lightmapIndex;
    /** @private */
    private _receiveShadow;
    /** @private */
    private _materialsInstance;
    /** @private */
    private _castShadow;
    /** @private  [实现IListPool接口]*/
    private _indexInList;
    /** @private */
    _indexInCastShadowList: number;
    /** @private */
    protected _bounds: Bounds;
    /** @private */
    protected _boundsChange: boolean;
    /** @private */
    _enable: boolean;
    /** @private */
    _shaderValues: ShaderData;
    /** @private */
    _sharedMaterials: BaseMaterial[];
    /** @private */
    _scene: Scene3D;
    /** @private */
    _owner: RenderableSprite3D;
    /** @private */
    _renderElements: RenderElement[];
    /** @private */
    _distanceForSort: number;
    /**@private */
    _visible: boolean;
    /** @private */
    _octreeNode: BoundsOctreeNode;
    /** @private */
    _indexInOctreeMotionList: number;
    /** @private */
    _updateMark: number;
    /** @private */
    _updateRenderType: number;
    /** @private */
    _isPartOfStaticBatch: boolean;
    /** @private */
    _staticBatch: GeometryElement;
    /**排序矫正值。*/
    sortingFudge: number;
    /**@private	[NATIVE]*/
    _cullingBufferIndex: number;
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
     * @private
     * 创建一个新的 <code>BaseRender</code> 实例。
     */
    constructor(owner: RenderableSprite3D);
    /**
     * @private
     */
    _getOctreeNode(): BoundsOctreeNode;
    /**
     * @private
     */
    _setOctreeNode(value: BoundsOctreeNode): void;
    /**
     * @private
     */
    _getIndexInMotionList(): number;
    /**
     * @private
     */
    _setIndexInMotionList(value: number): void;
    /**
     * @private
     */
    private _changeMaterialReference;
    /**
     * @private
     */
    private _getInstanceMaterial;
    /**
     * @private
     */
    _applyLightMapParams(): void;
    /**
     * @private
     */
    protected _onWorldMatNeedChange(flag: number): void;
    /**
     * @private
     */
    protected _calculateBoundingBox(): void;
    /**
     * @private [实现ISingletonElement接口]
     */
    _getIndexInList(): number;
    /**
     * @private [实现ISingletonElement接口]
     */
    _setIndexInList(index: number): void;
    /**
     * @private
     */
    _setBelongScene(scene: Scene3D): void;
    /**
     * @private
     * @param boundFrustum 如果boundFrustum为空则为摄像机不裁剪模式。
     */
    _needRender(boundFrustum: BoundFrustum): boolean;
    /**
     * @private
     */
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void;
    /**
     * @private
     */
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void;
    /**
     * @private
     */
    _revertBatchRenderUpdate(context: RenderContext3D): void;
    /**
     * @private
     */
    _destroy(): void;
}
