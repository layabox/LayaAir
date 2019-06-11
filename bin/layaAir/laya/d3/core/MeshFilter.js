import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";
/**
 * <code>MeshFilter</code> 类用于创建网格过滤器。
 */
export class MeshFilter {
    /**
     * 获取共享网格。
     * @return 共享网格。
     */
    get sharedMesh() {
        return this._sharedMesh;
    }
    /**
     * 设置共享网格。
     * @return  value 共享网格。
     */
    set sharedMesh(value) {
        if (this._sharedMesh !== value) {
            var defineDatas = this._owner._render._shaderValues;
            var lastValue = this._sharedMesh;
            if (lastValue) {
                lastValue._removeReference();
                defineDatas.removeDefine(this._getMeshDefine(lastValue));
            }
            if (value) {
                value._addReference();
                defineDatas.addDefine(this._getMeshDefine(value));
            }
            this._owner._render._onMeshChange(value);
            this._sharedMesh = value;
        }
    }
    /**
     * 创建一个新的 <code>MeshFilter</code> 实例。
     * @param owner 所属网格精灵。
     */
    constructor(owner) {
        this._owner = owner;
    }
    /**
     * @private
     */
    _getMeshDefine(mesh) {
        var define;
        for (var i = 0, n = mesh._subMeshCount; i < n; i++) {
            var subMesh = mesh._getSubMesh(i);
            var vertexElements = subMesh._vertexBuffer._vertexDeclaration.vertexElements;
            for (var j = 0, m = vertexElements.length; j < m; j++) {
                var vertexElement = vertexElements[j];
                var name = vertexElement.elementUsage;
                switch (name) {
                    case VertexMesh.MESH_COLOR0:
                        define |= MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR;
                        break;
                    case VertexMesh.MESH_TEXTURECOORDINATE0:
                        define |= MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0;
                        break;
                    case VertexMesh.MESH_TEXTURECOORDINATE1:
                        define |= MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1;
                        break;
                }
            }
        }
        return define;
    }
    /**
     * @inheritDoc
     */
    destroy() {
        this._owner = null;
        (this._sharedMesh) && (this._sharedMesh._removeReference(), this._sharedMesh = null);
    }
}
