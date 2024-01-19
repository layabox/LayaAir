import { IShaderInstance } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IShaderInstance";
import { ShaderDataType } from "../../RenderEngine/RenderInterface/ShaderData";
import { DefineDatas } from "../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderInstance } from "../../RenderEngine/RenderShader/ShaderInstance";
import { SubShader, UniformMapType } from "../../RenderEngine/RenderShader/SubShader";
import { LayaGL } from "../../layagl/LayaGL";
import { IShaderCompiledObj } from "./ShaderCompile";
import { ShaderNode } from "./ShaderNode";
export class ShaderProcessInfo {
    defineString: string[];
    vs: ShaderNode;
    ps: ShaderNode;
    attributeMap: { [name: string]: [number, ShaderDataType] };
    uniformMap: UniformMapType;
    is2D: boolean;
    //....其他数据
};
export class ShaderCompileDefineBase {
    /** @internal */
    static _defineString: Array<string> = [];
    /** @internal */
    static _debugDefineString: string[] = [];
    /** @internal */
    static _debugDefineMask: number[] = [];
    /** @internal */
    public _VS: ShaderNode;
    /** @internal */
    public _PS: ShaderNode;
    /** @internal */
    _defs: Set<string>;
    /** @internal */
    _validDefine: DefineDatas = new DefineDatas();

    /** @internal */
    protected _owner: SubShader;
    /** @internal */
    name: string;

    nodeCommonMap: Array<string>;
    /** @internal */
    protected _cacheSharders: { [key: number]: { [key: number]: { [key: number]: ShaderInstance } } } = {};

    constructor(owner: any, name: string, compiledObj: IShaderCompiledObj) {
        this._owner = owner;
        this.name = name;
        this._VS = compiledObj.vsNode;
        this._PS = compiledObj.psNode;
        this._defs = compiledObj.defs;
        for (let k of compiledObj.defs)
            this._validDefine.add(Shader3D.getDefineByName(k));
    }

   
    /**
     * @internal
     */
    withCompile(compileDefine: DefineDatas): IShaderInstance {
        return null;
    }
}