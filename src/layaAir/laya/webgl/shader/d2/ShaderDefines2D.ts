import { ShaderDataType } from "../../../RenderEngine/RenderInterface/ShaderData";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { LayaGL } from "../../../layagl/LayaGL";

export class ShaderDefines2D {
    /**@internal */
    static TEXTURE2D: ShaderDefine;
    /**@internal */
    static PRIMITIVE: ShaderDefine;
    /**@internal */
    static FILTERGLOW: ShaderDefine;
    /**@internal */
    static FILTERBLUR: ShaderDefine;
    /**@internal */
    static FILTERCOLOR: ShaderDefine;
    /**@internal */
    static COLORADD: ShaderDefine;
    /**@internal */
    static WORLDMAT: ShaderDefine;
    /**@internal */
    static FILLTEXTURE: ShaderDefine;
    /**@internal */
    static SKINMESH: ShaderDefine;
    /**@internal */
    static MVP3D: ShaderDefine;
    /**@internal */
    static GAMMASPACE: ShaderDefine;
    /**@internal */
    static INVERTY: ShaderDefine;
    /**@internal */
    static GAMMATEXTURE: ShaderDefine;

    /**@internal */
    static TEXTURESHADER: ShaderDefine;
    /**@internal */
    static PRIMITIVESHADER: ShaderDefine;

    /**@internal */
    static UNIFORM_MMAT: number;// mat4 u_mmat
    static UNIFORM_CLIPMATDIR: number;// uniform vec4 u_clipMatDir;
    static UNIFORM_CLIPMATPOS: number;// uniform vec2 u_clipMatPos;
    static UNIFORM_MMAT2: number;// uniform mat4 u_mmat2;
    static UNIFORM_SIZE: number;// uniform vec2 u_size;
    static UNIFORM_CLIPOFF: number;//uniform vec2 u_clipOff;	
    static UNIFORM_MVPMatrix: number;//uniform mat4 u_MvpMatrix;

    static UNIFORM_SPRITETEXTURE: number;// uniform sampler2D u_spriteTexture;
    static UNIFORM_STRENGTH_SIG2_2SIG2_GAUSS1: number;//uniform vec4 u_strength_sig2_2sig2_gauss1; // TODO模糊的过程中会导致变暗变亮
    static UNIFORM_BLURINFO: number; //uniform vec2 u_blurInfo;

    static UNIFORM_COLORALPHA: number;// uniform vec4 u_colorAlpha;
    static UNIFORM_COLORMAT: number; //uniform mat4 u_colorMat;
    static UNIFORM_COLOR: number;//uniform vec4 u_color;
    static UNIFORM_BLURINFO1: number//uniform vec4 u_blurInfo1;
    static UNIFORM_BLURINFO2: number//uniform vec4 u_blurInfo2;
    static UNIFORM_COLORADD: number;//uniform vec4 u_colorAdd;
    static UNIFORM_TEXRANGE: number;//uniform vec4 u_TexRange;

    //TODO?
    //static NOOPTMASK: number = ShaderDefines2D.FILTERGLOW | ShaderDefines2D.FILTERBLUR | ShaderDefines2D.FILTERCOLOR | ShaderDefines2D.FILLTEXTURE;	//有这些定义的不要优化。见submittexture

    static __init__(): void {
        ShaderDefines2D.TEXTURE2D = Shader3D.getDefineByName("TEXTURE2D");
        ShaderDefines2D.PRIMITIVE = Shader3D.getDefineByName("PRIMITIVE");

        ShaderDefines2D.FILTERGLOW = Shader3D.getDefineByName("GLOW_FILTER");
        ShaderDefines2D.FILTERBLUR = Shader3D.getDefineByName("BLUR_FILTER");
        ShaderDefines2D.FILTERCOLOR = Shader3D.getDefineByName("COLOR_FILTER");
        ShaderDefines2D.COLORADD = Shader3D.getDefineByName("COLOR_ADD");
        ShaderDefines2D.WORLDMAT = Shader3D.getDefineByName("WORLDMAT");
        ShaderDefines2D.FILLTEXTURE = Shader3D.getDefineByName("FILLTEXTURE");
        ShaderDefines2D.MVP3D = Shader3D.getDefineByName('MVP3D');

        ShaderDefines2D.GAMMASPACE = Shader3D.getDefineByName('GAMMASPACE');

        ShaderDefines2D.INVERTY = Shader3D.getDefineByName('INVERTY');

        ShaderDefines2D.GAMMATEXTURE = Shader3D.getDefineByName('GAMMATEXTURE');

        ShaderDefines2D.TEXTURESHADER = Shader3D.getDefineByName("TEXTUREVS");
        ShaderDefines2D.PRIMITIVESHADER = Shader3D.getDefineByName("PRIMITIVEMESH");

        ShaderDefines2D.initSprite2DCommandEncoder();
    }

    static initSprite2DCommandEncoder() {
        ShaderDefines2D.UNIFORM_MMAT = Shader3D.propertyNameToID("u_mmat");
        ShaderDefines2D.UNIFORM_CLIPMATDIR = Shader3D.propertyNameToID("u_clipMatDir");
        ShaderDefines2D.UNIFORM_CLIPMATPOS = Shader3D.propertyNameToID("u_clipMatPos");
        ShaderDefines2D.UNIFORM_MMAT2 = Shader3D.propertyNameToID("u_mmat2");
        ShaderDefines2D.UNIFORM_SIZE = Shader3D.propertyNameToID("u_size");
        ShaderDefines2D.UNIFORM_CLIPOFF = Shader3D.propertyNameToID("u_clipOff");

        ShaderDefines2D.UNIFORM_MVPMatrix = Shader3D.propertyNameToID("u_MvpMatrix");
        ShaderDefines2D.UNIFORM_SPRITETEXTURE = Shader3D.propertyNameToID("u_spriteTexture");
        ShaderDefines2D.UNIFORM_STRENGTH_SIG2_2SIG2_GAUSS1 = Shader3D.propertyNameToID("u_strength_sig2_2sig2_gauss1");
        ShaderDefines2D.UNIFORM_BLURINFO = Shader3D.propertyNameToID("u_blurInfo");
        ShaderDefines2D.UNIFORM_COLORALPHA = Shader3D.propertyNameToID("u_colorAlpha");
        ShaderDefines2D.UNIFORM_COLORMAT = Shader3D.propertyNameToID("u_colorMat");

        ShaderDefines2D.UNIFORM_COLOR = Shader3D.propertyNameToID("u_color");
        ShaderDefines2D.UNIFORM_BLURINFO1 = Shader3D.propertyNameToID("u_blurInfo1");
        ShaderDefines2D.UNIFORM_BLURINFO2 = Shader3D.propertyNameToID("u_blurInfo2");
        ShaderDefines2D.UNIFORM_COLORADD = Shader3D.propertyNameToID("u_colorAdd");
        ShaderDefines2D.UNIFORM_TEXRANGE = Shader3D.propertyNameToID("u_TexRange");

        const commandUniform = LayaGL.renderOBJCreate.createGlobalUniformMap("Sprite2D");

        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_MMAT, "u_mmat", ShaderDataType.Matrix4x4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATDIR, "u_clipMatDir", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATPOS, "u_clipMatPos", ShaderDataType.Vector2);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_MMAT2, "u_mmat2", ShaderDataType.Matrix4x4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_SIZE, "u_size", ShaderDataType.Vector2);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPOFF, "u_clipOff", ShaderDataType.Vector2);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_MVPMatrix, "u_MvpMatrix", ShaderDataType.Matrix4x4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_SPRITETEXTURE, "u_spriteTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_STRENGTH_SIG2_2SIG2_GAUSS1, "u_strength_sig2_2sig2_gauss1", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_BLURINFO, "u_blurInfo", ShaderDataType.Vector2);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_COLORALPHA, "u_colorAlpha", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_COLORMAT, "u_colorMat", ShaderDataType.Matrix4x4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_COLOR, "u_color", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_BLURINFO1, "u_blurInfo1", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_BLURINFO2, "u_blurInfo2", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_COLORADD, "u_colorAdd", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_TEXRANGE, "u_TexRange", ShaderDataType.Vector4);
    }
}


