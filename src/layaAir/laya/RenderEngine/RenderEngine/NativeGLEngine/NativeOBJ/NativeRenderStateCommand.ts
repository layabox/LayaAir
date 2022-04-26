import { RenderStateType } from "../../../RenderEnum/RenderStateType";
import { RenderStateCommand } from "../../../RenderStateCommand";

/**
 * 渲染状态设置命令流
 */
export class NativeRenderStateCommand extends RenderStateCommand {
    cmdArray:Map<RenderStateType,any> = new Map();
    constructor(){
        super();
    }
    addCMD(renderstate:RenderStateType,value:number|boolean|Array<number>){
        super.addCMD(renderstate,value);
    }

    applyCMD(){
        super.applyCMD();
    }

    clear(){
        super.clear();
    }
}