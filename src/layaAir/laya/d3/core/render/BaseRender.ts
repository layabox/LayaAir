import { RenderElement } from "./RenderElement";
import { RenderContext3D } from "./RenderContext3D";
import { RenderableSprite3D } from "../RenderableSprite3D"
import { Transform3D } from "../Transform3D"
import { Material } from "../../../resource/Material";
import { BoundFrustum } from "../../math/BoundFrustum"
import { Event } from "../../../events/Event"
import { Lightmap } from "../scene/Lightmap";
import { MeshSprite3DShaderDeclaration } from "../../../d3/core/MeshSprite3DShaderDeclaration";
import { TextureCube } from "../../../resource/TextureCube";
import { Component } from "../../../components/Component";
import { Sprite3D } from "../Sprite3D";
import { ShaderData, ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { TransLargeUBOUtils } from "../TransLargeUBOUtils";
import { IBaseRenderNode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { SubUniformBufferData } from "../../../RenderEngine/SubUniformBufferData";
import { Stat } from "../../../utils/Stat";
import { Bounds } from "../../math/Bounds";
import { Volume } from "../../component/Volume/Volume";
import { ReflectionProbe, ReflectionProbeMode } from "../../component/Volume/reflectionProbe/ReflectionProbe";
import { Mesh } from "../../resource/models/Mesh";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { NodeFlags } from "../../../Const";
import { Sprite3DRenderDeclaration } from "./Sprite3DRenderDeclaration";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BatchRender } from "../../component/Volume/BatchVolume/BatchRender";
import { IBoundsCell } from "../../math/IBoundsCell";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { LayaGL } from "../../../layagl/LayaGL";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { VolumetricGI } from "../../component/Volume/VolumetricGI/VolumetricGI";

export enum RenderBitFlag {
    RenderBitFlag_CullFlag = 0,
    RenderBitFlag_Batch = 1,
    RenderBitFlag_Editor = 2,
    RenderBitFlag_InstanceBatch = 3,
    RenderBitFlag_VertexMergeBatch = 4,

}

export enum IrradianceMode {
    LightMap,
    VolumetricGI,
    Common
}
/**
 * <code>Render</code> 类用于渲染器的父类，抽象类不允许实例。
 */
export class BaseRender extends Component implements IBoundsCell {
    /** @internal */
    static _meshVerticeDefine: Array<ShaderDefine> = [];

    /**@internal */
    private static _uniqueIDCounter: number = 0;

    /**@internal */
    static _tempBoundBoxCorners: Vector3[] = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];

    /**@internal */
    static _defaultLightmapScaleOffset: Vector4 = new Vector4(1.0, 1.0, 0.0, 0.0);

    /**@internal */
    static _transLargeUbO: TransLargeUBOUtils;

    /**
     * BaseRender Init
     */
    static __init__() {
        BaseRender.shaderValueInit();
        // if (Config3D._config._uniformBlock)
        // 	BaseRender.initRenderableLargeUniformBlock();
    }
    /**
      * @internal
      * @param mesh 
      * @param out 
      */
    static getMeshDefine(mesh: Mesh, out: Array<ShaderDefine>): number {
        out.length = 0;
        var define: number;
        for (var i: number = 0, n: number = mesh._subMeshes.length; i < n; i++) {
            var subMesh = mesh.getSubMesh(i);
            var vertexElements: any[] = subMesh._vertexBuffer._vertexDeclaration._vertexElements;
            for (var j: number = 0, m: number = vertexElements.length; j < m; j++) {
                var vertexElement = vertexElements[j];
                var name: number = vertexElement._elementUsage;
                switch (name) {
                    case VertexMesh.MESH_COLOR0:
                        out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
                        break
                    case VertexMesh.MESH_TEXTURECOORDINATE0:
                        out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
                        break;
                    case VertexMesh.MESH_TEXTURECOORDINATE1:
                        out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
                        break;
                    case VertexMesh.MESH_TANGENT0:
                        out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_TANGENT);
                        break;
                }
            }
        }
        return define;
    }

    /**
     * 更改顶点宏定义
     * @param oldMesh 旧Mesh 
     * @param mesh 新Mesh
     * @param defineDatas 数据  
     */
    static changeVertexDefine(oldMesh: Mesh, mesh: Mesh, defineDatas: ShaderData) {

        var lastValue: Mesh = oldMesh;
        if (lastValue) {
            BaseRender.getMeshDefine(lastValue, BaseRender._meshVerticeDefine);
            for (var i: number = 0, n: number = BaseRender._meshVerticeDefine.length; i < n; i++)
                defineDatas.removeDefine(BaseRender._meshVerticeDefine[i]);
        }
        if (mesh) {
            BaseRender.getMeshDefine(mesh, BaseRender._meshVerticeDefine);
            for (var i: number = 0, n: number = BaseRender._meshVerticeDefine.length; i < n; i++)
                defineDatas.addDefine(BaseRender._meshVerticeDefine[i]);
        }
    }

    /**
     * 宏定义初始化
     */
    static shaderValueInit() {
        Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL = Shader3D.getDefineByName("GI_LEGACYIBL");
        Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL = Shader3D.getDefineByName("GI_IBL");
        Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD = Shader3D.getDefineByName("IBL_RGBD");
        Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION = Shader3D.getDefineByName("SPECCUBE_BOX_PROJECTION");

        Sprite3DRenderDeclaration.SHADERDEFINE_VOLUMETRICGI = Shader3D.getDefineByName("VOLUMETRICGI");
    }

    /** @internal */
    private _lightmapScaleOffset: Vector4 = new Vector4(1, 1, 0, 0);
    /** @internal */
    private _lightmapIndex: number;
    /** @internal */
    private _materialsInstance: boolean[];
    /**@internal */
    _commonUniformMap: Array<string> = [];
    /** @internal */
    _sharedMaterials: Material[] = [];
    /** @internal TODO*/
    _supportOctree: boolean = true;
    /** @internal TODO*/
    _scene: any;//Scene3D
    /** @internal */
    _sceneUpdateMark: number = -1;
    /** @internal 属于相机的标记*/
    _updateMark: number = -1;
    /** @internal 是否需要反射探针*/
    _probReflection: ReflectionProbe;
    /**@internal 属于更新反射探针的标志 */
    _probeReflectionUpdateMark: number = -1;
    /**@internal 是否需要lightProbe*/
    _lightProb: VolumetricGI;
    /**@internal */
    _lightProbUpdateMark: number = -1;
    /** @internal 材质是否支持反射探针*/
    _surportReflectionProbe: boolean = false;
    /**@internal */
    _surportVolumetricGI: boolean = false;
    /** @internal 设置是反射探针模式 off  simple */
    _reflectionMode: number = ReflectionProbeMode.simple;
    /**@internal */
    _irradientMode: IrradianceMode;
    /** @internal */
    _shaderValues: ShaderData;
    /**@internal */
    _renderElements: RenderElement[];
    /** @internal */
    _updateRenderType: number = -1;
    /**排序矫正值。*/
    sortingFudge: number;
    /**@internal */
    _subUniformBufferData: SubUniformBufferData;
    /**@internal motion list index，not motion is -1*/
    _motionIndexList: number = -1;
    /**@internal 是否自定义了needRender*/
    _customCull: boolean;
    /**@internal 可以根据不同的值来设置*/
    _ratioIgnor: number = 0.005;//TODO
    /**@internal TODO*/
    _LOD: number = -1;
    /**@internal TODO*/
    _batchRender: BatchRender;

    /**@internal */
    protected _lightmapDirtyFlag: number = -1;
    /**@internal 如果这个值不是0,说明有一些条件使他不能加入渲染队列，例如如果是1，证明此节点被lod淘汰*/
    private _volume: Volume;
    /**@internal */
    protected _worldParams: Vector4;//x:invertFaceFront  yzw?
    /**
     * DistanceVolumCull
     * 根据距离和包围盒进行裁剪，越大越容易被裁
     */
    set ratioIgnor(value: number) {
        this._ratioIgnor = value;
    }

    get ratioIgnor(): number {
        return this._ratioIgnor;
    }

    /**
     * 获取渲染节点的渲染禁用位
     */
    get renderbitFlag() {
        return this._rendernode.renderbitFlag;
    }

    /**
     * 包围盒是否更新
     */
    set boundsChange(value: boolean) {
        this._rendernode.boundsChange = value
    }

    get boundsChange(): boolean {
        return this._rendernode.boundsChange;
    }

    /**
     * @internal
     */
    shadowCullPass(): boolean {
        return this.castShadow && this._enabled && (this.renderbitFlag == 0);
    }

    /**@internal */
    protected _rendernode: IBaseRenderNode;

    /** @internal */
    protected _bounds: Bounds;

    /** @internal */
    protected _baseGeometryBounds: Bounds;

    /**@internal */
    protected _transform: Transform3D;

    /**@internal */
    _distanceForSort: number;

    /**@internal */
    _receiveShadow: boolean;

    /**
     * 获取渲染节点
     */
    get renderNode(): IBaseRenderNode {
        return this._rendernode;
    }

    /**
     * 排序距离
     */
    set distanceForSort(value: number) {
        this._distanceForSort = value;
        this._rendernode.distanceForSort = value;
    }

    get distanceForSort() {
        return this._distanceForSort;
    }

    /**
     * 设置GeometryBounds，
     * 如果设置了此bounds，渲染包围盒会根据geometryBounds和transform来更新，native层会下沉
     * @internal
     */
    set geometryBounds(value: Bounds) {
        this._baseGeometryBounds = this._rendernode.geometryBounds = value;
    }

    get geometryBounds(): Bounds {
        return this._baseGeometryBounds;
    }
    /**
     * 获取唯一标识ID,通常用于识别。
     */
    get id(): number {
        return this._rendernode.renderId;
    }

    /**
     * 光照贴图的索引。
     */
    get lightmapIndex(): number {
        return this._lightmapIndex;
    }

    set lightmapIndex(value: number) {
        this._lightmapDirtyFlag = -1;
        this._lightmapIndex = value;
        this._scene && this._applyLightMapParams();
        this._getIrradientMode();
    }

    /**
     * 光照功能查询
     */
    get irradientMode() {
        return this._irradientMode;
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
        this._isSupportRenderFeature();
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
        this._isSupportRenderFeature();
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
        this._isSupportRenderFeature();
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
        this._isSupportRenderFeature();
    }

    /**
     * 包围盒,只读,不允许修改其值。
     */
    get bounds(): Bounds {
        if (this.boundsChange) {
            this._calculateBoundingBox();
            this.boundsChange = false;
        }
        return this._bounds as Bounds;
    }

    set receiveShadow(value: boolean) {
        if (this.renderNode.receiveShadow !== value) {
            this.renderNode.receiveShadow = value;
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
        return this.renderNode.receiveShadow;
    }

    /**
     * 是否产生阴影。
     */
    get castShadow(): boolean {
        return this.renderNode.castShadow;
    }

    set castShadow(value: boolean) {
        this.renderNode.castShadow = value;
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
     * 体积光探针
     */
    set volume(value: Volume) {
        if (!value) {//value = null,
            if (this._volume) {
                this._volume._removeRenderNode && this._volume._removeRenderNode(this);
                this._volume = null;
            }
            return;
        }
        if (this._volume != value) {
            value._addRenderNode && value._addRenderNode(this);
            this._volume = value;
            return;
        } else {
            value._motionInVolume && value._motionInVolume(this);
        }
    }

    get volume(): Volume {
        return this._volume;
    }

    /**
     * @internal
     * 设置反射球
     */
    set probReflection(voluemProbe: ReflectionProbe) {
        if (this._probReflection == voluemProbe)
            return;
        this._probeReflectionUpdateMark = -1;
        this._probReflection = voluemProbe;
        if (this._reflectionMode == ReflectionProbeMode.off) {
            this._shaderValues.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
            this._shaderValues.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL);
            this._setShaderValue(RenderableSprite3D.IBLTEX, ShaderDataType.TextureCube, TextureCube.blackTexture);
            this._setShaderValue(RenderableSprite3D.IBLROUGHNESSLEVEL, ShaderDataType.Float, 0);
        } else {
            this._probReflection.applyReflectionShaderData(this._shaderValues);
        }
        this._getIrradientMode();
    }

    /**
     * 设置全局体积光探针
     */
    set lightProb(volumetricGI: VolumetricGI) {
        if (this._lightProb == volumetricGI) {
            return;
        }
        this._lightProbUpdateMark = -1;
        this._lightProb = volumetricGI;
        if (this.lightmapIndex < 0) {
            this._lightProb && this._lightProb.applyVolumetricGI(this._shaderValues)
        };
        this._getIrradientMode();
    }



    /**
     * 创建一个新的 <code>BaseRender</code> 实例。
     */
    constructor() {
        super();
        this._commonUniformMap = this._getcommonUniformMap();
        this._rendernode = this._createBaseRenderNode();
        this._rendernode.owner = this;
        this._rendernode.renderId = ++BaseRender._uniqueIDCounter;
        this._bounds = this._rendernode.bounds = new Bounds(Vector3.ZERO, Vector3.ZERO);
        this._renderElements = [];
        this._enabled = true;
        this._materialsInstance = [];
        this._shaderValues = LayaGL.renderOBJCreate.createShaderData(null);
        this.lightmapIndex = -1;
        this.receiveShadow = false;
        this.sortingFudge = 0.0;
        this._customCull = this._needRender !== BaseRender.prototype._needRender;
        this.runInEditor = true;
        this.boundsChange = true;
        this._rendernode.renderbitFlag = 0;
        this._rendernode.staticMask = 1;
        this._worldParams = new Vector4(1.0, 0.0, 0.0, 0.0);
    }

    private _getIrradientMode() {
        if (this.lightmapIndex >= 0) {
            this._irradientMode = IrradianceMode.LightMap;
        } else if (this.lightProb) {
            this._irradientMode = IrradianceMode.VolumetricGI;
        } else {

        }
    }

    /**
     * @internal
     * @protected
     * @returns 
     */
    protected _getcommonUniformMap(): Array<string> {
        return ["Sprite3D"];
    }

    /**
     * @internal
     * @protected
     * @returns 
     */
    protected _createBaseRenderNode(): IBaseRenderNode {
        return Laya3DRender.renderOBJCreate.createBaseRenderNode();
    }

    private _changeLayer(layer: number) {
        this._rendernode.layer = layer;
    }

    private _changeStaticMask(staticmask: number) {
        this._rendernode.staticMask = staticmask;
    }

    /**
     * @internal
     * @protected
     */
    protected _onAdded(): void {
        this._transform = (this.owner as Sprite3D).transform;
        (this.owner as Sprite3D)._isRenderNode++;
        this.setRenderbitFlag(RenderBitFlag.RenderBitFlag_Editor, this.owner._getBit(NodeFlags.HIDE_BY_EDITOR));
        this._rendernode.transform = this._transform;
        this._changeLayer((this.owner as Sprite3D).layer);
        this._changeStaticMask((this.owner as Sprite3D)._isStatic);
    }

    /**
     * @internal
     * @protected
     */
    protected _onEnable(): void {
        super._onEnable();
        if (this.owner) {
            (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);//如果为合并BaseRender,owner可能为空
            (this.owner as Sprite3D).on(Event.LAYERCHANGE, this, this._changeLayer);
            (this.owner as Sprite3D).on(Event.staticMask, this, this._changeStaticMask);
            this._changeLayer((this.owner as Sprite3D).layer);
            this._changeStaticMask((this.owner as Sprite3D)._isStatic);
        }
        this.owner.scene._addRenderObject(this);
        this._setBelongScene(this.owner.scene);
    }

    /**
     * @internal
     * @protected
     */
    protected _onDisable(): void {
        if (this.owner) {
            (this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);//如果为合并BaseRender,owner可能为空
            (this.owner as Sprite3D).off(Event.LAYERCHANGE, this, this._changeLayer);
            (this.owner as Sprite3D).off(Event.staticMask, this, this._changeStaticMask);
        }
        this.owner.scene._removeRenderObject(this);
        this._setUnBelongScene();
        this.volume = null;
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
    private _isSupportRenderFeature() {
        //surportReflectionProbe
        let preReflection = this._surportReflectionProbe;
        let prelightprob = this._surportVolumetricGI;
        this._surportReflectionProbe = false;
        this._surportVolumetricGI = false;
        var sharedMats: Material[] = this._sharedMaterials;
        for (var i: number = 0, n: number = sharedMats.length; i < n; i++) {
            var mat: Material = sharedMats[i];
            this._surportReflectionProbe ||= (this._surportReflectionProbe || (mat && mat._shader._supportReflectionProbe));//TODO：最后一个判断是否合理
            this._surportVolumetricGI ||= (this._surportVolumetricGI || (mat && mat._shader._surportVolumetricGI));
        }
        if ((!preReflection && this._surportReflectionProbe) || (!prelightprob && this._surportVolumetricGI))//如果变成支持Reflection
            this._addReflectionProbeUpdate();
    }

    /**
     * @internal
     * BaseRender motion
     */
    protected _onWorldMatNeedChange(flag: number): void {
        this.boundsChange = true;
        this._addReflectionProbeUpdate();
        this._subUniformBufferData && (this._subUniformBufferData._needUpdate = true);
        this._batchRender && this._batchRender._updateOneRender(this);
    }

    /**
     * @internal
     */
    protected _calculateBoundingBox(): void {
        throw ("BaseRender: must override it.");
    }


    /**
     * 设置渲染flag,每一位都代表不同的淘汰原因，1表示lod淘汰
     */
    setRenderbitFlag(flag: number, pass: boolean) {
        if (pass)
            this._rendernode.renderbitFlag |= (1 << flag);
        else
            this._rendernode.renderbitFlag &= ~(1 << flag);
    }

    /**
     * @internal
     */
    _setShaderValue(index: number, shaderdataType: ShaderDataType, value: any) {
        this._shaderValues.setShaderData(index, shaderdataType, value);
    }

    /**
     * 渲染器添加到更新反射探针队列
     * @internal
     */
    _addReflectionProbeUpdate() {
        //TODO目前暂时不支持混合以及与天空盒模式，只支持simple和off
        this._scene && this._scene._volumeManager.addMotionObject(this);
    }

    /**
     * @internal
     * 全局贴图
     */
    _applyLightMapParams(): void {
        if (!this._scene) return;
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
     * apply lightProb
     * @returns 
     */
    _applyLightProb() {
        if (this.lightmapIndex >= 0 || !this._lightProb) return;
        if (this._lightProb._updateMark != this._lightProbUpdateMark) {
            this._lightProbUpdateMark = this._lightProb._updateMark;
            this._lightProb.applyVolumetricGI(this._shaderValues);
        }
    }

    /**
     * @internal
     * apply reflection
     * @returns 
     */
    _applyReflection() {
        if (!this._probReflection) return;
        if (this._probReflection._updateMark != this._probeReflectionUpdateMark) {
            this._probeReflectionUpdateMark = this._probReflection._updateMark;
            this._probReflection.applyReflectionShaderData(this._shaderValues);
        }
    }

    /**
     * @internal
     */
    _setBelongScene(scene: any): void {
        this._scene = scene;
        this._onWorldMatNeedChange(1);
        this._isSupportRenderFeature();
        this._batchRender && this._batchRender._batchOneRender(this);
        this.lightmapIndex = this.lightmapIndex;
        Stat.renderNode++;
        if (false) {
            this._subUniformBufferData = BaseRender._transLargeUbO.create();
            this._subUniformBufferData.setMatrix("u_WorldMat", Matrix4x4.DEFAULT);
            this._addReflectionProbeUpdate();
            this.probReflection = this._probReflection;
            this.lightmapScaleOffset = this._lightmapScaleOffset;
            this._subUniformBufferData._needUpdate = true;
        }
    }

    /**
     * @internal
     */
    _setUnBelongScene() {
        Stat.renderNode--;
        this._scene._volumeManager.removeMotionObject(this);
        let batch = this._batchRender;
        this._batchRender && this._batchRender._removeOneRender(this);
        this._batchRender = batch;
        if (false) {
            this._subUniformBufferData && BaseRender._transLargeUbO.recover(this._subUniformBufferData);
            this._subUniformBufferData = null;
        }
        this._scene = null;
    }

    /**
     * @internal
     * @param boundFrustum 裁剪。
     */
    _needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
        if (boundFrustum)
            return boundFrustum.intersects(this.bounds);
        else
            return true;
    }

    /**
     * @internal
     * 裁剪失败后，如果需要可以调用此函数更新数据
     */
    _CullOut(): void {
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
     * @protected
     */
    protected _onDestroy() {
        if (this.owner as Sprite3D)
            (this.owner as Sprite3D)._isRenderNode--;
        (this._motionIndexList !== -1) && (this._scene._sceneRenderManager.removeMotionObject(this));
        (this._scene) && this._scene.sceneRenderableManager.removeRenderObject(this);
        var i: number = 0, n: number = 0;
        for (i = 0, n = this._renderElements.length; i < n; i++)
            this._renderElements[i].destroy();
        for (i = 0, n = this._sharedMaterials.length; i < n; i++) {
            let m = this._sharedMaterials[i];
            m && !m.destroyed && m._removeReference();
        }
        this._renderElements = null;
        this._sharedMaterials = null;
        this._bounds = null;
        this._lightmapScaleOffset = null;
        this._lightmapIndex = -1;
        this._scene = null;
        this._rendernode = null;
        this._shaderValues.destroy();
        this._shaderValues = null;
        this._transform = null;
        this._batchRender = null;
        if (this._subUniformBufferData) {
            BaseRender._transLargeUbO.recover(this._subUniformBufferData);
            this._subUniformBufferData = null;
        }
    }

    /**
     * @internal
     * @override
     * @param dest 
     */
    _cloneTo(dest: Component): void {
        super._cloneTo(dest);
        let render = (dest as BaseRender);
        render.receiveShadow = this.receiveShadow;
        render.sharedMaterials = this.sharedMaterials;
        render.reflectionMode = this.reflectionMode;
        render.castShadow = this.castShadow;
        render.sortingFudge = this.sortingFudge;
    }
}

