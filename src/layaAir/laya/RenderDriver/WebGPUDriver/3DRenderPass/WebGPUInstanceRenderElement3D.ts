import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { MeshSprite3DShaderDeclaration } from "../../../d3/core/MeshSprite3DShaderDeclaration";
import { RenderableSprite3D } from "../../../d3/core/RenderableSprite3D";
import { SimpleSkinnedMeshSprite3D } from "../../../d3/core/SimpleSkinnedMeshSprite3D";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
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
    inUse: boolean;
    state: WebGPUBufferState;
    worldInstanceVB?: WebGPUVertexBuffer;
    lightmapScaleOffsetVB?: WebGPUVertexBuffer;
    simpleAnimatorVB?: WebGPUVertexBuffer;
}

export class WebGPUInstanceRenderElement3D extends WebGPURenderElement3D {
    private static _instanceBufferStateMap: Map<number, WebGPUInstanceStateInfo[]> = new Map();

    static getInstanceBufferState(geometry: WebGPURenderGeometry, renderType: number, spriteDefine: WebDefineDatas) {
        const _initStateInfo = (stateinfo: WebGPUInstanceStateInfo) => {
            const oriBufferState = geometry.bufferState;
            const vertexArray = oriBufferState._vertexBuffers.slice();
            const worldMatVertex = new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
            worldMatVertex.setDataLength(this.MaxInstanceCount * 16 * 4);
            worldMatVertex.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
            worldMatVertex.instanceBuffer = true;
            vertexArray.push(worldMatVertex);
            stateinfo.worldInstanceVB = worldMatVertex;
            switch (renderType) {
                case BaseRenderType.MeshRender:
                    if (spriteDefine.has(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1)) {
                        const instanceLightMapVertexBuffer = new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
                        instanceLightMapVertexBuffer.setDataLength(this.MaxInstanceCount * 4 * 4);
                        instanceLightMapVertexBuffer.vertexDeclaration = VertexMesh.instanceLightMapScaleOffsetDeclaration;
                        instanceLightMapVertexBuffer.instanceBuffer = true;
                        vertexArray.push(instanceLightMapVertexBuffer);
                        stateinfo.lightmapScaleOffsetVB = instanceLightMapVertexBuffer;
                    }
                    break;
                case BaseRenderType.SimpleSkinRender:
                    const instanceSimpleAnimatorBuffer = new WebGPUVertexBuffer(BufferTargetType.ARRAY_BUFFER, BufferUsage.Dynamic);
                    instanceSimpleAnimatorBuffer.setDataLength(this.MaxInstanceCount * 4 * 4);
                    instanceSimpleAnimatorBuffer.vertexDeclaration = VertexMesh.instanceSimpleAnimatorDeclaration;
                    instanceSimpleAnimatorBuffer.instanceBuffer = true;
                    vertexArray.push(instanceSimpleAnimatorBuffer);
                    stateinfo.simpleAnimatorVB = instanceSimpleAnimatorBuffer;
                    break;
            }
            stateinfo.state.applyState(vertexArray, geometry.bufferState._bindedIndexBuffer);
        };

        const stateInfos = this._instanceBufferStateMap.get(geometry._id);
        if (!stateInfos) {
            const stateInfo = { inUse: true, state: new WebGPUBufferState() };
            _initStateInfo(stateInfo);
            this._instanceBufferStateMap.set(geometry._id, [stateInfo]);
            return stateInfo;
        }
        for (let i = stateInfos.length - 1; i > -1; i--) {
            if (!stateInfos[i].inUse) {
                stateInfos[i].inUse = true;
                return stateInfos[i];
            }
        }
        const stateInfo = { inUse: true, state: new WebGPUBufferState() };
        _initStateInfo(stateInfo);
        stateInfos.push(stateInfo);
        return stateInfo;
    }

    /**
     * max instance count
     */
    static MaxInstanceCount: number = 1024;

    /**
     * @internal
     */
    private static _pool: WebGPUInstanceRenderElement3D[] = [];
    static create(): WebGPUInstanceRenderElement3D {
        let element = this._pool.pop() || new WebGPUInstanceRenderElement3D();
        return element;
    }

    /**
     * pool of Buffer
     * @internal
     */
    private static _bufferPool: Map<number, Float32Array[]> = new Map();

    static _instanceBufferCreate(length: number): Float32Array {
        let array = this._bufferPool.get(length);
        if (!array) {
            this._bufferPool.set(length, []);
            array = this._bufferPool.get(length);
        }

        const element = array.pop() || new Float32Array(length);
        return element;
    }

    _instanceElementList: SingletonList<IRenderElement3D>;

    private _vertexBuffers: Array<WebGPUVertexBuffer> = [];
    private _updateData: Array<Float32Array> = [];
    private _updateDataNum: Array<number> = [];
    private _instanceStateInfo: WebGPUInstanceStateInfo;
    drawCount: number;
    updateNums: number;

    constructor() {
        super();
        this.objectName = 'WebGPUInstanceRenderElement3D';
        this._instanceElementList = new SingletonList();
        this.drawCount = 0;
        this.updateNums = 0;
        this.isRender = true;
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
        //将场景或全局配置定义准备好
        const compileDefine = WebGPURenderElement3D._compileDefine;
        if (this._sceneData)
            this._sceneData._defineDatas.cloneTo(compileDefine);
        else if (context.globalConfigShaderData)
            context.globalConfigShaderData.cloneTo(compileDefine);

        //添加相机数据定义
        if (this._cameraData)
            compileDefine.addDefineDatas(this._cameraData._defineDatas);

        //编译着色器，创建uniform缓冲区
        if (this.renderShaderData)
            compileDefine.addDefineDatas(this.renderShaderData.getDefineData());
        if (this.materialShaderData)
            compileDefine.addDefineDatas(this.materialShaderData._defineDatas);

        compileDefine.add(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
        this._updateInstanceData();

        //查找着色器对象缓存
        for (let i = 0; i < this._passNum; i++) {
            if (!this._shaderPass[i].moduleData.getCacheShader(compileDefine)) {
                const { uniformMap, arrayMap } = this._collectUniform(compileDefine); //@ts-ignore
                this._shaderPass[i].uniformMap = uniformMap; //@ts-ignore
                this._shaderPass[i].arrayMap = arrayMap;
            }

            //获取着色器实例，先查找缓存，如果没有则创建
            const shaderInstance = this._shaderPass[i].withCompile(compileDefine) as WebGPUShaderInstance;
            this._shaderInstance[i] = this._shaderInstances[this._passIndex[i]] = shaderInstance;

            //创建uniform缓冲区
            if (i === 0) {
                this._sceneData?.createUniformBuffer(shaderInstance.uniformInfo[0], true);
                this._cameraData?.createUniformBuffer(shaderInstance.uniformInfo[1], true);
                this.renderShaderData?.createUniformBuffer(shaderInstance.uniformInfo[2]);
                this.materialShaderData?.createUniformBuffer(shaderInstance.uniformInfo[3]);
            }
        }

        //重编译着色器后，清理绑定组缓存
        this.renderShaderData?.clearBindGroup();
        this.materialShaderData?.clearBindGroup();
    }

    private _updateInstanceData() {
        if (this.updateNums != 0)
            this.clearRenderData(); //?
        switch (this.owner.renderNodeType) {
            case BaseRenderType.MeshRender:
                {
                    const worldMatrixData = this.getUpdateData(0, 16 * WebGPUInstanceRenderElement3D.MaxInstanceCount);
                    this.addUpdateBuffer(this._instanceStateInfo.worldInstanceVB, 16);
                    const insBatches = this._instanceElementList;
                    const elements = insBatches.elements;
                    const count = insBatches.length;
                    this.drawCount = count;
                    this.geometry.instanceCount = this.drawCount;
                    for (let i = 0; i < count; i++)
                        worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);

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
                    const insBatches = this._instanceElementList;
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
        this._instanceStateInfo = WebGPUInstanceRenderElement3D.getInstanceBufferState(geometry, this.owner.renderNodeType, this.renderShaderData._defineDatas);
        this.geometry.bufferState = this._instanceStateInfo.state;
    }

    /**
     * 上传几何数据
     * @param command 
     * @param bundle 
     */
    protected _uploadGeometry(command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle) {
        for (let i = 0; i < this.updateNums; i++)
            this._vertexBuffers[i]?.setData(this._updateData[i].buffer, 0, 0, this.drawCount * this._updateDataNum[i] * 4);
        super._uploadGeometry(command, bundle);
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
        WebGPUInstanceRenderElement3D._pool.push(this);
        this._instanceStateInfo.inUse = false;
        this._instanceElementList.clear();
    }

    /**
     * 销毁
     */
    destroy(): void {
        super.destroy();
    }
}