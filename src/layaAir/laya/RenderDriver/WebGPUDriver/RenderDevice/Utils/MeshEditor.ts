import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { SubMesh } from "laya/d3/resource/models/SubMesh";
import { LayaGL } from "laya/layagl/LayaGL";
import { Vector2 } from "laya/maths/Vector2";
import { Vector3 } from "laya/maths/Vector3";
import { BufferUsage } from "laya/RenderEngine/RenderEnum/BufferTargetType";
import { RenderParams } from "laya/RenderEngine/RenderEnum/RenderParams";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "laya/RenderEngine/VertexDeclaration";
import { VertexElement } from "laya/renders/VertexElement";
import { VertexElementFormat } from "laya/renders/VertexElementFormat";

export function MeshAddTangent(mesh: Mesh) {
    const vd = mesh.getVertexDeclaration();
    const vte = vd.getVertexElementByUsage(VertexMesh.MESH_TANGENT0);

    if (!vte) {
        const tangentDatas = MeshEditor.calculateTangent(mesh);
        if (tangentDatas)
            MeshEditor.addVertexElement(mesh, VertexMesh.MESH_TANGENT0, tangentDatas);
    } else {
        const tangentDatas = MeshEditor.calculateTangent(mesh);
        if (tangentDatas) {
            MeshEditor.removeVertexElement(mesh, VertexMesh.MESH_TANGENT0);
            MeshEditor.addVertexElement(mesh, VertexMesh.MESH_TANGENT0, tangentDatas);
        }
    }
}

export class MeshEditor {
    private static tempV3_0 = new Vector3();
    private static tempV3_1 = new Vector3();

    /**
     * 
     * @param elementUsage 
     */
    static getElementFlagByUsage(elementUsage: number): string {
        switch (elementUsage) {
            case VertexMesh.MESH_POSITION0:
                return "POSITION";
            case VertexMesh.MESH_NORMAL0:
                return "NORMAL";
            case VertexMesh.MESH_COLOR0:
                return "COLOR";
            case VertexMesh.MESH_TEXTURECOORDINATE0:
                return "UV";
            case VertexMesh.MESH_TEXTURECOORDINATE1:
                return "UV1";
            case VertexMesh.MESH_BLENDWEIGHT0:
                return "BLENDWEIGHT";
            case VertexMesh.MESH_BLENDINDICES0:
                return "BLENDINDICES";
            case VertexMesh.MESH_TANGENT0:
                return "TANGENT";
            default:
                throw "MeshEditor: unknown vertex flag.";
        }
    }

    /**
     * 获取 VertexDeclaration 对象 对应的 declaration string
     * @param verDec 
     */
    static getVertexDecStr(verDec: VertexDeclaration): string {

        let decStrs: string[] = [];

        let elementCount = verDec.vertexElementCount;
        for (let index = 0; index < elementCount; index++) {
            let e = verDec.getVertexElementByIndex(index);
            let flag: string = MeshEditor.getElementFlagByUsage(e.elementUsage);
            decStrs.push(flag);
        }

        if (decStrs.length) {
            return decStrs.toString();
        }
        else {
            return null;
        }
    }

    static getElementLength(elementInfo: number[]) {

        let usage = elementInfo[1];
        let elementByteLength = 0;
        switch (usage) {
            case LayaGL.renderEngine.getParams(RenderParams.FLOAT):
                elementByteLength = 4;
                break;
            case LayaGL.renderEngine.getParams(RenderParams.UNSIGNED_BYTE):
                elementByteLength = 1;
                break;
            case LayaGL.renderEngine.getParams(RenderParams.BYTE):
                elementByteLength = 1;
                break;
            case LayaGL.renderEngine.getParams(RenderParams.UNSIGNED_SHORT):
                elementByteLength = 2;
                break;
            default:
                throw `Unkonw usage: ${usage}`;
        }


        return elementInfo[0] * elementByteLength;
    }

    /**
     * 向 mesh 中添加新的 vertexElement
     * 若 mesh 中已经存在elementUsage对应元素， 直接返回不进行操作
     * @param mesh 
     * @param elementUsage 
     * @param elementData 
     */
    static addVertexElement(mesh: Mesh, elementUsage: number, elementData: ArrayBufferView) {

        let indexBuffer: IndexBuffer3D = mesh._indexBuffer;
        let vertexBuffer: VertexBuffer3D = mesh._vertexBuffer;

        // 原始 顶点声明
        let oriVbDec: VertexDeclaration = mesh.getVertexDeclaration();

        // 判断当前 mesh 中是否存在此 element 
        // 存在直接返回
        if (oriVbDec.getVertexElementByUsage(elementUsage)) {
            return mesh;
        }

        let compatible = false;
        let boneIndexVE: VertexElement = oriVbDec.getVertexElementByUsage(VertexMesh.MESH_BLENDINDICES0);
        if (boneIndexVE) {
            compatible = boneIndexVE.elementFormat == VertexElementFormat.Vector4;
        }
        // 生成的新 VertexDeclaration 确保需要添加的数据在顶点结构结尾
        let vbDecStr: string = MeshEditor.getVertexDecStr(oriVbDec);
        let flagStr: string = MeshEditor.getElementFlagByUsage(elementUsage);
        vbDecStr += `,${flagStr}`;
        let newvbDec: VertexDeclaration = VertexMesh.getVertexDeclaration(vbDecStr, compatible);

        let newStride: number = newvbDec.vertexStride;
        // let newFloatStride: number = newStride / 4;
        let vertexCount: number = mesh.vertexCount;
        let oriStride: number = oriVbDec.vertexStride;
        // let vertexFloatStride: number = vertexStride / 4;
        let oldVertexBuffer: Uint8Array = vertexBuffer.getUint8Data();
        // let newVertexfloat32: Float32Array = new Float32Array(vertexCount * newStride / 4);
        let newVertexBuffer = new Uint8Array(vertexCount * newStride);

        let addVE: VertexElement = newvbDec.getVertexElementByUsage(elementUsage);
        // let addOffset = addVE.offset;
        let elmentInfo: number[] = VertexElementFormat.getElementInfos(addVE.elementFormat);
        let elementLength = MeshEditor.getElementLength(elmentInfo);

        let elementDataBuffer = new Uint8Array(elementData.buffer);

        for (let index = 0; index < vertexCount; index++) {

            let newOffset = newStride * index;
            let oriOffset = oriStride * index;

            let addOffset = addVE.offset + newOffset;
            let dataOffset = elementLength * index;
            // 复制旧数据
            for (let i = 0; i < oriStride; i++) {
                newVertexBuffer[newOffset + i] = oldVertexBuffer[oriOffset + i];
            }

            // 在每个顶点后添加新数据
            for (let i = 0; i < elementLength; i++) {
                newVertexBuffer[addOffset + i] = elementDataBuffer[dataOffset + i];
            }
        }

        let newVertexfloat32 = new Float32Array(newVertexBuffer.buffer);
        let newVB: VertexBuffer3D = new VertexBuffer3D(newVertexfloat32.byteLength, BufferUsage.Static, true);
        newVB.vertexDeclaration = newvbDec;
        newVB.setData(newVertexfloat32.buffer);
        mesh._vertexBuffer = newVB;
        mesh._setBuffer(newVB, indexBuffer);
        mesh._setInstanceBuffer();

        for (let index = 0; index < mesh.subMeshCount; index++) {
            let subMesh: SubMesh = mesh.getSubMesh(index);
            subMesh._vertexBuffer = newVB;
        }

        let memorySize: number = newVB._byteLength + indexBuffer._byteLength;

        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);

        return mesh;
    }

    static removeVertexElement(mesh: Mesh, elementUsage: number) {
        // 原始 顶点声明
        let oriVbDec: VertexDeclaration = mesh.getVertexDeclaration();

        // 判断当前 mesh 中是否存在此 element 
        // 不存在直接返回
        if (!oriVbDec.getVertexElementByUsage(elementUsage)) {
            return mesh;
        }

        let oldStride = oriVbDec.vertexStride;

        let compatible = false;
        let boneIndexVE = oriVbDec.getVertexElementByUsage(VertexMesh.MESH_BLENDINDICES0);
        if (boneIndexVE) {
            compatible = boneIndexVE.elementFormat == VertexElementFormat.Vector4;
        }

        // 生成的新 VertexDeclaration
        let decStrs = [];
        for (let index = 0; index < oriVbDec.vertexElementCount; index++) {
            let element = oriVbDec.getVertexElementByIndex(index);
            if (element.elementUsage != elementUsage) {
                decStrs.push(MeshEditor.getElementFlagByUsage(element.elementUsage));
            }
        }
        let vbDec = decStrs.toString();
        let newvbDec = VertexMesh.getVertexDeclaration(vbDec, compatible);

        let vertexCount = mesh.vertexCount;
        let newStride = newvbDec.vertexStride;

        let newVertexBuffer = new Uint8Array(vertexCount * newStride);
        let oldVertexBuffer = mesh._vertexBuffer.getUint8Data();

        for (let index = 0; index < vertexCount; index++) {
            let newVertexOffset = newStride * index;
            let oldVertexOffset = oldStride * index;
            for (let elementIndex = 0; elementIndex < newvbDec.vertexElementCount; elementIndex++) {
                let element = newvbDec.getVertexElementByIndex(elementIndex);
                let usage = element.elementUsage;

                let oldElement = oriVbDec.getVertexElementByUsage(usage);

                let info = VertexElementFormat.getElementInfos(element.elementFormat);
                let elementLength = MeshEditor.getElementLength(info);

                let newDataOffset = newVertexOffset + element.offset;
                let oldDataOffset = oldVertexOffset + oldElement.offset;

                for (let dataIndex = 0; dataIndex < elementLength; dataIndex++) {
                    newVertexBuffer[newDataOffset + dataIndex] = oldVertexBuffer[oldDataOffset + dataIndex];
                }

            }

        }

        let newVertexData = new Float32Array(newVertexBuffer.buffer);
        let newVB = Laya3DRender.renderOBJCreate.createVertexBuffer3D(newVertexData.byteLength, BufferUsage.Static, true);
        newVB.vertexDeclaration = newvbDec;
        newVB.setData(newVertexData.buffer);
        mesh._vertexBuffer = newVB;
        mesh._setBuffer(newVB, mesh._indexBuffer);
        mesh._setInstanceBuffer();

        for (let index = 0; index < mesh.subMeshCount; index++) {
            let subMesh = mesh.getSubMesh(index);
            subMesh._vertexBuffer = newVB;
        }

        let memorySize = newVB._byteLength + mesh._indexBuffer._byteLength;
        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);

        return mesh;
    }


    /**
     * 计算 mesh tangent 数据
     * @param mesh 
     */
    static calculateTangent(mesh: Mesh): Float32Array {

        if (!mesh._isReadable) {
            return null;
        }

        let vbDec: VertexDeclaration = mesh.getVertexDeclaration();
        if (!(vbDec.getVertexElementByUsage(VertexMesh.MESH_POSITION0) && vbDec.getVertexElementByUsage(VertexMesh.MESH_NORMAL0) && vbDec.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0))) {
            return null;
        }

        let indices: Uint32Array = new Uint32Array(mesh.getIndices());

        let positions: Vector3[] = [];
        mesh.getPositions(positions);

        let normals: Vector3[] = [];
        mesh.getNormals(normals);

        let uvs: Vector2[] = [];
        mesh.getUVs(uvs, 0);

        let tan1s: Vector3[] = new Array(indices.length);
        for (let index = 0; index < tan1s.length; index++) {
            tan1s[index] = new Vector3();
        }
        let tan2s: Vector3[] = new Array(indices.length);
        for (let index = 0; index < tan2s.length; index++) {
            tan2s[index] = new Vector3();
        }

        for (let i = 0; i < indices.length; i += 3) {
            let index1: number = indices[i];
            let index2: number = indices[i + 1];
            let index3: number = indices[i + 2];

            let p1: Vector3 = positions[index1];
            let p2: Vector3 = positions[index2];
            let p3: Vector3 = positions[index3];

            let uv1: Vector2 = uvs[index1];
            let uv2: Vector2 = uvs[index2];
            let uv3: Vector2 = uvs[index3];

            let x1 = p2.x - p1.x;
            let x2 = p3.x - p1.x;
            let y1 = p2.y - p1.y;
            let y2 = p3.y - p1.y;
            let z1 = p2.z - p1.z;
            let z2 = p3.z - p1.z;

            let s1 = uv2.x - uv1.x;
            let s2 = uv3.x - uv1.x;
            let t1 = uv2.y - uv1.y;
            let t2 = uv3.y - uv1.y;

            let r = 1.0 / (s1 * t2 - s2 * t1);
            let sdir: Vector3 = new Vector3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
            let tdir: Vector3 = new Vector3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);

            Vector3.add(sdir, tan1s[index1], tan1s[index1]);
            Vector3.add(sdir, tan1s[index2], tan1s[index2]);
            Vector3.add(sdir, tan1s[index3], tan1s[index3]);

            Vector3.add(tdir, tan2s[index1], tan2s[index1]);
            Vector3.add(tdir, tan2s[index2], tan2s[index2]);
            Vector3.add(tdir, tan2s[index3], tan2s[index3]);
        }

        // let tangents: Vector4[] = [];
        let tangentArray: Float32Array = new Float32Array(mesh.vertexCount * 4);

        for (let index = 0; index < positions.length; index++) {
            let n: Vector3 = normals[index];
            let t: Vector3 = tan1s[index];

            let temp: Vector3 = MeshEditor.tempV3_0;
            Vector3.scale(n, Vector3.dot(n, t), temp);
            Vector3.subtract(t, temp, temp);
            Vector3.normalize(temp, temp);

            let temp1: Vector3 = MeshEditor.tempV3_1;
            Vector3.cross(n, t, temp1);
            let w = Vector3.dot(temp1, tan2s[index]) < 0 ? -1 : 1;

            tangentArray[index * 4] = temp.x;
            tangentArray[index * 4 + 1] = temp.y;
            tangentArray[index * 4 + 2] = temp.z;
            tangentArray[index * 4 + 3] = w;
            // tangents.push(new Vector4(temp.x, temp.y, temp.z, w));
        }

        return tangentArray;
    }
}