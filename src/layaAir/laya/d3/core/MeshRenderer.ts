import { Config3D } from "../../../Config3D"
import { Component } from "../../components/Component"
import { LayaGL } from "../../layagl/LayaGL"
import { Matrix4x4 } from "../../maths/Matrix4x4"
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable"
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D"
import { ShaderData, ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData"
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine"
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh"
import { VertexElement } from "../../renders/VertexElement"
import { Mesh } from "../resource/models/Mesh"
import { MorphTargetChannel } from "../resource/models/MorphTarget"
import { SubMesh } from "../resource/models/SubMesh"
import { BlinnPhongMaterial } from "./material/BlinnPhongMaterial"
import { Material } from "./material/Material"
import { MeshFilter } from "./MeshFilter"
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration"
import { BaseRender } from "./render/BaseRender"
import { RenderContext3D } from "./render/RenderContext3D"
import { RenderElement } from "./render/RenderElement"
import { SubMeshRenderElement } from "./render/SubMeshRenderElement"
import { RenderableSprite3D } from "./RenderableSprite3D"
import { Sprite3D } from "./Sprite3D"
import { Transform3D } from "./Transform3D"
import { MeshUtil } from "../resource/models/MeshUtil"

/**
 * <code>MeshRenderer</code> 类用于网格渲染器。
 */
export class MeshRenderer extends BaseRender {
    /** @internal */
    protected _revertStaticBatchDefineUV1: boolean = false;
    /** @internal */
    protected _projectionViewWorldMatrix: Matrix4x4;
    /** @internal */
    protected _mesh: Mesh;

    /**
     * @internal
     */
    static __init__(): void {
        MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0 = Shader3D.getDefineByName("UV");
        MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR = Shader3D.getDefineByName("COLOR");
        MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1 = Shader3D.getDefineByName("UV1");
        MeshSprite3DShaderDeclaration.SHADERDEFINE_TANGENT = Shader3D.getDefineByName("TANGENT");
        MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE = Shader3D.getDefineByName("GPU_INSTANCE");
    }

    private morphTargetActiveCount: number = 0;
    private morphTargetActiveWeight: Float32Array;
    private morphTargetActiveIndex: Float32Array;

    /**@internal */
    morphTargetWeight: Float32Array;
    private morphtargetChannels: MorphTargetChannel[];

    private _morphWeightChange: boolean = true;

    /**
     * 创建一个新的 <code>MeshRender</code> 实例。
     */
    constructor() {
        super();
        this._projectionViewWorldMatrix = new Matrix4x4();
    }

    /**
     * @internal
     */
    _createRenderElement(): RenderElement {
        return new SubMeshRenderElement();
    }

    /**@intermal */
    getMesh() {
        return this._mesh;
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        const filter = this.owner.getComponent(MeshFilter) as MeshFilter;
        if (filter) filter._enabled && this._onMeshChange(filter.sharedMesh);
    }

    /**
     * @internal
     * @param mesh 
     * @param out 
     */
    protected _getMeshDefine(mesh: Mesh, out: Array<ShaderDefine>): number {
        let define;
        out.length = 0;
        MeshUtil.getMeshDefine(mesh, out);
        return define;
    }

    protected _changeVertexDefine(mesh: Mesh) {
        var defineDatas: ShaderData = this._shaderValues;
        var lastValue: Mesh = this._mesh;
        if (lastValue) {
            this._getMeshDefine(lastValue, MeshFilter._meshVerticeDefine);
            for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
                defineDatas.removeDefine(MeshFilter._meshVerticeDefine[i]);
        }
        if (mesh) {
            this._getMeshDefine(mesh, MeshFilter._meshVerticeDefine);
            for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
                defineDatas.addDefine(MeshFilter._meshVerticeDefine[i]);
        }

    }

    private _morphTargetValues: Record<string, number> = {}
    /**
     * @internal
     */
    public get morphTargetValues(): Record<string, number> {
        return this._morphTargetValues;
    }
    /**
     * @internal
     */
    public set morphTargetValues(value: Record<string, number>) {
        this._morphTargetValues = value;
    }

    /**
     * @internal
     * @param key 
     */
    _changeMorphTargetValue(key: string) {
        this._morphWeightChange = true;
    }

    /**
     * 设置 morph target 通道 权重
     * @param channelName 通道名
     * @param weight 权重值
     */
    setMorphChannelWeight(channelName: string, weight: number) {
        // todo
        let mesh = this._mesh;
        if (mesh && mesh.morphTargetData) {
            let morphData = mesh.morphTargetData;
            let channel = morphData.getMorphChannel(channelName);
            this.morphTargetValues[channel.name] = weight;
            this._morphWeightChange = true;
        }
    }

    /**
     * 更新 morph target 数据
     */
    protected _applyMorphdata() {
        let mesh = this._mesh;
        if (this._morphWeightChange && mesh && mesh.morphTargetData) {

            let morphData = mesh.morphTargetData;
            let channelCount = morphData.channelCount;

            for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
                let channel = morphData.getMorphChannelbyIndex(channelIndex);
                // channel.targetCount;
                let weight = this.morphTargetValues[channel.name];

                // update target weight
                let lastFullWeight = 0;
                channel.targets.forEach(target => {
                    if (weight <= target.fullWeight) {
                        this.morphTargetWeight[target._index] = (weight - lastFullWeight) / (target.fullWeight - lastFullWeight);
                    }
                    else {
                        this.morphTargetWeight[target._index] = 1;
                    }
                    lastFullWeight = target.fullWeight;
                });
            }

            let activeIndex = 0;
            // todo top k
            this.morphTargetWeight.forEach((weight, index) => {
                if (weight > 0) {
                    this.morphTargetActiveIndex[activeIndex] = index;
                    this.morphTargetActiveWeight[activeIndex] = weight;
                    activeIndex++;
                }
            });

            this.morphTargetActiveCount = Math.min(activeIndex, Config3D.maxMorphTargetCount);

            if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
                this._shaderValues.setInt(RenderableSprite3D.MorphActiveCount, this.morphTargetActiveCount);

                this._shaderValues.setBuffer(RenderableSprite3D.MorphActiceTargets, this.morphTargetActiveIndex);
                this._shaderValues.setBuffer(RenderableSprite3D.MorphActiveWeights, this.morphTargetActiveWeight);
            }
            else {
                // todo
            }
            this._morphWeightChange = false;
            // todo 
            // active count == 0 disable morph ?
        }

    }

    /**
     * 更新 mesh 时 更新 morph target data (shader define)
     * @param mesh 
     */
    protected _changeMorphData(mesh: Mesh) {
        let shaderData = this._shaderValues;
        let oldMesh = this._mesh;

        // todo
        // config max count
        const maxMorphTargetCount = Config3D.maxMorphTargetCount;
        let maxCount = maxMorphTargetCount;

        this.morphTargetActiveIndex = new Float32Array(maxCount);
        this.morphTargetActiveWeight = new Float32Array(maxCount);

        if (LayaGL.renderEngine.getCapable(RenderCapable.Texture3D)) {
            if (oldMesh && oldMesh.morphTargetData) {
                let morphData = oldMesh.morphTargetData;
                shaderData.removeDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET);

                let morphVertexDec = morphData.vertexDec;

                morphVertexDec._vertexElements.forEach(element => {
                    switch (element.elementUsage) {
                        case VertexMesh.MESH_POSITION0:
                            shaderData.removeDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET_POSITION);
                            break;
                        case VertexMesh.MESH_NORMAL0:
                            shaderData.removeDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET_NORMAL);
                            break;
                        case VertexMesh.MESH_TANGENT0:
                            shaderData.removeDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET_TANGENT);
                            break;
                        default:
                            break;
                    }
                })
            }

            if (mesh && mesh.morphTargetData) {

                let morphData = mesh.morphTargetData;

                shaderData.addDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET);
                let morphVertexDec = morphData.vertexDec;
                morphVertexDec._vertexElements.forEach(element => {
                    switch (element.elementUsage) {
                        case VertexMesh.MESH_POSITION0:
                            shaderData.addDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET_POSITION);
                            break;
                        case VertexMesh.MESH_NORMAL0:
                            shaderData.addDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET_NORMAL);
                            break;
                        case VertexMesh.MESH_TANGENT0:
                            shaderData.addDefine(RenderableSprite3D.SHADERDEFINE_MORPHTARGET_TANGENT);
                            break;
                        default:
                            break;
                    }
                })

                shaderData.setVector(RenderableSprite3D.MorphAttriOffset, mesh.morphTargetData.attributeOffset);

                shaderData.setTexture(RenderableSprite3D.MorphTex, mesh.morphTargetData.targetTexture);

                shaderData.setVector(RenderableSprite3D.MorphParams, morphData.params);

                shaderData.setBuffer(RenderableSprite3D.MorphActiceTargets, this.morphTargetActiveIndex);
                shaderData.setBuffer(RenderableSprite3D.MorphActiveWeights, this.morphTargetActiveWeight);
            }
        }

        if (oldMesh && oldMesh.morphTargetData) {
            this.morphTargetWeight = null;

            this.morphtargetChannels = null;
            this._morphTargetValues = {};
        }

        if (mesh && mesh.morphTargetData) {

            let morphData = mesh.morphTargetData;

            let channelCount = morphData.channelCount;

            this.morphTargetWeight = new Float32Array(morphData.targetCount);

            this.morphtargetChannels = new Array<MorphTargetChannel>(channelCount);
            for (let index = 0; index < channelCount; index++) {
                let channel = morphData.getMorphChannelbyIndex(index);
                this.morphtargetChannels[index] = channel;
                this._morphTargetValues[channel.name] = 0;
            }
        }

    }

    /**
     * @internal
     */
    _onMeshChange(mesh: Mesh): void {
        if (mesh && this._mesh != mesh) {
            this._changeVertexDefine(mesh);
            this._changeMorphData(mesh);
            this._mesh = mesh;
            this.geometryBounds = mesh.bounds;
            var count: number = mesh.subMeshCount;
            this._renderElements.length = count;
            for (var i: number = 0; i < count; i++) {
                var renderElement: RenderElement = this._renderElements[i];
                if (!renderElement) {
                    var material: Material = this.sharedMaterials[i];
                    renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
                    this.owner && renderElement.setTransform((this.owner as Sprite3D)._transform);
                    renderElement.render = this;
                    renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
                }
                renderElement.setGeometry(mesh.getSubMesh(i));
            }

        } else if (!mesh) {
            this._renderElements.forEach
            this._renderElements.forEach(element => {
                element.destroy();
            });
            this._renderElements.length = 0;
            this._mesh = null;
            this._changeVertexDefine(null);
            this._changeMorphData(null);
        }
        this.boundsChange = true;
        // if (this._octreeNode && this._indexInOctreeMotionList === -1) {
        // 	this._octreeNode.getManagerNode().addMotionObject(this);
        // }
    }


    /**
     * @internal
     * 开启多材质 多element模式
     */
    updateMulPassRender(): void {
        const filter = this.owner.getComponent(MeshFilter);
        if (!filter)
            return;
        const mesh = filter.sharedMesh;
        if (mesh) {
            var subCount: number = mesh.subMeshCount;
            var matCount = this._sharedMaterials.length;
            if (subCount > matCount) {
                let count = subCount
                this._renderElements.length = count;
                for (var i: number = 0; i < count; i++) {
                    var renderElement: RenderElement = this._renderElements[i];
                    if (!renderElement) {
                        var material: Material = this.sharedMaterials[i];
                        renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
                        renderElement.setTransform((this.owner as Sprite3D)._transform);
                        renderElement.render = this;
                        renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
                    }
                    renderElement.setGeometry(mesh.getSubMesh(i));
                }
            } else {
                let count = matCount;
                this._renderElements.length = count;
                for (var i: number = 0; i < count; i++) {
                    var renderElement: RenderElement = this._renderElements[i];
                    if (!renderElement) {
                        var material: Material = this.sharedMaterials[i];
                        renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
                        renderElement.setTransform((this.owner as Sprite3D)._transform);
                        renderElement.render = this;
                        renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
                    }
                }
                renderElement.setGeometry(mesh.getSubMesh(count % subCount));
            }

        } else {
            this._renderElements.length = 0;
        }
        this.boundsChange = true;
        // if (this._octreeNode && this._indexInOctreeMotionList === -1) {
        // 	this._octreeNode.getManagerNode().addMotionObject(this);
        // }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    protected _calculateBoundingBox(): void {
        var sharedMesh: Mesh = this._mesh;
        if (sharedMesh) {
            var worldMat: Matrix4x4 = this._transform.worldMatrix;
            if (sharedMesh.morphTargetData) {
                sharedMesh.morphTargetData.bounds._tranform(worldMat, this._bounds);
            }
            else {
                sharedMesh.bounds._tranform(worldMat, this._bounds);
            }
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void {
        this._applyLightMapParams();
        this._applyReflection();
        this._applyMorphdata();
        var element: SubMeshRenderElement = <SubMeshRenderElement>context.renderElement;
        let trans = transform ? transform : this._transform;
        this._setShaderValue(Sprite3D.WORLDMATRIX, ShaderDataType.Matrix4x4, trans.worldMatrix);

        this._worldParams.x = trans.getFrontFaceValue();
        this._setShaderValue(Sprite3D.WORLDINVERTFRONT, ShaderDataType.Vector4, this._worldParams);

        return;
    }
    /**
     * @internal
     * @override
     */
    _revertBatchRenderUpdate(context: RenderContext3D): void {
        var element: SubMeshRenderElement = (<SubMeshRenderElement>context.renderElement);
        switch (element.renderType) {
            case RenderElement.RENDERTYPE_STATICBATCH:
                if (this._revertStaticBatchDefineUV1)
                    this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
                this._shaderValues.setVector(RenderableSprite3D.LIGHTMAPSCALEOFFSET, this.lightmapScaleOffset);
                break;
            case RenderElement.RENDERTYPE_INSTANCEBATCH:
                this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
                break;
        }
    }

    protected _onDestroy() {
        super._onDestroy();
        this._morphTargetValues = null;
    }

    /**
     * @override
     * @param dest 
     */
    _cloneTo(dest: Component): void {
        super._cloneTo(dest);
        // todo clone morphtarget weight
        // onMeshChange in onEnable
        if (this.morphTargetWeight) {
            (<MeshRenderer>dest).morphTargetWeight = new Float32Array(this.morphTargetWeight);
        }
        for (const key in this._morphTargetValues) {
            (<MeshRenderer>dest)._morphTargetValues[key] = this._morphTargetValues[key];
        }
    }
}