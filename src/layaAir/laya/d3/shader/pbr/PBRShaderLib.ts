import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";

import BRDFGLSL from "./BRDF.glsl";
import PBRGIGLSL from "./pbrGI.glsl";

import PBRCommonGLSL from "./pbrCommon.glsl";
import PBRVertexGLSL from "./pbrVertex.glsl";
import PBRFragGLSL from "./pbrFrag.glsl";
import PBRMetallicGLSL from "./pbrMetallicFrag.glsl";
import { PBRDefaultDFG } from "./PBRDefaultDFG";
import { SubShader } from "../SubShader";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";

export class PBRShaderLib {

    static init() {
        // pbr lib
        Shader3D.addInclude("BRDF.glsl", BRDFGLSL);
        Shader3D.addInclude("PBRGI.glsl", PBRGIGLSL);
      

        Shader3D.addInclude("PBRCommon.glsl", PBRCommonGLSL);
        Shader3D.addInclude("PBRVertex.glsl", PBRVertexGLSL);
        Shader3D.addInclude("PBRFrag.glsl", PBRFragGLSL);

        Shader3D.addInclude("PBRMetallicFrag.glsl",PBRMetallicGLSL);

        PBRDefaultDFG.DefaultDfgTexture();
        SubShader.regIncludeBindUnifrom("PBRGI.glsl",{"u_IBLDGF": ShaderDataType.Texture2D},{"u_IBLDGF": PBRDefaultDFG.defaultDFG});
    }
}