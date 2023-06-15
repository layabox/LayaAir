import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { UniformBufferParamsType, UnifromBufferData } from "../../RenderEngine/UniformBufferData";

export class DepthCasterData{
    static DepthCasterUBOData: UnifromBufferData;
    /**
     * create DepthCaster UniformBuffer
     * @internal
     * @returns 
     */
    static createDepthCasterUniformBlock(): UnifromBufferData {

        if (!DepthCasterData.DepthCasterUBOData) {
            let uniformpara = new Map<number, UniformBufferParamsType>();
            uniformpara.set(Shader3D.propertyNameToID("u_ShadowBias"), UniformBufferParamsType.Vector4);
            //uniformpara.set(Shader3D.propertyNameToID("u_ViewProjection"), UniformBufferParamsType.Matrix4x4);
            uniformpara.set(Shader3D.propertyNameToID("u_ShadowLightDirection"), UniformBufferParamsType.Vector3);
            DepthCasterData.DepthCasterUBOData = new UnifromBufferData(uniformpara);
        }

        return DepthCasterData.DepthCasterUBOData;
    }
}