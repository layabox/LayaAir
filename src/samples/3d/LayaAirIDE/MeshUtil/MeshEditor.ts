// import { Mesh } from "laya/d3/resource/models/Mesh";
// import { Vector3 } from "laya/d3/math/Vector3";
// import { Vector2 } from "laya/d3/math/Vector2";
// import { Vector4 } from "laya/d3/math/Vector4";
// import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D";
// import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
// import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
// import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
// import { VertexElement } from "laya/d3/graphics/VertexElement";
// import { VertexElementFormat } from "laya/d3/graphics/VertexElementFormat";
// import { LayaGL } from "laya/layagl/LayaGL";
// import { SubMesh } from "laya/d3/resource/models/SubMesh";
// import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
// import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
// import { AssetsManager, AssetType } from "../../core/assetsmgr/AssetsManager";
// import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
// import { MeshFilter } from "laya/d3/core/MeshFilter";
// import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";

// export class MeshEditor {

//     private static tempV3_0 = new Vector3();
//     private static tempV3_1 = new Vector3();


//     static init(){
//         let assetManager = AssetsManager.inst;
        
//         let mesh = PrimitiveMesh.createBox();
//         let tArray = this.calculateTangent(mesh);
//         assetManager.addAssets("defaultCube",AssetType.MESH,MeshEditor.addVertexElement(mesh,VertexMesh.MESH_TANGENT0,tArray));
        
//         mesh = PrimitiveMesh.createCapsule();
//         tArray = this.calculateTangent(mesh);
//         assetManager.addAssets("defaultCapsule",AssetType.MESH,MeshEditor.addVertexElement(mesh,VertexMesh.MESH_TANGENT0,tArray));
        
//         mesh = PrimitiveMesh.createCone();
//         tArray = this.calculateTangent(mesh);
//         assetManager.addAssets("defaultCone",AssetType.MESH,MeshEditor.addVertexElement(mesh,VertexMesh.MESH_TANGENT0,tArray));
        
//         mesh = PrimitiveMesh.createCylinder();
//         tArray = this.calculateTangent(mesh);
//         assetManager.addAssets("defaultCylinder",AssetType.MESH,MeshEditor.addVertexElement(mesh,VertexMesh.MESH_TANGENT0,tArray));
        
//         mesh = PrimitiveMesh.createPlane();
//         tArray = this.calculateTangent(mesh);
//         assetManager.addAssets("defaultPlane",AssetType.MESH,MeshEditor.addVertexElement(mesh,VertexMesh.MESH_TANGENT0,tArray));
        
//         mesh = PrimitiveMesh.createQuad();
//         tArray = this.calculateTangent(mesh);
//         assetManager.addAssets("defaultQuad",AssetType.MESH,MeshEditor.addVertexElement(mesh,VertexMesh.MESH_TANGENT0,tArray));
        
//         mesh = PrimitiveMesh.createSphere();
//         tArray = this.calculateTangent(mesh);
//         assetManager.addAssets("defaultSphere",AssetType.MESH,MeshEditor.addVertexElement(mesh,VertexMesh.MESH_TANGENT0,tArray));
        
//     }

//     /**
//      * 
//      * @param elementUsage 
//      */
//     static getElementFlagByUsage(elementUsage: number): string {
//         switch (elementUsage) {
//             case VertexMesh.MESH_POSITION0:
//                 return "POSITION";
//             case VertexMesh.MESH_NORMAL0:
//                 return "NORMAL";
//             case VertexMesh.MESH_COLOR0:
//                 return "COLOR";
//             case VertexMesh.MESH_TEXTURECOORDINATE0:
//                 return "UV";
//             case VertexMesh.MESH_TEXTURECOORDINATE1:
//                 return "UV1";
//             case VertexMesh.MESH_BLENDWEIGHT0:
//                 return "BLENDWEIGHT";
//             case VertexMesh.MESH_BLENDINDICES0:
//                 return "BLENDINDICES";
//             case VertexMesh.MESH_TANGENT0:
//                 return "TANGENT";
//             default:
//                 throw "MeshEditor: unknown vertex flag.";
//         }
//     }

//     /**
//      * 获取 VertexDeclaration 对象 对应的 declaration string
//      * @param verDec 
//      */
//     static getVertexDecStr(verDec: VertexDeclaration): string {

//         let decStrs: string[] = [];

//         let elementCount = verDec.vertexElementCount;
//         for (let index = 0; index < elementCount; index++) {
//             let e = verDec.getVertexElementByIndex(index);
//             let flag: string = MeshEditor.getElementFlagByUsage(e.elementUsage);
//             decStrs.push(flag);
//         }

//         if (decStrs.length) {
//             return decStrs.toString();
//         }
//         else {
//             return null;
//         }
//     }

//     static addVertexDeclaration(vertexDeclaration: VertexDeclaration, ) {

//     }

//     /**
//      * 向 mesh 中添加新的 vertexElement
//      * 若 mesh 中已经存在elementUsage对应元素， 直接返回不进行操作
//      * @param mesh 
//      * @param elementUsage 
//      * @param elementData 
//      */
//     static addVertexElement(mesh: Mesh, elementUsage: number, elementData: Float32Array) {
//         let gl: WebGLRenderingContext = LayaGL.instance;

//         let indexBuffer: IndexBuffer3D = mesh._indexBuffer;
//         let vertexBuffer: VertexBuffer3D = mesh._vertexBuffer;

//         // 原始 顶点声明
//         let vbDec: VertexDeclaration = mesh.getVertexDeclaration();

//         // 判断当前 mesh 中是否存在此 element 
//         // 存在直接返回
//         if (vbDec.getVertexElementByUsage(elementUsage)) {
//             return mesh;
//         }

//         let compatible = false;
//         let boneIndexVE: VertexElement = vbDec.getVertexElementByUsage(VertexMesh.MESH_BLENDINDICES0);
//         if (boneIndexVE) {
//             compatible = boneIndexVE.elementFormat == VertexElementFormat.Vector4;
//         }
//         // 生成的新 VertexDeclaration 确保需要添加的数据在顶点结构结尾
//         let vbDecStr: string = MeshEditor.getVertexDecStr(vbDec);
//         let flagStr: string = MeshEditor.getElementFlagByUsage(elementUsage);
//         vbDecStr += `,${flagStr}`;
//         let newvbDec: VertexDeclaration = VertexMesh.getVertexDeclaration(vbDecStr, compatible);

//         let newStride: number = newvbDec.vertexStride;
//         let newFloatStride: number = newStride / 4;
//         let vertexCount: number = mesh.vertexCount;
//         let vertexStride: number = vbDec.vertexStride;
//         let vertexFloatStride: number = vertexStride / 4;
//         let vertexfloat32: Float32Array = vertexBuffer.getFloat32Data();
//         let newVertexfloat32: Float32Array = new Float32Array(vertexCount * newStride / 4);

//         let addVE: VertexElement = newvbDec.getVertexElementByUsage(elementUsage);
//         let addFloatOffset = addVE.offset / 4;
//         let elmentInfo: number[] = VertexElementFormat.getElementInfos(addVE.elementFormat);
//         let elementLength = (elmentInfo[1] == gl.UNSIGNED_BYTE) ? 1 : 4;

//         for (let index = 0; index < vertexCount; index++) {
//             let oriOffset: number = vertexFloatStride * index;
//             let offset: number = newFloatStride * index;
//             let eoffset: number = offset + addFloatOffset;
//             let addDataOffset: number = elementLength * index;
//             for (let oi = 0; oi < vertexFloatStride; oi++) {
//                 newVertexfloat32[offset + oi] = vertexfloat32[oriOffset + oi];
//             }
//             for (let i = 0; i < elementLength; i++) {
//                 newVertexfloat32[eoffset + i] = elementData[addDataOffset + i];
//             }
//         }

//         let newVB: VertexBuffer3D = new VertexBuffer3D(newVertexfloat32.byteLength, gl.STATIC_DRAW, true);
//         newVB.vertexDeclaration = newvbDec;
//         newVB.setData(newVertexfloat32.buffer);
//         mesh._vertexBuffer = newVB;
//         mesh._setBuffer(newVB, indexBuffer);
//         mesh._setInstanceBuffer(mesh._instanceBufferStateType);

//         for (let index = 0; index < mesh.subMeshCount; index++) {
//             let subMesh: SubMesh = mesh.getSubMesh(index);
//             subMesh._vertexBuffer = newVB;
//         }

//         let memorySize: number = newVB._byteLength + indexBuffer._byteLength;

//         mesh._setCPUMemory(memorySize);
//         mesh._setGPUMemory(memorySize);

//         return mesh;
//     }


//     /**
//      * 计算 mesh tangent 数据
//      * @param mesh 
//      */
//     static calculateTangent(mesh: Mesh): Float32Array {

//         if (!mesh._isReadable) {
//             return null;
//         }

//         let vbDec: VertexDeclaration = mesh.getVertexDeclaration();
//         if (!(vbDec.getVertexElementByUsage(VertexMesh.MESH_POSITION0) && vbDec.getVertexElementByUsage(VertexMesh.MESH_NORMAL0) && vbDec.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0))) {
//             return null;
//         }

//         let indices: Uint32Array = new Uint32Array(mesh.getIndices());

//         let positions: Vector3[] = [];
//         mesh.getPositions(positions);

//         let normals: Vector3[] = [];
//         mesh.getNormals(normals);

//         let uvs: Vector2[] = [];
//         mesh.getUVs(uvs, 0);

//         let tan1s: Vector3[] = new Array(indices.length);
//         for (let index = 0; index < tan1s.length; index++) {
//             tan1s[index] = new Vector3();
//         }
//         let tan2s: Vector3[] = new Array(indices.length);
//         for (let index = 0; index < tan2s.length; index++) {
//             tan2s[index] = new Vector3();
//         }

//         for (let i = 0; i < indices.length; i += 3) {
//             let index1: number = indices[i];
//             let index2: number = indices[i + 1];
//             let index3: number = indices[i + 2];

//             let p1: Vector3 = positions[index1];
//             let p2: Vector3 = positions[index2];
//             let p3: Vector3 = positions[index3];

//             let uv1: Vector2 = uvs[index1];
//             let uv2: Vector2 = uvs[index2];
//             let uv3: Vector2 = uvs[index3];

//             let x1 = p2.x - p1.x;
//             let x2 = p3.x - p1.x;
//             let y1 = p2.y - p1.y;
//             let y2 = p3.y - p1.y;
//             let z1 = p2.z - p1.z;
//             let z2 = p3.z - p1.z;

//             let s1 = uv2.x - uv1.x;
//             let s2 = uv3.x - uv1.x;
//             let t1 = uv2.y - uv1.y;
//             let t2 = uv3.y - uv1.y;

//             let r = 1.0 / (s1 * t2 - s2 * t1);
//             let sdir: Vector3 = new Vector3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
//             let tdir: Vector3 = new Vector3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);

//             Vector3.add(sdir, tan1s[index1], tan1s[index1]);
//             Vector3.add(sdir, tan1s[index2], tan1s[index2]);
//             Vector3.add(sdir, tan1s[index3], tan1s[index3]);

//             Vector3.add(tdir, tan2s[index1], tan2s[index1]);
//             Vector3.add(tdir, tan2s[index2], tan2s[index2]);
//             Vector3.add(tdir, tan2s[index3], tan2s[index3]);
//         }

//         // let tangents: Vector4[] = [];
//         let tangentArray: Float32Array = new Float32Array(mesh.vertexCount * 4);

//         for (let index = 0; index < positions.length; index++) {
//             let n: Vector3 = normals[index];
//             let t: Vector3 = tan1s[index];

//             let temp: Vector3 = MeshEditor.tempV3_0;
//             Vector3.scale(n, Vector3.dot(n, t), temp);
//             Vector3.subtract(t, temp, temp);
//             Vector3.normalize(temp, temp);

//             let temp1: Vector3 = MeshEditor.tempV3_1;
//             Vector3.cross(n, t, temp1);
//             let w = Vector3.dot(temp1, tan2s[index]) < 0 ? -1 : 1;

//             tangentArray[index * 4] = temp.x;
//             tangentArray[index * 4 + 1] = temp.y;
//             tangentArray[index * 4 + 2] = temp.z;
//             tangentArray[index * 4 + 3] = w;
//             // tangents.push(new Vector4(temp.x, temp.y, temp.z, w));
//         }

//         return tangentArray;
//     }

//     /**
//      * // todo  need ?
//      * 获取 渲染节点需要的材质个数
//      * @param sprite 
//      * @returns 
//      */
//     static getMaterialCount(sprite: MeshSprite3D | SkinnedMeshSprite3D): number {
//         let meshFilter: MeshFilter = sprite.meshFilter;
//         let mesh: Mesh = meshFilter.sharedMesh;

//         return mesh.subMeshCount;
//     }

//     //-------------------------------------------------
//     // todo  提出去
//     /**
//      * 编辑器生成Box
//      */
//     static createBox():MeshSprite3D {
//         return new MeshSprite3D(AssetsManager.inst.getMesh("defaultCube"));
//     }

//     /**
//      * miner
//      * 编辑器生成Capsule
//      */
//     static createCapsule(){
//         return new MeshSprite3D(AssetsManager.inst.getMesh("defaultCube"));
//     }

//     /**
//      * miner
//      * 编辑器生成Cone
//      */
//     static createCone(){
//         return new MeshSprite3D(AssetsManager.inst.getMesh("defaultCone"));
//     }

//     /**
//      * miner
//      * 编辑器生成Cylinder
//      */
//     static createCylinder(){
//         return new MeshSprite3D(AssetsManager.inst.getMesh("defaultCylinder"));
//     }

//     /**
//      * miner
//      * 编辑器生成Plane
//      */
//     static createPlane(){
//         return new MeshSprite3D(AssetsManager.inst.getMesh("defaultPlane"));
//     }

//     /**
//      * miner
//      * 编辑器生成Quad
//      */
//     static creatQuad(){
//         return new MeshSprite3D(AssetsManager.inst.getMesh("defaultQuad"));
//     }

//     /**
//      * miner
//      * 编辑器生成Sphere
//      */
//     static createSphere(){
//         return new MeshSprite3D(AssetsManager.inst.getMesh("defaultSphere"));
//     }
// }
