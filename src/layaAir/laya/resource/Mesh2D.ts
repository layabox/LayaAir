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
import { Handler } from "../utils/Handler";
import { Resource } from "./Resource";


/**
 * <code>Mesh</code> 类用于创建文件网格数据模板。
 */
export class Mesh2D extends Resource {
    /**@internal */
    static MESH_INSTANCEBUFFER_TYPE_NORMAL: number = 0;
    /**@internal */
    static MESH_INSTANCEBUFFER_TYPE_SIMPLEANIMATOR: number = 1;

    static MESH2D_INSTANCE_MAX_NUM = 1024;

    /**
      * @internal
      */
    static __init__(): void {
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
    _vertexBuffer: IVertexBuffer = null;
    /** @internal */
    _indexBuffer: IIndexBuffer = null;

    // /** @internal */
    // _boneNames: string[];
    // /** @internal */
    // _skinnedMatrixCaches: skinnedMatrixCache[] = [];
    /** @internal */
    _vertexCount: number = 0;
    /** @internal */
    _indexFormat: IndexFormat = IndexFormat.UInt16;

    /**
     * @readonly
     * 顶点数据
     */
    get vertexBuffer(): IVertexBuffer {
        return this._vertexBuffer;
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
        for (var i: number = 0, n: number = this._subMeshes.length; i < n; i++)
            this._subMeshes[i].destroy();
        this._vertexBuffer && this._vertexBuffer.destroy();
        this._indexBuffer && this._indexBuffer.destroy();
        this._bufferState.destroy();
        this._instanceBufferState && this._instanceBufferState.destroy();
        this._instanceWorldVertexBuffer && this._instanceWorldVertexBuffer.destroy();
        this._instanceSimpleAniVertexBuffer && this._instanceSimpleAniVertexBuffer.destroy();
        this._setCPUMemory(0);
        this._setGPUMemory(0);
        this._bufferState = null;
        this._instanceBufferState = null;
        this._vertexBuffer = null;
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
        // for (var i: number = 0, n: number = subMeshes.length; i < n; i++)
        //     subMeshes[i]._indexInMesh = i;
    }


    /**
     * @internal
     */
    _setBuffer(vertexBuffer: IVertexBuffer, indexBuffer: IIndexBuffer): void {
        var bufferState: IBufferState = this._bufferState;
        bufferState.applyState([vertexBuffer], indexBuffer);
    }

    /**
     * @internal
     */
    _setInstanceBuffer() {
        if (this._instanceBufferState)
            return;
        var instanceBufferState: IBufferState = this._instanceBufferState = LayaGL.renderDeviceFactory.createBufferState();
        var instanceBufferStateType = this._instanceBufferStateType;
        let vertexArray = [];
        vertexArray.push(this._vertexBuffer);
        let instanceBuffer: IVertexBuffer = this._instanceWorldVertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        instanceBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
        instanceBuffer.setDataLength(Mesh2D.MESH2D_INSTANCE_MAX_NUM * 6 * 4);
        instanceBuffer.instanceBuffer = true;
        vertexArray.push(instanceBuffer);
        switch (instanceBufferStateType) {
            case Mesh2D.MESH_INSTANCEBUFFER_TYPE_SIMPLEANIMATOR:
                let instanceSimpleAnimatorBuffer = this._instanceSimpleAniVertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
                instanceSimpleAnimatorBuffer.vertexDeclaration = VertexMesh.instanceSimpleAnimatorDeclaration;
                instanceSimpleAnimatorBuffer.setDataLength(Mesh2D.MESH2D_INSTANCE_MAX_NUM * 4 * 4);
                instanceSimpleAnimatorBuffer.instanceBuffer = true;
                vertexArray.push(instanceSimpleAnimatorBuffer);
                break;
        }
        instanceBufferState.applyState(vertexArray, this._indexBuffer);
    }

    /**
     * 根据获取子网格。
     * @param index 索引。
     */
    getSubMesh(index: number): IRenderGeometryElement {
        return this._subMeshes[index];
    }

    /**
     * 获取顶点声明。
     */
    getVertexDeclaration(): VertexDeclaration {
        return this._vertexBuffer.vertexDeclaration;
    }

    /**
    * 设置顶点数据。
    * @param vertices 顶点数据。
    */
    setVertices(vertices: ArrayBuffer): void {
        this._vertexBuffer.setData(vertices, 0, 0, vertices.byteLength);
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



