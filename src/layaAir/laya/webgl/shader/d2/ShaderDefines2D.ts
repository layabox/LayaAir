import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";

export class ShaderDefines2D {
    /**@internal */
    static TEXTURE2D: ShaderDefine;
    /**@internal */
    static PRIMITIVE: ShaderDefine;
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

    static VERTEX_SIZE: ShaderDefine;

    /**@internal */
    static TEXTURESHADER: ShaderDefine;
    /**@internal */
    static PRIMITIVESHADER: ShaderDefine;
    /** @internal */
    static RENDERTEXTURE: ShaderDefine;
    /**@internal */
    static MATERIALCLIP: ShaderDefine;

    /**@internal */
    static UNIFORM_MMAT: number;// mat4 u_mmat
    static UNIFORM_CLIPMATDIR: number;// uniform vec4 u_clipMatDir;
    static UNIFORM_CLIPMATPOS: number;// uniform vec2 u_clipMatPos;

    static UNIFORM_MATERIAL_CLIPMATDIR: number;// uniform vec4 u_mClipMatDir;
    static UNIFORM_MATERIAL_CLIPMATPOS: number;// uniform vec2 u_mCipMatPos;

    // static UNIFORM_PIVOTPOS: number;// uniform vec2 u_clipMatPos;
    static UNIFORM_MMAT2: number;// uniform mat4 u_mmat2;
    static UNIFORM_SIZE: number;

    static UNIFORM_VERTALPHA: number;//顶点alpha，给cacheas normal用;

    static UNIFORM_SPRITETEXTURE: number;// uniform sampler2D u_spriteTexture;

    static UNIFORM_VERTEX_SIZE: number;// uniform vec4 u_vertexSize;

    static UNIFORM_TEXRANGE: number;//uniform vec4 u_TexRange;
    /**
     * 渲染矩阵第一个vector3属性ID
     */
    static UNIFORM_NMATRIX_0: number;
    /**
     * 渲染矩阵第二个vector3属性ID
     */
    static UNIFORM_NMATRIX_1: number;
    /** uniform vec3 u_InvertMat_0; // 反转矩阵的第一行 */
    static UNIFORM_INVERTMAT_0: number;
    /** uniform vec3 u_InvertMat_1; // 反转矩阵的第二行 */
    static UNIFORM_INVERTMAT_1: number;
    //TODO?
    //static NOOPTMASK: number = ShaderDefines2D.FILTERGLOW | ShaderDefines2D.FILTERBLUR | ShaderDefines2D.FILTERCOLOR | ShaderDefines2D.FILLTEXTURE;	//有这些定义的不要优化。见submittexture

    static __init__(): void {
        ShaderDefines2D.TEXTURE2D = Shader3D.getDefineByName("TEXTURE2D");
        ShaderDefines2D.PRIMITIVE = Shader3D.getDefineByName("PRIMITIVE");
        ShaderDefines2D.VERTEX_SIZE = Shader3D.getDefineByName("VERTEX_SIZE");

        ShaderDefines2D.COLORADD = Shader3D.getDefineByName("COLOR_ADD");
        ShaderDefines2D.WORLDMAT = Shader3D.getDefineByName("WORLDMAT");
        ShaderDefines2D.FILLTEXTURE = Shader3D.getDefineByName("FILLTEXTURE");
        ShaderDefines2D.RENDERTEXTURE = Shader3D.getDefineByName('RENDERTEXTURE');
        ShaderDefines2D.MATERIALCLIP = Shader3D.getDefineByName('MATERIALCLIP');

        ShaderDefines2D.GAMMASPACE = Shader3D.getDefineByName('GAMMASPACE');

        ShaderDefines2D.INVERTY = Shader3D.getDefineByName('INVERTY');

        ShaderDefines2D.GAMMATEXTURE = Shader3D.getDefineByName('GAMMATEXTURE');

        ShaderDefines2D.TEXTURESHADER = Shader3D.getDefineByName("TEXTUREVS");
        ShaderDefines2D.PRIMITIVESHADER = Shader3D.getDefineByName("PRIMITIVEMESH");

        ShaderDefines2D.initSprite2DCommandEncoder();
    }

    static initSprite2DCommandEncoder() {
        ShaderDefines2D.UNIFORM_NMATRIX_0 = Shader3D.propertyNameToID("u_NMatrix_0");
        ShaderDefines2D.UNIFORM_NMATRIX_1 = Shader3D.propertyNameToID("u_NMatrix_1");
        ShaderDefines2D.UNIFORM_INVERTMAT_0 = Shader3D.propertyNameToID("u_InvertMat_0");
        ShaderDefines2D.UNIFORM_INVERTMAT_1 = Shader3D.propertyNameToID("u_InvertMat_1");

        ShaderDefines2D.UNIFORM_MMAT = Shader3D.propertyNameToID("u_mmat");
        ShaderDefines2D.UNIFORM_CLIPMATDIR = Shader3D.propertyNameToID("u_clipMatDir");
        ShaderDefines2D.UNIFORM_CLIPMATPOS = Shader3D.propertyNameToID("u_clipMatPos");

        ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATDIR = Shader3D.propertyNameToID("u_mClipMatDir");
        ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATPOS = Shader3D.propertyNameToID("u_mClipMatPos");

        // ShaderDefines2D.UNIFORM_PIVOTPOS = Shader3D.propertyNameToID("u_pivotPos");
        ShaderDefines2D.UNIFORM_MMAT2 = Shader3D.propertyNameToID("u_mmat2");
        ShaderDefines2D.UNIFORM_SIZE = Shader3D.propertyNameToID("u_size");
        ShaderDefines2D.UNIFORM_VERTALPHA = Shader3D.propertyNameToID("u_VertAlpha");

        ShaderDefines2D.UNIFORM_SPRITETEXTURE = Shader3D.propertyNameToID("u_spriteTexture");
        ShaderDefines2D.UNIFORM_VERTEX_SIZE = Shader3D.propertyNameToID("u_vertexSize");

        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2D");
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_NMATRIX_0, "u_NMatrix_0", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_NMATRIX_1, "u_NMatrix_1", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_MMAT, "u_mmat", ShaderDataType.Matrix4x4);

        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_MMAT2, "u_mmat2", ShaderDataType.Matrix4x4);
        // commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_SIZE, "u_size", ShaderDataType.Vector2);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_VERTALPHA, "u_VertAlpha", ShaderDataType.Float);
        // commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_SPRITETEXTURE, "u_spriteTexture", ShaderDataType.Texture2D);

        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_TEXRANGE, "u_TexRange", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATDIR, "u_clipMatDir", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATPOS, "u_clipMatPos", ShaderDataType.Vector4);
        //commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_VERTEX_SIZE, "u_vertexSize", ShaderDataType.Vector4);

        let sceneUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGlobal");
        sceneUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_SIZE, "u_size", ShaderDataType.Vector2);
        sceneUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_INVERTMAT_0, "u_InvertMat_0", ShaderDataType.Vector3);
        sceneUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_INVERTMAT_1, "u_InvertMat_1", ShaderDataType.Vector3);
    }
}


