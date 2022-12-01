import { SingletonList } from "../../../../utils/SingletonList";
import { BaseRender } from "../../../core/render/BaseRender";
/**
 * 类用来描述合批的渲染节点
 */
export class BatchRender extends BaseRender{
    private _checkLOD:boolean;
    private _batchList:SingletonList<BaseRender>;

    
    _add(rendernode:BaseRender):boolean{
        return false;
    }

    //TODO 好像基类不需要
    _addList(renderNodes:BaseRender[]){
        //TODO  add list
    }

    _remove(rendernode:BaseRender){
        return false;
    }

    _reBatch(){

    }

    /**
     * Restoring the Batch Render State
     */
    _restorRenderNode(){

    }

    _clear(){

    }
}