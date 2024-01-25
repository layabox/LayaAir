import { IDefineDatas } from "../Design/IDefineDatas";
import { RTShaderData } from "./RTShaderData";
import { RTShaderDefine } from "./RTShaderDefine";


export class RTDefineDatas implements IDefineDatas {
    _nativeobj: any;
    constructor(value: any) {
        if (value) {
            this._nativeobj = value;
        }
        else {
            this._nativeobj = new (window as any).conchRTDefineDatas();
        }
    }
    get _length(): number {
        return this._nativeobj._length;
    }

    set _length(value: number) {
        this._nativeobj._length = value;
    }
    get _mask(): number[] {
        return this._nativeobj._mask;
    }

    set _mask(value: number[]) {
        this._nativeobj._mask = value;
    }
    /**
     * @internal
     */
    _intersectionDefineDatas(define: RTDefineDatas): void {
        this._nativeobj._intersectionDefineDatas(define._nativeobj);
    }

    add(define: RTShaderDefine): void {
        this._nativeobj.add(define._nativeobj);
    }
    remove(define: RTShaderDefine): void {
        this._nativeobj.remove(define._nativeobj);
    }
    addDefineDatas(define: RTDefineDatas): void {
        this._nativeobj.addDefineDatas(define._nativeobj);
    }
    removeDefineDatas(define: RTDefineDatas): void {
        this._nativeobj.removeDefineDatas(define._nativeobj);
    }
    has(define: RTShaderDefine): boolean {
        return this._nativeobj.has(define._nativeobj);
    }
    clear(): void {
        this._nativeobj.clear();
    }
    cloneTo(destObject: RTDefineDatas): void {
        this._nativeobj.cloneTo(destObject._nativeobj);
    }
    clone(): RTDefineDatas {
        return new RTDefineDatas(this._nativeobj.clone());
    }
    destroy(): void {
        this._nativeobj.destroy();
    }

}
