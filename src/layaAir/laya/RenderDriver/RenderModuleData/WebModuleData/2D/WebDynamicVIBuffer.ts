import { LayaGL } from "../../../../layagl/LayaGL";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { Stat } from "../../../../utils/Stat";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { IDynamicVIBuffer, IBufferDataView, IBufferBlock } from "../../Design/2D/IRender2DDataHandle";

export class BufferDataView implements IBufferDataView {
    private _data: Float32Array | Uint16Array;
    private _start: number;
    private _length: number;
    /** @internal */
    _isUsingTemp: boolean = false;
    private _stride:number = 1;
    owner: WebDynamicVIBuffer;

    count = 0;

    isModified: boolean = false; // 标记数据是否被修改
    
    modify(type:number){
        if(type === 0){
            this.owner._vertexModify = true;
        }else{
            this.owner._indexModify = true;
        }
        this.isModified = true;
        this.owner.needUpload = true;
    }

    constructor(owner: WebDynamicVIBuffer, source: Float32Array | Uint16Array, start: number, length: number, stride:number = 1) {
        this.owner = owner;
        this._start = start;
        this._length = length;
        this._stride = stride;
        if ( start + length > source.length ) {
            this._data = new (source.constructor as any)(this._length);
            this._isUsingTemp = true;
        } else {
            this._data = new (source.constructor as any)( source.buffer , start * source.BYTES_PER_ELEMENT, length );
        }
    }

    get data(): Float32Array | Uint16Array {
        return this._data;
    }

    get start(): number {
        return this._start;
    }

    get length(): number {
        return this._length;
    }

    get stride(): number {
        return this._stride;
    }


    // 更新数据视图
    updateView(newData: Float32Array | Uint16Array) {
        if (this._isUsingTemp) {
            newData.set(this._data , this._start);
            this._isUsingTemp = false;
        }
        this._data = new (newData.constructor as any)(newData.buffer , this._start * newData.BYTES_PER_ELEMENT, this._length);
    }

    getDataRange(): { start: number, length: number } {
        return {
            start: this._start,
            length: this._length
        };
    }
}

enum BufferState {
    NO_CHANGE = 0,
    NEED_RESIZE = 1,
    RESIZED = 2
}

export class WebDynamicVIBuffer implements IDynamicVIBuffer{
    static MAX_VERTEX = 65535;
    static DEFAULT_BLOCK_SIZE = 512;

    private _bufferState: IBufferState;
    private _vertexBuffer: IVertexBuffer;
    private _indexBuffer: IIndexBuffer;
    
    private _vertexData: Float32Array | null = null;
    private _indexData: Uint16Array | null = null;
    
    private _vertexState: BufferState = BufferState.NO_CHANGE;
    private _indexState: BufferState = BufferState.NO_CHANGE;
    
    private _vertexBlockSize: number;
    private _indexBlockSize: number;
    
    private _vertexViews: BufferDataView [] = [];
    private _indexViews: BufferDataView [] = [];
    
    private _vertexFreeBlocks: number[] = [];
    private _indexFreeBlocks: number[] = [];

    _vertexModify:boolean = true;

    _indexModify:boolean = true;
    /** @internal */
    public needUpload: boolean = false;

    private _vertexDeclaration:VertexDeclaration;

    get vertexBuffer(): IVertexBuffer {
        return this._vertexBuffer;
    }

    get indexBuffer(): IIndexBuffer {
        return this._indexBuffer;
    }

    get bufferState(): IBufferState {
        return this._bufferState;
    }

    constructor( vertexBlockSize: number, indexBlockSize: number ) {
        this._vertexBlockSize = vertexBlockSize;
        this._indexBlockSize = indexBlockSize;
        
        let vertexDefaultSize = vertexBlockSize * WebDynamicVIBuffer.DEFAULT_BLOCK_SIZE;
        this._vertexData = new Float32Array(vertexDefaultSize);
        let indexDefaultSize = indexBlockSize * WebDynamicVIBuffer.DEFAULT_BLOCK_SIZE;
        this._indexData = new Uint16Array(indexDefaultSize);

        this._vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        this._vertexBuffer.setDataLength(vertexDefaultSize * 4);
        this._indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this._indexBuffer.indexType = IndexFormat.UInt16;
        this._indexBuffer._setIndexDataLength(indexDefaultSize * 2);

        this._bufferState = LayaGL.renderDeviceFactory.createBufferState();
    }

    set vertexDeclaration(vertexDeclaration:VertexDeclaration){
        if(this._vertexDeclaration !== vertexDeclaration){
            this._vertexDeclaration = vertexDeclaration;
            this._vertexBuffer.vertexDeclaration = vertexDeclaration;
            this._bufferState.applyState([this._vertexBuffer], this._indexBuffer);
        }
    }

    get vertexDeclaration():VertexDeclaration{
        return this._vertexDeclaration;
    }

    /**
     * 检查顶点缓冲区是否有足够空间
     * @param length 需要的长度
     * @returns 使用的blocks，如果空间不足则返回null
     */
    checkVertexBuffer(length: number): IBufferBlock {
        let requiredBlocks = Math.ceil(length / this._vertexBlockSize);
        
        let usedBlocks: number[] = [];
        let usedViews: BufferDataView[] = [];
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
            let view = new BufferDataView(
                this,
                this._vertexData,
                newBlockIndex * this._vertexBlockSize,
                this._vertexBlockSize,
                this._vertexDeclaration.vertexStride / 4
            );
            this._vertexViews[newBlockIndex] = view;
            if(view._isUsingTemp){
                this._vertexState = BufferState.NEED_RESIZE;
            }
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
    checkIndexBuffer(length: number): IBufferBlock {
        let requiredBlocks = Math.ceil(length / this._indexBlockSize);

        let usedBlocks: number[] = [];
        let usedViews: BufferDataView[] = [];
        let remainingBlocks = requiredBlocks;

        // 首先使用空闲块
        while (remainingBlocks > 0 && this._indexFreeBlocks.length > 0) {
            let block = this._indexFreeBlocks.shift();
            usedBlocks.push(block);
            usedViews.push(this._indexViews[block]);
            remainingBlocks--;
        }

        // 如果还需要更多块，使用新的块
        while (remainingBlocks > 0) {
            let newBlockIndex = this._indexViews.length;
            usedBlocks.push(newBlockIndex);
            // 为新块创建视图
            let view = new BufferDataView(
                this,
                this._indexData,
                newBlockIndex * this._indexBlockSize,
                this._indexBlockSize
            );
            this._indexViews[newBlockIndex] = view; 
            if(view._isUsingTemp){
                this._indexState = BufferState.NEED_RESIZE;
            }
            usedViews.push(view);
            remainingBlocks--;
        }
        // 使用第一个block的视图
        return { buffer: this, indexViews: usedViews, indexBlocks: usedBlocks };
    }


    private _releaseBlocks(blocks: number[] , list: BufferDataView[] , freeBlocks: number[]) {
        if (!blocks || blocks.length === 0)
            return;
        blocks.forEach(blockIndex => {
            list[blockIndex].count = 0;
        });
        freeBlocks.push(...blocks);
        this.needUpload = true;
    }
    /**
     * 释放顶点缓冲区块
     * @param blocks 要释放的blocks数组
     */
    releaseVertexBlocks(blocks: number[]) {
        this._releaseBlocks(blocks, this._vertexViews, this._vertexFreeBlocks);
    }

    /**
     * 释放索引缓冲区块
     * @param blocks 要释放的blocks数组
     */
    releaseIndexBlocks(blocks: number[]) {
        this._releaseBlocks(blocks, this._indexViews, this._indexFreeBlocks);
    }

    /**
     * 上传数据到GPU
     */
    upload() {
        if (!this.needUpload) return;

        // vb
        if (this._vertexState === BufferState.NEED_RESIZE) {
            let newSize = this._vertexViews.length * this._vertexBlockSize
            
            let newData = new Float32Array(newSize);
            newData.set(this._vertexData);
            
            this._vertexData = newData;
            this._vertexState = BufferState.RESIZED;
            this._vertexBuffer.setDataLength(this._vertexData.length * 4);

            this._vertexViews.forEach((view, index) => {
                if (view) {
                    view.updateView(this._vertexData);
                }
            });
            this._vertexModify = true;
        }

        // ib
        if (this._indexState === BufferState.NEED_RESIZE) {
            let newSize = this._indexViews.length * this._indexBlockSize
            
            let newData = new Uint16Array(newSize);
            newData.set(this._indexData);
            
            this._indexData = newData;
            this._indexState = BufferState.RESIZED;
            this._indexBuffer._setIndexDataLength(this._indexData.length * 2);
            this._indexBuffer.indexCount = this._indexData.length;

            this._indexViews.forEach((view, index) => {
                if (view) {
                    view.updateView(this._indexData);
                }
            }); 
            this._indexModify = true;
        }

        // vb
        if (this._vertexModify) {
            let start = 0;
            let end = 0;
            for (let i = 0 , n = this._vertexViews.length; i < n; i++) {
                let view = this._vertexViews[i];
                if(view && view.isModified){
                    start = Math.min(start, view.start);
                    end = Math.max(end, view.start + view.count);
                    view.isModified = false;
                }
            }
            if(start !== end ){
                this._vertexBuffer.setData( this._vertexData.buffer,start ,start * 4,(end - start) * 4);
            }
            this._vertexModify = false;
        }
        // this._vertexBuffer.setData( this._vertexData.buffer,0 ,0, this._vertexData.byteLength);
        
        if (this._indexModify) {
            let start = 0;
            let end = 0;
            for (let i = 0 , n = this._indexViews.length; i < n; i++) {
                let view = this._indexViews[i];
                if(view && view.isModified){
                    start = Math.min(start, view.start);
                    end = Math.max(end, view.start + view.count);
                    view.isModified = false;
                }
            }
            if(start !== end ){
                let tempView = new Uint16Array(this._indexData.buffer, start * 2, end - start);
                this._indexBuffer._setIndexData(tempView,start);
            }
            this._indexModify = false;
        }
        
        // this._indexBuffer._setIndexData(this._indexData, 0);
        // console.log( "==== upload buffer" , Stat.loopCount );
        this.needUpload = false;
        this._vertexState = BufferState.NO_CHANGE;
        this._indexState = BufferState.NO_CHANGE;
    }

    /**
     * 清理所有数据
     */
    clear() {
        this._vertexViews.forEach(view => view = null);
        this._indexViews.forEach(view => view = null);
        this._vertexFreeBlocks = [];
        this._indexFreeBlocks = [];
        this.needUpload = true;
    }

    /**
     * 销毁资源
     */
    destroy() {
        this.clear();
        this._vertexBuffer.destroy();
        this._indexBuffer.destroy();
    }
}
