import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";

/**
 * Shader define bitmask stored by the C++ runtime.
 *
 * Native operations go through `conchLayaXDefineDatas` and the LayaX C API.
 * Variant resolution reads the same C++ define storage.
 */
export class LayaXDefineDatas implements IDefineDatas {
    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXDefineDatas();
        this._nativeObj.create();
    }

    get _length(): number {
        // C++ manages length internally; return 0 for interface compat
        return 0;
    }

    set _length(value: number) {
        // No-op: C++ manages length
    }

    get _mask(): number[] {
        // C++ manages mask internally; return empty for interface compat
        return [];
    }

    set _mask(value: number[]) {
        // No-op: C++ manages mask
    }

    /** @internal */
    _intersectionDefineDatas(define: IDefineDatas): void {
        // Intersection is done in C++ during variant resolution.
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
            // C++ addDefineDatas expects LayaXDefineDatas_JS*, pass the native object (not handle number)
            this._nativeObj.addDefineDatas((define as LayaXDefineDatas)._nativeObj);
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
            this._nativeObj.cloneTo(dest._nativeObj);
        }
    }

    clone(): LayaXDefineDatas {
        let dest = new LayaXDefineDatas();
        this.cloneTo(dest);
        return dest;
    }


    destroy(): void {
        this._nativeObj.destroy();
    }
}
