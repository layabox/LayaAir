import VFXUtilsGLSL from "./VFXUtils.glsl";
import VFXCommonGLSL from "./VFXCommon.glsl";
import VFXGPUEventGLSL from "./VFXGPUEvent.glsl";
import VFXRenderCommonGLSL from "./VFXRenderCommon.glsl";
import VFXRenderVertexGLSL from "./VFXRenderVertex.glsl";
import BlueprintPixelVertexVFXGLSL from "./BlueprintPixelVertexVFX.glsl";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
export class VFXShaderInit {

    static init() {
        Shader3D.addInclude("VFXUtils.glsl", VFXUtilsGLSL);
        Shader3D.addInclude("VFXCommon.glsl", VFXCommonGLSL);
        Shader3D.addInclude("VFXGPUEvent.glsl", VFXGPUEventGLSL);
        Shader3D.addInclude("VFXRenderCommon.glsl", VFXRenderCommonGLSL);
        Shader3D.addInclude("VFXRenderVertex.glsl", VFXRenderVertexGLSL);
        // 蓝图 shader 启 supportVFX 时引用此文件；用全路径 key 兼容 .bps 编出来的
        // `#include "shaderBlueprint/lib/BlueprintPixelVertexVFX.glsl"` 写法
        Shader3D.addInclude("shaderBlueprint/lib/BlueprintPixelVertexVFX.glsl", BlueprintPixelVertexVFXGLSL);
    }

}
