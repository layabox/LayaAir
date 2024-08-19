import { LayaGL } from "../layagl/LayaGL";
import { IIndexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexMesh } from "../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Mesh2D } from "../resource/Mesh2D";
import { Byte } from "../utils/Byte";

export class LoadModel2DV01 {
    /**@internal */
    private static _BLOCK: any = { count: 0 };
    /**@internal */
    private static _DATA = { offset: 0, size: 0 };
    /**@internal */
    private static _strings: any[] = [];
    /**@internal */
    private static _readData: Byte;
    /**@internal */
    private static _version: string;
    /**@internal */
    private static _mesh: Mesh2D;
    /**@internal */
    private static _subMeshes: IRenderGeometryElement[];

    /**
     * @internal
     */
    static parse(readData: Byte, version: string, mesh: Mesh2D, subMeshes: IRenderGeometryElement[]): void {
        LoadModel2DV01._mesh = mesh;
        LoadModel2DV01._subMeshes = subMeshes;
        LoadModel2DV01._version = version;
        LoadModel2DV01._readData = readData;
        LoadModel2DV01.READ_DATA();
        LoadModel2DV01.READ_BLOCK();
        LoadModel2DV01.READ_STRINGS();
        for (var i: number = 0, n: number = LoadModel2DV01._BLOCK.count; i < n; i++) {
            LoadModel2DV01._readData.pos = LoadModel2DV01._BLOCK.blockStarts[i];
            var index: number = LoadModel2DV01._readData.getUint16();
            var blockName: string = LoadModel2DV01._strings[index];
            var fn: Function = (LoadModel2DV01 as any)["READ_" + blockName];
            if (fn == null)
                console.warn("model file err,no this function:" + index + " " + blockName);
            else
                fn.call(null);
        }
        LoadModel2DV01._strings.length = 0;
        LoadModel2DV01._readData = null;
        LoadModel2DV01._version = null;
        LoadModel2DV01._mesh = null;
        LoadModel2DV01._subMeshes = null;
    }

    /**
     * @internal
     */
    private static _readString(): string {
        return LoadModel2DV01._strings[LoadModel2DV01._readData.getUint16()];
    }
    /**
     * @internal
     */
    private static READ_DATA(): void {
        LoadModel2DV01._DATA.offset = LoadModel2DV01._readData.getUint32();
        LoadModel2DV01._DATA.size = LoadModel2DV01._readData.getUint32();
    }

    /**
     * @internal
     */
    private static READ_BLOCK(): void {
        var count: number = LoadModel2DV01._BLOCK.count = LoadModel2DV01._readData.getUint16();
        var blockStarts: any[] = LoadModel2DV01._BLOCK.blockStarts = [];
        var blockLengths: any[] = LoadModel2DV01._BLOCK.blockLengths = [];
        for (var i: number = 0; i < count; i++) {
            blockStarts.push(LoadModel2DV01._readData.getUint32());
            blockLengths.push(LoadModel2DV01._readData.getUint32());
        }
    }

    /**
     * @internal
     */
    private static READ_STRINGS(): void {
        var offset: number = LoadModel2DV01._readData.getUint32();
        var count: number = LoadModel2DV01._readData.getUint16();
        var prePos: number = LoadModel2DV01._readData.pos;
        LoadModel2DV01._readData.pos = offset + LoadModel2DV01._DATA.offset;

        for (var i: number = 0; i < count; i++)
            LoadModel2DV01._strings[i] = LoadModel2DV01._readData.readUTFString();

        LoadModel2DV01._readData.pos = prePos;
    }

    /**
     * @internal
     */
    private static READ_MESH(): boolean {
        var i: number;
        var memorySize: number = 0;
        var name: string = LoadModel2DV01._readString();
        var reader: Byte = LoadModel2DV01._readData;
        var arrayBuffer: ArrayBuffer = reader.__getBuffer();

        var vertexBufferCount: number = reader.getInt16();
        var offset: number = LoadModel2DV01._DATA.offset;

        var mesh: Mesh2D = LoadModel2DV01._mesh;

        let vertexBuffers:IVertexBuffer[] = [];
        var vertexCount: number  = 0;
        for (i = 0; i < vertexBufferCount; i++) {
            var vbStart: number = offset + reader.getUint32();
            var byteLength: number = reader.getUint32();
            var vertexFlag: string = LoadModel2DV01._readString();
            var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration(vertexFlag, false);

            var vertexData = arrayBuffer.slice(vbStart, vbStart + byteLength);
            // var floatData = new Float32Array(vertexData);
            // var uint8Data = new Uint8Array(vertexData);
          
            var vertexBuffer: IVertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer( BufferUsage.Static);
            vertexBuffer.vertexDeclaration = vertexDeclaration;
            vertexBuffer.setDataLength(byteLength);
            vertexBuffer.setData(vertexData,0,0,byteLength);
            vertexCount = byteLength / vertexDeclaration.vertexStride;

            memorySize += byteLength;
            vertexBuffers[i] = vertexBuffer;
        }
        
        //TDDO:是否加标记
        if (vertexCount > 65535)
            mesh._indexFormat = IndexFormat.UInt32;
        else
            mesh._indexFormat = IndexFormat.UInt16;

        var ibStart: number = offset + reader.getUint32();
        var ibLength: number = reader.getUint32();

        var ibDatas: Uint16Array | Uint32Array, byteCount:number;
        if (mesh.indexFormat == IndexFormat.UInt32){
            ibDatas = new Uint32Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
            byteCount = 4;
        }
        else{
            ibDatas = new Uint16Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
            byteCount = 2;
        }

        var indexBuffer: IIndexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer( BufferUsage.Static);
        indexBuffer.indexType = mesh.indexFormat;
        indexBuffer.indexCount = ibLength / byteCount;

        indexBuffer._setIndexDataLength(ibLength);

        indexBuffer._setIndexData(ibDatas,0);

        mesh._setBuffers(vertexBuffers, indexBuffer);

        memorySize += ibDatas.byteLength;
        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);
        mesh.name = name;

        return true;
    }

    /**
     * @internal
     */
    private static READ_SUBMESH(): boolean {
        var reader: Byte = LoadModel2DV01._readData;
        var subMesh: IRenderGeometryElement = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles , DrawType.DrawElement);

        reader.getInt16();//TODO:vbIndex

        let mesh = LoadModel2DV01._mesh
        subMesh.bufferState = mesh._bufferState;
        subMesh.indexFormat = mesh.indexFormat;


        var drawCount: number = reader.getUint16();
 
        for (var i: number = 0; i < drawCount; i++) {
            let ibOffset = reader.readUint32();
            let ibCount = reader.readUint32();
            subMesh.setDrawElemenParams(ibCount , ibOffset);
        }
        LoadModel2DV01._subMeshes.push(subMesh);
        return true;
    }

}