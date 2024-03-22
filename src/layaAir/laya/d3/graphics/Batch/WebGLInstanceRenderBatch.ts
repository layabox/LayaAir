import { Config3D } from "../../../../Config3D";
import { WebGLInstanceRenderElement3D } from "../../../RenderDriver/WebGLDriver/3DRenderPass/WebGLInstanceRenderElement3D";
import { WebGLRenderElement3D } from "../../../RenderDriver/WebGLDriver/3DRenderPass/WebGLRenderElement3D";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { LayaGL } from "../../../layagl/LayaGL";
import { SingletonList } from "../../../utils/SingletonList";
import { BatchMark } from "../../core/render/BatchMark";

export class WebGLInstanceRenderBatch {

    private revocerList: SingletonList<WebGLInstanceRenderElement3D>;

    private _batchQpaqueMarks: any[] = [];
    private _updateCountMark: number = 0;

    constructor() {
        this.revocerList = new SingletonList();
    }

    getBathMark(element: WebGLRenderElement3D) {

        let renderNode = element.owner;
        let geometry = element.geometry;

        let invertFrontFace = element.transform ? element.transform._isFrontFaceInvert : false;

        let invertFrontFaceFlag = invertFrontFace ? 1 : 0;
        let receiveShadowFlag = renderNode.receiveShadow ? 1 : 0;
        let geometryFlag = geometry._id;
        let materialFlag = element.materialId;

        let renderId = (materialFlag << 17) + (geometryFlag << 2) + (invertFrontFaceFlag << 1) + (receiveShadowFlag);

        // let geoMatID 

        let reflectFlag = (renderNode.probeReflection ? renderNode.probeReflection._id : -1) + 1;
        let lightmapFlag = renderNode.lightmapIndex + 1;
        let lightProbeFlag = (renderNode.volumetricGI ? renderNode.volumetricGI._id : -1) + 1;

        let giId = (reflectFlag << 10) + (lightmapFlag << 20) + lightProbeFlag;

        let data = this._batchQpaqueMarks[renderId] || (this._batchQpaqueMarks[renderId] = {});
        return data[giId] || (data[giId] = new BatchMark());
    }

    batch(elements: SingletonList<WebGLRenderElement3D>) {

        if (!Config3D.enableDynamicBatch || !LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance)) {
            return;
        }
        this.recoverData();
        let elementCount = elements.length;

        let elementArray = elements.elements;

        elements.length = 0;

        this._updateCountMark++;

        for (let i = 0; i < elementCount; i++) {
            let element = elementArray[i];

            if (element.canDynamicBatch && element.subShader._owner._enableInstancing) {
                // shader 支持 Instance
                let instanceMark = this.getBathMark(element);
                if (this._updateCountMark == instanceMark.updateMark) {
                    let instanceIndex = instanceMark.indexInList;
                    if (instanceMark.batched) {
                        let originElement = <WebGLInstanceRenderElement3D>elementArray[instanceIndex];
                        let instanceElements = originElement._instanceElementList;
                        // 达到 最大 instance 数量 放弃合并 // todo
                        if (instanceElements.length == WebGLInstanceRenderElement3D.MaxInstanceCount) {
                            instanceMark.indexInList = elements.length;
                            instanceMark.batched = false;
                            elements.add(element);
                        }
                        else {
                            // 加入合并队列
                            instanceElements.add(element);
                        }
                    }
                    else {

                        let originElement = elementArray[instanceIndex];

                        // 替换 renderElement
                        let instanceRenderElement = WebGLInstanceRenderElement3D.create();
                        this.revocerList.add(instanceRenderElement);
                        instanceRenderElement.subShader = element.subShader;
                        instanceRenderElement.materialShaderData = element.materialShaderData;
                        instanceRenderElement.materialRenderQueue = element.materialRenderQueue;
                        instanceRenderElement.renderShaderData = element.renderShaderData;
                        instanceRenderElement.owner = element.owner;
                        instanceRenderElement.setGeometry(element.geometry);


                        let list = instanceRenderElement._instanceElementList;
                        list.length = 0;
                        list.add(originElement);
                        list.add(element);
                        elementArray[instanceIndex] = instanceRenderElement;
                        instanceMark.batched = true;
                        instanceRenderElement._invertFrontFace = element.transform ? element.transform._isFrontFaceInvert : false;

                    }
                }
                else {
                    instanceMark.updateMark = this._updateCountMark;
                    instanceMark.indexInList = elements.length;
                    instanceMark.batched = false;
                    elements.add(element);
                }
            }
            else {
                // can not Instance
                elements.add(element);
            }
        }


    }

    recoverData() {
        for (let i = 0, n = this.revocerList.length; i < n; i++) {
            let element = this.revocerList.elements[i];
            element.recover();
        }
        this.revocerList.length = 0;
    }

}