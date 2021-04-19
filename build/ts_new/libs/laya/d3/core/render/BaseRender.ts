//@ts-nocheck
import { RenderElement } from "./RenderElement";
import { RenderContext3D } from "./RenderContext3D";
import { Bounds } from "../Bounds"
import { GeometryElement } from "../GeometryElement"
import { RenderableSprite3D } from "../RenderableSprite3D"
import { Transform3D } from "../Transform3D"
import { Material } from "../material/Material"
import { BoundsOctreeNode } from "../scene/BoundsOctreeNode"
import { IOctreeObject } from "../scene/IOctreeObject"
import { Scene3D } from "../scene/Scene3D"
import { BoundFrustum } from "../../math/BoundFrustum"
import { Vector3 } from "../../math/Vector3"
import { Vector4 } from "../../math/Vector4"
import { ShaderData } from "../../shader/ShaderData"
import { Event } from "../../../events/Event"
import { EventDispatcher } from "../../../events/EventDispatcher"
import { ISingletonElement } from "../../../resource/ISingletonElement"
import { MeshRenderStaticBatchManager } from "../../graphics/MeshRenderStaticBatchManager";
import { Stat } from "../../../utils/Stat";
import { Lightmap } from "../scene/Lightmap";
import { ReflectionProbe, ReflectionProbeMode } from "../reflectionProbe/ReflectionProbe";

/**
 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
 */
export class BaseRender extends EventDispatcher implements ISingletonElement, IOctreeObject {
	/**@internal */
	static _tempBoundBoxCorners: Vector3[] = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];

	/**@internal */
	private static _uniqueIDCounter: number = 0;

	/**@internal */
	static _defaultLightmapScaleOffset: Vector4 = new Vector4(1.0, 1.0, 0.0, 0.0);

	/**@internal */
	private _id: number;
	/** @internal */
	private _lightmapScaleOffset: Vector4 = new Vector4(1, 1, 0, 0);
	/** @internal */
	private _lightmapIndex: number;
	/** @internal */
	private _receiveShadow: boolean;
	/** @internal */
	private _materialsInstance: boolean[];
	/** @internal  [实现IListPool接口]*/
	private _indexInList: number = -1;
	/** @internal */
	_indexInCastShadowList: number = -1;

	/** @internal */
	protected _bounds: Bounds;
	/** @internal */
	protected _boundsChange: boolean = true;


	/** @internal */
	_castShadow: boolean = false;
	/** @internal */
	_supportOctree: boolean = true;
	/** @internal */
	_enable: boolean;
	/** @internal */
	_shaderValues: ShaderData;

	/** @internal */
	_sharedMaterials: Material[] = [];
	/** @internal */
	_scene: Scene3D;
	/** @internal */
	_owner: RenderableSprite3D;
	/** @internal */
	_renderElements: RenderElement[];
	/** @internal */
	_distanceForSort: number;
	/** @internal */
	_renderMark: number = -1;//TODO:初始值为-1强制更新,否则会造成第一帧动画不更新等,待优化
	/** @internal */
	_octreeNode: BoundsOctreeNode;
	/** @internal */
	_indexInOctreeMotionList: number = -1;
	/** @internal 是否需要反射探针*/
	_probReflection:ReflectionProbe;
	/** @internal 材质是否支持反射探针*/
	_surportReflectionProbe:Boolean;
	/** @internal 设置是反射探针模式 off  simple */
	_reflectionMode:number = ReflectionProbeMode.simple;

	/** @internal */
	_updateMark: number = -1;
	/** @internal */
	_updateRenderType: number = -1;
	/** @internal */
	_isPartOfStaticBatch: boolean = false;
	/** @internal */
	_staticBatch: GeometryElement = null;

	/**排序矫正值。*/
	sortingFudge: number;

	/**@internal	[NATIVE]*/
	_cullingBufferIndex: number;

	/**
	 * 获取唯一标识ID,通常用于识别。
	 */
	get id(): number {
		return this._id;
	}

	/**
	 * 光照贴图的索引。
	 */
	get lightmapIndex(): number {
		return this._lightmapIndex;
	}

	set lightmapIndex(value: number) {
		this._lightmapIndex = value;
	}

	/**
	 * 光照贴图的缩放和偏移。
	 */
	get lightmapScaleOffset(): Vector4 {
		return this._lightmapScaleOffset;
	}

	set lightmapScaleOffset(value: Vector4) {
		if (!value)
			throw "BaseRender: lightmapScaleOffset can't be null.";
		this._lightmapScaleOffset = value;
		this._shaderValues.setVector(RenderableSprite3D.LIGHTMAPSCALEOFFSET, value);
	}

	/**
	 * 是否可用。
	 */
	get enable(): boolean {
		return this._enable;
	}

	set enable(value: boolean) {
		this._enable = !!value;
	}

	/**
	 * 返回第一个实例材质,第一次使用会拷贝实例对象。
	 */
	get material(): Material {
		var material: Material = this._sharedMaterials[0];
		if (material && !this._materialsInstance[0]) {
			var insMat: Material = this._getInstanceMaterial(material, 0);
			var renderElement: RenderElement = this._renderElements[0];
			(renderElement) && (renderElement.material = insMat);
		}
		return this._sharedMaterials[0];
	}

	set material(value: Material) {
		this.sharedMaterial = value;
		this._isSupportReflection();
	}

	/**
	 * 潜拷贝实例材质列表,第一次使用会拷贝实例对象。
	 */
	get materials(): Material[] {
		for (var i: number = 0, n: number = this._sharedMaterials.length; i < n; i++) {
			if (!this._materialsInstance[i]) {
				var insMat: Material = this._getInstanceMaterial(this._sharedMaterials[i], i);
				var renderElement: RenderElement = this._renderElements[i];
				(renderElement) && (renderElement.material = insMat);
			}
		}
		return this._sharedMaterials.slice();
	}

	set materials(value: Material[]) {
		this.sharedMaterials = value;
		this._isSupportReflection();
	}

	/**
	 * 返回第一个材质。
	 */
	get sharedMaterial(): Material {
		return this._sharedMaterials[0];
	}

	set sharedMaterial(value: Material) {
		var lastValue: Material = this._sharedMaterials[0];
		if (lastValue !== value) {
			this._sharedMaterials[0] = value;
			this._materialsInstance[0] = false;
			this._changeMaterialReference(lastValue, value);
			var renderElement: RenderElement = this._renderElements[0];
			(renderElement) && (renderElement.material = value);
		}
		this._isSupportReflection();
	}

	/**
	 * 浅拷贝材质列表。
	 */
	get sharedMaterials(): Material[] {
		return this._sharedMaterials.slice();
	}

	set sharedMaterials(value: Material[]) {
		var materialsInstance: boolean[] = this._materialsInstance;
		var sharedMats: Material[] = this._sharedMaterials;

		for (var i: number = 0, n: number = sharedMats.length; i < n; i++) {
			var lastMat: Material = sharedMats[i];
			(lastMat) && (lastMat._removeReference());
		}

		if (value) {
			var count: number = value.length;
			materialsInstance.length = count;
			sharedMats.length = count;
			for (i = 0; i < count; i++) {
				lastMat = sharedMats[i];
				var mat: Material = value[i];
				if (lastMat !== mat) {
					materialsInstance[i] = false;
					var renderElement: RenderElement = this._renderElements[i];
					(renderElement) && (renderElement.material = mat);
				}
				if (mat) {
					mat._addReference();
				}
				sharedMats[i] = mat;
			}
		} else {
			throw new Error("BaseRender: shadredMaterials value can't be null.");
		}
		this._isSupportReflection();
	}

	/**
	 * 包围盒,只读,不允许修改其值。
	 */
	get bounds(): Bounds {
		if (this._boundsChange) {
			this._calculateBoundingBox();
			this._boundsChange = false;
		}
		return this._bounds;
	}

	set receiveShadow(value: boolean) {
		if (this._receiveShadow !== value) {
			this._receiveShadow = value;
			if (value)
				this._shaderValues.addDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
			else
				this._shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
		}
	}

	/**
	 * 是否接收阴影属性
	 */
	get receiveShadow(): boolean {
		return this._receiveShadow;
	}

	/**
	 * 是否产生阴影。
	 */
	get castShadow(): boolean {
		return this._castShadow;
	}

	set castShadow(value: boolean) {
		this._castShadow = value;
	}

	/**
	 * 是否是静态的一部分。
	 */
	get isPartOfStaticBatch(): boolean {
		return this._isPartOfStaticBatch;
	}

	/**
	 * 是否被渲染。
	 */
	get isRender(): boolean {
		return this._renderMark == -1 || this._renderMark == (Stat.loopCount - 1);
	}

	set reflectionMode(value:ReflectionProbeMode){
		this._reflectionMode = value;
	}

	get reflectionMode():ReflectionProbeMode{
		return this._reflectionMode;
	}

	/**
	 * @internal
	 * 创建一个新的 <code>BaseRender</code> 实例。
	 */
	constructor(owner: RenderableSprite3D) {
		super();
		this._id = ++BaseRender._uniqueIDCounter;
		this._indexInCastShadowList = -1;
		this._bounds = new Bounds(Vector3._ZERO, Vector3._ZERO);

		this._renderElements = [];
		this._owner = owner;
		this._enable = true;
		this._materialsInstance = [];
		this._shaderValues = new ShaderData(null);
		this.lightmapIndex = -1;
		this.receiveShadow = false;
		this.sortingFudge = 0.0;
		(owner) && (this._owner.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));//如果为合并BaseRender,owner可能为空
	}

	/**
	 * 
	 */
	_getOctreeNode(): BoundsOctreeNode {//[实现IOctreeObject接口]
		return this._octreeNode;
	}

	/**
	 * 
	 */
	_setOctreeNode(value: BoundsOctreeNode): void {//[实现IOctreeObject接口]
		if(!value){
				(this._indexInOctreeMotionList !== -1) && (this._octreeNode._octree.removeMotionObject(this));
		}
		this._octreeNode = value;
		
	}

	/**
	 * 
	 */
	_getIndexInMotionList(): number {//[实现IOctreeObject接口]
		return this._indexInOctreeMotionList;
	}

	/**
	 *
	 */
	_setIndexInMotionList(value: number): void {//[实现IOctreeObject接口]
		this._indexInOctreeMotionList = value;
	}

	/**
	 * @internal
	 */
	private _changeMaterialReference(lastValue: Material, value: Material): void {
		(lastValue) && (lastValue._removeReference());
		value._addReference();//TODO:value可以为空
	}

	/**
	 * @internal
	 */
	private _getInstanceMaterial(material: Material, index: number): Material {
		var insMat: Material = material.clone();//深拷贝
		insMat.name = insMat.name + "(Instance)";
		this._materialsInstance[index] = true;
		this._changeMaterialReference(this._sharedMaterials[index], insMat);
		this._sharedMaterials[index] = insMat;
		return insMat;
	}

	/**
	 * @internal
	 */
	private _isSupportReflection(){
		this._surportReflectionProbe = false;
		var sharedMats: Material[] = this._sharedMaterials;
		for (var i: number = 0, n: number = sharedMats.length; i < n; i++) {
			var mat: Material = sharedMats[i];
			this._surportReflectionProbe= (this._surportReflectionProbe||(mat&&mat._shader._supportReflectionProbe));//TODO：最后一个判断是否合理
		}
	}

	/**
	 * 渲染器添加到更新反射探针队列
	 * @internal
	 */
	_addReflectionProbeUpdate(){
		//TODO目前暂时不支持混合以及与天空盒模式，只支持simple和off
		if(this._surportReflectionProbe&&this._reflectionMode==1){
			this._scene && this._scene._reflectionProbeManager.addMotionObject(this);
		}
	}

	/**
	 * @internal
	 */
	_applyLightMapParams(): void {
		var lightMaps: Lightmap[] = this._scene.lightmaps;
		var shaderValues: ShaderData = this._shaderValues;
		var lightmapIndex: number = this._lightmapIndex;
		if (lightmapIndex >= 0 && lightmapIndex < lightMaps.length) {
			var lightMap: Lightmap = lightMaps[lightmapIndex];
			shaderValues.setTexture(RenderableSprite3D.LIGHTMAP, lightMap.lightmapColor);
			shaderValues.addDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
			if (lightMap.lightmapDirection) {
				shaderValues.setTexture(RenderableSprite3D.LIGHTMAP_DIRECTION, lightMap.lightmapDirection);
				shaderValues.addDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
			}
			else {
				shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
			}
		} else {
			shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
			shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
		}
	}

	/**
	 * @internal
	 */
	protected _onWorldMatNeedChange(flag: number): void {
		this._boundsChange = true;
		if (this._octreeNode) {
			flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;//过滤有用TRANSFORM标记
			if (flag) {
				if (this._indexInOctreeMotionList === -1)//_octreeNode表示在八叉树队列中
					this._octreeNode._octree.addMotionObject(this);
			}
		}
		this._addReflectionProbeUpdate();
		
	}


	

	/**
	 * @internal
	 */
	protected _calculateBoundingBox(): void {
		throw ("BaseRender: must override it.");
	}

	/**
	 *  [实现ISingletonElement接口]
	 */
	_getIndexInList(): number {
		return this._indexInList;
	}

	/**
	 *  [实现ISingletonElement接口]
	 */
	_setIndexInList(index: number): void {
		this._indexInList = index;
	}

	/**
	 * @internal
	 */
	_setBelongScene(scene: Scene3D): void {
		this._scene = scene;
	}

	/**
	 * @internal
	 * @param boundFrustum 如果boundFrustum为空则为摄像机不裁剪模式。
	 */
	_needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
		return true;
	}

	/**
	 * @internal
	 * 八叉树节点不需要渲染调用的事件 
	 */
	_OctreeNoRender():void{
	}

	/**
	 * @internal
	 */
	_renderUpdate(context: RenderContext3D, transform: Transform3D): void {
	}

	/**
	 * @internal
	 */
	_renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
	}

	/**
	 * @internal
	 */
	_revertBatchRenderUpdate(context: RenderContext3D): void {
	}

	/**
	 * @internal
	 */
	_destroy(): void {
		(this._indexInOctreeMotionList !== -1) && (this._octreeNode._octree.removeMotionObject(this));
		this.offAll();
		var i: number = 0, n: number = 0;
		for (i = 0, n = this._renderElements.length; i < n; i++)
			this._renderElements[i].destroy();
		for (i = 0, n = this._sharedMaterials.length; i < n; i++)
			(this._sharedMaterials[i].destroyed) || (this._sharedMaterials[i]._removeReference());//TODO:材质可能为空
		this._renderElements = null;
		this._owner = null;
		this._sharedMaterials = null;
		this._bounds = null;
		this._lightmapScaleOffset = null;
	}

	/**
	 * 标记为非静态,静态合并后可用于取消静态限制。
	 */
	markAsUnStatic(): void {
		if (this._isPartOfStaticBatch) {
			MeshRenderStaticBatchManager.instance._removeRenderSprite(this._owner);
			this._isPartOfStaticBatch = false;
		}

	}
}

