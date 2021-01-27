import { VertexDeclaration } from "../VertexDeclaration";
import { VertexElement } from "../VertexElement";
import { VertexElementFormat } from "../VertexElementFormat";

/**
 * ...
 * @author ...
 */
export class VertexMesh {
	/**顶点位置数据 */
	static MESH_POSITION0: number = 0;
	/**顶点顶点色数据 */
	static MESH_COLOR0: number = 1;
	/**顶点UV0数据 */
	static MESH_TEXTURECOORDINATE0: number = 2;
	/**顶点法线数据 */
	static MESH_NORMAL0: number = 3;
	/**顶点切线数据 */
	static MESH_TANGENT0: number = 4;
	/**顶点骨骼索引数据 */
	static MESH_BLENDINDICES0: number = 5;
	/**顶点骨骼权重数据 */
	static MESH_BLENDWEIGHT0: number = 6;
	/**顶点UV1数据 */
	static MESH_TEXTURECOORDINATE1: number = 7;
	/**顶点世界矩阵数据Row0 */
	static MESH_WORLDMATRIX_ROW0: number = 8;
	/**顶点世界矩阵数据Row1 */
	static MESH_WORLDMATRIX_ROW1: number = 9;
	/**顶点世界矩阵数据Row2 */
	static MESH_WORLDMATRIX_ROW2: number = 10;
	/**顶点世界矩阵数据Row3 */
	static MESH_WORLDMATRIX_ROW3: number = 11;


	//TODO：location不够
	/**简单数据动画数据 */
	static MESH_SIMPLEANIMATOR:number = 12;
	/**instanceworld顶点描述 */
	static instanceWorldMatrixDeclaration: VertexDeclaration;
	/**instanceSimple动画数据顶点描述 */
	static instanceSimpleAnimatorDeclaration: VertexDeclaration;

	
	/**自定义attribute instance 预留位*/
	/**顶点自定义数据0 */
	static MESH_CUSTOME0:number = 12;
	/**顶点自定义数据1 */
	static MESH_CUSTOME1:number = 13;
	/**顶点自定义数据2 */
	static MESH_CUSTOME2:number = 14;
	/**顶点自定义数据3 */
	static MESH_CUSTOME3:number = 15;



	
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
		
		VertexMesh.instanceSimpleAnimatorDeclaration = new VertexDeclaration(16,[new VertexElement(0,VertexElementFormat.Vector4,VertexMesh.MESH_SIMPLEANIMATOR)]);
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


