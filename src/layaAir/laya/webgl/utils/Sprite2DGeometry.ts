import { LayaGL } from "../../layagl/LayaGL";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { ISprite2DGeometry } from "../../renders/Render2D";

/**
 * Mesh2d只是保存数据。描述attribute用的。本身没有webgl数据。
 */
export abstract class Sprite2DGeometry implements ISprite2DGeometry {

    //顶点结构大小。每个mesh的顶点结构是固定的。
    protected _stride = 0;
    //当前的顶点的个数。对外只读		
    protected _vertNum = 0;
    //实际index 个数。对外只读。例如一个三角形是3个。由于ib本身可能超过实际使用的数量，所以需要一个indexNum
    protected _indexNum = 0;

    protected _VBBuff: ArrayBuffer;
    protected _IBBuff: ArrayBuffer;

    needRelease: boolean = true;

    vertexBuffer: IVertexBuffer = null;
    indexBuffer: IIndexBuffer = null;
    
    
    /**
     * @param stride
     * @param vballoc  vb预分配的大小。主要是用来提高效率。防止不断的resizebfufer
     * @param iballoc
     */
    constructor(stride: number, vballoc: number, iballoc: number) {
        this._stride = stride;
        this._VBBuff = new ArrayBuffer(vballoc || 32);
        this._IBBuff = new ArrayBuffer(iballoc || 8)
        this.onVBRealloc(this._VBBuff);
        this.onIBRealloc(this._IBBuff);
    }

    get vbBuffer(): ArrayBuffer {
        return this._VBBuff;
    }
    get ibBuffer(): ArrayBuffer {
        return this._IBBuff;
    }

    get indexNum() {
        return this._indexNum
    }

    get vertexNum() {
        return this._vertNum
    }

    abstract get vertexDeclarition(): VertexDeclaration;

    clearMesh() {
        this._vertNum = 0;
        this._indexNum = 0;
    }

    protected abstract onVBRealloc(buff: ArrayBuffer): void;
    protected abstract onIBRealloc(buff: ArrayBuffer): void;

    /**
    * 在当前的基础上需要多大空间，单位是byte
    * @param sz
    */
    protected expVBSize(len: number) {
        if (len) {
            let curLen = this._vertNum * this._stride;
            if (curLen + len > this._VBBuff.byteLength) {
                let old = this._VBBuff;
                this._VBBuff = new ArrayBuffer(curLen + len * 8);
                (new Uint8Array(this._VBBuff, 0, curLen)).set(new Uint8Array(old, 0, curLen));
                this.onVBRealloc(this._VBBuff);
            }
        }
    }

    protected expIBSize(len: number) {
        if (len) {
            let curlen = this._indexNum * 2;
            if (curlen + len > this._IBBuff.byteLength) {
                let old = this._IBBuff;
                this._IBBuff = new ArrayBuffer(curlen + len * 8);
                (new Uint8Array(this._IBBuff, 0, curlen)).set(new Uint8Array(old, 0, curlen));
                this.onIBRealloc(this._IBBuff);
            }
        }
    }

    destroy() {
        if (this.vertexBuffer) {
            this.vertexBuffer.destroy();
            this.vertexBuffer = null;
        }
        if (this.indexBuffer) {
            this.indexBuffer.destroy();
            this.indexBuffer = null;
        }
    }
    
    createBuffer() {
        if (this.vertexBuffer && this.indexBuffer) return;
        let vertexDeclaration = this.vertexDeclarition;
        let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = vertexDeclaration;
        let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this.vertexBuffer = vb;
        this.indexBuffer = ib;
    }

    uploadBuffer() {
        let vertexDeclaration = this.vertexDeclarition;
        let vb = this.vertexBuffer;
        let ib = this.indexBuffer;
        let vblen = this.vertexNum * vertexDeclaration.vertexStride;
        let iblen = this.indexNum * 2;
        vb.setDataLength(vblen);
        vb.setData(this.vbBuffer, 0, 0, vblen);
        ib._setIndexDataLength(iblen);
        ib._setIndexData(new Uint16Array(this.ibBuffer, 0, iblen / 2), 0);
    }
}

