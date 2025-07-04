import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

export class Particle2DShader {

    static ColorOverLifetimeDef: ShaderDefine;
    static ColorOverLifetimeRandom: ShaderDefine;
    static ColorOVerLifetimeColorKey_8: ShaderDefine;
    static GradientRGB: number;
    static GradientAlpha: number;
    static GradientTimeRange: number;
    static GradientMaxRGB: number;
    static GradientMaxAlpha: number;
    static GradientMaxTimeRange: number;

    static VelocityOverLifetimeDef: ShaderDefine;
    static VelocityCurveMinX: number;
    static VelocityCurveMinY: number;
    static VelocityCurveMaxX: number;
    static VelocityCurveMaxY: number;
    static VelocityOverLifetimeSpace: number;

    static SizeOverLifetimeDef: ShaderDefine;
    static SizeCurveMinX: number;
    static SizeCurveMinY: number;
    static SizeCurveMinTimeRange: number;
    static SizeCurveMaxX: number;
    static SizeCurveMaxY: number;
    static SizeCurveMaxTimeRange: number;

    static RotationOverLifetimeDef: ShaderDefine;
    static RotationCurveMin: number;
    static RotationCurveMax: number;

    static TextureSheetAnimationDef: ShaderDefine;
    static TextureSheetFrameData: number;
    static TextureSheetFrame: number;
    static TextureSheetFrameRange: number;
    static TextureSheetFrameMax: number;

    static CurrentTime: number;

    static UnitPixels: number;

    static init() {

        const uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("_Particle2D");
        const addUniform = (name: string, type: ShaderDataType) => {
            let index = Shader3D.propertyNameToID(name);
            uniformMap.addShaderUniform(index, name, type);
            return index;
        }
        const addUniformArray = (name: string, type: ShaderDataType, arrayLength: number) => {
            let index = Shader3D.propertyNameToID(name);
            uniformMap.addShaderUniformArray(index, name, type, arrayLength);
            return index;
        }

        Particle2DShader.CurrentTime = addUniform("u_CurrentTime", ShaderDataType.Float);
        Particle2DShader.UnitPixels = addUniform("u_UnitPixels", ShaderDataType.Float);

        {
            // color over life time
            Particle2DShader.ColorOverLifetimeDef = Shader3D.getDefineByName("COLOROVERLIFETIME");
            Particle2DShader.ColorOverLifetimeRandom = Shader3D.getDefineByName("COLOROVERLIFETIME_RANDOM");
            Particle2DShader.ColorOVerLifetimeColorKey_8 = Shader3D.getDefineByName("COLOROVERLIFETIME_COLORKEY_8");

            Particle2DShader.GradientRGB = addUniformArray("u_GradientRGB", ShaderDataType.Vector4, 8);
            Particle2DShader.GradientAlpha = addUniformArray("u_GradientAlpha", ShaderDataType.Vector4, 4);
            Particle2DShader.GradientTimeRange = addUniform("u_GradientTimeRange", ShaderDataType.Vector4);
            Particle2DShader.GradientMaxRGB = addUniformArray("u_GradientMaxRGB", ShaderDataType.Vector4, 8);
            Particle2DShader.GradientMaxAlpha = addUniformArray("u_GradientMaxAlpha", ShaderDataType.Vector4, 4);
            Particle2DShader.GradientMaxTimeRange = addUniform("u_GradientMaxTimeRange", ShaderDataType.Vector4);
        }

        {
            // velocity over life time
            Particle2DShader.VelocityOverLifetimeDef = Shader3D.getDefineByName("VELOCITYOVERLIFETIME");

            Particle2DShader.VelocityCurveMinX = addUniformArray("u_VelocityCurveMinX", ShaderDataType.Vector4, 2);
            Particle2DShader.VelocityCurveMinY = addUniformArray("u_VelocityCurveMinY", ShaderDataType.Vector4, 2);

            Particle2DShader.VelocityCurveMaxX = addUniformArray("u_VelocityCurveMaxX", ShaderDataType.Vector4, 2);
            Particle2DShader.VelocityCurveMaxY = addUniformArray("u_VelocityCurveMaxY", ShaderDataType.Vector4, 2);

            Particle2DShader.VelocityOverLifetimeSpace = addUniform("u_VelocityOverLifetimeSpace", ShaderDataType.Float);
        }

        {
            // Size over life time
            Particle2DShader.SizeOverLifetimeDef = Shader3D.getDefineByName("SIZEOVERLIFETIME");

            Particle2DShader.SizeCurveMinX = addUniformArray("u_SizeCurveMinX", ShaderDataType.Vector4, 2);
            Particle2DShader.SizeCurveMinY = addUniformArray("u_SizeCurveMinY", ShaderDataType.Vector4, 2);
            Particle2DShader.SizeCurveMinTimeRange = addUniform("u_SizeCurveMinTimeRange", ShaderDataType.Vector4);

            Particle2DShader.SizeCurveMaxX = addUniformArray("u_SizeCurveMaxX", ShaderDataType.Vector4, 2);
            Particle2DShader.SizeCurveMaxY = addUniformArray("u_SizeCurveMaxY", ShaderDataType.Vector4, 2);
            Particle2DShader.SizeCurveMaxTimeRange = addUniform("u_SizeCurveMaxTimeRange", ShaderDataType.Vector4);
        }
        {
            // Rotation over life time
            Particle2DShader.RotationOverLifetimeDef = Shader3D.getDefineByName("ROTATIONOVERLIFETIME");

            Particle2DShader.RotationCurveMin = addUniformArray("u_RotationCurveMin", ShaderDataType.Vector4, 2);
            Particle2DShader.RotationCurveMax = addUniformArray("u_RotationCurveMax", ShaderDataType.Vector4, 2);
        }
        {
            // TextureSheetAnimation
            Particle2DShader.TextureSheetAnimationDef = Shader3D.getDefineByName("TEXTURESHEETANIMATION");

            Particle2DShader.TextureSheetFrameData = addUniform("u_TextureSheetFrameData", ShaderDataType.Vector4);
            Particle2DShader.TextureSheetFrame = addUniformArray("u_TextureSheetFrame", ShaderDataType.Vector4, 2);
            Particle2DShader.TextureSheetFrameMax = addUniformArray("u_TextureSheetFrameMax", ShaderDataType.Vector4, 2);
            Particle2DShader.TextureSheetFrameRange = addUniform("u_TextureSheetFrameRange", ShaderDataType.Vector4);
        }

    }

}