import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { MultiRenderData } from "./MultiRenderData";

/**
 * @en Creator class for index buffer (IB) in spine rendering.
 * @zh Spine渲染中用于创建索引缓冲区（IB）的类。
 */
export class IBCreator {
    type:IndexFormat;
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
    ibLength: number;
    maxIndexCount:number
    /**
     * @en The output render data for multiple renders.
     * @zh 用于多重渲染的输出渲染数据。
     */
    outRenderData: MultiRenderData;

    get realIb(): Uint16Array|Uint32Array|Uint8Array {
        return this.ib;
    }

    constructor(type:IndexFormat , maxIndexCount : number ) {
        this.type = type;
        this.maxIndexCount = maxIndexCount;
        // this.ib = new Uint16Array(SpineMeshBase.maxVertex * 3);
        switch (type) {
            case IndexFormat.UInt16:
                this.size = 2;
                this.ib = new Uint16Array(maxIndexCount);
                break;
            case IndexFormat.UInt8:
                this.size = 1;
                this.ib = new Uint8Array(maxIndexCount);
                break;
                
            case IndexFormat.UInt32:
                this.size = 4
                this.ib = new Uint32Array(maxIndexCount);
                break;
        }
        this.ibLength = 0;
    }
}