import { Config } from "../../Config";
import { ILaya } from "../../ILaya";
import { IBufferState } from "../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
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
                    switch (subFlags[j]) {
                        case "POSITION":
                            element = new VertexElement(offset, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0);
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
     * @en create a Mesh2D by data
     * @param vbs vertexBuffers Array
     * @param vbDeclaration vertex declaration info array
     * @param ib index Buffer
     * @param ibFormat index Buffer format
     * @param submeshInfo subMesh render info，start for index offset，length for draw range。one mesh2D can Multisegmental rendering。
     * @param canRead vb & ib data is readable or not
     * @returns return a mesh2D，can use to Mesh2DRender
     * @zh 创建一个Mesh2D
     * @param vbs 顶点数组数据
     * @param vbDeclaration 顶点描述数组
     * @param ib 索引数据
     * @param ibFormat 索引数据格式
     * @param submeshInfo 子Mesh渲染信息，start标识从索引数据哪里开始，length指draw多少索引值的三角形，一个Mesh2D可以分成多端来渲染，方便赋入不同的材质
     * @param canRead vb 和 ib 数据是否可读
     * @returns 返回一个mesh2D实例。可用于mesh2DRender组件渲染
     */
    static createMesh2DByPrimitive(vbs: Float32Array[], vbDeclaration: VertexDeclaration[], ib: Uint16Array | Uint32Array, ibFormat: IndexFormat, submeshInfo: { start: number, length: number }[] , canRead = false) {
        let mesh2d = new Mesh2D();
        let vbArray = [];
        for (var i = 0, n = vbs.length; i < n; i++) {
            let vbdata = vbs[i];
            let vertex = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            vertex.vertexDeclaration = vbDeclaration[i];
            vertex.setDataLength(vbdata.buffer.byteLength);
            vertex.setData(vbdata.buffer, 0, 0, vbdata.buffer.byteLength);
            vbArray.push(vertex);
        }
        let indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        indexBuffer._setIndexDataLength(ib.buffer.byteLength);
        indexBuffer._setIndexData(ib, 0);
        mesh2d._setBuffers(vbArray, indexBuffer);

        let geometryArray = [];
        for (var i = 0; i < submeshInfo.length; i++) {
            let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            geometry.bufferState = mesh2d._bufferState;
            geometry.setDrawElemenParams(submeshInfo[i].length, submeshInfo[i].start);
            geometry.indexFormat = ibFormat;
            geometryArray.push(geometry);
        }
        mesh2d._setSubMeshes(geometryArray);
        return mesh2d;
    }


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

    /** 是否保留数据 */
    canRead:boolean = false;
    /** @internal */
    _vertices:ArrayBuffer[] = null;
    /** @internal */
    _indices:Uint16Array | Uint32Array |Uint8Array = null;
    // /**
    //  * 设置indexformat
    //  * @param 索引格式
    //  */
    // set indexFormat(value: IndexFormat) {
    //     this._indexFormat = value
    //     this._subMeshes.forEach(element => {
    //         element.indexFormat = value;
    //     });
    // }

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
    _setBuffers(vertexBuffers: IVertexBuffer[], indexBuffer: IIndexBuffer): void {
        var bufferState: IBufferState = this._bufferState;
        this._vertexBuffers = vertexBuffers;
        this._indexBuffer = indexBuffer;
        bufferState.applyState(vertexBuffers, indexBuffer);
    }

    /**
     * 根据获取子网格。
     * @param index 索引。
     */
    getSubMesh(index: number): IRenderGeometryElement {
        return this._subMeshes[index];
    }

    /**
    * @en Set vertex group data
    * @param vertices set vertexs data
    * @zh 设置顶点组数据。
    * @param vertices 设置的顶点数据。
    */
    setVertices(vertices: ArrayBuffer[]): void {
        for (let i = 0, len = vertices.length; i < len; i++) {
            if (vertices[i] && this._vertexBuffers[i]) {
                this._vertexBuffers[i].setData(vertices[i], 0, 0, vertices[i].byteLength);
            }
        }

        if (this.canRead) {
            this._vertices = vertices;
        }
    }

    /**
     * @en VertexBuffer data that was set earlier
     * @zh 之前设置的vertexbuffer数据
     */
    getVertices():ArrayBuffer[]{
        if (!this.canRead || !this._vertices) {
            throw new Error("Can't getVertices without the canRead flag, or if the canRead flag is false before setVertices!");
        }else{
            return this._vertices;
        }
    }

    /**
     * @en Set a vertex buffer data
     * @param data  buffer data
     * @param index vertex array index
     * @param bufferOffset  buffer data set offset
     * @zh 设置某个顶点Buffer数据
     * @param data 设置数据
     * @param index 设置的顶点Buffer队列索引
     * @param bufferOffset 设置Buffer数据的偏移
     */
    setVertexByIndex(data: ArrayBuffer, index: number, bufferOffset: number = 0) {
        this._vertexBuffers[index].setData(data, bufferOffset, 0, data.byteLength);
    }

    /**
     * @en set index buffer data
     * @param indices index buffer data
     * @zh 设置索引buffer数据。
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

        if (this.canRead) {
            this._indices = indices;
        }
    }

    /**
     * @en The indexbuffer data that was set earlier
     * @zh 之前设置的索引buffer数据
     */
    getIndices(){
        if (!this.canRead || !this._indices) {
            throw new Error("Can't getIndices without the canRead flag, or if the canRead flag is false before setIndices!");
        }else{
            return this._indices;
        }
    }
}



