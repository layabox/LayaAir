import { SubShader } from "././SubShader";
import { ShaderInstance } from "././ShaderInstance";
import { RenderState } from "../core/material/RenderState";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export declare class ShaderPass extends ShaderCompile {
    /**@private */
    private _owner;
    /**@private */
    _stateMap: any;
    /**@private */
    private _cacheSharders;
    /**@private */
    private _publicValidDefine;
    /**@private */
    private _spriteValidDefine;
    /**@private */
    private _materialValidDefine;
    /**@private */
    private _renderState;
    /**
     * 获取渲染状态。
     * @return 渲染状态。
     */
    readonly renderState: RenderState;
    constructor(owner: SubShader, vs: string, ps: string, stateMap: any);
    /**
     * @private
     */
    private _definesToNameDic;
    /**
     * @inheritDoc
     */
    protected _compileToTree(parent: ShaderNode, lines: any[], start: number, includefiles: any[], defs: any): void;
    /**
     * @private
     */
    withCompile(publicDefine: number, spriteDefine: number, materialDefine: number): ShaderInstance;
}
