import { SubShader } from "./SubShader";
import { RenderState } from "../core/material/RenderState";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export declare class ShaderPass extends ShaderCompile {
    /**
     * 获取渲染状态。
     * @return 渲染状态。
     */
    readonly renderState: RenderState;
    constructor(owner: SubShader, vs: string, ps: string, stateMap: any);
    /**
     * @inheritDoc
     */
    protected _compileToTree(parent: ShaderNode, lines: any[], start: number, includefiles: any[], defs: any): void;
}
