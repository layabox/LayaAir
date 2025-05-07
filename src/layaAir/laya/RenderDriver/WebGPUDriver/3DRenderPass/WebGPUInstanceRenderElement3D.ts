import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { MeshSprite3DShaderDeclaration } from "../../../d3/core/MeshSprite3DShaderDeclaration";
import { RenderableSprite3D } from "../../../d3/core/RenderableSprite3D";
import { SimpleSkinnedMeshSprite3D } from "../../../d3/core/SimpleSkinnedMeshSprite3D";
import { SingletonList } from "../../../utils/SingletonList";
import { IInstanceRenderElement3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { BaseRenderType } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGPUBufferState } from "../RenderDevice/WebGPUBufferState";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPURenderGeometry } from "../RenderDevice/WebGPURenderGeometry";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUVertexBuffer } from "../RenderDevice/WebGPUVertexBuffer";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

export interface WebGPUInstanceStateInfo {
    state: WebGPUBufferState;
    worldInstanceVB?: WebGPUVertexBuffer;
    simpleAnimatorVB?: WebGPUVertexBuffer;
    lightmapScaleOffsetVB?: WebGPUVertexBuffer;
}

export class WebGPUInstanceRenderElement3D extends WebGPURenderElement3D implements IInstanceRenderElement3D {
    static getInstanceBufferState(stateinfo: WebGPUInstanceStateInfo, geometry: WebGPURenderGeometry, renderType: number, spriteDefine: WebDefineDatas) {
        const _initStateInfo = (stateinfo: WebGPUInstanceStateInfo) => {
            const oriBufferState = geometry.bufferState;
            const vertexArray = oriBufferState._vertexBuffers.slice();
            let worldMatVertex = stateinfo.worldInstanceVB;
            let declaration = VertexMesh.instanceWorldMatrixDeclaration;
            const size = this.MaxInstanceCount * declaration.vertexStride;
            if (!worldMatVertex || worldMatVertex.source._size < size) {
                if (worldMatVertex) {
                    worldMatVertex.destroy();
                    worldMatVertex.source._source.destroy();
                }
                stateinfo.worldInstanceVB = worldMatVertex = new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
                worldMatVertex.instanceBuffer = true;
                worldMatVertex.setDataLength(size);
                worldMatVertex.vertexDeclaration = declaration;
            }
            vertexArray.push(worldMatVertex);
            switch (renderType) {
                case BaseRenderType.MeshRender:
                    if (spriteDefine.has(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1)) {
                        let instanceLightMapVertexBuffer = stateinfo.lightmapScaleOffsetVB;
                        const size = this.MaxInstanceCount * 4 * 4;
                        if (!instanceLightMapVertexBuffer || instanceLightMapVertexBuffer.source._size < size) {
                            if (instanceLightMapVertexBuffer) {
                                instanceLightMapVertexBuffer.destroy();
                                instanceLightMapVertexBuffer.source._source.destroy();
                            }
                            stateinfo.lightmapScaleOffsetVB = instanceLightMapVertexBuffer = new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
                            instanceLightMapVertexBuffer.instanceBuffer = true;
                            instanceLightMapVertexBuffer.setDataLength(this.MaxInstanceCount * 4 * 4);
                            instanceLightMapVertexBuffer.vertexDeclaration = VertexMesh.instanceLightMapScaleOffsetDeclaration;
                        }
                        vertexArray.push(instanceLightMapVertexBuffer);
                    }
                    break;
                case BaseRenderType.SimpleSkinRender:
                    let instanceSimpleAnimatorBuffer = stateinfo.simpleAnimatorVB;
                    const size = this.MaxInstanceCount * 4 * 4;
                    if (!instanceSimpleAnimatorBuffer || instanceSimpleAnimatorBuffer.source._size < size) {
                        if (instanceSimpleAnimatorBuffer) {
                            instanceSimpleAnimatorBuffer.destroy();
                            instanceSimpleAnimatorBuffer.source._source.destroy();
                        }
                        stateinfo.simpleAnimatorVB = instanceSimpleAnimatorBuffer = new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
                        instanceSimpleAnimatorBuffer.instanceBuffer = true;
                        instanceSimpleAnimatorBuffer.setDataLength(this.MaxInstanceCount * 4 * 4);
                        instanceSimpleAnimatorBuffer.vertexDeclaration = VertexMesh.instanceSimpleAnimatorDeclaration;
                    }
                    vertexArray.push(instanceSimpleAnimatorBuffer);
                    break;
            }
            stateinfo.state.applyState(vertexArray, geometry.bufferState._bindedIndexBuffer);
        };

        if (!stateinfo)
            stateinfo = { state: new WebGPUBufferState() };
        _initStateInfo(stateinfo);
        return stateinfo;
    }

    static MaxInstanceCount: number = 1024;

    private static _pool: WebGPUInstanceRenderElement3D[] = [];
    static create(): WebGPUInstanceRenderElement3D {
        const obj = this._pool.pop() ?? new WebGPUInstanceRenderElement3D();
        return obj;
    }

    private static _bufferPool: Map<number, Float32Array[]> = new Map();
    static _instanceBufferCreate(length: number): Float32Array {
        let array = this._bufferPool.get(length);
        if (!array) {
            this._bufferPool.set(length, []);
            array = this._bufferPool.get(length);
        }
        return array.pop() ?? new Float32Array(length);
    }

    instanceElementList: SingletonList<IRenderElement3D>;

    private _vertexBuffers: Array<WebGPUVertexBuffer> = [];
    private _updateData: Array<Float32Array> = [];
    private _updateDataNum: Array<number> = [];
    private _instanceStateInfo: WebGPUInstanceStateInfo;
    drawCount: number;
    updateNums: number;

    constructor() {
        super();
        this.instanceElementList = new SingletonList();
        this.drawCount = 0;
        this.updateNums = 0;
        this.isRender = true;
        //console.log('create instance element3d');
    }

    addUpdateBuffer(vb: WebGPUVertexBuffer, length: number) {
        this._vertexBuffers[this.updateNums] = vb;
        this._updateDataNum[this.updateNums] = length;
        this.updateNums++;
    }

    getUpdateData(index: number, length: number): Float32Array {
        this._updateData[index] = WebGPUInstanceRenderElement3D._instanceBufferCreate(length);
        return this._updateData[index];
    }

    /**
     * 着色器数据是否改变
     * @param context
     */
    protected _isShaderDataChange(context: WebGPURenderContext3D) {
        return true;
    }

    protected _compileShader(context: WebGPURenderContext3D) {
        this._shaderInstances.clear();

        let comDef = this._getShaderInstanceDefines(context);
        comDef.add(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);

        let passes = this.subShader._passes;
        for (let pass of passes) {
            if (pass.pipelineMode !== context.pipelineMode)
                continue;

            if (this.renderShaderData) {
                pass.nodeCommonMap = this.owner._commonUniformMap;
            }
            else {
                pass.nodeCommonMap = null;
            }

            pass.additionShaderData = null;
            if (this.owner) {
                pass.additionShaderData = this.owner._additionShaderDataKeys;
            }

            (pass.moduleData as any).geo = this.geometry;

            let shaderIns = pass.withCompile(comDef) as WebGPUShaderInstance;
            this._shaderInstances.add(shaderIns);
        }

        if (this._shaderInstances.length > 0) {
            this._updateInstanceData();
        }
    }

    private _updateInstanceData() {
        if (this.updateNums != 0)
            this.clearRenderData(); //?
        switch (this.owner.renderNodeType) {
            case BaseRenderType.MeshRender:
                {
                    let worldDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
                    let worldMatFloatStride = worldDeclaration.vertexStride / 4;
                    const worldMatrixData = this.getUpdateData(0, worldMatFloatStride * WebGPUInstanceRenderElement3D.MaxInstanceCount);
                    this.addUpdateBuffer(this._instanceStateInfo.worldInstanceVB, worldMatFloatStride);
                    const insBatches = this.instanceElementList;
                    const elements = insBatches.elements;
                    const count = insBatches.length;
                    this.drawCount = count;
                    this.geometry.instanceCount = this.drawCount;
                    for (let i = 0; i < count; i++) {
                        let element = elements[i] as WebGPURenderElement3D;
                        worldMatrixData.set(element.transform.worldMatrix.elements, i * worldMatFloatStride);
                        element.owner._worldParams.writeTo(worldMatrixData, i * worldMatFloatStride + 16);
                    }

                    const haveLightMap = this.renderShaderData.hasDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP) && this.renderShaderData.hasDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
                    if (haveLightMap) {
                        const lightMapData = this.getUpdateData(1, 4 * WebGPUInstanceRenderElement3D.MaxInstanceCount);
                        for (let i = 0; i < count; i++) { //@ts-ignore
                            const lightmapScaleOffset = elements[i].owner.lightmapScaleOffset;
                            const offset = i * 4;
                            lightMapData[offset] = lightmapScaleOffset.x;
                            lightMapData[offset + 1] = lightmapScaleOffset.y;
                            lightMapData[offset + 2] = lightmapScaleOffset.z;
                            lightMapData[offset + 3] = lightmapScaleOffset.w;
                        }
                        this.addUpdateBuffer(this._instanceStateInfo.lightmapScaleOffsetVB, 4);
                    }
                    break;
                }
            case BaseRenderType.SimpleSkinRender:
                {
                    const worldMatrixData = this.getUpdateData(0, 16 * WebGPUInstanceRenderElement3D.MaxInstanceCount);
                    this.addUpdateBuffer(this._instanceStateInfo.worldInstanceVB, 16);
                    const insBatches = this.instanceElementList;
                    const elements = insBatches.elements;
                    const count = insBatches.length;
                    this.drawCount = count;
                    this.geometry.instanceCount = this.drawCount;
                    for (let i = 0; i < count; i++)
                        worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);

                    const simpleAnimatorData = this.getUpdateData(1, 4 * WebGPUInstanceRenderElement3D.MaxInstanceCount);
                    for (let i = 0; i < count; i++) {
                        const simpleAnimatorParams = elements[i].renderShaderData.getVector(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS);
                        const offset = i * 4;
                        simpleAnimatorData[offset] = simpleAnimatorParams.x;
                        simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
                        simpleAnimatorData[offset + 2] = simpleAnimatorParams.z;
                        simpleAnimatorData[offset + 3] = simpleAnimatorParams.w;
                    }
                    this.addUpdateBuffer(this._instanceStateInfo.simpleAnimatorVB, 4);
                    break;
                }
        }
    }

    /**
     * 设置几何对象
     * @param geometry 
     */
    setGeometry(geometry: WebGPURenderGeometry) {
        if (!this.geometry)
            this.geometry = new WebGPURenderGeometry(geometry.mode, geometry.drawType);
        geometry.cloneTo(this.geometry);
        this.geometry.drawType = DrawType.DrawElementInstance;
        this._instanceStateInfo = WebGPUInstanceRenderElement3D.getInstanceBufferState(this._instanceStateInfo, geometry, this.owner.renderNodeType, this.renderShaderData._defineDatas);
        this.geometry.bufferState = this._instanceStateInfo.state;
        //this.geometry.checkDataFormat = this.geometry.bufferState.isNeedChangeFormat() ? false : true;
    }

    /**
     * 上传几何数据
     * @param command 
     * @param bundle 
     */
    protected _uploadGeometry(command: WebGPURenderCommandEncoder | WebGPURenderBundle) {
        for (let i = 0; i < this.updateNums; i++)
            this._vertexBuffers[i]?.setData(this._updateData[i].buffer, 0, 0, this.drawCount * this._updateDataNum[i] * 4);
        return super._uploadGeometry(command);
    }

    /**
     * 清理单次渲染生成的数据
     */
    clearRenderData(): void {
        this.drawCount = 0;
        this.updateNums = 0;
        this._vertexBuffers.length = 0;
        this._updateData.forEach(data => {
            WebGPUInstanceRenderElement3D._bufferPool.get(data.length).push(data);
        });
        this._updateData.length = 0;
        this._updateDataNum.length = 0;
    }

    /**
     * 回收
     */
    recover() {
        this.instanceElementList.clear();
        WebGPUInstanceRenderElement3D._pool.push(this);
    }
}