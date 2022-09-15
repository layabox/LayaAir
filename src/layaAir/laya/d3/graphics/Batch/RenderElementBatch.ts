import { LayaGL } from "../../../layagl/LayaGL";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { SingletonList } from "../../../utils/SingletonList";
import { RenderElement } from "../../core/render/RenderElement";
import { SubMeshInstanceBatch } from "../SubMeshInstanceBatch";
import { InstanceBatchManager } from "./InstanceBatchManager";
import { InstanceRenderElement } from "../../core/render/InstanceRenderElement";
import { MeshInstanceGeometry } from "../MeshInstanceGeometry";
import { SubMesh } from "../../resource/models/SubMesh";
import { Config3D } from "../../../../Config3D";

export class RenderElementBatch {
    static instance: RenderElementBatch;
    private _instanceBatchManager: InstanceBatchManager;
    private _recoverList: SingletonList<InstanceRenderElement>;
    constructor() {
        RenderElementBatch.instance = this;
        this._instanceBatchManager = InstanceBatchManager.instance;
        this._recoverList = new SingletonList();
    }

    recoverData() {
        let elements = this._recoverList.elements;
        for (let i = 0, n = this._recoverList.length; i < n; i++) {
            let element = elements[i];
            element.recover();
        }
        this._recoverList.length = 0;
    }

    batch(elements: SingletonList<RenderElement>) {
        let len = elements.length;
        elements.length = 0;
        this._instanceBatchManager.updateCountMark++;//每个批次是一个新的标签，保证更新不重复
        let elementArray = elements.elements;
        for (var i = 0; i < len; i++) {
            let element = elements.elements[i];
            if (!element._canBatch) {
                elements.add(element);
                continue;
            }
            if (element.staticBatch && (!element.render._probReflection || element.render._probReflection._isScene) && Config3D.enableStaticBatch) {
                //static Batch TODO
                elements.add(element);
            }
            else if (Config3D.enableDynamicBatch && LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance)) {
                if (element.renderSubShader._owner._enableInstancing && element.render.lightmapIndex < 0) {
                    var insManager = this._instanceBatchManager;
                    var insBatchMarks = insManager.getInstanceBatchOpaquaMark(element.render.receiveShadow, element.material.id, element._geometry._id, element.transform ? element.transform._isFrontFaceInvert : false, element.render._probReflection ? element.render._probReflection.id : -1);
                    if (insManager.updateCountMark === insBatchMarks.updateMark) {
                        //can batch
                        var insBatchIndex: number = insBatchMarks.indexInList;
                        var insOriElement: RenderElement = elementArray[insBatchIndex];
                        if (insBatchMarks.batched) {
                            var instanceelements: SingletonList<RenderElement> = (insOriElement as InstanceRenderElement)._instanceBatchElementList;
                            if (instanceelements.length === SubMeshInstanceBatch.maxInstanceCount) {
                                insBatchMarks.updateMark = insManager.updateCountMark;
                                insBatchMarks.indexInList = elements.length;
                                insBatchMarks.batched = false;
                                elements.add(element);
                            } else {
                                instanceelements.add(element);
                            }
                        } else {
                            //替换Elements中的RenderElement为InstanceElement
                            let instanceRenderElement = InstanceRenderElement.create();
                            this._recoverList.add(instanceRenderElement);
                            instanceRenderElement.render = insOriElement.render;
                            instanceRenderElement.renderType = RenderElement.RENDERTYPE_INSTANCEBATCH;
                            //Geometry updaste
                            (instanceRenderElement._geometry as MeshInstanceGeometry).subMesh = (insOriElement._geometry as SubMesh);
                            instanceRenderElement.material = insOriElement.material;
                            instanceRenderElement.setTransform(null);
                            instanceRenderElement.renderSubShader = insOriElement.renderSubShader;
                            let list = instanceRenderElement._instanceBatchElementList;
                            list.length = 0;
                            list.add(insOriElement);
                            list.add(element);
                            elementArray[insBatchIndex] = instanceRenderElement;
                            insBatchMarks.batched = true;
                        }
                    } else {
                        insBatchMarks.updateMark = insManager.updateCountMark;
                        insBatchMarks.indexInList = elements.length;
                        insBatchMarks.batched = false;
                        elements.add(element);
                    }
                } else
                    elements.add(element);
            }
            else
                elements.add(element);
        }
    }
}