import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { UniformBufferParamsType, UnifromBufferData } from "../../RenderEngine/UniformBufferData";

/**
 * @en DepthCasterData class for managing depth casting data.
 * @zh DepthCasterData 类，用于管理深度投射数据。
 */
export class DepthCasterData {
    /**
     * @en Stores the uniform buffer data for the depth caster
     * @zh 存储深度投射器的统一缓冲数据
     */
    static DepthCasterUBOData: UnifromBufferData;

    /**
     * @internal
     * @en Create DepthCaster UniformBuffer.
     * @returns The created UniformBufferData for depth caster.
     * @zh 创建深度投射器的 UniformBuffer。
     * @returns 创建的深度投射器 UniformBufferData。
     */
    static createDepthCasterUniformBlock(): UnifromBufferData {

        if (!DepthCasterData.DepthCasterUBOData) {
            let uniformpara = new Map<number, UniformBufferParamsType>();
            uniformpara.set(Shader3D.propertyNameToID("u_ShadowBias"), UniformBufferParamsType.Vector4);
            uniformpara.set(Shader3D.propertyNameToID("u_ShadowLightDirection"), UniformBufferParamsType.Vector3);
            DepthCasterData.DepthCasterUBOData = new UnifromBufferData(uniformpara);
        }

        return DepthCasterData.DepthCasterUBOData;
    }
}