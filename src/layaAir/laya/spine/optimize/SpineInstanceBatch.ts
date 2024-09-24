import { Laya } from "../../../Laya";
import { BaseRender2DType, BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IBatch2DRender, RenderManager2D } from "../../NodeRender2D/RenderManager2D";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { LayaGL } from "../../layagl/LayaGL";
import { FastSinglelist } from "../../utils/SingletonList";
import { SpineShaderInit } from "../material/SpineShaderInit";

/**
 * @en SpineInstanceBatch used for efficient rendering Spine instances.
 * @zh SpineInstanceBatch 用于高效渲染 Spine 实例。
 */
export class SpineInstanceBatch implements IBatch2DRender{
    /**
     * @en The instance of SpineInstanceBatch.
     * @zh SpineInstanceBatch 的实例。
     */
    static instance: SpineInstanceBatch;

    // _recoverList = new FastSinglelist<IRenderElement2D>();
    _recoverList = new FastSinglelist<SpineInstanceInfo>();

    /**
     * @en Check if two render elements can be merged.
     * @param left The left render element to compare.
     * @param right The right render element to compare.
     * @returns True if the elements can be merged, false otherwise.
     * @zh 检测两个渲染元素是否可以合并。
     * @param left 要比较的左侧渲染元素。
     * @param right 要比较的右侧渲染元素。
     * @returns 如果元素可以合并则返回 true，否则返回 false。
     */
    check(left:IRenderElement2D , right:IRenderElement2D):boolean{
        if (left.materialShaderData != right.materialShaderData
            || left.geometry.instanceCount
            || right.geometry.instanceCount
            // || !left.value2DShaderData.hasDefine(SpineShaderInit.SPINE_GPU_INSTANCE)
            // || !right.value2DShaderData.hasDefine(SpineShaderInit.SPINE_GPU_INSTANCE)
        )
            return false

        return true
    }

    /**
     * @en Batch render elements.
     * @param list The list of render elements.
     * @param start The starting index in the list.
     * @param length The number of elements to process.
     * @zh 批量渲染元素。
     * @param list 渲染元素列表。
     * @param start 列表中的起始索引。
     * @param length 要处理的元素数量。
     */
    batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number): void {
        let elementArray = list.elements;
        let batchStart = -1;
        for (let i = 0; i < length - 1; i++) {
            let index = start + i;
            let cElement = elementArray[index];
            let nElement = elementArray[index + 1];
            
            if(this.check(cElement , nElement)){
                if (batchStart == -1 ) {
                    batchStart = i;
                }
            }else{
                if (batchStart != -1 ) {
                    this.batch(list , batchStart + start , i - batchStart);
                }

                batchStart = 0;
            }
        }

        if (batchStart != -1 ) {
            this.batch(list , batchStart + start , length - batchStart);
        }
        
    }

    /**
     * @en Update the instance buffer with new data.
     * @param info The SpineInstanceInfo object.
     * @param nMatrixData The new matrix data.
     * @param simpleAnimatorData The new animator data.
     * @param instanceCount The number of instances.
     * @zh 使用新数据更新实例缓冲区。
     * @param info SpineInstanceInfo 对象。
     * @param nMatrixData 新的矩阵数据。
     * @param simpleAnimatorData 新的动画器数据。
     * @param instanceCount 实例数量。
     */
    updateBuffer(info:SpineInstanceInfo , nMatrixData:Float32Array , simpleAnimatorData : Float32Array , instanceCount:number){
        let nMatrixInstanceVB = info.nMatrixInstanceVB;
        let simpleAnimatorVB = info.simpleAnimatorVB;
        
        nMatrixInstanceVB.setData(nMatrixData.buffer, 0, 0, instanceCount * 6 * 4);

        simpleAnimatorVB.setData(simpleAnimatorData.buffer, 0, 0, instanceCount * 4 * 4);
    }

    /**
     * @en Organize instance data for batching.
     * @param list The list of render elements.
     * @param start The starting index in the list.
     * @param length The number of elements to process.
     * @zh 组织实例数据以进行批处理。
     * @param list 渲染元素列表。
     * @param start 列表中的起始索引。
     * @param length 要处理的元素数量。
     */
    batch(list: FastSinglelist<IRenderElement2D> ,  start: number, length: number ){

        let instanceElement:IRenderElement2D , geometry:IRenderGeometryElement;
        let elementArray: Array<IRenderElement2D> = list.elements;
        //  nMatrix Length = 6 ;
        //  Simple Animator Params Length = 4;

        let nMatrixData: Float32Array = SpineInstanceElement2DTool._instanceBufferCreate( 6 * SpineInstanceElement2DTool.MaxInstanceCount);
        let simpleAnimatorData: Float32Array = SpineInstanceElement2DTool._instanceBufferCreate( 4 * SpineInstanceElement2DTool.MaxInstanceCount);

        let state:IBufferState , info:SpineInstanceInfo;

        let instanceCount = 0;
        for (let i = 0; i < length; i++) {
            let element = elementArray[start + i];
            let shaderData = element.value2DShaderData;
            if (!instanceElement) {
                let originGeo = element.geometry;
                info = SpineInstanceElement2DTool.getInstanceInfo(originGeo);
                // instanceElement = SpineInstanceElement2DTool.getInstanceInfo();
                instanceElement = info.element;//SpineInstanceElement2DTool.getInstanceInfo();
                this._recoverList.add(info);
                // this._recoverList.add(instanceElement);
                geometry = instanceElement.geometry;
                instanceCount = geometry.instanceCount = 0;
                // let format = geometry.indexFormat = originGeo.indexFormat;
                // if (!geometry.bufferState) {
                //     state = info.state;
                //     geometry.bufferState = state;
                // }
                // let byteCount = 0;
                // let indexCount = originGeo.bufferState._bindedIndexBuffer.indexCount;
                // TODO
                // let indexBuffer = originGeo.bufferState._bindedIndexBuffer;
                // switch (format) {
                //     case IndexFormat.UInt16:
                //         byteCount = 2;                        
                //         break;
                //     case IndexFormat.UInt32:
                //         byteCount = 4;                        
                //         break;
                //     case IndexFormat.UInt8:
                //         byteCount = 1;                        
                //         break;
                // }
                // geometry.setDrawElemenParams(indexCount , 0);

                instanceElement.subShader = element.subShader;
                instanceElement.materialShaderData = element.materialShaderData;
                instanceElement.value2DShaderData = element.value2DShaderData;
                instanceElement.renderStateIsBySprite = element.renderStateIsBySprite;
                instanceElement.nodeCommonMap = element.nodeCommonMap;
                instanceElement.value2DShaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE);

            }

            let nMatrix_0= shaderData.getVector3(BaseRenderNode2D.NMATRIX_0);
            let nMatrix_1 = shaderData.getVector3(BaseRenderNode2D.NMATRIX_1);
            let nMatrixOffset = instanceCount * 6;
            nMatrixData[nMatrixOffset] = nMatrix_0.x;
            nMatrixData[nMatrixOffset + 1] = nMatrix_0.y;
            nMatrixData[nMatrixOffset + 2] = nMatrix_0.z;
            nMatrixData[nMatrixOffset + 3] = nMatrix_1.x;
            nMatrixData[nMatrixOffset + 4] = nMatrix_1.y;
            nMatrixData[nMatrixOffset + 5] = nMatrix_1.z;
            // nMatrixData.set(nMatrixBuffer, instanceCount * 6);    
            //simpleAnimationData
            let simpleAnimatorParams = shaderData.getVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS);
            let offset: number = instanceCount * 4;
            simpleAnimatorData[offset] = simpleAnimatorParams.x;
            simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
            simpleAnimatorData[offset + 2] = simpleAnimatorParams.z;
            simpleAnimatorData[offset + 3] = simpleAnimatorParams.w;

            instanceCount ++;
            geometry.instanceCount = instanceCount;
            if (geometry.instanceCount == SpineInstanceElement2DTool.MaxInstanceCount) {
                this.updateBuffer(info , nMatrixData , simpleAnimatorData , geometry.instanceCount);
                list.add(instanceElement);
                instanceElement = null;
            }
        }

        // geometry.instanceCount = length;

        if (instanceElement) {
            this.updateBuffer(info , nMatrixData , simpleAnimatorData , geometry.instanceCount);
            list.add(instanceElement);
        }

        SpineInstanceElement2DTool._instanceBufferRecover(nMatrixData);
        SpineInstanceElement2DTool._instanceBufferRecover(simpleAnimatorData);
    }

    /**
     * @en Recover instance data.
     * @zh 回收实例数据。
     */
    recover(): void {
        let length = this._recoverList.length;
        let recoverArray = this._recoverList.elements;
        for (let i = 0; i < length; i++) {
            // let element = recoverArray[i];
            // SpineInstanceElement2DTool.recover(element);
            let info = recoverArray[i];
            SpineInstanceElement2DTool.recover(info);
        }
        this._recoverList.length = 0;
    }
}

Laya.addAfterInitCallback(function() {
    SpineInstanceBatch.instance = new SpineInstanceBatch;
    RenderManager2D.regisBatch(BaseRender2DType.spineSimple,SpineInstanceBatch.instance);
})

export interface SpineInstanceInfo {
    element:IRenderElement2D;
    source:IRenderGeometryElement;
    state: IBufferState;
    nMatrixInstanceVB?:IVertexBuffer;
    simpleAnimatorVB?: IVertexBuffer;
}

/**
 * @en Tool class for managing Spine instance elements in 2D rendering.
 * @zh 用于管理 2D 渲染中的 Spine 实例元素的工具类。
 */
export class SpineInstanceElement2DTool{

    /**
     * @en Maximum number of instances that can be batched.
     * @zh 可以批处理的最大实例数量。
     */
    static MaxInstanceCount = 2048;

    /**
     * get Instance BufferState
     */
    // private static _instanceBufferStateMap: IBufferState[] = [];
    private static _instanceBufferInfoMap: Map<IRenderGeometryElement,SpineInstanceInfo[]>  = new Map;

    /**
     * @en Get or create a SpineInstanceInfo for a given geometry.
     * @param geometry The render geometry element.
     * @zh 获取或创建给定几何体的 SpineInstanceInfo。
     * @param geometry 渲染几何体元素。
     */
    static getInstanceInfo(geometry:IRenderGeometryElement):SpineInstanceInfo{
        let infos = SpineInstanceElement2DTool._instanceBufferInfoMap.get(geometry);
        if (!infos) {
            infos = [];
            SpineInstanceElement2DTool._instanceBufferInfoMap.set(geometry , infos);
        }
        let info = infos.pop()||SpineInstanceElement2DTool.createInstanceInfo(geometry);
        // if (!info) {
            // let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            // element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles,DrawType.DrawElementInstance);
            // let state = LayaGL.renderDeviceFactory.createBufferState();

            // let info:SpineInstanceInfo  = {state , element};

            // let oriBufferState = geometry.bufferState;
            // let vertexArray = oriBufferState._vertexBuffers.slice();

            // let nMatrixInstanceVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            // nMatrixInstanceVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 16 * 4)
            // nMatrixInstanceVB.vertexDeclaration = SpineShaderInit.instanceNMatrixDeclaration;
            // nMatrixInstanceVB.instanceBuffer = true;
            // vertexArray.push(nMatrixInstanceVB);
            // info.nMatrixInstanceVB = nMatrixInstanceVB;

            
            // let simpleAnimatorVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            // simpleAnimatorVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 4 * 4)
            // simpleAnimatorVB.vertexDeclaration = SpineShaderInit.instanceSimpleAnimatorDeclaration;
            // simpleAnimatorVB.instanceBuffer = true;
            // vertexArray.push(simpleAnimatorVB);
            // info.simpleAnimatorVB = simpleAnimatorVB;
            // state.applyState(vertexArray,geometry.bufferState._bindedIndexBuffer);
            
            // element.geometry.bufferState = state;
            // SpineInstanceElement2DTool._instanceBufferInfoMap.set(geometry,info);
        // }

        return info;
    }

    /**
     * @en Create a new SpineInstanceInfo for a given geometry.
     * @param geometry The render geometry element.
     * @zh 为给定的几何体创建一个新的 SpineInstanceInfo。
     * @param geometry 渲染几何体元素。
     */
    static createInstanceInfo(geometry:IRenderGeometryElement){
        let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        let instanceGeometry = element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles,DrawType.DrawElementInstance);
        let state = LayaGL.renderDeviceFactory.createBufferState();

        let info:SpineInstanceInfo  = {state , element , source : geometry};

        let oriBufferState = geometry.bufferState;
        let vertexArray = oriBufferState._vertexBuffers.slice();

        let nMatrixInstanceVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        nMatrixInstanceVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 16 * 4)
        nMatrixInstanceVB.vertexDeclaration = SpineShaderInit.instanceNMatrixDeclaration;
        nMatrixInstanceVB.instanceBuffer = true;
        vertexArray.push(nMatrixInstanceVB);
        info.nMatrixInstanceVB = nMatrixInstanceVB;

        
        let simpleAnimatorVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        simpleAnimatorVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 4 * 4)
        simpleAnimatorVB.vertexDeclaration = SpineShaderInit.instanceSimpleAnimatorDeclaration;
        simpleAnimatorVB.instanceBuffer = true;
        vertexArray.push(simpleAnimatorVB);
        info.simpleAnimatorVB = simpleAnimatorVB;

        state.applyState(vertexArray,geometry.bufferState._bindedIndexBuffer);
        //@ts-ignore
        instanceGeometry.drawParams.elements = geometry.drawParams.elements.slice();
        //@ts-ignore
        instanceGeometry.drawParams.length = geometry.drawParams.length;

        instanceGeometry.indexFormat = geometry.indexFormat;

        // instanceGeometry.setDrawElemenParams(indexCount , 0);

        instanceGeometry.bufferState = state;
        return info;
    }

    /**
     * @en Recover a SpineInstanceInfo object.
     * @param info The SpineInstanceInfo to recover.
     * @zh 回收一个 SpineInstanceInfo 对象。
     * @param info 要回收的 SpineInstanceInfo。
     */
    static recover(info:SpineInstanceInfo){
        let element = info.element;
        element.value2DShaderData.removeDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        element.value2DShaderData = null;
        element.materialShaderData = null;
        element.subShader = null;
        element.nodeCommonMap = null;
        let infos = SpineInstanceElement2DTool._instanceBufferInfoMap.get(info.source);
        infos.push(info);
        // element.geometry.clearRenderParams();
    }

    /**
     * @internal
     */
    private static _pool: IRenderElement2D[] = [];

    // static create(): IRenderElement2D {
    //     let element = this._pool.pop() || LayaGL.render2DRenderPassFactory.createRenderElement2D();
        // if (!element.geometry) {
        //     element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles,DrawType.DrawElementInstance);
        // }
        // return element;
    // }

    // static recover(element:IRenderElement2D){
    //     element.value2DShaderData = null;
    //     element.materialShaderData = null;
    //     element.subShader = null;
    //     element.geometry.clearRenderParams();
    //     this._pool.push(element);
    // }

    /**
     * pool of Buffer
     */
    private static _bufferPool: Float32Array[][] = [];

    static _instanceBufferCreate(length: number): Float32Array {
        let array = SpineInstanceElement2DTool._bufferPool[length];
        if (!array) {
            array = SpineInstanceElement2DTool._bufferPool[length] = [];
        }

        let element = array.pop() || new Float32Array(length);
        return element;
    }

    static _instanceBufferRecover(float32:Float32Array){
        let length = float32.length;
        let array = SpineInstanceElement2DTool._bufferPool[length];
        if (!array) {
            array = SpineInstanceElement2DTool._bufferPool[length] = [];
        }
        array.push(float32);
    }
}