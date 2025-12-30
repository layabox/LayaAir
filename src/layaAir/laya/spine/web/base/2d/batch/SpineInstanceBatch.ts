import { BaseRender2DType } from "../../../../../display/SpriteConst";
import { LayaGL } from "../../../../../layagl/LayaGL";
import { IRenderElement2D } from "../../../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IBufferState } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { IBatch2DProvider, BatchManager } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/BatchManager";
import { BufferUsage } from "../../../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../../../utils/SingletonList";
import { ShaderDefines2D } from "../../../../../webgl/shader/d2/ShaderDefines2D";
import { SpineShaderInit } from "../../../../shader/SpineShaderInit";


/**
 * @en SpineInstanceBatch used for efficient rendering Spine instances.
 * @zh SpineInstanceBatch 用于高效渲染 Spine 实例。
 */
export class SpineInstanceBatch implements IBatch2DProvider {
    // _recoverList = new FastSinglelist<IRenderElement2D>();
    _recoverList = new FastSinglelist<SpineInstanceInfo>();

    /**
     * @en Batch render elements according to IBatch2DProvider interface.
     * @param list The list of render elements.
     * @param start The starting index in the list.
     * @param end The ending index in the list (inclusive).
     * @param allowReorder Whether to allow reordering elements for better batching.
     * @zh 根据 IBatch2DProvider 接口批量渲染元素。
     * @param list 渲染元素列表。
     * @param start 列表中的起始索引。
     * @param end 列表中的结束索引（包含）。
     * @param allowReorder 是否允许重新排序元素以获得更好的批处理效果。
     */
    batch(list: FastSinglelist<IRenderElement2D>, start: number, end: number, allowReorder?: boolean): void {
        if (start > end) {
            return;
        }

        let elementArray = list.elements;
        let length = end - start + 1;
        
        // 如果只有一个元素，直接添加
        if (length === 1) {
            list.add(elementArray[start]);
            return;
        }

        // 使用 check 方法进行分组批处理
        let batchStart = start;
        for (let i = start; i < end; i++) {
            let cElement = elementArray[i];
            let nElement = elementArray[i + 1];
            
            // 检查是否可以合并
            if (!this.check(cElement, nElement)) {
                // 不能合并，处理当前批次
                if (i > batchStart) {
                    // 有多个元素可以批处理
                    this._batchInternal(list, batchStart, i - batchStart + 1);
                } else {
                    // 单个元素，直接添加
                    list.add(elementArray[batchStart]);
                }
                batchStart = i + 1;
            }
        }

        // 处理最后一个批次
        if (batchStart <= end) {
            if (end > batchStart) {
                // 有多个元素可以批处理
                this._batchInternal(list, batchStart, end - batchStart + 1);
            } else {
                // 单个元素，直接添加
                list.add(elementArray[batchStart]);
            }
        }
    }

    /**
     * @en Reset the batch state and recover resources.
     * @zh 重置批处理状态并回收资源。
     */
    reset(): void {
        this.recover();
    }

    /**
     * @en Destroy the batch provider and clean up all resources.
     * @zh 销毁批处理提供者并清理所有资源。
     */
    destroy(): void {
        this.recover();
        // 清理回收列表
        this._recoverList.length = 0;
    }

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
        if (left.materialShaderData !== right.materialShaderData) {
            return false;
        }

        if (left.geometry.instanceCount || right.geometry.instanceCount) {
            return false;
        }

        return true;
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
    batchRenderElement(list: FastSinglelist<IRenderElement2D>, start: number, length: number , elementCount:number = 1): void {
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
                    this._batchInternal(list , batchStart + start , i - batchStart);
                } else {
                    // 单个元素，直接添加
                    list.add(elementArray[start + i]);
                }

                batchStart = -1;
            }
        }

        if (batchStart != -1 ) {
            this._batchInternal(list , batchStart + start , length - batchStart);
        } else if (length > 0) {
            // 最后一个元素单独处理
            list.add(elementArray[start + length - 1]);
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
        
        nMatrixInstanceVB.setData(nMatrixData.buffer as ArrayBuffer, 0, 0, instanceCount * 6 * 4);

        simpleAnimatorVB.setData(simpleAnimatorData.buffer as ArrayBuffer, 0, 0, instanceCount * 4 * 4);
    }

    /**
     * @en Organize instance data for batching (internal method).
     * @param list The list of render elements.
     * @param start The starting index in the list.
     * @param length The number of elements to process.
     * @zh 组织实例数据以进行批处理（内部方法）。
     * @param list 渲染元素列表。
     * @param start 列表中的起始索引。
     * @param length 要处理的元素数量。
     */
    _batchInternal(list: FastSinglelist<IRenderElement2D> ,  start: number, length: number ){

        let instanceElement:IRenderElement2D , geometry:IRenderGeometryElement;
        let elementArray: Array<IRenderElement2D> = list.elements;
        //  nMatrix Length = 6 ;
        //  Simple Animator Params Length = 4;

        let nMatrixData: Float32Array = SpineInstanceElement2DTool._instanceBufferCreate( 6 * SpineInstanceElement2DTool.MaxInstanceCount);
        let simpleAnimatorData: Float32Array = SpineInstanceElement2DTool._instanceBufferCreate( 4 * SpineInstanceElement2DTool.MaxInstanceCount);

        let info:SpineInstanceInfo;
        let currentGeometry:IRenderGeometryElement = null;

        let instanceCount = 0;
        for (let i = 0; i < length; i++) {
            let element = elementArray[start + i];
            let shaderData = element.value2DShaderData;
            let originGeo = element.geometry;

            // 如果是第一个元素，或者 geometry 改变了，需要初始化或更新 InstanceInfo
            if (!instanceElement || currentGeometry !== originGeo) {
                // 如果之前有 instanceElement，需要先提交当前批次
                if (instanceElement && instanceCount > 0) {
                    this.updateBuffer(info, nMatrixData, simpleAnimatorData, instanceCount);
                    geometry.instanceCount = instanceCount;
                    list.add(instanceElement);
                    instanceElement = null;
                    instanceCount = 0;
                }

                // 获取或创建统一的 InstanceInfo
                info = SpineInstanceElement2DTool.getInstanceInfo();
                instanceElement = info.element;
                this._recoverList.add(info);
                geometry = instanceElement.geometry;
                currentGeometry = originGeo;

                // 更新 BufferState：重新 applyState 以使用新的 geometry
                let oriBufferState = originGeo.bufferState;
                let vertexArray = oriBufferState._vertexBuffers.slice();
                vertexArray.push(info.nMatrixInstanceVB);
                vertexArray.push(info.simpleAnimatorVB);
                info.state.applyState(vertexArray, oriBufferState._bindedIndexBuffer);
                geometry.bufferState = info.state;

                // 更新 drawParams
                //@ts-ignore
                geometry.drawParams.elements = originGeo.drawParams.elements.slice();
                //@ts-ignore
                geometry.drawParams.length = originGeo.drawParams.length;
                geometry.indexFormat = originGeo.indexFormat;

                // 设置渲染元素属性
                instanceElement.subShader = element.subShader;
                instanceElement.materialShaderData = element.materialShaderData;
                instanceElement.value2DShaderData = element.value2DShaderData;
                instanceElement.renderStateIsBySprite = element.renderStateIsBySprite;
                instanceElement.nodeCommonMap = element.nodeCommonMap;
                instanceElement.value2DShaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
            }

            // 收集实例数据
            let nMatrix_0= shaderData.getVector3(ShaderDefines2D.UNIFORM_NMATRIX_0);
            let nMatrix_1 = shaderData.getVector3(ShaderDefines2D.UNIFORM_NMATRIX_1);
            let nMatrixOffset = instanceCount * 6;
            nMatrixData[nMatrixOffset] = nMatrix_0.x;
            nMatrixData[nMatrixOffset + 1] = nMatrix_0.y;
            nMatrixData[nMatrixOffset + 2] = nMatrix_0.z;
            nMatrixData[nMatrixOffset + 3] = nMatrix_1.x;
            nMatrixData[nMatrixOffset + 4] = nMatrix_1.y;
            nMatrixData[nMatrixOffset + 5] = nMatrix_1.z;

            let simpleAnimatorParams = shaderData.getVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS);
            let offset: number = instanceCount * 4;
            simpleAnimatorData[offset] = simpleAnimatorParams.x;
            simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
            simpleAnimatorData[offset + 2] = simpleAnimatorParams.z;
            simpleAnimatorData[offset + 3] = simpleAnimatorParams.w;

            instanceCount ++;
            geometry.instanceCount = instanceCount;

            // 如果达到最大实例数，提交当前批次并重置
            if (geometry.instanceCount == SpineInstanceElement2DTool.MaxInstanceCount) {
                this.updateBuffer(info , nMatrixData , simpleAnimatorData , geometry.instanceCount);
                list.add(instanceElement);
                instanceElement = null;
                currentGeometry = null;
                instanceCount = 0;
            }
        }

        // 处理剩余的实例
        if (instanceElement && instanceCount > 0) {
            this.updateBuffer(info , nMatrixData , simpleAnimatorData , instanceCount);
            geometry.instanceCount = instanceCount;
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

export interface SpineInstanceInfo {
    element:IRenderElement2D;
    state: IBufferState;
    nMatrixInstanceVB:IVertexBuffer;
    simpleAnimatorVB: IVertexBuffer;
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
     * 统一的 InstanceInfo 池，不再按 geometry 分割
     */
    private static _instanceInfoPool: SpineInstanceInfo[] = [];

    /**
     * @en Get or create a unified SpineInstanceInfo (not bound to specific geometry).
     * @zh 获取或创建统一的 SpineInstanceInfo（不绑定特定几何体）。
     */
    static getInstanceInfo():SpineInstanceInfo{
        let info = SpineInstanceElement2DTool._instanceInfoPool.pop() || SpineInstanceElement2DTool.createInstanceInfo();
        return info;
    }

    /**
     * @en Create a new unified SpineInstanceInfo.
     * @zh 创建一个新的统一 SpineInstanceInfo。
     */
    static createInstanceInfo():SpineInstanceInfo{
        let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        let instanceGeometry = element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles,DrawType.DrawElementInstance);
        let state = LayaGL.renderDeviceFactory.createBufferState();

        let nMatrixInstanceVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        nMatrixInstanceVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 6 * 4);
        nMatrixInstanceVB.vertexDeclaration = SpineShaderInit.instanceNMatrixDeclaration;
        nMatrixInstanceVB.instanceBuffer = true;

        let simpleAnimatorVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        simpleAnimatorVB.setDataLength(SpineInstanceElement2DTool.MaxInstanceCount * 4 * 4);
        simpleAnimatorVB.vertexDeclaration = SpineShaderInit.instanceSimpleAnimatorDeclaration;
        simpleAnimatorVB.instanceBuffer = true;

        let info:SpineInstanceInfo = {
            state,
            element,
            nMatrixInstanceVB,
            simpleAnimatorVB
        };

        return info;
    }

    /**
     * @en Recover a SpineInstanceInfo object to the pool.
     * @param info The SpineInstanceInfo to recover.
     * @zh 回收一个 SpineInstanceInfo 对象到池中。
     * @param info 要回收的 SpineInstanceInfo。
     */
    static recover(info:SpineInstanceInfo){
        let element = info.element;
        if (element.value2DShaderData) {
            element.value2DShaderData.removeDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        }
        element.value2DShaderData = null;
        element.materialShaderData = null;
        element.subShader = null;
        element.nodeCommonMap = null;
        element.geometry.bufferState = null;
        //@ts-ignore
        element.geometry.drawParams.elements = [];
        //@ts-ignore
        element.geometry.drawParams.length = 0;
        
        SpineInstanceElement2DTool._instanceInfoPool.push(info);
    }

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
