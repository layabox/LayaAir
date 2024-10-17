import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { SpineMeshUtils } from "../mesh/SpineMeshUtils";
import { AttachmentParse } from "./AttachmentParse";
import { MultiRenderData } from "./MultiRenderData";
import { SlotUtils } from "./SlotUtils";
import { VBCreator } from "./VBCreator";

/**
 * @en Creator class for index buffer (IB) in spine rendering.
 * @zh Spine渲染中用于创建索引缓冲区（IB）的类。
 */
export class IBCreator {
    /** 
     * @en The index type.
     * @zh 索引类型。
     */
    type:IndexFormat;
    /**
     * @en The byte count of the index type.
     * @zh 索引类型字节数量。
     */
    size:number;
    /**
     * @en The index buffer array.
     * @zh 索引缓冲区数组。
     */
    ib: Uint16Array|Uint32Array|Uint8Array;
    /**
     * @en The actual length of the index buffer.
     * @zh 索引缓冲区的实际长度。
     */
    ibLength: number = 0;
    /**
     * @en The Max length of the index buffer.
     * @zh 索引缓冲区的最大长度。
     */
    maxIndexCount:number = 0;
    /**
     * @en The output render data for multiple renders.
     * @zh 用于多重渲染的输出渲染数据。
     */
    outRenderData: MultiRenderData;

    /** @ignore */
    constructor() {
    }

    /**
     * 
     * @zh 根据顶点长度设置索引类型
     * @param vertexCount 顶点数目
     */
    updateFormat(vertexCount:number){
        let ntype:IndexFormat = SpineMeshUtils.getIndexFormat(vertexCount);
        if (this.type === ntype) return
        this.type = ntype;
        this._updateBuffer();
    }

    /**
	 * @en set index buffer length.
	 * @param	maxIndexCount The Max length of Index count.
	 * @zh 设置索引缓冲长度。
	 * @param	maxIndexCount 索引最大个数。
	 */
    setBufferLength(maxIndexCount:number){
        if (maxIndexCount <= this.maxIndexCount) return;
        this.maxIndexCount = maxIndexCount;
        this._updateBuffer();
    }

    private _updateBuffer(){
        let oldbuffer = this.ib;

        switch (this.type) {
            case IndexFormat.UInt16:
                this.size = 2;
                this.ib = new Uint16Array(this.maxIndexCount);
                break;
            case IndexFormat.UInt8:
                this.size = 1;
                this.ib = new Uint8Array(this.maxIndexCount);
                break;
                
            case IndexFormat.UInt32:
                this.size = 4
                this.ib = new Uint32Array(this.maxIndexCount);
                break;
        }

        if (oldbuffer) this.ib.set(oldbuffer);
    }

    /**
     * @en Create index buffer for attachments.
     * @param attachs Array of attachment parse data.
     * @param vbCreator Vertex buffer creator.
     * @param order Optional draw order array.
     * @zh 为附件创建索引缓冲区。
     * @param attachs 附件解析数据数组。
     * @param vbCreator 顶点缓冲区创建器。
     * @param order 可选的绘制顺序数组。
     */
    createIB(attachs: AttachmentParse[], vbCreator: VBCreator, order?: number[]) {
        let offset = 0;
        let slotVBMap = vbCreator.slotVBMap;
        let drawOrder;
        let getAttach: (value: any) => AttachmentParse;
        if (order) {//动画drawOrder
            drawOrder = order;
            getAttach = function (value: any) {
                return attachs[value];
            }
        }
        else {
            drawOrder = attachs;
            getAttach = function (value: any) {
                return value;
            }
        }
        let outRenderData = new MultiRenderData();
        let texture;
        let blend;

        let uploadData:Array<{offset:number , data : ArrayLike<number> , start:number}> = [];
        let end = -1;
        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let attach = getAttach(drawOrder[i]);
            if (attach.attachment && !attach.isPath) {
                let needAdd = false;
                if (texture != attach.textureName) {
                    texture = attach.textureName;
                    needAdd = true;
                }
                if (blend != attach.blendMode) {
                    blend = attach.blendMode;
                    needAdd = true;
                }
                if (needAdd) {
                    if (outRenderData.currentData) {
                        outRenderData.endData(offset); 
                    }
                    outRenderData.addData(attach.textureName, attach.blendMode, offset, 0 , attach.attachment);
                }

                let attachPos = slotVBMap.get(attach.slotId).get(attach.attachment);
                
                if (attach.attachment && attach.indexArray) {
                    
                    uploadData.push({
                        data:attach.indexArray,
                        offset : attachPos.offset,
                        start : offset
                    });

                    offset += attach.indexArray.length;
                    end = Math.max(end , offset);
                }
            }
        }

        let vertexCount = vbCreator.maxVertexCount;
        let ntype:IndexFormat = SpineMeshUtils.getIndexFormat(vertexCount);

        let needUpdateBuffer = false;
        if (ntype !== this.type) {
            this.type = ntype;
            needUpdateBuffer = true;
        }

        if (end > this.maxIndexCount){
            this.maxIndexCount = end;
            needUpdateBuffer = true;
        } 

        needUpdateBuffer && this._updateBuffer();

        let ib = this.ib;
        for (let i = 0 , len = uploadData.length; i < len; i++) {
            let upload = uploadData[i];
            let offset = upload.offset;
            let start = upload.start;
            for (let j = 0, n = upload.data.length; j < n; j++) {
                ib[start + j] = upload.data[j] + offset;
            }
        }

        if (texture) {
            outRenderData.endData(offset);
        }

        this.outRenderData = outRenderData;
        this.ibLength = offset;
    }
}
