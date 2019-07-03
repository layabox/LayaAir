import { VertexDeclaration } from "../VertexDeclaration";
import { VertexElement } from "../VertexElement";
import { VertexElementFormat } from "../VertexElementFormat";
/**
 * ...
 * @author ...
 */
export class VertexMesh {
    /**
     * 获取顶点声明。
     * @param vertexFlag 顶点声明标记字符,格式为:"POSITION,NORMAL,COLOR,UV,UV1,BLENDWEIGHT,BLENDINDICES,TANGENT"。
     * @return 顶点声明。
     */
    static getVertexDeclaration(vertexFlag, compatible = true) {
        var verDec = VertexMesh._vertexDeclarationMap[vertexFlag + (compatible ? "_0" : "_1")]; //TODO:兼容模式
        if (!verDec) {
            var subFlags = vertexFlag.split(",");
            var offset = 0;
            var elements = [];
            for (var i = 0, n = subFlags.length; i < n; i++) {
                var element;
                switch (subFlags[i]) {
                    case "POSITION":
                        element = new VertexElement(offset, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0);
                        offset += 12;
                        break;
                    case "NORMAL":
                        element = new VertexElement(offset, VertexElementFormat.Vector3, VertexMesh.MESH_NORMAL0);
                        offset += 12;
                        break;
                    case "COLOR":
                        element = new VertexElement(offset, VertexElementFormat.Vector4, VertexMesh.MESH_COLOR0);
                        offset += 16;
                        break;
                    case "UV":
                        element = new VertexElement(offset, VertexElementFormat.Vector2, VertexMesh.MESH_TEXTURECOORDINATE0);
                        offset += 8;
                        break;
                    case "UV1":
                        element = new VertexElement(offset, VertexElementFormat.Vector2, VertexMesh.MESH_TEXTURECOORDINATE1);
                        offset += 8;
                        break;
                    case "BLENDWEIGHT":
                        element = new VertexElement(offset, VertexElementFormat.Vector4, VertexMesh.MESH_BLENDWEIGHT0);
                        offset += 16;
                        break;
                    case "BLENDINDICES":
                        if (compatible) {
                            element = new VertexElement(offset, VertexElementFormat.Vector4, VertexMesh.MESH_BLENDINDICES0); //兼容
                            offset += 16;
                        }
                        else {
                            element = new VertexElement(offset, VertexElementFormat.Byte4, VertexMesh.MESH_BLENDINDICES0);
                            offset += 4;
                        }
                        break;
                    case "TANGENT":
                        element = new VertexElement(offset, VertexElementFormat.Vector4, VertexMesh.MESH_TANGENT0);
                        offset += 16;
                        break;
                    default:
                        throw "VertexMesh: unknown vertex flag.";
                }
                elements.push(element);
            }
            verDec = new VertexDeclaration(offset, elements);
            VertexMesh._vertexDeclarationMap[vertexFlag + (compatible ? "_0" : "_1")] = verDec; //TODO:兼容模式
        }
        return verDec;
    }
}
VertexMesh.MESH_POSITION0 = 0;
VertexMesh.MESH_COLOR0 = 1;
VertexMesh.MESH_TEXTURECOORDINATE0 = 2;
VertexMesh.MESH_NORMAL0 = 3;
VertexMesh.MESH_TANGENT0 = 4;
VertexMesh.MESH_BLENDINDICES0 = 5;
VertexMesh.MESH_BLENDWEIGHT0 = 6;
VertexMesh.MESH_TEXTURECOORDINATE1 = 7;
VertexMesh.MESH_WORLDMATRIX_ROW0 = 8;
VertexMesh.MESH_WORLDMATRIX_ROW1 = 9;
VertexMesh.MESH_WORLDMATRIX_ROW2 = 10;
VertexMesh.MESH_WORLDMATRIX_ROW3 = 11;
VertexMesh.MESH_MVPMATRIX_ROW0 = 12;
VertexMesh.MESH_MVPMATRIX_ROW1 = 13;
VertexMesh.MESH_MVPMATRIX_ROW2 = 14;
VertexMesh.MESH_MVPMATRIX_ROW3 = 15;
VertexMesh.instanceWorldMatrixDeclaration = new VertexDeclaration(64, [new VertexElement(0, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW0),
    new VertexElement(16, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW1),
    new VertexElement(32, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW2),
    new VertexElement(48, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW3)]);
VertexMesh.instanceMVPMatrixDeclaration = new VertexDeclaration(64, [new VertexElement(0, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW0),
    new VertexElement(16, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW1),
    new VertexElement(32, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW2),
    new VertexElement(48, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW3)]);
/**@internal */
VertexMesh._vertexDeclarationMap = {};
