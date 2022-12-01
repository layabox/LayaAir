import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";

import UtillitiesColorGLSL from "./lib/UtillitiesColor.glsl";
import TransformCommonGLSL from "./lib/TransformCommon.glsl";
import RRTCommonGLSL from "./lib/RRTCommon.glsl";
import ODTCommonGLSL from "./lib/ODTCommon.glsl";
import TonescalesGLSL from "./lib/Tonescales.glsl";

import RRTGLSL from "./rrt/RRT.glsl";
import ODT_sRGB_100nits_GLSL from "./odt/ODT_sRGB_100nits.glsl";

import ACESGLSL from "./ACES.glsl";

export class ACESShaderLib {

    static init() {
        Shader3D.addInclude("ACES_UtillitiesColor.glsl", UtillitiesColorGLSL);
        Shader3D.addInclude("ACES_TransformCommon.glsl", TransformCommonGLSL);
        Shader3D.addInclude("ACES_Tonescales.glsl", TonescalesGLSL);
        Shader3D.addInclude("ACES_RRTCommon.glsl", RRTCommonGLSL);
        Shader3D.addInclude("ACES_ODTCommon.glsl", ODTCommonGLSL);

        Shader3D.addInclude("ACES_RRT.glsl", RRTGLSL);
        Shader3D.addInclude("ACES_ODT_sRGB_100nits.glsl", ODT_sRGB_100nits_GLSL);

        Shader3D.addInclude("ACES.glsl", ACESGLSL);
    }

}