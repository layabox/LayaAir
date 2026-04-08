import { ShaderData, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";

export class ShaderDefines2D {

    /**
     * @en Number of bits reserved for per-element shader defines in the textureKey encoding.
     * @zh textureKey 编码中为逐元素着色器宏定义保留的位数。
     */
    static SHADER_DEFINE_BITS = 7;
    /**
     * @en Per-element shader define names, in bit-position order (bit 0 = FILLTEXTURE, bit 1 = GAMMATEXTURE, etc.)
     * @zh 逐元素着色器宏定义名称，按位位置排列。
     * @internal
     */
    static _PER_ELEMENT_DEFINE_NAMES: string[] = [
        'FILLTEXTURE', 'GAMMATEXTURE', 'TEXTURESHADER',
        'PRIMITIVESHADER', 'MATERIALCLIP', 'UNIFORMCLIP', 'UV_CLIP_GPU'
    ];

    /** @internal cached mapping: array of { define, bit } for fast lookup */
    static _perElementDefineMap: { define: ShaderDefine; bit: number }[] = null;
    /** @internal whether all per-element defines share a single _index word */
    static _singleWord: boolean = false;
    /** @internal the shared _index if _singleWord is true */
    static _sharedIndex: number = -1;

    /**
     * @en Build the per-element define mapping from ShaderDefines2D static fields.
     * @zh 从 ShaderDefines2D 静态字段构建逐元素宏定义映射。
     * @internal
     */
    static _buildDefineMap(): void {
        this._perElementDefineMap = [];
        const defines: ShaderDefine[] = [
            ShaderDefines2D.FILLTEXTURE, ShaderDefines2D.GAMMATEXTURE,
            ShaderDefines2D.TEXTURESHADER, ShaderDefines2D.PRIMITIVESHADER,
            ShaderDefines2D.MATERIALCLIP, ShaderDefines2D.UNIFORMCLIP, ShaderDefines2D.UV_CLIP_GPU
        ];
        let firstIndex = defines[0]._index;
        this._singleWord = true;
        for (let i = 0; i < defines.length; i++) {
            if (defines[i]._index !== firstIndex) {
                this._singleWord = false;
            }
            this._perElementDefineMap.push({ define: defines[i], bit: 1 << i });
        }
        if (this._singleWord) {
            this._sharedIndex = firstIndex;
        }
    }
    /**
     * @en Compute a bit field (0..127) representing which per-element shader defines are active in the given ShaderData.
     * @zh 计算给定 ShaderData 中活跃的逐元素着色器宏定义位域（0..127）。
     * @param shaderData The shader data to query defines from.
     * @returns A number in range [0, 2^SHADER_DEFINE_BITS - 1].
     */
    static getPerElementDefineBits(shaderData: ShaderData): number {
        if (!this._perElementDefineMap) {
            this._buildDefineMap();
        }
        let bits = 0;
        for (let i = 0; i < this._perElementDefineMap.length; i++) {
            let entry = this._perElementDefineMap[i];
            if (shaderData.hasDefine(entry.define)) {
                bits |= entry.bit;
            }
        }
        return bits;
    }

    /**@internal */
    static FILLTEXTURE: ShaderDefine;

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
    /** @internal */
    static UNIFORMCLIP:ShaderDefine;
    /** @internal */
    static UV_CLIP_GPU: ShaderDefine;

    /**@internal */
    static UNIFORM_CLIPMATDIR: number;// uniform vec4 u_clipMatDir;
    static UNIFORM_CLIPMATPOS: number;// uniform vec2 u_clipMatPos;

    static UNIFORM_MATERIAL_CLIPMATDIR: number;// uniform vec4 u_mClipMatDir;
    static UNIFORM_MATERIAL_CLIPMATPOS: number;// uniform vec2 u_mCipMatPos;

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

        ShaderDefines2D.VERTEX_SIZE = Shader3D.getDefineByName("VERTEX_SIZE");
        ShaderDefines2D.FILLTEXTURE = Shader3D.getDefineByName("FILLTEXTURE");
        ShaderDefines2D.RENDERTEXTURE = Shader3D.getDefineByName('RENDERTEXTURE');
        ShaderDefines2D.MATERIALCLIP = Shader3D.getDefineByName('MATERIALCLIP');

        ShaderDefines2D.UNIFORMCLIP = Shader3D.getDefineByName('UNIFORMCLIP');
        ShaderDefines2D.UV_CLIP_GPU = Shader3D.getDefineByName('UV_CLIP_GPU');
        
        ShaderDefines2D.GAMMASPACE = Shader3D.getDefineByName('GAMMASPACE');

        ShaderDefines2D.INVERTY = Shader3D.getDefineByName('INVERTY');

        ShaderDefines2D.GAMMATEXTURE = Shader3D.getDefineByName('GAMMATEXTURE');

        ShaderDefines2D.TEXTURESHADER = Shader3D.getDefineByName("TEXTUREVS");
        ShaderDefines2D.PRIMITIVESHADER = Shader3D.getDefineByName("PRIMITIVEMESH");

        // Verify per-element defines share a single _index word for efficient bit mapping
        {
            let defines = [
                ShaderDefines2D.FILLTEXTURE, ShaderDefines2D.GAMMATEXTURE,
                ShaderDefines2D.TEXTURESHADER, ShaderDefines2D.PRIMITIVESHADER,
                ShaderDefines2D.MATERIALCLIP, ShaderDefines2D.UNIFORMCLIP, ShaderDefines2D.UV_CLIP_GPU
            ];
            let idx0 = defines[0]._index;
            for (let i = 1; i < defines.length; i++) {
                if (defines[i]._index !== idx0) {
                    console.warn('[ShaderDefines2D] Per-element defines span multiple _index words (' + idx0 + ' vs ' + defines[i]._index + '). textureKey bit mapping uses per-define hasDefine() fallback.');
                    break;
                }
            }
        }

        ShaderDefines2D.initSprite2DCommandEncoder();
    }

    static initSprite2DCommandEncoder() {
        ShaderDefines2D.UNIFORM_NMATRIX_0 = Shader3D.propertyNameToID("u_NMatrix_0");
        ShaderDefines2D.UNIFORM_NMATRIX_1 = Shader3D.propertyNameToID("u_NMatrix_1");
        ShaderDefines2D.UNIFORM_INVERTMAT_0 = Shader3D.propertyNameToID("u_InvertMat_0");
        ShaderDefines2D.UNIFORM_INVERTMAT_1 = Shader3D.propertyNameToID("u_InvertMat_1");
        ShaderDefines2D.UNIFORM_CLIPMATDIR = Shader3D.propertyNameToID("u_clipMatDir");
        ShaderDefines2D.UNIFORM_CLIPMATPOS = Shader3D.propertyNameToID("u_clipMatPos");
        ShaderDefines2D.UNIFORM_SIZE = Shader3D.propertyNameToID("u_size");
        ShaderDefines2D.UNIFORM_VERTALPHA = Shader3D.propertyNameToID("u_VertAlpha");

        // sprite2d
        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2D");
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_NMATRIX_0, "u_NMatrix_0", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_NMATRIX_1, "u_NMatrix_1", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_VERTALPHA, "u_VertAlpha", ShaderDataType.Float);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATDIR, "u_clipMatDir", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(ShaderDefines2D.UNIFORM_CLIPMATPOS, "u_clipMatPos", ShaderDataType.Vector4);

        // pass
        let passUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DPass");
        passUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_SIZE, "u_size", ShaderDataType.Vector2);
        passUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_INVERTMAT_0, "u_InvertMat_0", ShaderDataType.Vector3);
        passUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_INVERTMAT_1, "u_InvertMat_1", ShaderDataType.Vector3);

        // graphics
        ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATDIR = Shader3D.propertyNameToID("u_mClipMatDir");
        ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATPOS = Shader3D.propertyNameToID("u_mClipMatPos");
        ShaderDefines2D.UNIFORM_VERTEX_SIZE = Shader3D.propertyNameToID("u_vertexSize");
        ShaderDefines2D.UNIFORM_TEXRANGE = Shader3D.propertyNameToID("u_TexRange");
        ShaderDefines2D.UNIFORM_SPRITETEXTURE = Shader3D.propertyNameToID("u_spriteTexture");

        const graphicsUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGraphics");
        graphicsUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATDIR, "u_mClipMatDir", ShaderDataType.Vector4);
        graphicsUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATPOS, "u_mClipMatPos", ShaderDataType.Vector4);
        graphicsUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_VERTEX_SIZE, "u_vertexSize", ShaderDataType.Vector4);
        graphicsUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_TEXRANGE, "u_TexRange", ShaderDataType.Vector4);
        graphicsUniformMap.addShaderUniform(ShaderDefines2D.UNIFORM_SPRITETEXTURE, "u_spriteTexture", ShaderDataType.Texture2D);
    }
}


