import { GRAPHICS_INFO_DEFAULT_QUAD_INDICES, GRAPHICS_INFO_VERTEX_BLOCK_SIZE } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { Web2DGraphicsIndexBuffer, Web2DGraphicsVertexBuffer, Web2DGraphicWholeBuffer } from "./Web2DGraphic2DBuffer";
import { WebRender2DPass } from "./WebRender2DPass";

export abstract class Web2DGraphicsBufferDataView {

    /** IB 的 start 不可信，只有在提交时百分百正确 */
    start: number;//element start
    length: number;//element length

    owner: Web2DGraphicWholeBuffer;

    /** @internal */
    _next: Web2DGraphicsBufferDataView;
    /** @internal */
    _prev: Web2DGraphicsBufferDataView;
}

export class Web2DGraphic2DVertexDataView extends Web2DGraphicsBufferDataView {
    private _view: Float32Array

    stride: number = 1;//element length

    declare owner: Web2DGraphicsVertexBuffer;
    /** @internal */
    declare _next: Web2DGraphic2DVertexDataView;
    /** @internal */
    declare _prev: Web2DGraphic2DVertexDataView;

    /**
     * @internal
     * @returns 
     */
    _getData(): Float32Array {
        return this._view;
    }

    /** @private */
    _modify() {
        this.owner._modifyOneView(this);
        WebRender2DPass.setBuffer(this.owner);
    }

    // 更新数据视图
    _updateView(wholeData: Float32Array) {
        if (!this._view || this._view.buffer !== wholeData.buffer) {
            this._view = new Float32Array(wholeData.buffer, this.start * 4 /** Float32Array.BYTES_PER_ELEMENT */, this.length);
        }
    }

    constructor(owner: Web2DGraphicsVertexBuffer, start: number, length: number, stride: number = 1) {
        super();
        this.owner = owner;
        this.start = start;
        this.length = length;
        this.stride = stride;
        this._updateView(owner._dataView);
        owner.addDataView(this);
    }


}

export class Web2DGraphic2DIndexDataView extends Web2DGraphicsBufferDataView {

    private static _nextIndexRevision = 0;
    private _indexRevision = ++Web2DGraphic2DIndexDataView._nextIndexRevision;
    private _quadIndexCount = -1;
    protected _view: Uint16Array | Uint32Array;

    declare owner: Web2DGraphicsIndexBuffer;

    _geometry: IRenderGeometryElement;

    /** @internal Identifies this view's current index data across Graphics rebuilds. */
    get indexRevision(): number {
        return this._indexRevision;
    }

    setGeometry(value: IRenderGeometryElement): void {
        this._geometry = value;
    }

    /** @internal */
    declare _next: Web2DGraphic2DIndexDataView;
    /** @internal */
    declare _prev: Web2DGraphic2DIndexDataView;

    /** @internal */
    _getData(): Uint16Array | Uint32Array {
        return this._view;
    }

    constructor(owner: Web2DGraphicsIndexBuffer, length: number, create: boolean = true) {
        super();
        this.owner = owner;
        this.length = length;

        if (create) {
            this._view = new (GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE)(length);
        }
    }

    // 更新数据视图
    _updateView(wholeData: Uint16Array | Uint32Array) {
        wholeData.set(this._view, this.start);
    }

    /** @internal */
    _writeQuadIndices(vertexBlocks: readonly number[], quadCount: number): void {
        const indexData = this._view;
        const quadIndices = GRAPHICS_INFO_DEFAULT_QUAD_INDICES;
        const matchesQuadCount = this._quadIndexCount === quadCount;
        let changed = false;
        for (let i = 0; i < quadCount; i++) {
            const vertexBase = i * 4;
            const blockIndex = Math.floor(vertexBase / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
            const blockBase = vertexBlocks[blockIndex] * GRAPHICS_INFO_VERTEX_BLOCK_SIZE
                + vertexBase - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
            const indexOffset = i * quadIndices.length;
            if (matchesQuadCount && indexData[indexOffset] === blockBase + quadIndices[0])
                continue;

            for (let j = 0; j < quadIndices.length; j++) {
                const value = blockBase + quadIndices[j];
                if (matchesQuadCount || indexData[indexOffset + j] !== value) {
                    indexData[indexOffset + j] = value;
                    changed = true;
                }
            }
        }
        this._modify(changed);
        this._quadIndexCount = quadCount;
    }

    /** @private */
    _modify(changed = true) {
        if (changed) {
            this._indexRevision = ++Web2DGraphic2DIndexDataView._nextIndexRevision;
            this._quadIndexCount = -1;
        }
        // A reused view may need a new offset in the source buffer even when its indices match.
        this.owner._modifyOneView(this);
        WebRender2DPass.setBuffer(this.owner);
    }

    destroy(): void {
        this._view = null;
        this._geometry = null;
        this.owner = null;
        this._next = null;
        this._prev = null;
    }
}
