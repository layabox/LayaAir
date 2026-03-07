import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";

/**
 * LayaX DefineDatas — Rust-backed shader define bitmask.
 *
 * Delegates all operations to `conchLayaXDefineDatas` (C++ → Rust FFI).
 * Unlike RTDefineDatas which uses conchRTDefineDatas (GLES path),
 * this uses the LayaX path with Rust-side storage and variant selection.
 */
export class LayaXDefineDatas implements IDefineDatas {
    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXDefineDatas();
        this._nativeObj.create();
    }

    get _length(): number {
        // Rust manages length internally; return 0 for interface compat
        return 0;
    }

    set _length(value: number) {
        // No-op: Rust manages length
    }

    get _mask(): number[] {
        // Rust manages mask internally; return empty for interface compat
        return [];
    }

    set _mask(value: number[]) {
        // No-op: Rust manages mask
    }

    /** @internal */
    _intersectionDefineDatas(define: IDefineDatas): void {
        // Intersection is done in Rust during variant resolution.
        // This is a no-op on the TS side for the LayaX path.
    }

    add(define: ShaderDefine): void {
        this._nativeObj.add(define._index, define._value);
    }

    remove(define: ShaderDefine): void {
        this._nativeObj.remove(define._index, define._value);
    }

    addDefineDatas(define: IDefineDatas): void {
        if ((define as any)._nativeObj) {
            this._nativeObj.addDefineDatas((define as LayaXDefineDatas)._nativeObj.handle);
        }
    }

    removeDefineDatas(define: IDefineDatas): void {
        // Remove is handled at the individual define level in LayaX path
    }

    has(define: ShaderDefine): boolean {
        return this._nativeObj.has(define._index, define._value);
    }

    clear(): void {
        this._nativeObj.clear();
    }

    cloneTo(destObject: IDefineDatas): void {
        // For LayaX path, clone is done by creating a fresh DefineDatas
        // and adding all defines from this one
        const dest = destObject as LayaXDefineDatas;
        if (dest._nativeObj) {
            dest._nativeObj.clear();
            dest._nativeObj.addDefineDatas(this._nativeObj.handle);
        }
    }

    clone(): LayaXDefineDatas {
        let dest = new LayaXDefineDatas();
        this.cloneTo(dest);
        return dest;
    }

    /** Get the native handle (for passing to ShaderPass etc.) */
    get handle(): number {
        return this._nativeObj.handle;
    }

    destroy(): void {
        this._nativeObj.destroy();
    }
}
