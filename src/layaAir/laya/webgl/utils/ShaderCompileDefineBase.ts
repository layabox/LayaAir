import { IShaderInstance } from "../../RenderDriver/DriverDesign/RenderDevice/IShaderInstance";
import { IDefineDatas } from "../../RenderDriver/RenderModuleData/Design/IDefineDatas";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { SubShader, UniformMapType } from "../../RenderEngine/RenderShader/SubShader";
import { LayaGL } from "../../layagl/LayaGL";
import { IShaderCompiledObj } from "./ShaderCompile";
import { ShaderNode } from "./ShaderNode";
import { UniformProperty } from "../../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";

export interface ShaderProcessInfo {
    defineString: string[];
    vs: ShaderNode;
    ps: ShaderNode;
    attributeMap: Record<string, [number, ShaderDataType]>;
    uniformMap: Map<number, UniformProperty>;
    is2D: boolean;
    //....其他数据
}

export class ShaderCompileDefineBase {
    _VS: ShaderNode;
    _PS: ShaderNode;
    _defs: Set<string>;
    _validDefine: IDefineDatas;
    _owner: SubShader;
    name: string;

    constructor(owner: any, name: string, compiledObj: IShaderCompiledObj) {
        this._owner = owner;
        this.name = name;
        this._VS = compiledObj.vsNode;
        this._PS = compiledObj.psNode;
        this._defs = compiledObj.defs;
        this._validDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();

        for (let k of compiledObj.defs)
            this._validDefine.add(Shader3D.getDefineByName(k));

        this._validDefine.add(Shader3D.getDefineByName("VBONEW"));
        this._validDefine.add(Shader3D.getDefineByName("VBONEI"));
    }

    withCompile(compileDefine: IDefineDatas): IShaderInstance {
        return null;
    }
}