import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { BlendFactor } from "../../RenderEngine/RenderEnum/BlendFactor";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D";

/**
 * @en BlendMode enumeration.
 * @zh 混合模式枚举。
 * @blueprintable
 */
export enum BlendMode {
    invalid = 0,
    normal,
    add,
    multiply,
    screen,
    overlay,
    light,
    lighter,
    mask,
    destinationOut,
    addOld,
    lighterOld,
    sourceAlpha,
};

const TOINT: Record<string, number> = {
    [BlendMode.normal]: 0,
    [BlendMode.add]: 1,
    [BlendMode.multiply]: 2,
    [BlendMode.screen]: 3,
    [BlendMode.overlay]: 4,
    [BlendMode.light]: 5,
    [BlendMode.mask]: 6,
    [BlendMode.destinationOut]: 7,
    [BlendMode.lighter]: 1,
    [BlendMode.lighterOld]: 8,
    [BlendMode.addOld]: 8,
    [BlendMode.sourceAlpha]: 9,
};

/**
 * @ignore
 */
export class BlendModeHandler {
    /**@internal */
    static _init_(): void {
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

    static setShaderData(blendType: BlendMode, shaderData: ShaderData, premultipliedAlpha = true): void {
        let type = TOINT[blendType];
        switch (type) {
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

    static initBlendMode(shaderData: ShaderData): void {
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

