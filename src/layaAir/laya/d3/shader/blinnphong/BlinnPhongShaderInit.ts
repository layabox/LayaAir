import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../SubShader";

import BlinnPhongCommonGLSL from "./BlinnphongCommon.glsl";
import BlinnPhongVertexGLSL from "./BlinnPhongVertex.glsl";
import BlinnPhongFragGLSL from "./BlinnPhongFrag.glsl";

import BlinnPhongVS from "./BlinnPhong.vs";
import BlinnPhongFS from "./BlinnPhong.fs";

import DepthVS from "../depth/Depth.vs";
import DepthFS from "../depth/Depth.fs";

export class BlinnPhongShaderInit {

    static init() {

        Shader3D.addInclude("BlinnPhongCommon.glsl", BlinnPhongCommonGLSL);
        Shader3D.addInclude("BlinnPhongVertex.glsl", BlinnPhongVertexGLSL);
        Shader3D.addInclude("BlinnPhongFrag.glsl", BlinnPhongFragGLSL);

        let uniformMap = {

        };

        let shader = Shader3D.add("BLINNPHONG");
        let subShader = new SubShader(SubShader.DefaultAttributeMap, uniformMap);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(BlinnPhongVS, BlinnPhongFS);
        let shadowPass = subShader.addShaderPass(DepthVS, DepthFS, "ShadowCaster");


    }

}