import { IShaderInstance } from "../../RenderDriver/DriverDesign/RenderDevice/IShaderInstance";
import { IDefineDatas } from "../../RenderDriver/RenderModuleData/Design/IDefineDatas";
import { ShaderDataType } from "../../RenderDriver/RenderModuleData/Design/ShaderData";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
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
    _validDefine: IDefineDatas;

    /** @internal */
    protected _owner: SubShader;
    /** @internal */
    name: string;

    nodeCommonMap: Array<string>;

    constructor(owner: any, name: string, compiledObj: IShaderCompiledObj) {
        this._owner = owner;
        this.name = name;
        this._VS = compiledObj.vsNode;
        this._PS = compiledObj.psNode;
        this._defs = compiledObj.defs;
        this._validDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();
        for (let k of compiledObj.defs)
            this._validDefine.add(Shader3D.getDefineByName(k));
    }

   
    /**
     * @internal
     */
    withCompile(compileDefine: IDefineDatas): IShaderInstance {
        return null;
    }
}