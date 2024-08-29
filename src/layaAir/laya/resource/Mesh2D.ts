import { Config } from "../../Config";
import { ILaya } from "../../ILaya";
import { IBufferState } from "../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { LayaGL } from "../layagl/LayaGL";
import { Loader } from "../net/Loader";
import { VertexElement } from "../renders/VertexElement";
import { VertexElementFormat } from "../renders/VertexElementFormat";
import { Handler } from "../utils/Handler";
import { Resource } from "./Resource";

/**
 * @en Class is used to process 2D vertex meshes
 * @zh 类用于处理2D顶点网格
 */
export class VertexMesh2D{
	private static _vertexDeclarationMap: any = {};
    /**
     * @en Retrieves the vertex declaration based on the provided vertex flags.
     * @param vertexFlags An array of vertex declaration flag characters, formatted as: "POSITION,COLOR,UV,BLENDWEIGHT,BLENDINDICES".
     * @param compatible Whether to enable compatible mode.
     * @return An array of vertex declarations.
     * @zh 根据提供的顶点声明标志字符获取顶点声明。
     * @param vertexFlags 顶点声明标志字符数组，格式为："POSITION,COLOR,UV,BLENDWEIGHT,BLENDINDICES"。
     * @param compatible 是否启用兼容模式。
     * @return 顶点声明数组。
     */
	static getVertexDeclaration(vertexFlags: string[], compatible: boolean = true): VertexDeclaration[] {
        let verDecs:VertexDeclaration[] = []
        for (let i = 0 , len = vertexFlags.length; i < len; i++) {
            let vertexFlag = vertexFlags[i];
            let verDec: VertexDeclaration = VertexMesh2D._vertexDeclarationMap[vertexFlag + (compatible ? "_0" : "_1")];//TODO:兼容模式
            if (!verDec) {
                var subFlags: any[] = vertexFlag.split(",");
                var offset: number = 0;
                var elements: any[] = [];
                for (let j: number = 0, n: number = subFlags.length; j < n; j++) {
                    var element: VertexElement;
                    switch (subFlags[i]) {
                        case "POSITION":
                            element = new VertexElement(offset, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0);
                            offset += 8;
                            break;
                        case "COLOR":
                            element = new VertexElement(offset, VertexElementFormat.Vector4, VertexMesh.MESH_COLOR0);
                            offset += 16;
                            break;
                        case "UV":
                            element = new VertexElement(offset, VertexElementFormat.Vector2, VertexMesh.MESH_TEXTURECOORDINATE0);
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
                        default:
                            throw "VertexMesh: unknown vertex flag.";
                    }
                    elements.push(element);
                }
                verDec = new VertexDeclaration(offset, elements);
                VertexMesh2D._vertexDeclarationMap[vertexFlag + (compatible ? "_0" : "_1")] = verDec;//TODO:兼容模式
                verDecs.push(verDec);
            }
        }
		return verDecs;
	}
}

/**
 * @en The `Mesh2D` class represents a 2D mesh in the engine.
 * @zh `Mesh2D` 类表示引擎中的2D网格。
 */
export class Mesh2D extends Resource {
    /**
     * @en Loads a mesh template from the specified URL.
     * @param url The URL address of the mesh template.
     * @param complete A callback function that is executed when the mesh template is loaded.
     * @zh 从指定URL加载网格模板。
     * @param url 网格模板的地址。
     * @param complete 加载完成时的回调函数。
     */
    static load(url: string, complete: Handler): void {
        ILaya.loader.load(url, complete, null, Loader.MESH);
    }

    /** @internal */
    _bufferState: IBufferState;
    /** @internal */
    _instanceBufferState: IBufferState;
    /** @internal */
    _instanceBufferStateType: number = 0;
    /**@internal */
    _instanceWorldVertexBuffer: IVertexBuffer
    /**@internal */
    _instanceSimpleAniVertexBuffer: IVertexBuffer
    /** @internal */
    _subMeshes: IRenderGeometryElement[];
    /** @internal */
    _vertexBuffers: IVertexBuffer[] = null;
    /** @internal */
    _indexBuffer: IIndexBuffer = null;

    /** @internal */
    _vertexCount: number = 0;
    /** @internal */
    _indexFormat: IndexFormat = IndexFormat.UInt16;

    /**
     * @en Get the vertex buffer of the mesh.
     * @zh 获取网格的顶点缓冲。
     */
    get vertexBuffers(): IVertexBuffer[] {
        return this._vertexBuffers;
    }

    /**
     * @en Get the index buffer of the mesh.
     * @zh 获取网格的索引缓冲。
     */
    get indexBuffer(): IIndexBuffer {
        return this._indexBuffer;
    }

    /**
     * @en Get the number of vertices in the mesh.
     * @zh 获取网格中的顶点数。
     */
    get vertexCount(): number {
        return this._vertexCount;
    }

    /**
     * @en Get the index number of the mesh.
     * @zh 获取网格的索引数。
     */
    get indexCount(): number {
        return this._indexBuffer.indexCount;
    }

    /**
     * @en Get the number of SubMeshes in the mesh.
     * @zh 获取网格中子网格的个数。
     */
    get subMeshCount(): number {
        return this._subMeshes.length;
    }


    /**
     * @en The index format used by the mesh.
     * @zh 网格使用的索引格式。
     */
    get indexFormat(): IndexFormat {
        return this._indexFormat;
    }

    set indexFormat(value: IndexFormat) {
        this._indexFormat = value
        this._subMeshes.forEach(element => {
            element.indexFormat = value;
        });
    }

    /**
     * @ignore
     * @en prohibition of use.
     * @zh 禁止使用
     */
    constructor() {
        super();
        this._bufferState = LayaGL.renderDeviceFactory.createBufferState();
        this._subMeshes = [];
        this.destroyedImmediately = Config.destroyResourceImmediatelyDefault;
    }

    /**
     * @en Destroy the resource.
     * @zh 销毁资源
     */
    protected _disposeResource(): void {
        for (let i: number = 0, n: number = this._subMeshes.length; i < n; i++)
            this._subMeshes[i].destroy();
        for (let i = 0 , n = this._vertexBuffers.length; i < n; i++)
            this._vertexBuffers[i].destroy();
        this._indexBuffer && this._indexBuffer.destroy();
        this._bufferState.destroy();
        this._instanceBufferState && this._instanceBufferState.destroy();
        this._instanceWorldVertexBuffer && this._instanceWorldVertexBuffer.destroy();
        this._instanceSimpleAniVertexBuffer && this._instanceSimpleAniVertexBuffer.destroy();
        this._setCPUMemory(0);
        this._setGPUMemory(0);
        this._bufferState = null;
        this._instanceBufferState = null;
        this._vertexBuffers = null;
        this._indexBuffer = null;
        this._subMeshes = null;
        this._indexBuffer = null;
        // this._boneNames = null;
    }

    /**
     * @internal
     */
    _setSubMeshes(subMeshes: IRenderGeometryElement[]): void {
        this._subMeshes = subMeshes
    }


    /**
     * @internal
     */
    _setBuffer(vertexBuffer: IVertexBuffer, indexBuffer: IIndexBuffer): void {
        var bufferState: IBufferState = this._bufferState;
        bufferState.applyState([vertexBuffer], indexBuffer);
    }

    /**
     * @en Retrieves a SubMesh based on its index.
     * @param index The index of the SubMesh.
     * @returns The SubMesh at the specified index.
     * @zh 根据索引获取子网格。
     * @param index 子网格的索引。
     * @returns 索引指定的子网格。
     */
    getSubMesh(index: number): IRenderGeometryElement {
        return this._subMeshes[index];
    }

    /**
     * @en Sets the vertex data for the mesh.
     * @param vertices An array of ArrayBuffer objects containing vertex data.
     * @zh 设置网格的顶点数据。
     * @param vertices 顶点数据数组。
     */
    setVertices(vertices: ArrayBuffer[]): void {
        for (let i = 0 , len = vertices.length; i < len; i++) {
            if (vertices[i] && this._vertexBuffers[i]) {
                this._vertexBuffers[i].setData(vertices[i], 0, 0, vertices[i].byteLength);
            }
        }
        
    }

    /**
     * @en Sets the indices for the mesh.
     * @param indices An array containing the mesh indices. 
     * @zh 设置网格的索引。
     * @param indices 索引数据数组。
     */
    setIndices(indices: Uint8Array | Uint16Array | Uint32Array): void {
        var format: IndexFormat;
        if (indices instanceof Uint32Array)
            format = IndexFormat.UInt32;
        else if (indices instanceof Uint16Array)
            format = IndexFormat.UInt16;
        else if (indices instanceof Uint8Array)
            format = IndexFormat.UInt8;

        let indexBuffer = this._indexBuffer;
        if (this._indexFormat !== format || indexBuffer.indexCount !== indices.length) {//format chang and length chang will recreate the indexBuffer
            indexBuffer.destroy();
            this._indexBuffer = indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Static);
            indexBuffer.indexCount = indexBuffer.indexCount;
            indexBuffer.indexType = format;
        }
        indexBuffer._setIndexData(indices, 0);
        this.indexFormat = format;
    }
}



