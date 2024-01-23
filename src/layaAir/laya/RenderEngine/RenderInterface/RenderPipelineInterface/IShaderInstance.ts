import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { RenderState } from "../../RenderShader/RenderState";
import { ShaderDefine } from "../../RenderShader/ShaderDefine";
import { ShaderPass } from "../../RenderShader/ShaderPass";

export interface IShaderInstance {
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void
    _disposeResource(): void;
}


export interface IShaderPassData {
    pipelineMode: string;
    statefirst: boolean;
    validDefine: IDefineDatas;
    renderState: RenderState;
    setCacheShader(defines: IDefineDatas, shaderInstance: IShaderInstance): void;
    getCacheShader(defines: IDefineDatas): IShaderInstance;
    destory(): void;
}

//subShader和shaderpass仅仅保留getCacheShader相关的数据
export interface ISubshaderData {
    addShaderPass(pass: IShaderPassData): void;
    destroy(): void;
}

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
