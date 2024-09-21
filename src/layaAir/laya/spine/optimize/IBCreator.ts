import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { MultiRenderData } from "./MultiRenderData";

/**
 * @en Creator class for index buffer (IB) in spine rendering.
 * @zh Spine渲染中用于创建索引缓冲区（IB）的类。
 */
export class IBCreator {
    /**
     * @en The index buffer array.
     * @zh 索引缓冲区数组。
     */
    ib: Uint16Array;
    /**
     * @en The actual length of the index buffer.
     * @zh 索引缓冲区的实际长度。
     */
    ibLength: number;
    /**
     * @en The output render data for multiple renders.
     * @zh 用于多重渲染的输出渲染数据。
     */
    outRenderData: MultiRenderData;

    private _realib: Uint16Array;

    /**
     * @en The actual index buffer.
     * @zh 实际索引缓冲区。
     */
    get realIb(): Uint16Array {
        if (!this._realib) {
            this._realib = new Uint16Array(this.ib.buffer, 0, this.ibLength);
        }
        return this._realib;
    }
    /** @ignore */
    constructor() {
        this.ib = new Uint16Array(SpineMeshBase.maxVertex * 3);
        this.ibLength = 0;
    }
}