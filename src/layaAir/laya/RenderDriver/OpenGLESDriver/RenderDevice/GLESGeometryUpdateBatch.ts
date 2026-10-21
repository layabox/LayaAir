import type { GLESRenderGeometryElement } from "./GLESRenderGeometryElement";

/** Synchronous geometry preparation scope. Uses the same GL setters/thread as
 * individual updates; it only consolidates JS/native crossings before drawing. */
export class GLESGeometryUpdateBatch {
    static active: GLESGeometryUpdateBatch = null;
    private static readonly pool: GLESGeometryUpdateBatch[] = [];
    static readonly diagnostics = { flushes: 0, uploads: 0, geometries: 0, uploadBytes: 0,
        renderNodeFlushes: 0, renderNodes: 0, renderElements: 0,
        cameraUpdateCompletions: 0, cameraUpdateNodes: 0 };

    static completeCameraRenderUpdateBatch(nodes: readonly any[], cameraMask: number): boolean {
        const complete = (window as any).conchRTBaseRenderNode?.completeCameraRenderUpdateBatch;
        if (!complete || !Number.isInteger(cameraMask) || cameraMask < 0 || cameraMask > 0xffffffff) return false;
        if (!nodes.length) return true;
        if (!complete(nodes.map(node => node._nativeObj), cameraMask)) return false;
        this.diagnostics.cameraUpdateCompletions++;
        this.diagnostics.cameraUpdateNodes += nodes.length;
        return true;
    }
    private readonly buffers: any[] = [];
    private readonly sources: ArrayBuffer[] = [];
    private readonly geometries = new Set<GLESRenderGeometryElement>();
    private readonly nativeGeometries: any[] = [];
    private uploadRanges = new Int32Array(256);
    private drawRanges = new Int32Array(512);
    private readonly renderNodes: any[] = [];
    private readonly renderElements: any[] = [];
    private renderElementCounts = new Uint32Array(256);

    static begin(): (() => void) | null {
        if (typeof (window as any).conchGLESVertexBuffer?.submitGeometryBatch !== "function") return null;
        const previous = this.active;
        previous?.flush();
        const batch = this.pool.pop() ?? new GLESGeometryUpdateBatch();
        this.active = batch;
        let finished = false;
        return () => {
            if (finished) return;
            if (this.active !== batch) throw new Error("Geometry update scopes must finish in order");
            finished = true;
            try { batch.flush(); }
            finally { this.active = previous; this.pool.push(batch); }
        };
    }

    upload(buffer: any, source: ArrayBuffer, offset: number, start: number, bytes: number): void {
        const at = this.buffers.length * 4;
        if (bytes === Number.MAX_SAFE_INTEGER) bytes = source.byteLength;
        if (![offset, start, bytes].every(value => Number.isSafeInteger(value) && value >= 0 && value <= 0x7fffffff)
            || start + bytes > source.byteLength) throw new RangeError("Invalid geometry upload range");
        if (at + 4 > this.uploadRanges.length) {
            const grown = new Int32Array(this.uploadRanges.length * 2);
            grown.set(this.uploadRanges); this.uploadRanges = grown;
        }
        this.uploadRanges.set([offset, start, bytes, 0], at);
        this.buffers.push(buffer); this.sources.push(source);
    }

    geometry(value: GLESRenderGeometryElement): void { this.geometries.add(value); }

    /** Copy the ordered binding now; callers may reuse their element array. */
    bindRenderElements(node: any, elements: readonly any[]): boolean {
        if (typeof (window as any).conchRTBaseRenderNode?.setRenderElementsBatch !== "function") return false;
        const at = this.renderNodes.length;
        if (at === this.renderElementCounts.length) {
            const grown = new Uint32Array(at * 2);
            grown.set(this.renderElementCounts); this.renderElementCounts = grown;
        }
        this.renderElementCounts[at] = elements.length;
        this.renderNodes.push(node);
        for (const element of elements) this.renderElements.push(element._nativeObj);
        return true;
    }

    flush(): void {
        if (!this.buffers.length && !this.geometries.size && !this.renderNodes.length) return;
        let words = this.geometries.size * 3;
        for (const geometry of this.geometries) words += geometry.drawParams.length;
        if (words > this.drawRanges.length) this.drawRanges = new Int32Array(Math.max(words, this.drawRanges.length * 2));
        let row = 0, offset = this.geometries.size * 3;
        try {
            for (const geometry of this.geometries) {
                const params = geometry.drawParams;
                if (params.length % 2) throw new RangeError("Incomplete geometry draw pair");
                this.drawRanges.set([offset, params.length / 2, geometry.instanceCount], row * 3);
                for (let i = 0; i < params.length; ++i) {
                    const value = params.elements[i];
                    if (!Number.isSafeInteger(value) || value < 0 || value > 0x7fffffff) throw new RangeError("Invalid geometry draw range");
                    this.drawRanges[offset++] = value;
                }
                this.nativeGeometries.push(geometry._nativeObj); row++;
            }
            const counters = GLESGeometryUpdateBatch.diagnostics;
            if (this.buffers.length || this.geometries.size) {
                if (!(window as any).conchGLESVertexBuffer.submitGeometryBatch(this.buffers, this.sources,
                    this.uploadRanges.buffer, this.nativeGeometries, this.drawRanges.buffer)) {
                    throw new Error("Native geometry submission batch rejected");
                }
                counters.flushes++; counters.uploads += this.buffers.length; counters.geometries += row;
                for (let i = 0; i < this.buffers.length; ++i) counters.uploadBytes += this.uploadRanges[i * 4 + 2];
            }
            if (this.renderNodes.length) {
                if (!(window as any).conchRTBaseRenderNode.setRenderElementsBatch(
                    this.renderNodes, this.renderElements, this.renderElementCounts.buffer)) {
                    throw new Error("Native render element batch rejected");
                }
                counters.renderNodeFlushes++; counters.renderNodes += this.renderNodes.length;
                counters.renderElements += this.renderElements.length;
            }
        } finally {
            this.buffers.length = this.sources.length = this.nativeGeometries.length = 0;
            this.geometries.clear();
            this.renderNodes.length = this.renderElements.length = 0;
        }
    }
}
