import { Config3D } from "../../../Config3D"
import { Component } from "../../components/Component"
import { LayaGL } from "../../layagl/LayaGL"
import { Matrix4x4 } from "../../maths/Matrix4x4"
import { BaseRenderType, IMeshRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData"
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData"
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine"
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable"
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D"
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh"
import { Material } from "../../resource/Material"
import { Laya3DRender } from "../RenderObjs/Laya3DRender"
import { Mesh } from "../resource/models/Mesh"
import { MeshUtil } from "../resource/models/MeshUtil"
import { MorphTargetChannel } from "../resource/models/MorphTarget"
import { MeshFilter } from "./MeshFilter"
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration"
import { RenderableSprite3D } from "./RenderableSprite3D"
import { Sprite3D } from "./Sprite3D"
import { BlinnPhongMaterial } from "./material/BlinnPhongMaterial"
import { BaseRender } from "./render/BaseRender"
import { RenderContext3D } from "./render/RenderContext3D"
import { RenderElement } from "./render/RenderElement"
import { SubMeshRenderElement } from "./render/SubMeshRenderElement"
import { Stat } from "../../utils/Stat"


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

    private _moduleData: IMeshRenderNode;

    /**
     * 创建一个新的 <code>MeshRender</code> 实例。
     */
    constructor() {
        super();
        this._projectionViewWorldMatrix = new Matrix4x4();
        this._baseRenderNode.renderNodeType = BaseRenderType.MeshRender;
    }



    /**
     * override it
     * @returns 
     */
    protected _createBaseRenderNode(): IMeshRenderNode {

        return Laya3DRender.Render3DModuleDataFactory.createMeshRenderNode();
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

    /**
     * @internal
     * @protected
     * @param mesh 
     */
    protected _changeVertexDefine(mesh: Mesh) {
        var defineDatas: ShaderData = this._baseRenderNode.shaderData;
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
     * @internal
     * @protected
     * 更新 morph target 数据
     */
    protected _applyMorphdata() {
        let mesh = this._mesh;
        let shaderData = this._baseRenderNode.shaderData;
        if (this._morphWeightChange && mesh) {

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
                shaderData.setInt(RenderableSprite3D.MorphActiveCount, this.morphTargetActiveCount);

                shaderData.setBuffer(RenderableSprite3D.MorphActiceTargets, this.morphTargetActiveIndex);
                shaderData.setBuffer(RenderableSprite3D.MorphActiveWeights, this.morphTargetActiveWeight);
            }
            else {
                // todo
            }
            this._morphWeightChange = false;
            // todo 
            // active count == 0 disable morph ?
        }

    }

    _setBelongScene(scene: any): void {
        super._setBelongScene(scene);
        Stat.meshRenderNode++;
    }

    /**
     * @internal
     */
    _setUnBelongScene() {
        super._setUnBelongScene();
        Stat.meshRenderNode--;
    }

    /**
     * @internal
     * @protected
     * 更新 mesh 时 更新 morph target data (shader define)
     * @param mesh 
     */
    protected _changeMorphData(mesh: Mesh) {
        let shaderData = this._baseRenderNode.shaderData;
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
            if (mesh.morphTargetData)
                this.geometryBounds = mesh.morphTargetData.bounds
            else
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
                    //renderElement.renderSubShader = renderElement.material.shader.getSubShaderAt(0);//TODO
                }
                renderElement.setGeometry(mesh.getSubMesh(i));
            }
            this.boundsChange = true;
        } else if (!mesh) {
            this._renderElements.forEach
            this._renderElements.forEach(element => {
                element._renderElementOBJ.destroy();
                element.destroy();
            });
            this._renderElements.length = 0;
            this._mesh = null;
            this._changeVertexDefine(null);
            this._changeMorphData(null);
            this.boundsChange = false;
        }

        this._setRenderElements();
    }


    /**
     * @internal
     * BaseRender motion
     */
    protected _onWorldMatNeedChange(flag: number): void {
        super._onWorldMatNeedChange(flag);
        if (!this._mesh) {
            this.boundsChange = false;
        }
    }

    renderUpdate(context: RenderContext3D): void {
        if (!this._mesh) {
            return;
        }

        this._mesh.morphTargetData && this._applyMorphdata();
        if (this._renderElements.length == 1) {
            this._renderElements[0]._renderElementOBJ.isRender = this._renderElements[0]._geometry._prepareRender(context);
            this._renderElements[0]._geometry._updateRenderParams(context);
            let mat = this.sharedMaterial ?? BlinnPhongMaterial.defaultMaterial;
            this._renderElements[0]._renderElementOBJ.materialRenderQueue = mat.renderQueue;
            this._renderElements[0].material = this.sharedMaterial;
        } else {
            for (var i = 0, n = this._renderElements.length; i < n; i++) {
                this._renderElements[i]._renderElementOBJ.isRender = this._renderElements[i]._geometry._prepareRender(context);
                this._renderElements[i]._geometry._updateRenderParams(context);
                let material = this.sharedMaterial ?? BlinnPhongMaterial.defaultMaterial;
                material = this.sharedMaterials[i] ?? material;
                this._renderElements[i].material = material;
                this._renderElements[i]._renderElementOBJ.materialRenderQueue = material.renderQueue;
            }
        }
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
        this._setRenderElements();
    }

    /**
     * @internal
     * @protected
     */
    protected _onDestroy() {
        super._onDestroy();
        this._morphTargetValues = null;
    }

    /**
     * @internal
     * @override
     * @param dest 
     */
    _cloneTo(dest: MeshRenderer): void {
        super._cloneTo(dest);
        // todo clone morphtarget weight
        // onMeshChange in onEnable
        dest._onMeshChange(this._mesh);
        if (this.morphTargetWeight) {
            dest.morphTargetWeight = new Float32Array(this.morphTargetWeight);
        }
        for (const key in this._morphTargetValues) {
            dest._morphTargetValues[key] = this._morphTargetValues[key];
        }
    }
}