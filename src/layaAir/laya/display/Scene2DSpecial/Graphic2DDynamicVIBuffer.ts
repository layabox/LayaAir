import { LayaGL } from "../../layagl/LayaGL";
import { IBufferState } from "../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicWholeBuffer, I2DGraphicBufferDataView, BufferModifyType } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";

//用来分配和设置dataView的值
export class Graphic2DDynamicVIBuffer {
    static MAX_VERTEX = 65535;
    static DEFAULT_BLOCK_SIZE = 1024;
    static FREE_BLOCK_REFRESH_COUNT = 100;

    private _bufferState: IBufferState;
    private _vertexBuffer: IVertexBuffer;
    private _indexBuffer: IIndexBuffer;

    private _wholeVertex: I2DGraphicWholeBuffer;
    private _wholeIndex: I2DGraphicWholeBuffer;

    //一个渲染元素有几个顶点
    private _vertexBlockSize: number;
    // 一个顶点元素有多少个Float32
    private _vertexBlockLength: number;

    //目前的vertex block Count
    private _canVBlockCount: number;

    private _vertexViews: I2DGraphicBufferDataView[] = [];

    private _indexBufferLength: number = 0;
    private _indexBufferMaxLength: number = 0;

    private _vertexFreeBlocks: number[] = [];

    private _vertexDeclaration: VertexDeclaration;
    // 一个顶点元素占用长度
    private _vertexElementLength: number;
    // 一个顶点元素占用的字节数
    private _vertexStride: number;


    get vertexBuffer(): IVertexBuffer {
        return this._vertexBuffer;
    }

    get indexBuffer(): IIndexBuffer {
        return this._indexBuffer;
    }

    get bufferState(): IBufferState {
        return this._bufferState;
    }

    constructor(vertexBlockSize: number, vertexDeclaration: VertexDeclaration) {
        this._vertexBlockSize = vertexBlockSize;//一个顶点元素

        this._vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        //create I2DGraphicWholeBuffer
        this._wholeVertex = LayaGL.render2DRenderPassFactory.create2DGraphicWoleBuffer();
        this._wholeVertex.modifyType = BufferModifyType.Vertex;
        this._wholeVertex.buffer = this._vertexBuffer;

        this._indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this._indexBuffer.indexType = IndexFormat.UInt16;

        this._wholeIndex = LayaGL.render2DRenderPassFactory.create2DGraphicWoleBuffer();
        this._wholeIndex.modifyType = BufferModifyType.Index;
        this._wholeIndex.buffer = this._indexBuffer;

        this._bufferState = LayaGL.renderDeviceFactory.createBufferState();
        this._vertexBuffer.vertexDeclaration = vertexDeclaration;
        this._vertexDeclaration = vertexDeclaration;

        this._vertexStride = vertexDeclaration.vertexStride;
        this._vertexElementLength = this._vertexStride / 4;
        this._vertexBlockLength = this._vertexBlockSize * this._vertexElementLength;

        this._bufferState.applyState([this._vertexBuffer], this._indexBuffer);

        let size = Graphic2DDynamicVIBuffer.DEFAULT_BLOCK_SIZE;
        this.resizeVertexBuffer(size);
        this.resizeIndexBuffer(size);
    }

    resizeVertexBuffer(blockSize: number) {//size表示几个size
        let byteLength = blockSize * this._vertexBlockSize * this._vertexStride;
        this._wholeVertex.resetData(byteLength);
        this._vertexBuffer.setDataLength(byteLength);
        this._canVBlockCount = blockSize;
    }

    resizeIndexBuffer(size: number) {
        let byteLength = size * 2;
        this._wholeIndex.resetData(byteLength);
        this._indexBuffer._setIndexDataLength(byteLength);
        this._indexBufferMaxLength = size;
    }

    //扩展顶点范围
    vertexExtendBlock(needBlockSize: number): void {
        let blockSize = Math.ceil((this._canVBlockCount + needBlockSize) / Graphic2DDynamicVIBuffer.DEFAULT_BLOCK_SIZE) * Graphic2DDynamicVIBuffer.DEFAULT_BLOCK_SIZE;
        this.resizeVertexBuffer(blockSize);
    }

    indexExtendBlock(length: number): void {
        let nMaxLength = Math.ceil((this._indexBufferLength + length) / Graphic2DDynamicVIBuffer.DEFAULT_BLOCK_SIZE) * Graphic2DDynamicVIBuffer.DEFAULT_BLOCK_SIZE;
        this.resizeIndexBuffer(nMaxLength);
    }

    /**
     * 检查顶点缓冲区是否有足够空间
     * @param vertexCount 需要的长度
     * @returns 使用的blocks，如果空间不足则返回null
     */
    checkVertexBuffer(vertexCount: number): any {
        let requiredBlocks = Math.ceil(vertexCount / this._vertexBlockSize);
        let requiredExtendBlockCount = requiredBlocks - (this._vertexFreeBlocks.length + (this._canVBlockCount - this._vertexViews.length));
        if (requiredExtendBlockCount > 0) {//判断是否需要扩Buffer
            let needBlocks = this._canVBlockCount + requiredExtendBlockCount;
            let newVertexCount = needBlocks * this._vertexBlockSize;/** Float32Array.BYTES_PER_ELEMENT */;
            if (newVertexCount > Graphic2DDynamicVIBuffer.MAX_VERTEX) {    //扩Buffer是否超过了最大范围
                return null;
            } else {
                //扩Buffer
                this.vertexExtendBlock(requiredExtendBlockCount);
            }
        }

        let usedBlocks: number[] = [];
        let usedViews: I2DGraphicBufferDataView[] = [];
        let remainingBlocks = requiredBlocks;

        // 首先使用空闲块
        while (remainingBlocks > 0 && this._vertexFreeBlocks.length > 0) {
            let block = this._vertexFreeBlocks.shift();
            usedBlocks.push(block);
            usedViews.push(this._vertexViews[block]!);
            remainingBlocks--;
        }

        // 如果还需要更多块，使用新的块
        while (remainingBlocks > 0) {
            let newBlockIndex = this._vertexViews.length;
            usedBlocks.push(newBlockIndex);
            // 为新块创建视图
            let view = LayaGL.render2DRenderPassFactory.create2DGraphicBufferDataView(
                this._wholeVertex,
                newBlockIndex * this._vertexBlockLength,
                this._vertexBlockLength,
                this._vertexElementLength
            );
            this._vertexViews[newBlockIndex] = view;

            usedViews.push(view);
            remainingBlocks--;
        }
        // 使用第一个block的视图
        return { buffer: this, vertexViews: usedViews, vertexBlocks: usedBlocks };
    }

    /**
     * 检查索引缓冲区是否有足够空间
     * @param length 需要的长度
     * @returns 包含数据视图和使用的blocks的对象，如果空间不足则返回null
     */
    checkIndexBuffer(length: number): I2DGraphicBufferDataView {
        let view: I2DGraphicBufferDataView;

        // let views = this._indexViews.get(length);
        // if (views && views.length > 0) {
        //     view = views.shift();
        // }
        // else 
        if (this._indexBufferLength + length > this._indexBufferMaxLength) {
            this.indexExtendBlock(length);
        }

        // if (!view) {
            // 为新块创建视图
            view = LayaGL.render2DRenderPassFactory.create2DGraphicBufferDataView(
                this._wholeIndex,
                this._indexBufferLength,
                length,
                1
            );
            // this._wholeIndex.addDataView(view);
            this._indexBufferLength += length;
        // }
        // else if (view.start === -1) {
        //     view.start = this._indexBufferLength;
        //     this._indexBufferLength += length;
        // }
        return view;
    }

    private _releaseBlocks(blocks: number[], list: I2DGraphicBufferDataView[], freeBlocks: number[]) {
        if (!blocks || blocks.length === 0)
            return;
        freeBlocks.push(...blocks);
    }
    /**
     * 释放顶点缓冲区块
     * @param blocks 要释放的blocks数组
     */
    releaseVertexBlocks(blocks: number[]) {
        this._releaseBlocks(blocks, this._vertexViews, this._vertexFreeBlocks);
    }

    /**
     * 准备释放索引缓冲区块
     * @param indexView 要回收的索引缓冲区块
     */
    // readyReleaseIndexView(indexView: I2DGraphicBufferDataView) {
    //     let views = this._indexViews.get(indexView.length);
    //     if (views) {
    //         views.push(indexView);
    //     } else {
    //         this._indexViews.set(indexView.length, [indexView]);
    //     }
    // }

    /**
     * 释放索引缓冲区块
     * @param indexView 要释放的索引缓冲区块
     */
    releaseIndexView(indexView: I2DGraphicBufferDataView) {
        this._indexBufferLength -= indexView.length;
        // indexView 移除
        this._wholeIndex.removeDataView(indexView);
    }

    /**
     * 效果存疑
     * 清除池子内的索引缓冲区块
     */
    // clearAllIndexView() {
    //     this._wholeIndex.clearBufferViews();
    // }

    // /**
    //  * 上传数据到GPU
    //  */
    // upload() {
    //     if (!this.needUpload) return;

    //     // vb
    //     if (this._vertexState === BufferState.NEED_RESIZE) {
    //         let newSize = this._vertexViews.length * this._vertexBlockSize

    //         let newData = new Float32Array(newSize);
    //         newData.set(this._vertexData);

    //         this._vertexData = newData;
    //         this._vertexState = BufferState.RESIZED;
    //         this._vertexBuffer.setDataLength(this._vertexData.length * 4);

    //         this._vertexViews.forEach((view, index) => {
    //             if (view) {
    //                 view.updateView(this._vertexData);
    //                 view.isModified = false;
    //             }
    //         });
    //         this._vertexModify = false;
    //         this._vertexBuffer.setData(this._vertexData.buffer, 0, 0, this._vertexData.byteLength);
    //     }

    //     // ib
    //     if (this._indexState === BufferState.NEED_RESIZE) {
    //         let newSize = this._indexViews.length * this._indexBlockSize

    //         let newData = new Uint16Array(newSize);
    //         newData.set(this._indexData);

    //         this._indexData = newData;
    //         this._indexState = BufferState.RESIZED;
    //         this._indexBuffer._setIndexDataLength(this._indexData.length * 2);
    //         this._indexBuffer.indexCount = this._indexData.length;

    //         this._indexViews.forEach((view, index) => {
    //             if (view) {
    //                 view.updateView(this._indexData);
    //                 view.isModified = false;
    //             }
    //         });
    //         this._indexModify = false;
    //         this._indexBuffer._setIndexData(this._indexData, 0);
    //     }

    //     // vb
    //     if (this._vertexModify) {
    //         let start = Number.MAX_VALUE;
    //         let end = 0;
    //         for (let i = 0, n = this._vertexViews.length; i < n; i++) {
    //             let view = this._vertexViews[i];
    //             if (view && view.isModified) {
    //                 start = Math.min(start, view.start);
    //                 end = Math.max(end, view.start + view.count);
    //                 view.isModified = false;
    //             }
    //         }
    //         if (start !== end) {
    //             this._vertexBuffer.setData(this._vertexData.buffer, start * 4, start * 4, (end - start) * 4);
    //         }
    //         this._vertexModify = false;
    //     }

    //     // this._vertexBuffer.setData( this._vertexData.buffer,0 ,0, this._vertexData.byteLength);

    //     if (this._indexModify) {
    //         let start = Number.MAX_VALUE;
    //         let end = 0;
    //         for (let i = 0, n = this._indexViews.length; i < n; i++) {
    //             let view = this._indexViews[i];
    //             if (view && view.isModified) {
    //                 start = Math.min(start, view.start);
    //                 end = Math.max(end, view.start + view.count);
    //                 view.isModified = false;
    //             }
    //         }
    //         if (start !== end) {
    //             let tempView = new Uint16Array(this._indexData.buffer, start * 2, end - start);
    //             this._indexBuffer._setIndexData(tempView, start * 2);
    //         }
    //         this._indexModify = false;
    //     }

    //     // this._indexBuffer._setIndexData(this._indexData, 0);
    //     // console.log( "==== upload buffer" , Stat.loopCount );
    //     this.needUpload = false;
    //     this._vertexState = BufferState.NO_CHANGE;
    //     this._indexState = BufferState.NO_CHANGE;
    // }

    /**
     * 清理所有数据
     */
    clear() {
        this._vertexViews.forEach(view => view = null);
        this._vertexFreeBlocks = [];
    }

    /**
     * 销毁资源
     */
    destroy() {
        this.clear();
        this._vertexBuffer.destroy();
        this._indexBuffer.destroy();
        //wholeBuffer destroy
    }
}
