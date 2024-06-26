import { Laya } from "../../../Laya";
import { BaseRender2DType } from "../../NodeRender2D/BaseRenderNode2D";
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

export class SpineInstanceBatch implements IBatch2DRender{
    /** @internal */
    static instance: SpineInstanceBatch;

    _recoverList = new FastSinglelist<IRenderElement2D>();

    /**
     * 
     * @param left 
     * @param right 
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

    updateBuffer(info:SpineInstanceInfo , nMatrixData:Float32Array , simpleAnimatorData : Float32Array , instanceCount:number){
        let nMatrixInstanceVB = info.nMatrixInstanceVB;
        let simpleAnimatorVB = info.simpleAnimatorVB;
        
        nMatrixInstanceVB.setData(nMatrixData.buffer, 0, 0, instanceCount * 6 * 4);

        simpleAnimatorVB.setData(simpleAnimatorData.buffer, 0, 0, instanceCount * 4 * 4);
    }

    batch(list: FastSinglelist<IRenderElement2D> ,  start: number, length: number ){

        let instanceElement:IRenderElement2D , geometry:IRenderGeometryElement;
        let elementArray: Array<IRenderElement2D> = list.elements;
        //  nMatrix Length = 6 => 8;
        //  Simple Animator Params Length = 4;
        // let insBatches = this._instanceElementList;

        let nMatrixData: Float32Array = SpineInstanceElement2DTool._instanceBufferCreate( 6 * SpineInstanceElement2DTool.MaxInstanceCount);
        let simpleAnimatorData: Float32Array = SpineInstanceElement2DTool._instanceBufferCreate( 4 * SpineInstanceElement2DTool.MaxInstanceCount);

        let state:IBufferState , info:SpineInstanceInfo;

        let instanceCount = 0;
        for (let i = 0; i < length; i++) {
            let element = elementArray[start + i];
            let shaderData = element.value2DShaderData;;
            if (!instanceElement) {
                instanceElement = SpineInstanceElement2DTool.create();
                this._recoverList.add(instanceElement);
                geometry = instanceElement.geometry;
                instanceCount = geometry.instanceCount = 0;
                let originGeo = element.geometry;
                info = SpineInstanceElement2DTool.getInstanceInfo(originGeo);
                state = info.state;

                geometry.bufferState = state;
                let format = geometry.indexFormat = originGeo.indexFormat;
                // let byteCount = 0;
                let indexCount = originGeo.bufferState._bindedIndexBuffer.indexCount;
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
                geometry.setDrawElemenParams(indexCount , 0);

                instanceElement.subShader = element.subShader;
                instanceElement.materialShaderData = element.materialShaderData;
                instanceElement.value2DShaderData = element.value2DShaderData;
                instanceElement.renderStateIsBySprite = element.renderStateIsBySprite;

                instanceElement.value2DShaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE)
            }

            let nMatrixBuffer = shaderData.getBuffer(SpineShaderInit.NMatrix);
            nMatrixData.set(nMatrixBuffer, instanceCount * 6);    
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


    recover(): void {
        let length = this._recoverList.length;
        let recoverArray = this._recoverList.elements;
        for (let i = 0; i < length; i++) {
            let element = recoverArray[i];
            element.value2DShaderData.removeDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
            SpineInstanceElement2DTool.recover(element);
        }
        this._recoverList.length = 0;
    }
}

Laya.addAfterInitCallback(function() {
    SpineInstanceBatch.instance = new SpineInstanceBatch;
    RenderManager2D.regisBatch(BaseRender2DType.spineSimple,SpineInstanceBatch.instance);
})

export interface SpineInstanceInfo {
    state: IBufferState;
    nMatrixInstanceVB?:IVertexBuffer;
    simpleAnimatorVB?: IVertexBuffer;
}

export class SpineInstanceElement2DTool{

    static MaxInstanceCount = 2048;

    /**
     * get Instance BufferState
     */
    // private static _instanceBufferStateMap: IBufferState[] = [];
    private static _instanceBufferInfoMap: Map<IRenderGeometryElement,SpineInstanceInfo>  = new Map;

    static getInstanceInfo(geometry:IRenderGeometryElement):SpineInstanceInfo{
        let info = SpineInstanceElement2DTool._instanceBufferInfoMap.get(geometry);
        if (!info) {
            let state = LayaGL.renderDeviceFactory.createBufferState();
            info = {state};

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

            SpineInstanceElement2DTool._instanceBufferInfoMap.set(geometry,info);
        }

        return info;
    }


    /**
     * @internal
     */
    private static _pool: IRenderElement2D[] = [];

    static create(): IRenderElement2D {
        let element = this._pool.pop() || LayaGL.render2DRenderPassFactory.createRenderElement2D();
        if (!element.geometry) {
            element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles,DrawType.DrawElementInstance);
        }
        return element;
    }

    static recover(element:IRenderElement2D){
        element.value2DShaderData = null;
        element.materialShaderData = null;
        element.subShader = null;
        element.geometry.clearRenderParams();
        this._pool.push(element);
    }

    /**
     * pool of Buffer
     * @internal
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
    // geometry: IRenderGeometryElement;
    // materialShaderData: ShaderData;
    // value2DShaderData: ShaderData;
    // subShader: SubShader;
    // renderStateIsBySprite: boolean;

    // _instanceElementList: FastSinglelist<IRenderElement2D>;

    // private _vertexBuffers: Array<IVertexBuffer> = [];

    // private _updateData: Array<Float32Array> = [];

    // private _updateDataNum: Array<number> = [];

    // /** 绘制次数 */
    // drawCount: number = 0;
    // /** 更新数 */
    // updateNums: number = 0;

    // constructor(){
    //     this._instanceElementList = new FastSinglelist;
    // }

    // recover(){
    //     SpineInstanceElement2DTool._pool.push(this);
    //     this._instanceElementList.clear();
    // }

    // destroy(): void {
    //     this.geometry = null;
    //     this.materialShaderData = null;
    //     this.materialShaderData = null;
    //     this.value2DShaderData = null;
    //     this.subShader =  null;
    // }
    
    // addUpdateBuffer(vb: IVertexBuffer, length: number) {
    //     this._vertexBuffers[this.updateNums] = vb;
    //     this._updateDataNum[this.updateNums] = length;
    //     this.updateNums++;
    // }

    // getUpdateData(index: number, length: number): Float32Array {
    //     let data = this._updateData[index] = SpineInstanceElement2DTool._instanceBufferCreate(length);
    //     return data;
    // }

    // private _updateInstanceData() {
        //  nMatrix Length = 6;
        //  Simple Animator Params Length = 4;
        // let insBatches = this._instanceElementList;
        // let elements = insBatches.elements;
        // let count: number = insBatches.length;
        // this.drawCount = count;
        // this.geometry.instanceCount = this.drawCount;
        
        // let nMatrixData: Float32Array = this.getUpdateData(0, 8 * SpineInstanceElement2D.MaxInstanceCount);
        // this.addUpdateBuffer(this._instanceStateInfo.worldInstanceVB, 8);
        // let simpleAnimatorData: Float32Array = this.getUpdateData(1, 4 * SpineInstanceElement2D.MaxInstanceCount);
        // this.addUpdateBuffer(this._instanceStateInfo.simpleAnimatorVB, 4);
        
        // for (let i: number = 0; i < count; i++){
        //     let shaderData = elements[i].value2DShaderData;;
        //     let nMatrixBuffer = shaderData.getBuffer(SpineShaderInit.NMatrix);
        //     nMatrixData.set(nMatrixBuffer, i * 8);    
        //     //simpleAnimationData
        //     let simpleAnimatorParams = shaderData.getVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS);
        //     let offset: number = i * 4;
        //     simpleAnimatorData[offset] = simpleAnimatorParams.x;
        //     simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
        //     simpleAnimatorData[offset + 2] = simpleAnimatorParams.z;
        //     simpleAnimatorData[offset + 3] = simpleAnimatorParams.w;
        // }
    // }
}