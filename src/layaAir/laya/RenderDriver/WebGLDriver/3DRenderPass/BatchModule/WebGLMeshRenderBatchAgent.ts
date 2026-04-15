import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { CameraCullInfo, ShadowCullInfo } from "../../../../d3/shadowMap/ShadowSliceData";
import { FastSinglelist, SingletonList } from "../../../../utils/SingletonList";
import { RenderCullUtil } from "../../../DriverCommon/RenderCullUtil";
import { RenderListQueue } from "../../../DriverCommon/RenderListQueue";
import { IRenderElement3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { BatchCullMode, IBatchModuleAgent, IModuleAgentResource } from "../../../DriverDesign/3DRenderPass/IBatchModuleAgent";
import { WebBaseRenderNode } from "../../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGLInstanceRenderElement3D } from "./WebGLInstanceRenderElement3D";
import { WebGLRenderContext3D } from "../WebGLRenderContext3D";
import { WebGLRenderElement3D } from "../WebGLRenderElement3D";
export class BatchMark {
    /**@internal */
    updateMark: number = -1;
    /**@internal */
    indexInList: number = -1;
    /**@internal */
    batched: boolean = false;

    /**@internal */
    _curBindElementIndex: number = 0;

    _cacheRenderElement: WebGLInstanceRenderElement3D[] = [];

    constructor() {

    }

    release() {
        for (var i = 0; i < this._cacheRenderElement.length; i++) {
            this._cacheRenderElement[i].destroy();
        }
        this._cacheRenderElement = null;
    }
}

export class WebGLBatchQueue implements IModuleAgentResource {
    opaqueQueue: RenderListQueue;
    opaqueList: FastSinglelist<WebGLRenderElement3D>;
    transparentQueue: RenderListQueue;
    transparentList: FastSinglelist<IRenderElement3D>;
    opaqueCustomSort: boolean = false;
    transCustomSort: boolean = false;
    constructor(createTransList: boolean) {
        this.opaqueQueue = new RenderListQueue(false)
        this.opaqueList = this.opaqueQueue.elements as FastSinglelist<WebGLRenderElement3D>;

        if (createTransList) {
            this.transparentQueue = new RenderListQueue(true);
            this.transparentList = this.transparentQueue.elements as FastSinglelist<WebGLRenderElement3D>;
        }
    }


    clearList() {
        this.opaqueList.length = 0;
        this.transparentList && (this.transparentList.length = 0);
    }

    release() {
        if (this.transparentList) {
            this.transparentQueue.destroy();
            this.transparentList = null;
        }

        this.opaqueQueue.destroy();
        this.opaqueList = null;
    }

}

export class WebGLMeshRenderBatchAgent implements IBatchModuleAgent {
    protected _list: SingletonList<BaseRender>;
    protected _baseRenderList: SingletonList<WebBaseRenderNode>;


    protected _batchOpaqueMarks: any[] = [];


    //裁剪信息以及合批信息
    private _cameraCullInfo: CameraCullInfo[];
    _mainBatchQueue: FastSinglelist<WebGLBatchQueue>;

    //裁剪信息以及合批信息
    private _dirShadowCullInfo: ShadowCullInfo[];
    _shadowBatchQueue: FastSinglelist<WebGLBatchQueue>;

    //裁剪信息以及合批信息
    private _spotCullInfo: CameraCullInfo[];
    _spotBatchQueue: FastSinglelist<WebGLBatchQueue>;

    private _updateCountMark: number = 0;
    constructor() {
        this._mainBatchQueue = new FastSinglelist();
        this._shadowBatchQueue = new FastSinglelist();
        this._spotBatchQueue = new FastSinglelist();
        this._list = new SingletonList();
        this._baseRenderList = new SingletonList();
    }

    protected _canBatch(element: WebGLRenderElement3D) {
        return element.materialRenderQueue < 2500 && element.canDynamicBatch && element.subShader?._owner._enableInstancing;
    }
    protected _getBatchMark(element: WebGLRenderElement3D) {
        const renderNode = element.owner;
        const geometry = element.geometry;

        const invertFrontFace = element.transform ? element.transform._isFrontFaceInvert : false;
        const invertFrontFaceFlag = invertFrontFace ? 1 : 0;
        const receiveShadowFlag = renderNode.receiveShadow ? 1 : 0;
        //@ts-ignore
        const geometryFlag = geometry._id;
        const materialFlag = element.materialId;

        const renderId = (materialFlag << 17) + (geometryFlag << 2) + (invertFrontFaceFlag << 1) + (receiveShadowFlag);
        const reflectFlag = (renderNode.probeReflection ? renderNode.probeReflection._id : -1) + 1;
        const lightmapFlag = renderNode.lightmapIndex + 1;
        const lightProbeFlag = (renderNode.volumetricGI ? renderNode.volumetricGI._id : -1) + 1;
        const giId = (reflectFlag << 10) + (lightmapFlag << 20) + lightProbeFlag;
        const data = this._batchOpaqueMarks[renderId] || (this._batchOpaqueMarks[renderId] = {});
        return data[giId] || (data[giId] = new BatchMark());
    }

    protected _changeBatchMark(renderNode: WebBaseRenderNode) {
        let elements = renderNode.renderelements as WebGLRenderElement3D[];
        for (var i = 0; i < elements.length; i++) {
            let element = elements[i];
            if (this._canBatch(element)) {
                let mark = this._getBatchMark(elements[i]);
                element.customData = mark;
            } else {
                element.customData = null;
            }
        }
    }

    protected _opaqueInstanceBatch(elements: SingletonList<WebGLRenderElement3D>) {
        const elementCount = elements.length;
        const elementArray = elements.elements;
        elements.length = 0;
        this._updateCountMark++;
        for (let i = 0; i < elementCount; i++) {
            const element = elementArray[i];

            if (element.customData) {
                const instanceMark = element.customData as BatchMark;
                if (this._updateCountMark == instanceMark.updateMark) {
                    const instanceIndex = instanceMark.indexInList;
                    if (instanceMark.batched) {
                        const originElement = <WebGLInstanceRenderElement3D>elementArray[instanceIndex];
                        const instanceElements = originElement.instanceElementList;
                        // 达到 最大 instance 数量 放弃合并 // todo
                        if (instanceElements.length === WebGLInstanceRenderElement3D.MaxInstanceCount) {
                            instanceMark.indexInList = elements.length;
                            instanceMark.batched = false;
                            instanceMark._curBindElementIndex++;
                            elements.add(element);
                        } else {
                            // 加入合并队列
                            instanceElements.add(element);
                        }
                    } else {
                        const originElement = elementArray[instanceIndex];
                        // 替换 renderElement
                        if (!instanceMark._cacheRenderElement[instanceMark._curBindElementIndex]) {
                            instanceMark._cacheRenderElement[instanceMark._curBindElementIndex] = new WebGLInstanceRenderElement3D();
                        }
                        const instanceRenderElement = instanceMark._cacheRenderElement[instanceMark._curBindElementIndex];
                        instanceRenderElement.subShader = element.subShader;
                        instanceRenderElement.materialShaderData = element.materialShaderData;
                        instanceRenderElement.materialRenderQueue = element.materialRenderQueue;
                        instanceRenderElement.renderShaderData = element.renderShaderData;
                        instanceRenderElement.owner = element.owner;
                        instanceRenderElement.setGeometry(element.geometry);

                        const list = instanceRenderElement.instanceElementList;
                        list.length = 0;
                        list.add(originElement);
                        list.add(element);
                        elementArray[instanceIndex] = instanceRenderElement;
                        instanceMark.batched = true;
                    }
                } else {
                    instanceMark.updateMark = this._updateCountMark;
                    instanceMark.indexInList = elements.length;
                    instanceMark.batched = false;
                    instanceMark._curBindElementIndex = 0;
                    elements.add(element);
                }
            } else {
                elements.add(element);//cant batch
            }
        }
    }

    protected _transparentInstanceBatch(element: SingletonList<WebGLRenderElement3D>) {
        //TODO
    }


    create(): void {

    }

    addRenderNode(object: BaseRender): boolean {
        this._list.add(object);
        let baseNode = object._baseRenderNode as WebBaseRenderNode;
        this._baseRenderList.add(baseNode);
        this._changeBatchMark(baseNode);
        return true;
    }

    removeRenderNode(object: BaseRender): boolean {
        this._list.remove(object);
        this._baseRenderList.remove(object._baseRenderNode as WebBaseRenderNode);
        return true;
    }

    updateProperty(object: BaseRender, property: string | number) {
        this._changeBatchMark(object._baseRenderNode as WebBaseRenderNode);
    }

    setCullCamera(cameraCullInfo: CameraCullInfo[]): void {

        if (cameraCullInfo.length > this._mainBatchQueue.length) {
            let createCount = cameraCullInfo.length - this._mainBatchQueue.length;
            for (var i = 0; i < createCount; i++) {
                this._mainBatchQueue.add(new WebGLBatchQueue(true));
            }
        } else {
            this._mainBatchQueue.length = cameraCullInfo.length;
        }
        this._cameraCullInfo = cameraCullInfo;
    }

    setDirLightCullInfo(directLightCullInfo: ShadowCullInfo[]): void {
        if (directLightCullInfo.length > this._shadowBatchQueue.length) {
            let createCount = directLightCullInfo.length - this._shadowBatchQueue.length;
            for (var i = 0; i < createCount; i++) {
                this._shadowBatchQueue.add(new WebGLBatchQueue(false));
            }
        } else {
            this._shadowBatchQueue.length = directLightCullInfo.length;
        }
        this._dirShadowCullInfo = directLightCullInfo;
    }

    setSpotCullingDir(spotCullInfo: CameraCullInfo[]): void {
        if (spotCullInfo.length > this._spotBatchQueue.length) {
            let createCount = spotCullInfo.length - this._spotBatchQueue.length;
            for (var i = 0; i < createCount; i++) {
                this._spotBatchQueue.add(new WebGLBatchQueue(false));
            }
        } else {
            this._spotBatchQueue.length = spotCullInfo.length;
        }
        this._spotCullInfo = spotCullInfo;
    }

    appendRenderElement(cullMode: BatchCullMode, cullInfoIndex: number, context: WebGLRenderContext3D): IModuleAgentResource {
        let moduleBatchQueue: WebGLBatchQueue;
        let cullInfo;
        switch (cullMode) {
            case BatchCullMode.Camera:
                cullInfo = this._cameraCullInfo[cullInfoIndex];
                moduleBatchQueue = this._mainBatchQueue.elements[cullInfoIndex];
                moduleBatchQueue.clearList();
                RenderCullUtil.cullByCameraCullInfo(cullInfo, this._baseRenderList.elements, this._list.length, moduleBatchQueue.opaqueQueue, moduleBatchQueue.transparentQueue, context);
                this._opaqueInstanceBatch(moduleBatchQueue.opaqueList);
                break;
            case BatchCullMode.DirectLight:
                cullInfo = this._dirShadowCullInfo[cullInfoIndex];
                moduleBatchQueue = this._shadowBatchQueue.elements[cullInfoIndex];
                moduleBatchQueue.clearList();
                RenderCullUtil.cullDirectLightShadow(cullInfo, this._baseRenderList.elements, this._list.length, moduleBatchQueue.opaqueQueue, context);
                this._opaqueInstanceBatch(moduleBatchQueue.opaqueList);
                break;
            case BatchCullMode.Spot:
                cullInfo = this._spotCullInfo[cullInfoIndex];
                moduleBatchQueue = this._spotBatchQueue.elements[cullInfoIndex];
                moduleBatchQueue.clearList();
                RenderCullUtil.cullSpotShadow(cullInfo, this._baseRenderList.elements, this._list.length, moduleBatchQueue.opaqueQueue, context);
                this._opaqueInstanceBatch(moduleBatchQueue.opaqueList);
                break;
        }
        return moduleBatchQueue;
    }



    release(): void {
        //清理全局的合批产生的Buffer
        for (var [key, value] of WebGLInstanceRenderElement3D._instanceBufferStateMap) {
            value.state.destroy();
            value.worldInstanceVB && value.worldInstanceVB.destroy();
            value.lightmapScaleOffsetVB && value.lightmapScaleOffsetVB.destroy();
            value.simpleAnimatorVB && value.simpleAnimatorVB.destroy();
        }
        WebGLInstanceRenderElement3D._instanceBufferStateMap.clear();

        //清理 render element 上指向 BatchMark 的反向引用,避免 release 后悬挂
        const baseRenderArray = this._baseRenderList.elements;
        for (let i = 0, n = this._baseRenderList.length; i < n; i++) {
            const renderNode = baseRenderArray[i];
            if (!renderNode) continue;
            const elements = renderNode.renderelements as WebGLRenderElement3D[];
            if (!elements) continue;
            for (let j = 0, m = elements.length; j < m; j++) {
                elements[j] && (elements[j].customData = null);
            }
        }

        this._list.clear();
        this._list = null;
        this._baseRenderList.clear();
        this._baseRenderList = null;


        for (var i in this._batchOpaqueMarks) {
            let map = this._batchOpaqueMarks[i];
            for (var j in map) {
                (map[j] as BatchMark).release();
            }
            map = null;
        }
        this._batchOpaqueMarks = null;


        //裁剪信息以及合批信息
        this._cameraCullInfo = null;
        this._dirShadowCullInfo = null;
        this._spotCullInfo = null;
        for (let i = 0, n = this._mainBatchQueue.length; i < n; i++) {
            this._mainBatchQueue.elements[i].release();
        }
        this._mainBatchQueue.clear();
        this._mainBatchQueue = null;


        for (let i = 0, n = this._shadowBatchQueue.length; i < n; i++) {
            this._shadowBatchQueue.elements[i].release();
        }
        this._shadowBatchQueue.clear();
        this._shadowBatchQueue = null;

        for (let i = 0, n = this._spotBatchQueue.length; i < n; i++) {
            this._spotBatchQueue.elements[i].release();
        }
        this._spotBatchQueue.clear();
        this._spotBatchQueue = null;
    }

}