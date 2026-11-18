import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import BlitVS from "../postprocess/BlitScreen.vs";
import DepthCopyFS from "./DecalDepthCopy.fs";

/**
 * @en Copies current opaque depth to an independent, linear RGBA8 sampling texture.
 * @zh 将当前不透明深度复制到独立、使用线性颜色空间的 RGBA8 采样纹理。
 * @internal
 */
export class DecalDepthCopyShaderInit {
    static shader: Shader3D;

    static init(): void {
        if (this.shader) return;
        const shader = Shader3D.add("DecalDepthCopy");
        shader.shaderType = ShaderFeatureType.PostProcess;
        const subShader = new SubShader({
            a_PositionTexcoord: [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        }, {
            u_OffsetScale: ShaderDataType.Vector4
        });
        shader.addSubShader(subShader);
        const pass = subShader.addShaderPass(BlitVS, DepthCopyFS);
        pass.statefirst = true;
        const state = pass.renderState;
        state.depthTest = RenderState.DEPTHTEST_ALWAYS;
        state.depthWrite = false;
        state.cull = RenderState.CULL_NONE;
        state.blend = RenderState.BLEND_DISABLE;
        this.shader = shader;
    }
}
