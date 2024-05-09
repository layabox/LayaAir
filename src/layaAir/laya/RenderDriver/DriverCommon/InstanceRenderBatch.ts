import { Config3D } from "../../../Config3D";
import { BatchMark } from "../../d3/core/render/BatchMark";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable";
import { SingletonList } from "../../utils/SingletonList";
import { IRenderElement3D } from "../DriverDesign/3DRenderPass/I3DRenderPass";
import { IInstanceRenderElement3D } from "./IInstanceRenderElement3D";

/**
 * 动态合批通用类
 */
export class InstanceRenderBatch {
    private recoverList: SingletonList<IInstanceRenderElement3D>;

    private _batchOpaqueMarks: any[] = [];
    private _updateCountMark: number = 0;

    constructor() {
        this.recoverList = new SingletonList();
    }

    getBatchMark(element: IRenderElement3D) {
        let renderNode = element.owner;
        let geometry = element.geometry;

        let invertFrontFace = element.transform ? element.transform._isFrontFaceInvert : false;

        let invertFrontFaceFlag = invertFrontFace ? 1 : 0;
        let receiveShadowFlag = renderNode.receiveShadow ? 1 : 0;
        //let geometryFlag = geometry._id;
        let geometryFlag = 0;
        let materialFlag = element.materialId;

        let renderId = (materialFlag << 17) + (geometryFlag << 2) + (invertFrontFaceFlag << 1) + (receiveShadowFlag);

        let reflectFlag = (renderNode.probeReflection ? renderNode.probeReflection._id : -1) + 1;
        let lightmapFlag = renderNode.lightmapIndex + 1;
        let lightProbeFlag = (renderNode.volumetricGI ? renderNode.volumetricGI._id : -1) + 1;

        let giId = (reflectFlag << 10) + (lightmapFlag << 20) + lightProbeFlag;

        let data = this._batchOpaqueMarks[renderId] || (this._batchOpaqueMarks[renderId] = {});
        return data[giId] || (data[giId] = new BatchMark());
    }

    batch(elements: SingletonList<IRenderElement3D>) {
        // if (!Config3D.enableDynamicBatch || !LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance))
        //     return;
        // this.recoverData();
        // let elementCount = elements.length;
        // let elementArray = elements.elements;

        // elements.length = 0;
        // this._updateCountMark++;

        // for (let i = 0; i < elementCount; i++) {
        //     let element = elementArray[i];
        //     if (element.canDynamicBatch && element.subShader._owner._enableInstancing) {
        //         // shader 支持 Instance
        //         let instanceMark = this.getBatchMark(element);
        //         if (this._updateCountMark == instanceMark.updateMark) {
        //             let instanceIndex = instanceMark.indexInList;
        //             if (instanceMark.batched) {
        //                 let originElement = <WebGLInstanceRenderElement3D>elementArray[instanceIndex];
        //                 let instanceElements = originElement._instanceElementList;
        //                 // 达到 最大 instance 数量 放弃合并 // todo
        //                 if (instanceElements.length == WebGLInstanceRenderElement3D.MaxInstanceCount) {
        //                     instanceMark.indexInList = elements.length;
        //                     instanceMark.batched = false;
        //                     elements.add(element);
        //                 } else {
        //                     // 加入合并队列
        //                     instanceElements.add(element);
        //                 }
        //             } else {
        //                 let originElement = elementArray[instanceIndex];
        //                 // 替换 renderElement
        //                 let instanceRenderElement = WebGLInstanceRenderElement3D.create();
        //                 this.recoverList.add(instanceRenderElement);
        //                 instanceRenderElement.subShader = element.subShader;
        //                 instanceRenderElement.materialShaderData = element.materialShaderData;
        //                 instanceRenderElement.materialRenderQueue = element.materialRenderQueue;
        //                 instanceRenderElement.renderShaderData = element.renderShaderData;
        //                 instanceRenderElement.owner = element.owner;
        //                 instanceRenderElement.setGeometry(element.geometry);

        //                 let list = instanceRenderElement._instanceElementList;
        //                 list.length = 0;
        //                 list.add(originElement);
        //                 list.add(element);
        //                 elementArray[instanceIndex] = instanceRenderElement;
        //                 instanceMark.batched = true;
        //                 instanceRenderElement._invertFrontFace = element.transform ? element.transform._isFrontFaceInvert : false;
        //             }
        //         } else {
        //             instanceMark.updateMark = this._updateCountMark;
        //             instanceMark.indexInList = elements.length;
        //             instanceMark.batched = false;
        //             elements.add(element);
        //         }
        //     } else {
        //         // can not Instance
        //         elements.add(element);
        //     }
        // }
    }

    recoverData() {
        // for (let i = 0, n = this.recoverList.length; i < n; i++)
        //     this.recoverList.elements[i].recover();
    }
}