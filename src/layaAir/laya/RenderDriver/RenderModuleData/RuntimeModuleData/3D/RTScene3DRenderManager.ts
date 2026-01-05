import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { SingletonList } from "../../../../utils/SingletonList";
import { IBatchModuleAgent } from "../../../DriverDesign/3DRenderPass/IBatchModuleAgent";
import { ISceneRenderManager } from "../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { BaseRenderType, IBaseRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { RTBaseRenderNode } from "./RTBaseRenderNode";

export class RTScene3DRenderManager implements ISceneRenderManager {
    _nativeObj: any;
    /** @internal */
    _list: SingletonList<BaseRender> = new SingletonList();
    /**@internal 合批队列 */
    batchAgentList: Map<number, IBatchModuleAgent> = new Map();
    baseRenderList: SingletonList<IBaseRenderNode>;
    /**
    * @en The list of render objects.
    * @zh 渲染对象列表。
    */
    get list() {
        return this._list;
    }

    set list(value) {
        this._list = value;
        if (value) {
            let elemnt = this._list.elements
            for (let i = 0; i < this._list.length; i++) {
                this.removeRenderObject(elemnt[i]);
            }
            elemnt = value.elements;
            for (let i = 0; i < value.length; i++) {
                this.addRenderObject(elemnt[i]);
            }
        }
    }

    private _addBaseRenderNode(object: RTBaseRenderNode): void {
        this._nativeObj.addBaseRenderNode(object._nativeObj);
    }

    private _removeBaseRenderNode(object: RTBaseRenderNode): void {
        this._nativeObj.removeBaseRenderNode(object._nativeObj);
    }

    private _clearBaseRenderNode(): void {
        this._nativeObj.clearBaseRenderNode();
    }


    addRenderObject(object: BaseRender): void {
        let agent = this.batchAgentList.get(object._baseRenderNode.renderNodeType);
        if (agent) {
            agent.addRenderNode(object);
            object._batchRender = agent;
        } else {
            this._addBaseRenderNode(object._baseRenderNode as RTBaseRenderNode);
        }
    }

    removeRenderObject(object: BaseRender): void {
        let agent = this.batchAgentList.get(object._baseRenderNode.renderNodeType);
        if (agent) {
            agent.removeRenderNode(object);
            object._batchRender = null;
        } else {
            this._removeBaseRenderNode(object._baseRenderNode as RTBaseRenderNode);
        }
    }

    removeMotionObject(object: BaseRender): void {
        //TODO
    }

    addMotionObject(object: BaseRender): void {
        //TODO
    }

    updateMotionObjects(): void {
        //TODO
    }

    destroy(): void {
        this._list?.destroy();
        this._clearBaseRenderNode();
        this._list = null;
    }

    constructor() {
        this._nativeObj = new (window as any).conchRTScene3DRenderManager();
    }



    registerBatchModuleAgent(renderNodeType: number | BaseRenderType, agent: IBatchModuleAgent): void {
        if (!this.batchAgentList.has(renderNodeType)) {
            this.batchAgentList.set(renderNodeType, agent)
            this._nativeObj.registerBatchModuleAgent(renderNodeType, (agent as any)._nativeObj)
            for (let i = 0; i < this._list.length; i++) {
                if (this._list.elements[i].renderNode.renderNodeType == renderNodeType) {
                    agent.addRenderNode(this._list.elements[i]);
                    this._list.elements[i]._batchRender = agent;
                }
            }

        }
    }

    updateProperty(object: BaseRender, property: string): void {
        let agent = this.batchAgentList.get(object._baseRenderNode.renderNodeType);
        agent && agent.updateProperty(object, property);
    }

}
