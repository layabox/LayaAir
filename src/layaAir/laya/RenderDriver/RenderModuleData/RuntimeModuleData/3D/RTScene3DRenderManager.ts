import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { FastSinglelist, SingletonList } from "../../../../utils/SingletonList";
import { ISceneRenderManager } from "../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { RTBaseRenderNode } from "./RTBaseRenderNode";

export class RTScene3DRenderManager implements ISceneRenderManager {
    _nativeObj: any;
    /** @internal */
    _list: SingletonList<BaseRender> = new SingletonList();


    /**
    * @en The list of render objects.
    * @zh 渲染对象列表。
    */
    get list() {
        return this._list;
    }

    set list(value) {
        this._list = value;
        let elemnt = this._list.elements

        for (let i = 0; i < this._list.length; i++) {
            this._addBaseRenderNode(elemnt[i]._baseRenderNode as RTBaseRenderNode);
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
        this._list.add(object);
        this._addBaseRenderNode(object._baseRenderNode as RTBaseRenderNode);
    }

    removeRenderObject(object: BaseRender): void {
        this._list.remove(object);
        this._removeBaseRenderNode(object._baseRenderNode as RTBaseRenderNode);
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
        this._list.destroy();
        this._clearBaseRenderNode();
        this._list = null;
        this._nativeObj = null;
    }

    constructor() {
        this._nativeObj = new (window as any).conchRTScene3DRenderManager();
    }
}
