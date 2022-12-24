import { ILaya3D } from "../../../../ILaya3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector4 } from "../../../maths/Vector4";
import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SingletonList } from "../../../utils/SingletonList";
import { MeshInstanceGeometry } from "../../graphics/MeshInstanceGeometry";
import { InstanceRenderElementOBJ } from "../../RenderObjs/RenderObj/InstanceRenderElementOBJ";
import { Mesh } from "../../resource/models/Mesh";
import { Camera } from "../Camera";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { SimpleSkinnedMeshRenderer } from "../SimpleSkinnedMeshRenderer";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { BaseRender } from "./BaseRender";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

export class InstanceRenderElement extends RenderElement {
    /** @internal */
    static maxInstanceCount: number = 1024;
    /**@internal */
    private static _pool: InstanceRenderElement[] = [];

    static create(): InstanceRenderElement {
        let elemet = InstanceRenderElement._pool.length > 0 ? InstanceRenderElement._pool.pop() : new InstanceRenderElement();
        elemet._isInPool = false;
        elemet.clear();
        return elemet;
    }
    /**@internal */
    _instanceBatchElementList: SingletonList<RenderElement>
    /**@internal */
    _isInPool: boolean;
    /**判断是否需要更新数据 */
    _isUpdataData: boolean;
    /**@internal recover renderData*/
    private oriRendertype: number;


    constructor() {
        super();
        this.setGeometry(new MeshInstanceGeometry(null));
        this._instanceBatchElementList = new SingletonList();
        this._isUpdataData = true;
    }

    /**
     * @internal
     */
    getInvertFront(): boolean {
        return false;
    }

    protected _createRenderElementOBJ() {
        this._renderElementOBJ = LayaGL.renderOBJCreate.createInstanceRenderElement();
    }

    compileShader(context: IRenderContext3D) {
        var passes: ShaderPass[] = this._subShader._passes;
        this._renderElementOBJ._clearShaderInstance();
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass._pipelineMode !== context.pipelineMode)
                continue;
            var comDef: DefineDatas = RenderElement._compileDefine;
            context.sceneShaderData._defineDatas.cloneTo(comDef);
            this.render && comDef.addDefineDatas(this.render._shaderValues._defineDatas);

            comDef.addDefineDatas(this._renderElementOBJ._materialShaderData._defineDatas);
            //add Instance Define
            comDef.add(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);

            var shaderIns: ShaderInstance = pass.withCompile(comDef);
            this._renderElementOBJ._addShaderInstance(shaderIns);
        }
    }


    _renderUpdatePre(context: RenderContext3D) {
        var sceneMark: number = ILaya3D.Scene3D._updateMark;
        var transform: Transform3D = this.transform;
        context.renderElement = this;
        //model local
        var modelDataRender: boolean = (!!this.render) ? (sceneMark !== this.render._sceneUpdateMark || this.renderType !== this.render._updateRenderType) : false;
        if (modelDataRender) {
            this.render._renderUpdate(context, transform);
            this.render._sceneUpdateMark = sceneMark;
        }
        //camera
        var updateMark: number = Camera._updateMark;
        if (true) {//此处处理更新为裁剪和合并后的，可避免浪费
            this.render._renderUpdateWithCamera(context, transform);
            this.oriRendertype = this.render._updateRenderType
            this.render._updateMark = updateMark;
            this.render._updateRenderType = this.renderType;
            if (this._isUpdataData) {
                let mesh = (this._geometry as MeshInstanceGeometry).subMesh._mesh;
                this.updateInstanceData(mesh);
            }
        }

        const subUbo = (!!this.render) ? this.render._subUniformBufferData : false;
        if (subUbo) {
            subUbo._needUpdate && BaseRender._transLargeUbO.updateSubData(subUbo);
        }
        this._renderElementOBJ._isRender = this._geometry._prepareRender(context);
        this._geometry._updateRenderParams(context);
        this.compileShader(context._contextOBJ);
        this._geometry.instanceCount = this._instanceBatchElementList.length;
        this._renderElementOBJ._invertFront = this.getInvertFront();
    }

    updateInstanceData(mesh: Mesh) {
        mesh._setInstanceBuffer();
        (this._renderElementOBJ as InstanceRenderElementOBJ).clear();
        this._geometry.bufferState = mesh._instanceBufferState;
        switch (mesh._instanceBufferStateType) {
            case Mesh.MESH_INSTANCEBUFFER_TYPE_SIMPLEANIMATOR:
                //worldMatrix
                var worldMatrixData: Float32Array = (this._renderElementOBJ as InstanceRenderElementOBJ).getUpdateData(0, 16 * InstanceRenderElement.maxInstanceCount);
                (this._renderElementOBJ as InstanceRenderElementOBJ).addUpdateBuffer(mesh._instanceWorldVertexBuffer, 16);
                var insBatches = this._instanceBatchElementList;
                var elements = insBatches.elements;
                var count: number = insBatches.length;
                (this._renderElementOBJ as InstanceRenderElementOBJ).drawCount = count;
                let bone = (elements[0].render as SimpleSkinnedMeshRenderer).rootBone;
                if (bone) {
                    for (var i: number = 0; i < count; i++) {
                        var mat: Matrix4x4 = (((elements[i].render) as SimpleSkinnedMeshRenderer).rootBone as Sprite3D)._transform.worldMatrix;
                        worldMatrixData.set(mat.elements, i * 16);
                    }
                }
                else {
                    for (var i: number = 0; i < count; i++)
                        worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);
                }
                //simpleAnimationData
                var simpleAnimatorData: Float32Array = (this._renderElementOBJ as InstanceRenderElementOBJ).getUpdateData(1, 4 * InstanceRenderElement.maxInstanceCount);
                if (bone) {
                    for (var i: number = 0; i < count; i++) {
                        var render: SimpleSkinnedMeshRenderer = (elements[i].render) as SimpleSkinnedMeshRenderer;
                        render._computeAnimatorParamsData();
                        var simpleAnimatorParams: Vector4 = render._simpleAnimatorParams;
                        var offset: number = i * 4;
                        simpleAnimatorData[offset] = simpleAnimatorParams.x;
                        simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
                    }
                }
                else {
                    for (var i: number = 0; i < count; i++) {
                        simpleAnimatorData[offset] = 0;
                        simpleAnimatorData[offset + 1] = 0;
                    }
                }
                (this._renderElementOBJ as InstanceRenderElementOBJ).addUpdateBuffer(mesh._instanceSimpleAniVertexBuffer, 4)
                break;
            case Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL:

                var worldMatrixData: Float32Array = (this._renderElementOBJ as InstanceRenderElementOBJ).getUpdateData(0, 16 * InstanceRenderElement.maxInstanceCount);
                (this._renderElementOBJ as InstanceRenderElementOBJ).addUpdateBuffer(mesh._instanceWorldVertexBuffer, 16);
                var insBatches = this._instanceBatchElementList;
                var elements: RenderElement[] = insBatches.elements;
                var count: number = insBatches.length;
                (this._renderElementOBJ as InstanceRenderElementOBJ).drawCount = count;
                for (var i: number = 0; i < count; i++)
                    worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);
                break;
        }
    }

    clear() {
        this._instanceBatchElementList.length = 0;
    }
    recover(): void {
        InstanceRenderElement._pool.push(this);
        this.render._updateRenderType = this.oriRendertype;
        this._isInPool = true;
    }
}