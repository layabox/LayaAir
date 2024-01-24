import { IDefineDatas } from "../Design/IDefineDatas";
import { RTShaderData } from "./RTShaderData";
import { RTShaderDefine } from "./RTShaderDefine";


export class RTDefineDatas implements IDefineDatas {
    _nativeobj: any;
    constructor() {
        this._nativeobj = new (window as any).conchDefineDatas();
    }
    private __length: number;
    get _length(): number {
        return this._nativeobj._length;
    }

    set _length(value: number) {
        this._nativeobj._length = value;
    }
    _mask: number[];
    /**
     * @internal
     */
    _intersectionDefineDatas(define: RTDefineDatas): void {
        this._nativeobj
    }

    add(define: RTShaderDefine): void {
        throw new Error("Method not implemented.");
    }
    remove(define: RTShaderDefine): void {
        throw new Error("Method not implemented.");
    }
    addDefineDatas(define: RTDefineDatas): void {
        throw new Error("Method not implemented.");
    }
    removeDefineDatas(define: RTDefineDatas): void {
        throw new Error("Method not implemented.");
    }
    has(define: RTShaderDefine): boolean {
        throw new Error("Method not implemented.");
    }
    clear(): void {
        throw new Error("Method not implemented.");
    }
    cloneTo(destObject: RTDefineDatas): void {
        throw new Error("Method not implemented.");
    }
    clone(): RTDefineDatas {
        throw new Error("Method not implemented.");
    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }

}
