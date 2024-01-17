import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";

import BRDFGLSL from "./BRDF.glsl";
import PBRGIGLSL from "./pbrGI.glsl";

import PBRCommonGLSL from "./pbrCommon.glsl";
import PBRVertexGLSL from "./pbrVertex.glsl";
import PBRFragGLSL from "./pbrFrag.glsl";
import PBRMetallicGLSL from "./pbrMetallicFrag.glsl";
import { PBRDefaultDFG } from "./PBRDefaultDFG";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { ShaderDataType } from "../../../RenderEngine/RenderInterface/ShaderData";

export class PBRShaderLib {

    /**
     * emission
     */
    static DEFINE_EMISSION: ShaderDefine;

    /**
     * clear coat
     */
    static DEFINE_CLEARCOAT: ShaderDefine;
    static DEFINE_CLEARCOAT_NORMAL: ShaderDefine;

    /**
     * anisotropy
     */
    static DEFINE_ANISOTROPY: ShaderDefine;

    /**
     * ior
     */
    static DEFINE_IOR: ShaderDefine;

    /**
     * iridescence
     */
    static DEFINE_IRIDESCENCE: ShaderDefine;

    /**
     * sheen
     */
    static DEFINE_SHEEN: ShaderDefine;

    /**
     * transmission
     */
    static DEFINE_TRANSMISSION: ShaderDefine;

    /**
     * thick / volume
     */
    static DEFINE_THICKNESS: ShaderDefine;

    static init() {

        PBRShaderLib.DEFINE_EMISSION = Shader3D.getDefineByName("EMISSION");

        PBRShaderLib.DEFINE_CLEARCOAT = Shader3D.getDefineByName("CLEARCOAT");
        PBRShaderLib.DEFINE_CLEARCOAT_NORMAL = Shader3D.getDefineByName("CLEARCOAT_NORMAL");

        PBRShaderLib.DEFINE_ANISOTROPY = Shader3D.getDefineByName("ANISOTROPIC");

        PBRShaderLib.DEFINE_IOR = Shader3D.getDefineByName("IOR");

        PBRShaderLib.DEFINE_IRIDESCENCE = Shader3D.getDefineByName("IRIDESCENCE");

        PBRShaderLib.DEFINE_SHEEN = Shader3D.getDefineByName("SHEEN");

        PBRShaderLib.DEFINE_TRANSMISSION = Shader3D.getDefineByName("TRANSMISSION");

        PBRShaderLib.DEFINE_THICKNESS = Shader3D.getDefineByName("THICKNESS");

        // pbr lib
        Shader3D.addInclude("BRDF.glsl", BRDFGLSL);
        Shader3D.addInclude("PBRGI.glsl", PBRGIGLSL);

        Shader3D.addInclude("PBRCommon.glsl", PBRCommonGLSL);
        Shader3D.addInclude("PBRVertex.glsl", PBRVertexGLSL);
        Shader3D.addInclude("PBRFrag.glsl", PBRFragGLSL);

        PBRDefaultDFG.DefaultDfgTexture();
        SubShader.regIncludeBindUnifrom("PBRGI.glsl", { "u_IBLDFG": ShaderDataType.Texture2D }, { "u_IBLDFG": PBRDefaultDFG.defaultDFG });

        Shader3D.addInclude("PBRMetallicFrag.glsl", PBRMetallicGLSL);
    }
}