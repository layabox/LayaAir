import { Config3D } from "../../../../Config3D";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { BatchMark } from "../../../d3/core/render/BatchMark";
import { LayaGL } from "../../../layagl/LayaGL";
import { FastSinglelist, SingletonList } from "../../../utils/SingletonList";
import { IInstanceRenderElement3D, IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";


/**
 * 动态合批通用类（目前由WebGPU专用）
 */
export class WebGLInstanceRenderBatch {

    static MaxInstanceCount: number = 1024;

    private recoverList: FastSinglelist<IInstanceRenderElement3D>;
    private _batchOpaqueMarks: any[] = [];
    private _updateCountMark: number = 0;

    constructor() {
        this.recoverList = new FastSinglelist();
    }

    getBatchMark(element: IRenderElement3D) {
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

    batch(elements: SingletonList<IRenderElement3D>) {
        if (!Config3D.enableDynamicBatch
            || !LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance))
            return;

        const elementCount = elements.length;
        const elementArray = elements.elements;
        const maxInstanceCount = WebGLInstanceRenderBatch.MaxInstanceCount;

        elements.length = 0;
        this._updateCountMark++;

        for (let i = 0; i < elementCount; i++) {
            const element = elementArray[i];
            if (element.canDynamicBatch && element.subShader._owner._enableInstancing) {
                // shader 支持 instance
                const instanceMark = this.getBatchMark(element);
                if (this._updateCountMark == instanceMark.updateMark) {
                    const instanceIndex = instanceMark.indexInList;
                    if (instanceMark.batched) {
                        const originElement = <IInstanceRenderElement3D>elementArray[instanceIndex];
                        const instanceElements = originElement.instanceElementList;
                        // 达到 最大 instance 数量 放弃合并 // todo
                        if (instanceElements.length === maxInstanceCount) {
                            instanceMark.indexInList = elements.length;
                            instanceMark.batched = false;
                            elements.add(element);
                        } else {
                            // 加入合并队列
                            instanceElements.add(element);
                        }
                    } else {
                        const originElement = elementArray[instanceIndex];
                        // 替换 renderElement
                        const instanceRenderElement = Laya3DRender.Render3DPassFactory.createInstanceRenderElement3D()
                        this.recoverList.add(instanceRenderElement);
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
                    elements.add(element);
                }
            } else {
                // can not instance
                elements.add(element);
            }
        }
    }

    clearRenderData() {
        for (let i = this.recoverList.length - 1; i > -1; i--) {
            let element = this.recoverList.elements[i];
            element.clearRenderData();
        }
    }

    recoverData() {
        for (let i = this.recoverList.length - 1; i > -1; i--) {
            let element = this.recoverList.elements[i];
            element.recover();
        }
        this.recoverList.length = 0;
    }
}