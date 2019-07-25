import { VertexDeclaration } from "../VertexDeclaration";
import { VertexElement } from "../VertexElement";
import { VertexElementFormat } from "../VertexElementFormat";

/**
 * ...
 * @author ...
 */
export class VertexMesh {
	static MESH_POSITION0: number = 0;
	static MESH_COLOR0: number = 1;
	static MESH_TEXTURECOORDINATE0: number = 2;
	static MESH_NORMAL0: number = 3;
	static MESH_TANGENT0: number = 4;
	static MESH_BLENDINDICES0: number = 5;
	static MESH_BLENDWEIGHT0: number = 6;
	static MESH_TEXTURECOORDINATE1: number = 7;

	static MESH_WORLDMATRIX_ROW0: number = 8;
	static MESH_WORLDMATRIX_ROW1: number = 9;
	static MESH_WORLDMATRIX_ROW2: number = 10;
	static MESH_WORLDMATRIX_ROW3: number = 11;
	static MESH_MVPMATRIX_ROW0: number = 12;
	static MESH_MVPMATRIX_ROW1: number = 13;
	static MESH_MVPMATRIX_ROW2: number = 14;
	static MESH_MVPMATRIX_ROW3: number = 15;

	static instanceWorldMatrixDeclaration: VertexDeclaration;

	static instanceMVPMatrixDeclaration: VertexDeclaration;

	/**@internal */
	private static _vertexDeclarationMap: any = {};

	/**
	 * @internal
	 */
	static __init__(): void {
		VertexMesh.instanceWorldMatrixDeclaration = new VertexDeclaration(64,
			[new VertexElement(0, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW0),
			new VertexElement(16, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW1),
			new VertexElement(32, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW2),
			new VertexElement(48, VertexElementFormat.Vector4, VertexMesh.MESH_WORLDMATRIX_ROW3)]);

		VertexMesh.instanceMVPMatrixDeclaration = new VertexDeclaration(64,
			[new VertexElement(0, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW0),
			new VertexElement(16, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW1),
			new VertexElement(32, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW2),
			new VertexElement(48, VertexElementFormat.Vector4, VertexMesh.MESH_MVPMATRIX_ROW3)]);
	}

	/**
	 * 获取顶点声明。
	 * @param vertexFlag 顶点声明标记字符,格式为:"POSITION,NORMAL,COLOR,UV,UV1,BLENDWEIGHT,BLENDINDICES,TANGENT"。
	 * @return 顶点声明。
	 */
	static getVertexDeclaration(vertexFlag: string, compatible: boolean = true): VertexDeclaration {
		var verDec: VertexDeclaration = VertexMesh._vertexDeclarationMap[vertexFlag + (compatible ? "_0" : "_1")];//TODO:兼容模式
		if (!verDec) {
			var subFlags: any[] = vertexFlag.split(",");
			var offset: number = 0;
			var elements: any[] = [];
			for (var i: number = 0, n: number = subFlags.length; i < n; i++) {
				var element: VertexElement;
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
							element = new VertexElement(offset, VertexElementFormat.Vector4, VertexMesh.MESH_BLENDINDICES0);//兼容
							offset += 16;
						} else {
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
			VertexMesh._vertexDeclarationMap[vertexFlag + (compatible ? "_0" : "_1")] = verDec;//TODO:兼容模式
		}
		return verDec;
	}
}


