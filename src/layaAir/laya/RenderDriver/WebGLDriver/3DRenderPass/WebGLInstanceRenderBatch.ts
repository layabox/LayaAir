import { Config3D } from "../../../../Config3D";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { BatchMark } from "../../../d3/core/render/BatchMark";
import { LayaGL } from "../../../layagl/LayaGL";
import { FastSinglelist, SingletonList } from "../../../utils/SingletonList";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLInstanceRenderElement3D } from "./WebGLInstanceRenderElement3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";


/**
 * 动态合批通用类（目前由WebGPU专用）
 */
export class WebGLInstanceRenderBatch {

    static MaxInstanceCount: number = 1024;

    private recoverList: FastSinglelist<WebGLInstanceRenderElement3D>;
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
            const element = elementArray[i] as WebGLRenderElement3D;
            if (element.canDynamicBatch && element.subShader._owner._enableInstancing) {
                // shader 支持 instance
                const instanceMark = this.getBatchMark(element);
                if (this._updateCountMark == instanceMark.updateMark) {
                    const instanceIndex = instanceMark.indexInList;
                    if (instanceMark.batched) {
                        const originElement = <WebGLInstanceRenderElement3D>elementArray[instanceIndex];
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
                        const originElement = elementArray[instanceIndex] as WebGLRenderElement3D;
                        // 替换 renderElement
                        const instanceRenderElement = WebGLInstanceRenderElement3D.create();
                        this.recoverList.add(instanceRenderElement);
                        instanceRenderElement.subShader = element.subShader;
                        instanceRenderElement.materialShaderData = element.materialShaderData as WebGLShaderData;
                        instanceRenderElement.materialRenderQueue = element.materialRenderQueue;
                        instanceRenderElement.renderShaderData = element.renderShaderData as WebGLShaderData;
                        instanceRenderElement.owner = element.owner as WebBaseRenderNode;
                        instanceRenderElement.setGeometry(element.geometry as WebGLRenderGeometryElement);

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