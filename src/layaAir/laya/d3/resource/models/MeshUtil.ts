import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { MeshSprite3DShaderDeclaration } from "../../core/MeshSprite3DShaderDeclaration";
import { Mesh } from "./Mesh";

/**
 * @en Utility class for mesh operations
 * @zh Mesh操作的实用工具类
 */
export class MeshUtil {
    /**
     * @en Get the shader defines for a mesh
     * @param mesh The mesh to analyze
     * @param out Array to store the resulting shader defines
     * @zh 获取mesh的着色器宏定义
     * @param mesh 输入的Mesh对象
     * @param out 用于存储着色器宏定义的输出数组
     */
    static getMeshDefine(mesh: Mesh, out: Array<ShaderDefine>) {
        out.length = 0;
        let vertexElements = mesh._vertexBuffer.vertexDeclaration._vertexElements;
        for (const element of vertexElements) {
            switch (element.elementUsage) {
                case VertexMesh.MESH_COLOR0:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
                    break;
                case VertexMesh.MESH_TEXTURECOORDINATE0:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
                    break;
                case VertexMesh.MESH_TEXTURECOORDINATE1:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
                    break;
                case VertexMesh.MESH_TANGENT0:
                    out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_TANGENT);
                    break;
            }
        }
    }
}



