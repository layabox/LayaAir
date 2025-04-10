import { RenderContext3D } from "./RenderContext3D";
import { RenderableSprite3D } from "../RenderableSprite3D"
import { Material } from "../../../resource/Material";
import { BoundFrustum } from "../../math/BoundFrustum"
import { Event } from "../../../events/Event"
import { MeshSprite3DShaderDeclaration } from "../../../d3/core/MeshSprite3DShaderDeclaration";
import { Component } from "../../../components/Component";
import { Sprite3D } from "../Sprite3D";
import { Bounds } from "../../math/Bounds";
import { Volume } from "../../component/Volume/Volume";
import { ReflectionProbe, ReflectionProbeMode } from "../../component/Volume/reflectionProbe/ReflectionProbe";
import { Mesh } from "../../resource/models/Mesh";
import { NodeFlags } from "../../../Const";
import { Sprite3DRenderDeclaration } from "./Sprite3DRenderDeclaration";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BatchRender } from "../../component/Volume/BatchVolume/BatchRender";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { VolumetricGI } from "../../component/Volume/VolumetricGI/VolumetricGI";
import { Stat } from "../../../utils/Stat";
import { Scene3D } from "../scene/Scene3D";
import { RenderElement } from "./RenderElement";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ENodeCustomData, IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { IRenderContext3D, IRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Transform3D } from "../Transform3D";

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
 * @en The `BaseRender` class is the parent class for renderers and is an abstract class that should not be instantiated.
 * @zh `BaseRender` 类是渲染器的父类，是一个抽象类，不允许实例化。
 */
export class BaseRender extends Component {

    /** @internal */
    static _meshVerticeDefine: Array<ShaderDefine> = [];
    private static _uniqueIDCounter: number = 0;

    /**@internal */
    static _tempBoundBoxCorners: Vector3[] = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];

    /**@internal */
    static _defaultLightmapScaleOffset: Vector4 = new Vector4(1.0, 1.0, 0.0, 0.0);

    /**
     * @en Initialize the BaseRender class.
     * @zh 初始化 BaseRender 类。
     */
    static __init__() {
        BaseRender.shaderValueInit();
    }

    /**
     * @internal
     * @en Get mesh definitions and store them in the output array.
     * @param mesh The input mesh.
     * @param out The output array to store shader definitions.
     * @zh 获取网格定义并存储在输出数组中。
     * @param mesh 输入网格。
     * @param out 输出数组用于存储着色器定义。
     */
    static getMeshDefine(mesh: Mesh, out: Array<ShaderDefine>): number {
        out.length = 0;
        var define: number;
        for (var i: number = 0, n: number = mesh._subMeshes.length; i < n; i++) {
            var subMesh = mesh.getSubMesh(i);
            var vertexElements: any[] = subMesh._vertexBuffer.vertexDeclaration._vertexElements;
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
     * @en Change vertex shader definitions based on mesh changes.
     * @param oldMesh The old mesh.
     * @param mesh The new mesh.
     * @param defineDatas The shader data containing definitions.
     * @zh 根据网格变化更改顶点着色器宏定义。
     * @param oldMesh 旧的网格。
     * @param mesh 新的网格。
     * @param defineDatas 包含着色器定义的着色器数据。  
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
     * @en Macro definition initialization
     * @zh 宏定义初始化
     */
    static shaderValueInit() {
        Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL = Shader3D.getDefineByName("GI_LEGACYIBL");
        Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD = Shader3D.getDefineByName("IBL_RGBD");
        Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION = Shader3D.getDefineByName("SPECCUBE_BOX_PROJECTION");
    }

    /**@internal renderData*/
    _baseRenderNode: IBaseRenderNode;

    /** @internal */
    _sharedMaterials: Material[] = [];

    /** @internal */
    _scene: any;//Scene3D

    /** @internal */
    _sceneUpdateMark: number = -1;

    /** @internal 属于相机的标记*/
    _updateMark: number = -1;

    /** @internal 是否需要反射探针*/
    _probReflection: ReflectionProbe;

    /** @internal 材质是否支持反射探针*/
    _surportReflectionProbe: boolean = false;

    /** @internal */
    _lightProb: VolumetricGI;

    /**@internal */
    _surportVolumetricGI: boolean = false;

    /**@internal motion list index，not motion is -1*/
    _motionIndexList: number = -1;

    /**@internal TODO*/
    _LOD: number = -1;

    /**@internal TODO*/
    _batchRender: BatchRender;

    /**@interface */
    _receiveShadow: boolean;

    /**@internal */
    _inRenderList: boolean;
    protected _bounds: Bounds;
    protected _transform: Transform3D;

    /** 如果这个值不是0,说明有一些条件使他不能加入渲染队列，例如如果是1，证明此节点被lod淘汰*/
    private _volume: Volume;

    protected _asynNative: boolean;

    private _materialsInstance: boolean[];

    private _renderid: number;

    private _lightmapScaleOffset: Vector4 = new Vector4();

    _renderElements: RenderElement[] = [];

    declare owner: Sprite3D;

    /**
     * @en Whether to enable the renderer.
     * @zh 是否启用。
     */
    get enabled(): boolean {
        return super.enabled;
    }
    set enabled(value: boolean) {
        super.enabled = value;
        this._baseRenderNode.enable = value;
    }

    /**
     * @en The sorting fudge value.
     * @zh 排序矫正值。
     */
    get sortingFudge() {
        return this._baseRenderNode.sortingFudge;
    }
    set sortingFudge(value: number) {
        this._baseRenderNode.sortingFudge = value;
    }

    /**
     * @en The render bit flag of the render node.
     * @zh 渲染节点的渲染禁用位。
     */
    get renderbitFlag() {
        return this._baseRenderNode.renderbitFlag;
    }

    /**
     * @en Whether the bounds have changed.
     * @zh 包围盒是否更新。
     */
    get boundsChange(): boolean {
        return this._baseRenderNode.boundsChange;
    }
    set boundsChange(value: boolean) {
        this._baseRenderNode.boundsChange = value
    }


    /**
     * @en The render node.
     * @zh 渲染节点。
     */
    get renderNode(): IBaseRenderNode {
        return this._baseRenderNode;
    }

    /**
     * @en The distance used for sorting.
     * @zh 排序距离。
     */
    get distanceForSort() {
        return this._baseRenderNode.distanceForSort;
    }
    set distanceForSort(value: number) {
        this._baseRenderNode.distanceForSort = value;
    }

    /**
     * @en The Geometry Bounds.
     * If this bounds is set, the render bounding box will be updated based on geometryBounds and transform, and the native layer will be sunk.
     * @zh 几何包围盒，
     * 如果设置了此包围盒，渲染包围盒会根据 geometryBounds 和变换来更新，并且原生层会下沉。
     */
    get geometryBounds(): Bounds {
        return this._baseRenderNode.baseGeometryBounds;
    }
    set geometryBounds(value: Bounds) {
        this._baseRenderNode.baseGeometryBounds = value;
    }

    /**
     * @en The lightmap index.
     * @zh 光照贴图的索引。
     */
    get lightmapIndex(): number {
        return this._baseRenderNode.lightmapIndex;
    }

    set lightmapIndex(value: number) {
        this._baseRenderNode.lightmapIndex = value;
    }

    /**
     * @internal
     * @en Sets the lightmap index.
     * @param value The new lightmap index.
     * @zh 设置光照贴图的索引。
     * @param value 新的光照贴图索引。
     */
    setLightmapIndex(value: number) {
        let scene = <Scene3D>this._scene;
        if (value != -1 && (scene.lightmaps[value])) {
            this._baseRenderNode.lightmap = scene.lightmaps[value]._dataModule;
        }
        else {
            this._baseRenderNode.lightmap = null;
        }
        //this._scene && this._applyLightMapParams(); todo miner
        this._getIrradientMode();
    }

    /**
     * @en The irradient mode.
     * @zh 间接光照功能。
     */
    get irradientMode() {
        return this._baseRenderNode.irradientMode;
    }

    /**
     * @en The lightmap scale and offset.
     * @zh 光照贴图的缩放和偏移。
     */
    get lightmapScaleOffset(): Vector4 {
        return this._lightmapScaleOffset;
    }

    set lightmapScaleOffset(value: Vector4) {
        value.cloneTo(this._lightmapScaleOffset);
        this._baseRenderNode.setLightmapScaleOffset(this._lightmapScaleOffset);
    }

    /**
     * @en The first material.
     * @zh 第一个材质。
     */
    get sharedMaterial(): Material {
        return this._sharedMaterials[0];
    }

    set sharedMaterial(value: Material) {
        var lastValue = this._sharedMaterials[0];
        this._changeMaterialReference(lastValue, value);
        this._sharedMaterials[0] = value;

        let element = this._renderElements[0];
        if (element && element.material != value) {
            this._materialsInstance[0] = false;
            element.material = value;
        }

        this._isSupportRenderFeature();
    }

    /**
     * @en All shared materials.
     * @zh 所有渲染材质。
     */
    get sharedMaterials(): Material[] {
        return this._sharedMaterials.slice();
    }

    set sharedMaterials(value: Material[]) {
        var materialsInstance: boolean[] = this._materialsInstance;
        var sharedMats: Material[] = this._sharedMaterials;

        if (value) {
            let count = value.length;
            for (let i = 0; i < count; i++) {
                let mat = value[i];
                let lastMat = sharedMats[i];
                this._changeMaterialReference(lastMat, mat);
                sharedMats[i] = mat;

                let element = this._renderElements[i];
                if (element && element.material != mat) {
                    materialsInstance[i] = false;
                    element.material = mat;
                }
            }

            for (let i = count, n = sharedMats.length; i < n; i++) {
                let mat = sharedMats[i];
                mat && mat._removeReference();

                let element = this._renderElements[i];
                element && (element.material = null);
            }

            materialsInstance.length = count;
            sharedMats.length = count;
        }
        else {
            for (let i = 0, n = sharedMats.length; i < n; i++) {
                let lastMat = sharedMats[i];
                lastMat && lastMat._removeReference();
            }

            this._sharedMaterials = [];
        }
        this._isSupportRenderFeature();
    }

    /**
     * @en The bounds. Read-only, do not modify its value.
     * @zh 包围盒。只读，不允许修改其值。
     */
    get bounds(): Bounds {
        return this._baseRenderNode.bounds;
    }

    /**
     * @en Whether the object receives shadows.
     * @zh 是否接收阴影属性。
     */
    get receiveShadow(): boolean {
        return this._receiveShadow;
    }

    set receiveShadow(value: boolean) {
        if (this._receiveShadow !== value) {
            this._receiveShadow = value;
            if (value)
                this._baseRenderNode.shaderData.addDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
            else
                this._baseRenderNode.shaderData.removeDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
        }
        this._baseRenderNode.receiveShadow = value;
    }

    /**
     * @en Whether the object casts shadows.
     * @zh 是否产生阴影。
     */
    get castShadow(): boolean {
        return this._baseRenderNode.castShadow;
    }

    set castShadow(value: boolean) {
        this._baseRenderNode.castShadow = value;
    }

    /**
     * @en The reflection mode.
     * @zh 反射模式。
     */
    get reflectionMode(): ReflectionProbeMode {
        return this._baseRenderNode.reflectionMode;
    }

    set reflectionMode(value: ReflectionProbeMode) {
        this._baseRenderNode.reflectionMode = value;
    }

    /**
     * @en The volume light probe.
     * @zh 体积光探针。
     */
    get volume(): Volume {
        return this._volume;
    }

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

    /**
     * @internal
     * @en The reflection probe.
     * @zh 反射探针。
     */
    get probReflection() {
        return this._probReflection;
    }

    set probReflection(value: ReflectionProbe) {
        if (this._probReflection == value)
            return;
        this._probReflection = value;

        const ReflectionProbeBlockName = ReflectionProbe.BlockName;
        if (value) {
            this._baseRenderNode.probeReflection = value._dataModule;

            this._baseRenderNode.additionShaderData.set(ReflectionProbeBlockName, value.shaderData);
        }
        else {
            this._baseRenderNode.probeReflection = null;

            this._baseRenderNode.additionShaderData.delete(ReflectionProbeBlockName);
        }
        this._baseRenderNode.additionShaderData = this._baseRenderNode.additionShaderData;

        this._getIrradientMode();
    }

    /**
     * @en The light probe.
     * @zh 光照探针。
     */
    get lightProbe(): VolumetricGI {
        return this._lightProb;
    }

    set lightProbe(volumetricGI: VolumetricGI) {
        if (this._lightProb == volumetricGI) {
            return;
        }
        this._baseRenderNode.lightProbUpdateMark = -1;
        this._lightProb = volumetricGI;

        const VolumeGIBlockName = VolumetricGI.BlockName;
        if (volumetricGI) {
            this._baseRenderNode.volumetricGI = volumetricGI._dataModule;
            this._baseRenderNode.additionShaderData.set(VolumeGIBlockName, volumetricGI.shaderData);
        }
        else {
            this._baseRenderNode.volumetricGI = null;
            this._baseRenderNode.additionShaderData.delete(VolumeGIBlockName);
        }

        this._baseRenderNode.additionShaderData = this._baseRenderNode.additionShaderData;

        this._getIrradientMode();
    }


    /**
     * 设置自定义的渲染数据
     * @param dataSlot 
     * @param data 
     */
    setNodeCustomData(dataSlot: ENodeCustomData, data: number) {
        this.renderNode.setNodeCustomData(dataSlot, data);
    }

    /**
     * @ignore
     * @en consructor of BaseRender.
     * @zh 构造函数，初始化BaseRender。
     */
    constructor() {
        super();
        this._baseRenderNode = this._createBaseRenderNode();
        this._baseRenderNode.setCommonUniformMap(this._getcommonUniformMap());
        this._baseRenderNode.shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
        //this._rendernode.owner = this;
        this._renderid = ++BaseRender._uniqueIDCounter;
        this._baseRenderNode.bounds = this._bounds = new Bounds(Vector3.ZERO, Vector3.ZERO);
        this._enabled = true;
        this._baseRenderNode.enable = true;
        this._materialsInstance = [];
        this.lightmapIndex = -1;
        this.receiveShadow = false;
        this._baseRenderNode.sortingFudge = 0.0;
        this.reflectionMode = ReflectionProbeMode.simple;
        if (!!this._calculateBoundingBox) {
            this._baseRenderNode.set_caculateBoundingBox(this, this._calculateBoundingBox);
        }
        if (!!this._renderUpdate) {
            this._baseRenderNode.set_renderUpdatePreCall(this, this._renderUpdate);
        }
        this.runInEditor = true;
        this._asynNative = true;
        this.boundsChange = true;
        this._baseRenderNode.renderbitFlag = 0;
        this._baseRenderNode.staticMask = 1;

        this.castShadow = false;
        this._baseRenderNode.renderNodeType = 0;
    }

    /**
     * @en The function called by the bounding box calculation for each frame.
     * @zh 每一帧计算包围盒会调用的函数
     */
    _calculateBoundingBox?(): void;

    /**
     * @en Update the calling function of SpriteShaderData before rendering each frame.
     * @param context3D The 3D rendering context.
     * @zh 每一帧渲染前更新SpriteShaderData的调用函数。
     * @param context3D 3D渲染上下文。
     */
    _renderUpdate?(context3D: IRenderContext3D): void;

    /**
     * set BaseRenderElement
     */
    protected _setRenderElements() {
        let arrayElement: IRenderElement3D[] = [];
        if (this._renderElements.length == 0 && this._inRenderList) {
            this.owner?.scene._removeRenderObject(this);
        }
        if (this.owner?.activeInHierarchy && this.enabled && this.owner?.scene && this._renderElements.length > 0 && !this._inRenderList)
            this.owner.scene._addRenderObject(this);

        this._renderElements.forEach(element => {
            arrayElement.push(element._renderElementOBJ);
        });
        this._baseRenderNode.setRenderelements(arrayElement);

    }

    /**
     * BaseRender motion
     */
    protected _onWorldMatNeedChange(flag: number): void {
        this.boundsChange = true;
        this._addReflectionProbeUpdate();
        this._batchRender && this._batchRender._updateOneRender(this);
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["Sprite3D"];
    }

    protected _createBaseRenderNode(): IBaseRenderNode {
        return Laya3DRender.Render3DModuleDataFactory.createBaseRenderNode();
    }

    /**
     * @protected
     * @param context 
     */
    renderUpdate(context: RenderContext3D) {

    }
    protected _onAdded(): void {
        this._transform = this.owner.transform;
        this.owner._isRenderNode++;
        this.setRenderbitFlag(RenderBitFlag.RenderBitFlag_Editor, this.owner._getBit(NodeFlags.HIDE_BY_EDITOR));
        this._baseRenderNode.transform = this._transform;
        this._changeLayer(this.owner.layer);
        this._changeStaticMask(this.owner._isStatic);
    }
    protected _onEnable(): void {
        super._onEnable();

        this.owner.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);//如果为合并BaseRender,owner可能为空
        this.owner.on(Event.LAYER_CHANGE, this, this._changeLayer);
        this.owner.on(Event.STATIC_MASK, this, this._changeStaticMask);
        this._changeLayer(this.owner.layer);
        this._changeStaticMask(this.owner._isStatic);
        this.owner.scene._addRenderObject(this);
        this._setBelongScene(this.owner.scene);
    }

    protected _onDisable(): void {
        this.owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);//如果为合并BaseRender,owner可能为空
        this.owner.off(Event.LAYER_CHANGE, this, this._changeLayer);
        this.owner.off(Event.STATIC_MASK, this, this._changeStaticMask);

        this.owner.scene._removeRenderObject(this);
        this._setUnBelongScene();
        this.volume = null;

    }
    protected _onDestroy() {
        //按理说this.owner不会是空，但引擎里有直接new BaseRender的特殊用法
        if (this.owner)
            this.owner._isRenderNode--;
        (this._motionIndexList !== -1) && (this._scene._sceneRenderManager.removeMotionObject(this));
        (this._scene) && this._scene.sceneRenderableManager.removeRenderObject(this);
        this._baseRenderNode.destroy();
        for (let i = 0, n = this._sharedMaterials.length; i < n; i++) {
            let m = this._sharedMaterials[i];
            m && !m.destroyed && m._removeReference();
        }
        this._sharedMaterials = null;
        this._bounds = null;
        this._lightmapScaleOffset = null;
        this._scene = null;
        this._transform = null;
        this._batchRender = null;
    }

    /**
     * 确定间接光模式
     */
    private _getIrradientMode() {
        if (this.lightmapIndex >= 0) {
            this._baseRenderNode.irradientMode = IrradianceMode.LightMap;
        } else if (this.lightProbe) {
            this._baseRenderNode.irradientMode = IrradianceMode.VolumetricGI;
        } else {
            this._baseRenderNode.irradientMode = IrradianceMode.Common;
        }
    }
    private _changeLayer(layer: number) {
        this._baseRenderNode.layer = layer;
    }

    private _changeStaticMask(staticmask: number) {
        this._baseRenderNode.staticMask = staticmask;
    }

    private _changeMaterialReference(lastValue: Material, value: Material): void {
        (lastValue) && (lastValue._removeReference());
        value && value._addReference();
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
     * @en Adds the renderer to the update reflection probe queue.
     * @zh 渲染器添加到更新反射探针队列。
     */
    _addReflectionProbeUpdate() {
        //TODO目前暂时不支持混合以及与天空盒模式，只支持simple和off
        this._scene && this._scene._volumeManager.addMotionObject(this);
    }

    /**
     * @internal
     * @en Sets the scene to which this object belongs.
     * @zh 设置所属 Scene 调用此方法。
     */
    _setBelongScene(scene: any): void {
        this._scene = scene;
        this._onWorldMatNeedChange(1);
        this._isSupportRenderFeature();
        this._batchRender && this._batchRender._batchOneRender(this);
        this.setLightmapIndex(this.lightmapIndex);
        this._statAdd();
    }

    protected _statAdd() {
        Stat.renderNode++;
    }

    protected _statRemove() {
        Stat.renderNode--;
    }

    /**
     * @internal
     * @en This method is called when the object is removed from the Scene.
     * @zh 从 Scene 移除会调用此方法。
     */
    _setUnBelongScene() {
        this._statRemove();
        this._scene._volumeManager.removeMotionObject(this);
        let batch = this._batchRender;
        this._batchRender && this._batchRender._removeOneRender(this);
        this._batchRender = batch;
        this._scene = null;
    }

    /**
     * @internal
     * @param boundFrustum 裁剪。
     */
    _needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
        //TODO miner
        if (boundFrustum)
            return boundFrustum.intersects(this.bounds);
        else
            return true;
    }
    _cloneTo(dest: BaseRender): void {
        super._cloneTo(dest);
        dest.receiveShadow = this.receiveShadow;
        dest.sharedMaterials = this.sharedMaterials;
        dest.reflectionMode = this.reflectionMode;
        dest.castShadow = this.castShadow;
        dest.sortingFudge = this.sortingFudge;
    }

    /**
     * @en Sets the rendering flag, where each bit represents a different culling reason, 1 indicates LOD culling.
     * @param flag The flag to set, refer to RenderBitFlag for related flags or define custom bit flags.
     * @param pass Whether to set the flag.
     * @zh 设置渲染标志，每一位都代表不同的淘汰原因，1表示LOD淘汰。
     * @param flag 标记，可以查RenderBitFlag相关，也可以自定义标签位
     * @param pass 设置标签值
     */
    setRenderbitFlag(flag: number, pass: boolean) {
        if (pass)
            this._baseRenderNode.renderbitFlag |= (1 << flag);
        else
            this._baseRenderNode.renderbitFlag &= ~(1 << flag);
    }


    //-------------------------------------deprecated----------------------------------
    /**
     * @deprecated 请使用shareMaterial接口
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
}

