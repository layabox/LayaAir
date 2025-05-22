import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { BlendFactor } from "../../RenderEngine/RenderEnum/BlendFactor";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D";

export enum BlendMode {
    Normal = "normal",
    Add = "add",
    Multiply = "multiply",
    Screen = "screen",
    Overlay = "overlay",
    Lighter = "lighter",
    Mask = "mask",
    DestinationOut = "destination-out",
    AddOld = "add_old",
    SourceAlpha = "source_alpha",
}

export class BlendModeHandler {

    /** @internal 这个不直接暴露给开发者*/
    static NAMES = [
        BlendMode.Normal,
        BlendMode.Add,
        BlendMode.Multiply,
        BlendMode.Screen,
        BlendMode.Overlay,
        BlendMode.Lighter,
        BlendMode.Mask,
        BlendMode.DestinationOut,
        BlendMode.AddOld,
        BlendMode.SourceAlpha
    ];

    /** @internal */
    static TOINT: { [key: string]: number } = {
        [BlendMode.Normal]: 0,
        [BlendMode.Add]: 1,
        [BlendMode.Multiply]: 2,
        [BlendMode.Screen]: 3,
        [BlendMode.Overlay]: 4,
        [BlendMode.Lighter]: 5,
        [BlendMode.Mask]: 6,
        [BlendMode.DestinationOut]: 7,
        [BlendMode.AddOld]: 8,
        [BlendMode.SourceAlpha]: 9,
    };

    static fns: any[];
    static targetFns: any[];
    /**@internal */
    static _init_(): void {
        
        BlendModeHandler.fns = [
            BlendMode.Normal,      //0
            BlendMode.Add,         //1
            BlendMode.Multiply,    //2
            BlendMode.Screen,      //3
            BlendMode.Overlay,     //4
            BlendMode.Lighter,       //5
            BlendMode.Mask,        //6
            BlendMode.DestinationOut,   //7
            BlendMode.AddOld,         //8
            BlendMode.SourceAlpha,            //9
        ];

        BlendModeHandler.targetFns = [
            BlendMode.Normal,    //0
            BlendMode.Add,       //1
            BlendMode.Multiply,  //2 
            BlendMode.Screen,    //3
            BlendMode.Overlay,   //4
            BlendMode.Lighter,     //5
            BlendMode.Mask,            //6
            BlendMode.DestinationOut,  //7
            BlendMode.AddOld,    //8
            BlendMode.SourceAlpha             //9
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
        RenderStateContext.setBlendFunc(BlendFactor.One, BlendFactor.One);
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
    static BlendSourceAlpha(): void {
        RenderStateContext.setBlendFunc(BlendFactor.SourceAlpha, BlendFactor.OneMinusSourceAlpha);
    }

    static setShaderData(blendType: BlendMode | number, shaderData: ShaderData , premultipliedAlpha = true): void {
        if (typeof blendType === "string") {
            blendType = BlendModeHandler.TOINT[blendType];
        }
        switch (blendType) {
            case 1://add
            case 3://screen
            case 5://light
                shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
                shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE);
                break;
            case 2://BlendMultiply
                shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_DST_COLOR);
                shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
                break;
            case 6://mask
                shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ZERO);
                shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_SRC_ALPHA);
                break;
            case 7://destination
                shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ZERO);
                shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ZERO);
                break;
            case 9:// not premul alpha
                shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_SRC_ALPHA);
                shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
                break;
            default:// premul alpha
                shaderData.setInt(Shader3D.BLEND_SRC, premultipliedAlpha ? RenderState.BLENDPARAM_ONE : RenderState.BLENDPARAM_SRC_ALPHA);
                shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
        }
    }

    static initBlendMode(shaderData:ShaderData): void {
        shaderData.setBool(Shader3D.DEPTH_WRITE, false);
        shaderData.setInt(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        shaderData.setInt(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        shaderData.setInt(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
        shaderData.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, 1.0);
        shaderData.setInt(Shader3D.CULL, RenderState.CULL_NONE);
    }
}

