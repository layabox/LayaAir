import { BlendFactor } from "../../RenderEngine/RenderEnum/BlendFactor";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";

//export type BlendFunc = (gl:WebGLRenderingContext)=>void
export class BlendMode {
    static activeBlendFunction: Function = null;
    /** @internal 这个不直接暴露给开发者*/
    static NAMES = [
        "normal", 
        "add", 
        "multiply", 
        "screen", 
        "overlay", 
        "light", 
        "mask", 
        "destination-out",
        "add_old"];

    /** @internal */
    static TOINT:{[key:string]:number} = { 
        "normal": 0, 
        "add": 1, 
        "multiply": 2, 
        "screen": 3, 
        "overlay": 4, 
        "light": 5, 
        "mask": 6, 
        "destination-out": 7, 
        "lighter": 1,
        "lighter_old": 8,
        "add_old":8};

    static      NORMAL = "normal";					//0
    static        MASK = "mask";					//6
    static     LIGHTER = "lighter";					//1  

    static fns: any[];
    static targetFns: any[];
    /**@internal */
    static _init_(): void {
        BlendMode.fns =       [
            BlendMode.BlendNormal,      //0
            BlendMode.BlendAdd,         //1
            BlendMode.BlendMultiply,    //2
            BlendMode.BlendScreen,      //3
            BlendMode.BlendOverlay,     //4
            BlendMode.BlendLight,       //5
            BlendMode.BlendMask,        //6
            BlendMode.BlendDestinationOut,   //7
            BlendMode.BlendAddOld         //8
        ];

        BlendMode.targetFns = [
            BlendMode.BlendNormalTarget,    //0
            BlendMode.BlendAddTarget,       //1
            BlendMode.BlendMultiplyTarget,  //2
            BlendMode.BlendScreenTarget,    //3
            BlendMode.BlendOverlayTarget,   //4
            BlendMode.BlendLightTarget,     //5
            BlendMode.BlendMask,            //6
            BlendMode.BlendDestinationOut,  //7
            BlendMode.BlendAddTargetOld     //8
        ];
    }

    static BlendNormal(): void {
        //为了避免黑边，和canvas作为贴图的黑边
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.OneMinusSourceAlpha);
        
    }

    /**@internal 这个add感觉不合理，所以改成old了 */
    static BlendAddOld(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.DestinationAlpha);
    }

    static BlendAdd(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.One);
    }

    static BlendMultiply(): void {
        RenderStateContext.setBlendFunc(BlendFactor.DestinationColor, BlendFactor.OneMinusSourceAlpha);
    }

    static BlendScreen(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.One);
    }

    static BlendOverlay(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.OneMinusSourceAlpha);
    }

    static BlendLight(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One,BlendFactor.One);
    }

    static BlendNormalTarget(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.OneMinusSourceAlpha);
    }

    /**@internal add不应该是1+dst_α 所以改成old */
    static BlendAddTargetOld(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.DestinationAlpha);
    }
    static BlendAddTarget(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.One);
    }

    static BlendMultiplyTarget(): void {
        RenderStateContext.setBlendFunc(BlendFactor.DestinationColor, BlendFactor.OneMinusSourceAlpha);
    }

    static BlendScreenTarget(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.One);
    }

    static BlendOverlayTarget(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.OneMinusSourceColor);
    }

    static BlendLightTarget(): void {
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.One);
    }

    static BlendMask(): void {
        RenderStateContext.setBlendFunc(BlendFactor.Zero, BlendFactor.SourceAlpha);
    }

    static BlendDestinationOut(): void {
        RenderStateContext.setBlendFunc(BlendFactor.Zero, BlendFactor.Zero);
    }
}

