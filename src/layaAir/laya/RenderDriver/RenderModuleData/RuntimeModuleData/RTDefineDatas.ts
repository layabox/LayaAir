import { IDefineDatas } from "../Design/IDefineDatas";
import { RTShaderDefine } from "./RTShaderDefine";


export class RTDefineDatas implements IDefineDatas {
    _nativeObj: any;
    constructor(value?: any) {
        if (value) {
            this._nativeObj = value;
        }
        else {
            this._nativeObj = new (window as any).conchRTDefineDatas();
        }
    }
    get _length(): number {
        return this._nativeObj._length;
    }

    set _length(value: number) {
        this._nativeObj._length = value;
    }
    get _mask(): number[] {
        return this._nativeObj._mask;
    }

    set _mask(value: number[]) {
        this._nativeObj._mask = value;
    }
    /**
     * @internal
     */
    _intersectionDefineDatas(define: RTDefineDatas): void {
        this._nativeObj._intersectionDefineDatas(define);
    }

    add(define: RTShaderDefine): void {
        this._nativeObj.add(define);
    }
    remove(define: RTShaderDefine): void {
        this._nativeObj.remove(define);
    }
    addDefineDatas(define: RTDefineDatas): void {
        this._nativeObj.addDefineDatas(define._nativeObj);
    }
    removeDefineDatas(define: RTDefineDatas): void {
        this._nativeObj.removeDefineDatas(define._nativeObj);
    }
    has(define: RTShaderDefine): boolean {
        return this._nativeObj.has(define);
    }
    clear(): void {
        this._nativeObj.clear();
    }
    cloneTo(destObject: RTDefineDatas): void {
        this._nativeObj.cloneTo(destObject._nativeObj);
    }
    clone(): RTDefineDatas {
        return new RTDefineDatas(this._nativeObj.clone());
    }
    destroy(): void {
        this._nativeObj.destroy();
    }

}
