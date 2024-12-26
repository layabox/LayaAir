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

        Particle2DShader.CurrentTime = addUniform("u_CurrentTime", ShaderDataType.Float);
        Particle2DShader.UnitPixels = addUniform("u_UnitPixels", ShaderDataType.Float);

        {
            // color over life time
            Particle2DShader.ColorOverLifetimeDef = Shader3D.getDefineByName("COLOROVERLIFETIME");
            Particle2DShader.ColorOverLifetimeRandom = Shader3D.getDefineByName("COLOROVERLIFETIME_RANDOM");
            Particle2DShader.ColorOVerLifetimeColorKey_8 = Shader3D.getDefineByName("COLOROVERLIFETIME_COLORKEY_8");

            Particle2DShader.GradientRGB = addUniform("u_GradientRGB", ShaderDataType.Buffer);
            Particle2DShader.GradientAlpha = addUniform("u_GradientAlpha", ShaderDataType.Buffer);
            Particle2DShader.GradientTimeRange = addUniform("u_GradientTimeRange", ShaderDataType.Vector4);
            Particle2DShader.GradientMaxRGB = addUniform("u_GradientMaxRGB", ShaderDataType.Buffer);
            Particle2DShader.GradientMaxAlpha = addUniform("u_GradientMaxAlpha", ShaderDataType.Buffer);
            Particle2DShader.GradientMaxTimeRange = addUniform("u_GradientMaxTimeRange", ShaderDataType.Vector4);
        }

        {
            // velocity over life time
            Particle2DShader.VelocityOverLifetimeDef = Shader3D.getDefineByName("VELOCITYOVERLIFETIME");

            Particle2DShader.VelocityCurveMinX = addUniform("u_VelocityCurveMinX", ShaderDataType.Buffer);
            Particle2DShader.VelocityCurveMinY = addUniform("u_VelocityCurveMinY", ShaderDataType.Buffer);

            Particle2DShader.VelocityCurveMaxX = addUniform("u_VelocityCurveMaxX", ShaderDataType.Buffer);
            Particle2DShader.VelocityCurveMaxY = addUniform("u_VelocityCurveMaxY", ShaderDataType.Buffer);

            Particle2DShader.VelocityOverLifetimeSpace = addUniform("u_VelocityOverLifetimeSpace", ShaderDataType.Float);
        }

        {
            // Size over life time
            Particle2DShader.SizeOverLifetimeDef = Shader3D.getDefineByName("SIZEOVERLIFETIME");

            Particle2DShader.SizeCurveMinX = addUniform("u_SizeCurveMinX", ShaderDataType.Buffer);
            Particle2DShader.SizeCurveMinY = addUniform("u_SizeCurveMinY", ShaderDataType.Buffer);
            Particle2DShader.SizeCurveMinTimeRange = addUniform("u_SizeCurveMinTimeRange", ShaderDataType.Vector4);

            Particle2DShader.SizeCurveMaxX = addUniform("u_SizeCurveMaxX", ShaderDataType.Buffer);
            Particle2DShader.SizeCurveMaxY = addUniform("u_SizeCurveMaxY", ShaderDataType.Buffer);
            Particle2DShader.SizeCurveMaxTimeRange = addUniform("u_SizeCurveMaxTimeRange", ShaderDataType.Vector4);
        }
        {
            // Rotation over life time
            Particle2DShader.RotationOverLifetimeDef = Shader3D.getDefineByName("ROTATIONOVERLIFETIME");

            Particle2DShader.RotationCurveMin = addUniform("u_RotationCurveMin", ShaderDataType.Buffer);
            Particle2DShader.RotationCurveMax = addUniform("u_RotationCurveMax", ShaderDataType.Buffer);
        }
        {
            // TextureSheetAnimation
            Particle2DShader.TextureSheetAnimationDef = Shader3D.getDefineByName("TEXTURESHEETANIMATION");

            Particle2DShader.TextureSheetFrameData = addUniform("u_TextureSheetFrameData", ShaderDataType.Vector4);
            Particle2DShader.TextureSheetFrame = addUniform("u_TextureSheetFrame", ShaderDataType.Buffer);
            Particle2DShader.TextureSheetFrameMax = addUniform("u_TextureSheetFrameMax", ShaderDataType.Buffer);
            Particle2DShader.TextureSheetFrameRange = addUniform("u_TextureSheetFrameRange", ShaderDataType.Vector4);
        }

    }

}