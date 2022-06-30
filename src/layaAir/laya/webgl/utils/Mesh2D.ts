import { BufferState } from "../../d3/core/BufferState";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { Config } from "./../../../Config";
import { IndexBuffer2D } from "./IndexBuffer2D";
import { VertexBuffer2D } from "./VertexBuffer2D";

/**
 * Mesh2d只是保存数据。描述attribute用的。本身不具有渲染功能。
 */
export class Mesh2D {
    _stride = 0;			//顶点结构大小。每个mesh的顶点结构是固定的。
    vertNum = 0;				//当前的顶点的个数
    indexNum = 0;			//实际index 个数。例如一个三角形是3个。由于ib本身可能超过实际使用的数量，所以需要一个indexNum
    protected _applied = false;	//是否已经设置给webgl了
    _vb: VertexBuffer2D;			//vb和ib都可能需要在外部修改，所以public
    _ib: IndexBuffer2D;
    private _vao: BufferState;						//webgl VAO对象。需要WebGL扩展。
    private static _gvaoid = 0;
    private _attribInfo: any[];			//保存起来的属性定义数组。
    protected _quadNum = 0;
    //public static var meshlist:Array = [];	//活着的mesh对象列表。
    canReuse = false;	//用完以后，是删除还是回收。

    /**
     * 
     * @param	stride
     * @param	vballoc  vb预分配的大小。主要是用来提高效率。防止不断的resizebfufer
     * @param	iballoc
     */
    constructor(stride: number, vballoc: number, iballoc: number) {
        this._stride = stride;
        this._vb = new VertexBuffer2D(stride, BufferUsage.Dynamic);
        if (vballoc) {
            this._vb.buffer2D._resizeBuffer(vballoc, false);
        } else {
            Config.webGL2D_MeshAllocMaxMem && this._vb.buffer2D._resizeBuffer(64 * 1024 * stride, false);
        }
        this._ib = new IndexBuffer2D();
        if (iballoc) {
            this._ib.buffer2D._resizeBuffer(iballoc, false);
        }
        //meshlist.push(this);
    }

    /**
     * 直接创建一个固定的ib。按照固定四边形的索引。
     * @param	var QuadNum
     */
    createQuadIB(QuadNum: number): void {
        this._quadNum = QuadNum;
        this._ib.buffer2D._resizeBuffer(QuadNum * 6 * 2, false);	//short类型
        this._ib.buffer2D.byteLength = this._ib.buffer2D.bufferLength;	//这个我也不知道是什么意思

        var bd: Uint16Array = this._ib.buffer2D._uint16Array;
        var idx: number = 0;
        var curvert: number = 0;
        for (var i: number = 0; i < QuadNum; i++) {
            bd[idx++] = curvert;
            bd[idx++] = curvert + 2;
            bd[idx++] = curvert + 1;
            bd[idx++] = curvert;
            bd[idx++] = curvert + 3;
            bd[idx++] = curvert + 2;
            curvert += 4;
        }

        this._ib.buffer2D.setNeedUpload();
    }

    /**
     * 设置mesh的属性。每3个一组，对应的location分别是0,1,2...
     * 含义是：type,size,offset
     * 不允许多流。因此stride是固定的，offset只是在一个vertex之内。
     * @param	attribs
     */
    setAttributes(attribs: any[]): void {
        this._attribInfo = attribs;
        if (this._attribInfo.length % 3 != 0) {
            throw 'Mesh2D setAttributes error!';
        }
    }

    /**
     * 初始化VAO的配置，只需要执行一次。以后使用的时候直接bind就行
     * @param	gl
     */
    private configVAO(): void {
        if (this._applied)
            return;
        this._applied = true;
        if (!this._vao) {
            //_vao = __JS__('gl.createVertexArray();');
            this._vao = new BufferState();
            //_vao.dbgid = _gvaoid++;
        }
        this._vao.applyState([this._vb],this._ib);
        // var attribNum: number = this._attribInfo.length / 3;
        // var idx: number = 0;
        // for (var i: number = 0; i < attribNum; i++) {
        //     var _size: number = this._attribInfo[idx + 1];
        //     var _type: number = this._attribInfo[idx];
        //     var _off: number = this._attribInfo[idx + 2];
        //     gl.enableVertexAttribArray(i);
        //     gl.vertexAttribPointer(i, _size, _type, false, this._stride, _off); //注意 normalize都设置为false了，想必没人要用这个功能把。
        //     idx += 3;
        // }
        // this._vao.unBind();
        //gl.bindVertexArray(null);
    }

    /**
     * 应用这个mesh
     * @param	gl
     */
    useMesh(): void {
        if(this._vao&&!this._vao.isbind()){
            BufferState._curBindedBufferState&&BufferState._curBindedBufferState.unBind();
        }
        //要先bind，在bufferData
        this._applied || this.configVAO();
        this._ib.buffer2D._bind_upload();
        this._vb.buffer2D._bind_upload();
        this._vao.bind();
    }

    // //TODO:coverage
    // getEleNum(): number {
    //     return this._ib.buffer2D.getBuffer().byteLength / 2;
    // }

    /**
     * 子类实现。用来把自己放到对应的回收池中，以便复用。
     */
    releaseMesh(): void { }

    /**
     * 释放资源。
     */
    destroy(): void {
    }

    /**
     * 清理vb数据
     */
    clearVB(): void {
        this._vb.buffer2D.clear();
    }
}

