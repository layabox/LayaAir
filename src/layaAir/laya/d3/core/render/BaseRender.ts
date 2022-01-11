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
import { IRenderNodeObject } from "../scene/SceneRenderManager/IRenderNodeObject";
import { MeshSprite3DShaderDeclaration } from "../../../d3/core/MeshSprite3DShaderDeclaration";
import { TextureCube } from "../../resource/TextureCube";
import { SubUniformBufferData } from "../../graphics/subUniformBufferData";
import { Config3D } from "../../../../Config3D";
import { TransLargeUBOUtils } from "../TransLargeUBOUtils";
import { UniformBufferObject } from "../../graphics/UniformBufferObject";
import { ShaderDataType } from "./command/SetShaderDataCMD";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { UniformBufferParamsType } from "../../graphics/UniformBufferData";
import { LayaGL } from "../../../layagl/LayaGL";

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
	static _transLargeUbO: TransLargeUBOUtils;

	/**
	 * BaseRender Init
	 */
	static __init__() {
		if (Config3D._config._uniformBlock)
			BaseRender.initRenderableLargeUniformBlock();
	}

	/**
	 * init Renderable Block
	 */
	static initRenderableLargeUniformBlock() {
		let uniformpara: Map<string, UniformBufferParamsType> = new Map<string, UniformBufferParamsType>();
		uniformpara.set("u_WorldMat", UniformBufferParamsType.Matrix4x4);
		uniformpara.set("u_LightmapScaleOffset", UniformBufferParamsType.Vector4);
		uniformpara.set("u_ReflectCubeHDRParams", UniformBufferParamsType.Vector4);
		let subUBOData = new SubUniformBufferData(uniformpara, 0);
		//createUBO Buffer
		var gl: WebGLRenderingContext = LayaGL.instance;
		let ubo = UniformBufferObject.creat("SpriteUniformBlock", gl.DYNAMIC_DRAW, subUBOData.getbyteLength(), true);
		//bind manager
		BaseRender._transLargeUbO = new TransLargeUBOUtils(ubo, uniformpara, subUBOData);
	}

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
	protected _bounds: Bounds;

	/** @internal */
	protected _boundsChange: boolean = true;

	/** @internal */
	_indexInCastShadowList: number = -1;

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

	/**@internal */
	_renderElements: RenderElement[];

	/** @internal */
	_distanceForSort: number;

	/** @internal */
	_renderMark: number = -1;//TODO:初始值为-1强制更新,否则会造成第一帧动画不更新等,待优化

	/** @internal */
	_octreeNode: IRenderNodeObject;

	/** @internal */
	_indexInOctreeMotionList: number = -1;

	/** @internal 是否需要反射探针*/
	_probReflection: ReflectionProbe;

	/** @internal 材质是否支持反射探针*/
	_surportReflectionProbe: boolean;

	/** @internal 设置是反射探针模式 off  simple */
	_reflectionMode: number = ReflectionProbeMode.simple;

	/** @internal */
	_sceneUpdateMark: number = -1;

	/** @internal 属于相机的标记*/
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

	/**@internal */
	_transIsChange: boolean = false;

	/**@internal */
	_subUniformBufferData: SubUniformBufferData;

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
		this._setShaderValue(RenderableSprite3D.LIGHTMAPSCALEOFFSET, ShaderDataType.Vector4, value);
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

	/**
	 * 反射模式
	 */
	set reflectionMode(value: ReflectionProbeMode) {
		this._reflectionMode = value;
	}

	get reflectionMode(): ReflectionProbeMode {
		return this._reflectionMode;
	}

	/**
	 * 设置反射球
	 */
	set probReflection(voluemProbe: ReflectionProbe) {
		this._probReflection = voluemProbe;
		//更新反射探针
		if (!this._probReflection)
			return;
		if (this._reflectionMode == ReflectionProbeMode.off) {
			this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
			this._setShaderValue(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS, ShaderDataType.Vector4, ReflectionProbe.defaultTextureHDRDecodeValues);
			this._setShaderValue(RenderableSprite3D.REFLECTIONTEXTURE, ShaderDataType.Texture, TextureCube.blackTexture);
		}
		else {
			if (!this._probReflection.boxProjection) {
				this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);

			}
			else {
				this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
				this._setShaderValue(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION, ShaderDataType.Vector3, this._probReflection.probePosition);
				this._setShaderValue(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX, ShaderDataType.Vector3, this._probReflection.boundsMax);
				this._setShaderValue(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN, ShaderDataType.Vector3, this._probReflection.boundsMin);
			}
			this._setShaderValue(RenderableSprite3D.REFLECTIONTEXTURE, ShaderDataType.Texture, this._probReflection.reflectionTexture);
			this._setShaderValue(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS, ShaderDataType.Vector4, this._probReflection.reflectionHDRParams);
		}
		this._subUniformBufferData && (this._subUniformBufferData._needUpdate = true);
	}

	/**
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
	private _isSupportReflection() {
		this._surportReflectionProbe = false;
		var sharedMats: Material[] = this._sharedMaterials;
		for (var i: number = 0, n: number = sharedMats.length; i < n; i++) {
			var mat: Material = sharedMats[i];
			this._surportReflectionProbe = (this._surportReflectionProbe || (mat && mat._shader._supportReflectionProbe));//TODO：最后一个判断是否合理
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
					this._octreeNode.getManagerNode().addMotionObject(this);
			}
		}
		this._addReflectionProbeUpdate();
		this._transIsChange = true;
		this._subUniformBufferData && (this._subUniformBufferData._needUpdate = true);
	}
	
	/**
	 * @internal
	 */
	protected _calculateBoundingBox(): void {
		throw ("BaseRender: must override it.");
	}

	/**
	 * scene manager Node get
	 */
	 _getOctreeNode(): BoundsOctreeNode {//[实现IOctreeObject接口]
		return this._octreeNode;
	}

	/**
	 * scene manager Node Set
	 */
	_setOctreeNode(value: BoundsOctreeNode): void {//[实现IOctreeObject接口]
		if (!value) {
			(this._indexInOctreeMotionList !== -1) && (this._octreeNode.getManagerNode().removeMotionObject(this));
		}
		this._octreeNode = value;
	}

	/**
	 * motion list id get
	 */
	_getIndexInMotionList(): number {//[实现IOctreeObject接口]
		return this._indexInOctreeMotionList;
	}

	/**
	 * motion list id set
	 */
	_setIndexInMotionList(value: number): void {//[实现IOctreeObject接口]
		this._indexInOctreeMotionList = value;
	}


	/**
	 * @internal
	 */
	_setShaderValue(index: number, shaderDataType: ShaderDataType, value: any) {
		if (this._subUniformBufferData && this._subUniformBufferData._has(index))
			this._subUniformBufferData._setData(index, shaderDataType, value);
		this._shaderValues.setValueData(index, value);
	}

	/**
	 * 渲染器添加到更新反射探针队列
	 * @internal
	 */
	_addReflectionProbeUpdate() {
		//TODO目前暂时不支持混合以及与天空盒模式，只支持simple和off
		if (this._surportReflectionProbe && this._reflectionMode == 1) {
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
		if (Config3D._config._uniformBlock) {
			this._subUniformBufferData = BaseRender._transLargeUbO.create();
			this._subUniformBufferData.setMatrix("u_WorldMat", Matrix4x4.DEFAULT);
			this.probReflection = this._probReflection;
			this.lightmapScaleOffset = this._lightmapScaleOffset;
			this._subUniformBufferData._needUpdate = true;
		}
	}

	/**
	 * @internal
	 */
	_setUnBelongScene() {
		this._scene = null;
		if (Config3D._config._uniformBlock) {
			this._subUniformBufferData && BaseRender._transLargeUbO.recover(this._subUniformBufferData);
			this._subUniformBufferData = null;
		}
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
	_OctreeNoRender(): void {
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
		(this._indexInOctreeMotionList !== -1) && (this._octreeNode.getManagerNode().removeMotionObject(this));
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
		this._scene = null;

		if (this._subUniformBufferData) {
			BaseRender._transLargeUbO.recover(this._subUniformBufferData);
			this._subUniformBufferData = null;
		}
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

