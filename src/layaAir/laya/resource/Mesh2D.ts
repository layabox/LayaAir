import { Config } from "../../Config";
import { ILaya } from "../../ILaya";
import { IBufferState } from "../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { VertexMesh } from "../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { LayaGL } from "../layagl/LayaGL";
import { Loader } from "../net/Loader";
import { VertexElement } from "../renders/VertexElement";
import { VertexElementFormat } from "../renders/VertexElementFormat";
import { Handler } from "../utils/Handler";
import { Resource } from "./Resource";


export class VertexMesh2D {
    /**@internal */
    private static _vertexDeclarationMap: any = {};
    /**
     * 获取顶点声明。
     * @param vertexFlags 顶点声明标记字符,格式为:"POSITION,COLOR,UV,BLENDWEIGHT,BLENDINDICES"。
     * @return 顶点声明。
     */
    static getVertexDeclaration(vertexFlags: string[], compatible: boolean = true): VertexDeclaration[] {
        let verDecs: VertexDeclaration[] = []
        for (let i = 0, len = vertexFlags.length; i < len; i++) {
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


    /**
    * 获得mesh的宏
    * @param mesh Mesh
    * @param out define
    */
    static getMeshDefine(mesh: Mesh2D, out: Array<ShaderDefine>) {
        out.length = 0;
        let vertexs = mesh._vertexBuffers;
        for (var i = 0, n = vertexs.length; i < n; i++) {
            let elements = vertexs[i].vertexDeclaration._vertexElements;
            for (const element of elements) {
                switch (element.elementUsage) {
                    case VertexMesh.MESH_COLOR0:
                        out.push(Shader3D.getDefineByName("COLOR"));
                        break;
                    case VertexMesh.MESH_TEXTURECOORDINATE0:
                        out.push(Shader3D.getDefineByName("UV"));
                        break;
                }
            }
        }

    }
}

/**
 * <code>Mesh</code> 类用于创建文件网格数据模板。
 */
export class Mesh2D extends Resource {
    /**
     * 加载网格模板。
     * @param url 模板地址。
     * @param complete 完成回调。
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
     * @readonly
     * 顶点数据
     */
    get vertexBuffers(): IVertexBuffer[] {
        return this._vertexBuffers;
    }

    /**
     * @readonly
     * 顶点索引
     */
    get indexBuffer(): IIndexBuffer {
        return this._indexBuffer;
    }

    /**
     * 获取顶点个数。
     */
    get vertexCount(): number {
        return this._vertexCount;
    }

    /**
     * 获取索引个数。
     * @returns 索引个数
     */
    get indexCount(): number {
        return this._indexBuffer.indexCount;
    }

    /**
     * SubMesh的个数。
     * @returns SubMesh的个数
     */
    get subMeshCount(): number {
        return this._subMeshes.length;
    }


    /**
     * 索引格式。
     * @returns 索引格式
     */
    get indexFormat(): IndexFormat {
        return this._indexFormat;
    }


    /**
     * 设置indexformat
     * @param 索引格式
     */
    set indexFormat(value: IndexFormat) {
        this._indexFormat = value
        this._subMeshes.forEach(element => {
            element.indexFormat = value;
        });
    }

    /**
     * 创建一个 <code>Mesh</code> 实例,禁止使用。
     */
    constructor() {
        super();
        this._bufferState = LayaGL.renderDeviceFactory.createBufferState();
        this._subMeshes = [];
        this.destroyedImmediately = Config.destroyResourceImmediatelyDefault;
    }

    /**
     * 销毁资源
     * @internal
     * @inheritDoc
     * @override
     */
    protected _disposeResource(): void {
        for (let i: number = 0, n: number = this._subMeshes.length; i < n; i++)
            this._subMeshes[i].destroy();
        for (let i = 0, n = this._vertexBuffers.length; i < n; i++)
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
     *@internal
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
     * 根据获取子网格。
     * @param index 索引。
     */
    getSubMesh(index: number): IRenderGeometryElement {
        return this._subMeshes[index];
    }

    /**
    * 设置顶点数据。
    * @param vertices 顶点数据。
    */
    setVertices(vertices: ArrayBuffer[]): void {
        for (let i = 0, len = vertices.length; i < len; i++) {
            if (vertices[i] && this._vertexBuffers[i]) {
                this._vertexBuffers[i].setData(vertices[i], 0, 0, vertices[i].byteLength);
            }
        }

    }

    /**
     * 设置网格索引。
     * @param indices 网格索引。
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



