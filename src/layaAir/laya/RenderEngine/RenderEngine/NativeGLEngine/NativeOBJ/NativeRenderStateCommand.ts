
import { RenderStateCommand } from "../../../RenderStateCommand";
import { RenderStateType } from "../../../RenderEnum/RenderStateType";

/**
 * 渲染状态设置命令流
 */
export class NativeRenderStateCommand extends RenderStateCommand {
    private _nativeObj: any;
    constructor(){
        this._nativeObj = new (window as any).conchRenderStateCommand();
    }

    addCMD(renderstate:RenderStateType,value:any){
        switch (renderstate) {
            case RenderStateType.DepthTest:
            case RenderStateType.DepthMask:
            case RenderStateType.DepthFunc:
            case RenderStateType.StencilTest:
            case RenderStateType.StencilMask:
            case RenderStateType.BlendEquation:
            case RenderStateType.CullFace:
            case RenderStateType.FrontFace:
                this._nativeObj.addCMDInt1(value);
                break;
            case RenderStateType.StencilFunc:         
            case RenderStateType.BlendFunc:            
            case RenderStateType.BlendEquationSeparate:
                this._nativeObj.addCMDInt2(value[0], value[1]);
                break;
            case RenderStateType.StencilOp:
                this._nativeObj.addCMDInt3(value[0],value[1], value[2]);//TODO
                break;
            case RenderStateType.BlendType:
                this._nativeObj.addCMDInt1(value != BlendType.BLEND_DISABLE ? 1 : 0);
                break;
            case RenderStateType.BlendFuncSeperate:
                this._nativeObj.addCMDInt4(value[0], value[1], value[2], value[3]);
                break;
            default:
                throw "unknow type of renderStateType";
                break;
        }
    }

    applyCMD(){
        this._nativeObj.applyRenderStateCMD();
    }

    clear(){
        this._nativeObj.clear();
    }
}