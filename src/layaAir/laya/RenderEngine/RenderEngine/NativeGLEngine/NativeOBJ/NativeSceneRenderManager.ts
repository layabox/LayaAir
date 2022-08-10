import { SimpleSingletonList } from "../../../../utils/SimpleSingletonList";
import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../../d3/core/render/BaseRender";
import { ISceneRenderManager } from "../../../RenderInterface/RenderPipelineInterface/ISceneRenderManager";

export class NativeSceneRenderManager implements ISceneRenderManager {
    /** @internal */
    _renders: SimpleSingletonList = new SimpleSingletonList();
    //自定义更新的Bounds渲染节点
    _customUpdateList: SingletonList<BaseRender> = new SingletonList();
    //自定义裁剪的渲染节点
    _customCullList: SingletonList<BaseRender> = new SingletonList();
    private _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchSceneCullManger();
    }

    get list() {
        return this._renders;
    }

    set list(value) {
        this._renders = value;
    }

    addRenderObject(object: BaseRender): void {
        
        this._renders.add(object);
        if (object._customCull)
            this._customCullList.add(object);
        else
            this._nativeObj.addRenderObject((object.renderNode as any)._nativeObj);

    }

    removeRenderObject(object: BaseRender): void {
        
        this._renders.remove(object);
        if (!object._customCull)
            this._nativeObj.removeRenderObject((object.renderNode as any)._nativeObj);
        else {
            //remove
            let elements = this._customCullList.elements;
            let index = elements.indexOf(object);
            if (index < this._customCullList.length) {
                this._customCullList.length -= 1;
                elements[index] = elements[this._customCullList.length];
            }
        }
    }

    removeMotionObject(object: BaseRender): void {
        
        if (object.renderNode.geometryBounds) {
            //可以在native更新Bounds的渲染节点
            this._nativeObj.removeMotionObject((object.renderNode as any)._nativeObj);
        } else {
            let index = object._motionIndexList;
            if (index != -1) {//remove
                let elements = this._customUpdateList.elements;
                this._customUpdateList.length -= 1;
                elements[length]._motionIndexList = index;
                elements[index] = elements[length];
            }
        }
    }

    updateMotionObjects(): void {
        
        //update native Motion Node
        this._nativeObj.updateMotionObjects();

        for (let i = 0; i < this._customUpdateList.length; i++) {
            this._customUpdateList.elements[i].bounds;
            this._customUpdateList.elements[i]._motionIndexList = -1;
        }
        this._customUpdateList.length = 0;
    }

    addMotionObject(object: BaseRender): void {
        
        if (object.renderNode.geometryBounds) {
            this._nativeObj.addMotionObject((object.renderNode as any)._nativeObj);
        } else {
            if (object._motionIndexList == -1) {
                object._motionIndexList = this._customUpdateList.length;
                this._customUpdateList.add(object);
            }
        }
    }

    destroy(): void {
        this._renders.destroy();
        this._nativeObj.destroy();
        //Destroy
        this._customUpdateList.destroy();
        this._customCullList.destroy();
    }

}