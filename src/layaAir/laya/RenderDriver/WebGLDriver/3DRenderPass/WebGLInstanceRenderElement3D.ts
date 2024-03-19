import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { MeshSprite3DShaderDeclaration } from "../../../d3/core/MeshSprite3DShaderDeclaration";
import { RenderableSprite3D } from "../../../d3/core/RenderableSprite3D";
import { SimpleSkinnedMeshRenderer } from "../../../d3/core/SimpleSkinnedMeshRenderer";
import { SingletonList } from "../../../utils/SingletonList";
import { BaseRenderType } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLBufferState } from "../RenderDevice/WebGLBufferState";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebGLVertexBuffer } from "../RenderDevice/WebGLVertexBuffer";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";
export interface WebGLInstanceStateInfo {
    state: WebGLBufferState;
    worldInstanceVB?: WebGLVertexBuffer;
    lightmapScaleOffsetVB?: WebGLVertexBuffer;
    simpleAnimatorVB?: WebGLVertexBuffer;
}
export class WebGLInstanceRenderElement3D extends WebGLRenderElement3D {
    /**
     * get Instance BufferState
     */
    static _instanceBufferStateMap: Map<number, WebGLInstanceStateInfo> = new Map();
    static getInstanceBufferState(geometry: WebGLRenderGeometryElement, renderType: number, spriteDefine: WebDefineDatas) {
        let stateinfo = WebGLInstanceRenderElement3D._instanceBufferStateMap.get(geometry._id);
        if (!stateinfo) {
            stateinfo = { state: new WebGLBufferState() };
            let oriBufferState = geometry.bufferState;
            let vertexArray = oriBufferState._vertexBuffers.slice();
            let worldMatVertex = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
            worldMatVertex.setDataLength(WebGLInstanceRenderElement3D.MaxInstanceCount * 16 * 4)
            worldMatVertex.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
            worldMatVertex.instanceBuffer = true;
            vertexArray.push(worldMatVertex);
            stateinfo.worldInstanceVB = worldMatVertex;
            switch (renderType) {
                case BaseRenderType.MeshRender:
                    if (spriteDefine.has(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1)) {
                        let instanceLightMapVertexBuffer = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
                        instanceLightMapVertexBuffer.setDataLength(WebGLInstanceRenderElement3D.MaxInstanceCount * 4 * 4)
                        instanceLightMapVertexBuffer.vertexDeclaration = VertexMesh.instanceLightMapScaleOffsetDeclaration;
                        instanceLightMapVertexBuffer.instanceBuffer = true;
                        vertexArray.push(instanceLightMapVertexBuffer);
                        stateinfo.lightmapScaleOffsetVB = instanceLightMapVertexBuffer;
                    }
                    break;
                case BaseRenderType.SimpleSkinRender:
                    let instanceSimpleAnimatorBuffer = new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
                    instanceSimpleAnimatorBuffer.setDataLength(WebGLInstanceRenderElement3D.MaxInstanceCount * 4 * 4)
                    instanceSimpleAnimatorBuffer.vertexDeclaration = VertexMesh.instanceSimpleAnimatorDeclaration;
                    instanceSimpleAnimatorBuffer.instanceBuffer = true;
                    vertexArray.push(instanceSimpleAnimatorBuffer);
                    stateinfo.simpleAnimatorVB = instanceSimpleAnimatorBuffer;
                    break;
            }
            stateinfo.state.applyState(vertexArray, geometry.bufferState._bindedIndexBuffer);
            WebGLInstanceRenderElement3D._instanceBufferStateMap.set(geometry._id, stateinfo);
        }
        return stateinfo;
    }

    /**
     * max instance count
     */
    static MaxInstanceCount: number = 1024;

    /**
     * @internal
     */
    private static _pool: WebGLInstanceRenderElement3D[] = [];

    static create(): WebGLInstanceRenderElement3D {
        let element = this._pool.pop() || new WebGLInstanceRenderElement3D();
        return element;
    }

    /**
     * pool of Buffer
     * @internal
     */
    private static _bufferPool: Map<number, Float32Array[]> = new Map();

    static _instanceBufferCreate(length: number): Float32Array {
        let array = WebGLInstanceRenderElement3D._bufferPool.get(length);
        if (!array) {
            WebGLInstanceRenderElement3D._bufferPool.set(length, []);
            array = WebGLInstanceRenderElement3D._bufferPool.get(length)
        }

        let element = array.pop() || new Float32Array(length);
        return element;
    }

    _instanceElementList: SingletonList<WebGLRenderElement3D>;

    private _vertexBuffers: Array<WebGLVertexBuffer> = [];
    private _updateData: Array<Float32Array> = [];
    private _updateDataNum: Array<number> = [];
    private _instanceStateInfo: WebGLInstanceStateInfo;
    _invertFrontFace: boolean = true;
    drawCount: number;
    updateNums: number;
    protected _getInvertFront(): boolean {
        return this._invertFrontFace;
    }

    constructor() {
        super();
        this._instanceElementList = new SingletonList();
        this.drawCount = 0;
        this.updateNums = 0;
        this.isRender = true;
    }

    addUpdateBuffer(vb: WebGLVertexBuffer, length: number) {
        this._vertexBuffers[this.updateNums] = vb;
        this._updateDataNum[this.updateNums] = length;
        this.updateNums++;
    }

    getUpdateData(index: number, length: number): Float32Array {
        let data = this._updateData[index] = WebGLInstanceRenderElement3D._instanceBufferCreate(length);
        return data;
    }

    protected _compileShader(context: WebGLRenderContext3D) {
        let passes = this.subShader._passes;
        for (let i = 0; i < passes.length; i++) {
            let pass = passes[i];
            if (pass.pipelineMode != context.pipelineMode)
                continue;

            let comDef = WebGLRenderElement3D._compileDefine;
            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            }
            else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            context.cameraData && comDef.addDefineDatas(context.cameraData._defineDatas);

            if (this.renderShaderData) {
                comDef.addDefineDatas(this.renderShaderData.getDefineData());
                pass.nodeCommonMap = this.owner._commonUniformMap;
            }
            else {
                pass.nodeCommonMap = null;
            }

            comDef.addDefineDatas(this.materialShaderData._defineDatas);

            comDef.add(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
            this._updateInstanceData();

            let shaderIns = <WebGLShaderInstance>pass.withCompile(comDef);
            this._addShaderInstance(shaderIns);
        }
    }

    private _updateInstanceData() {
        switch (this.owner.renderNodeType) {
            case BaseRenderType.MeshRender:
                var worldMatrixData: Float32Array = this.getUpdateData(0, 16 * WebGLInstanceRenderElement3D.MaxInstanceCount);
                this.addUpdateBuffer(this._instanceStateInfo.worldInstanceVB, 16);
                var insBatches = this._instanceElementList;
                var elements: WebGLRenderElement3D[] = insBatches.elements;
                var count: number = insBatches.length;
                this.drawCount = count;
                this.geometry.instanceCount = this.drawCount;
                for (var i: number = 0; i < count; i++)
                    worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);

                let haveLightMap: boolean = this.renderShaderData.hasDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP) && this.renderShaderData.hasDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
                if (haveLightMap) {
                    var lightMapData: Float32Array = this.getUpdateData(1, 4 * WebGLInstanceRenderElement3D.MaxInstanceCount);
                    for (var i: number = 0; i < count; i++) {
                        let lightmapScaleOffset = elements[i].owner.lightmapScaleOffset;
                        var offset: number = i * 4;
                        lightMapData[offset] = lightmapScaleOffset.x;
                        lightMapData[offset + 1] = lightmapScaleOffset.y;
                        lightMapData[offset + 2] = lightmapScaleOffset.z;
                        lightMapData[offset + 3] = lightmapScaleOffset.w;
                    }
                    this.addUpdateBuffer(this._instanceStateInfo.lightmapScaleOffsetVB, 4);
                }
                break;
            case BaseRenderType.SimpleSkinRender:
                //worldMatrix
                var worldMatrixData: Float32Array = this.getUpdateData(0, 16 * WebGLInstanceRenderElement3D.MaxInstanceCount);
                this.addUpdateBuffer(this._instanceStateInfo.worldInstanceVB, 16);
                var insBatches = this._instanceElementList;
                var elements: WebGLRenderElement3D[] = insBatches.elements;
                var count: number = insBatches.length;
                this.drawCount = count;
                for (var i: number = 0; i < count; i++)
                    worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);
                //simpleAnimationData
                var simpleAnimatorData: Float32Array = this.getUpdateData(1, 4 * WebGLInstanceRenderElement3D.MaxInstanceCount);
                for (var i: number = 0; i < count; i++) {
                    var simpleAnimatorParams = this.renderShaderData.getVector(SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORPARAMS);
                    var offset: number = i * 4;
                    simpleAnimatorData[offset] = simpleAnimatorParams.x;
                    simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
                    simpleAnimatorData[offset + 2] = simpleAnimatorParams.z;
                    simpleAnimatorData[offset + 3] = simpleAnimatorParams.w;
                }
                this.addUpdateBuffer(this._instanceStateInfo.simpleAnimatorVB, 4);
                break;
        }
    }


    /**
     * get correct geometry
     * @param geometry 
     */
    setGeometry(geometry: WebGLRenderGeometryElement) {
        if (!this.geometry) {
            this.geometry = new WebGLRenderGeometryElement(geometry.mode, geometry.drawType);
        }
        geometry.cloneTo(this.geometry);
        this.geometry.drawType = DrawType.DrawElementInstance;
        this._instanceStateInfo = WebGLInstanceRenderElement3D.getInstanceBufferState(geometry, this.owner.renderNodeType, this.renderShaderData._defineDatas);
        this.geometry.bufferState = this._instanceStateInfo.state;
    }

    drawGeometry(shaderIns: WebGLShaderInstance): void {
        for (let i = 0; i < this.updateNums; i++) {
            let buffer = this._vertexBuffers[i];
            if (!buffer)
                break;
            let data = this._updateData[i];
            buffer.orphanStorage();
            buffer.setData(data.buffer, 0, 0, this.drawCount * this._updateDataNum[i] * 4);
        }
        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
    }

    recover() {
        WebGLInstanceRenderElement3D._pool.push(this);
        this.updateNums = 0;
        this._instanceElementList.clear();
        this._vertexBuffers.length = 0;
        this._updateData.forEach((data) => {
            WebGLInstanceRenderElement3D._bufferPool.get(data.length).push(data);
        });
        this._updateDataNum.length = 0;
    }

    destroy(): void {
        super.destroy();
    }
}