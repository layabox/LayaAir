import { ShaderDefine } from "./ShaderDefine";

//Shader data
export interface IDefineDatas {
    /**
     * @internal
     */
    _mask: Array<number>;
    /**
     * @internal
     */
    _length: number;
    /**
     * @internal
     */
    _intersectionDefineDatas(define: IDefineDatas): void;
    add(define: ShaderDefine): void;
    remove(define: ShaderDefine): void;
    addDefineDatas(define: IDefineDatas): void;
    removeDefineDatas(define: IDefineDatas): void;
    has(define: ShaderDefine): boolean;
    clear(): void;
    cloneTo(destObject: IDefineDatas): void;
    clone(): IDefineDatas;
    destroy(): void;
}

