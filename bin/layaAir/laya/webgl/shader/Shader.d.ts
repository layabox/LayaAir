import { BaseShader } from "././BaseShader";
import { ShaderValue } from "././ShaderValue";
import { StringKey } from "../../utils/StringKey";
export declare class Shader extends BaseShader {
    private static _count;
    static _preCompileShader: any;
    private _attribInfo;
    static SHADERNAME2ID: number;
    static nameKey: StringKey;
    static sharders: any[];
    static getShader(name: any): Shader;
    static create(vs: string, ps: string, saveName?: any, nameMap?: any, bindAttrib?: any[]): Shader;
    /**
     * 根据宏动态生成shader文件，支持#include?COLOR_FILTER "parts/ColorFilter_ps_logic.glsl";条件嵌入文件
     * @param	name
     * @param	vs
     * @param	ps
     * @param	define 宏定义，格式:{name:value...}
     * @return
     */
    static withCompile(nameID: number, define: any, shaderName: any, createShader: Function): Shader;
    /**
     * 根据宏动态生成shader文件，支持#include?COLOR_FILTER "parts/ColorFilter_ps_logic.glsl";条件嵌入文件
     * @param	name
     * @param	vs
     * @param	ps
     * @param	define 宏定义，格式:{name:value...}
     * @return
     */
    static withCompile2D(nameID: number, mainID: number, define: any, shaderName: any, createShader: Function, bindAttrib?: any[]): Shader;
    static addInclude(fileName: string, txt: string): void;
    /**
     * 预编译shader文件，主要是处理宏定义
     * @param	nameID,一般是特殊宏+shaderNameID*0.0002组成的一个浮点数当做唯一标识
     * @param	vs
     * @param	ps
     */
    static preCompile(nameID: number, vs: string, ps: string, nameMap: any): void;
    /**
     * 预编译shader文件，主要是处理宏定义
     * @param	nameID,一般是特殊宏+shaderNameID*0.0002组成的一个浮点数当做唯一标识
     * @param	vs
     * @param	ps
     */
    static preCompile2D(nameID: number, mainID: number, vs: string, ps: string, nameMap: any): void;
    private customCompile;
    private _nameMap;
    private _vs;
    private _ps;
    private _curActTexIndex;
    private _reCompile;
    tag: any;
    _vshader: any;
    _pshader: any;
    _program: any;
    _params: any[];
    _paramsMap: any;
    /**
     * 根据vs和ps信息生成shader对象
     * 把自己存储在 sharders 数组中
     * @param	vs
     * @param	ps
     * @param	name:
     * @param	nameMap 帮助里要详细解释为什么需要nameMap
     */
    constructor(vs: string, ps: string, saveName?: any, nameMap?: any, bindAttrib?: any[]);
    protected recreateResource(): void;
    protected _disposeResource(): void;
    private _compile;
    private static _createShader;
    /**
     * 根据变量名字获得
     * @param	name
     * @return
     */
    getUniform(name: string): any;
    private _uniform1f;
    private _uniform1fv;
    private _uniform_vec2;
    private _uniform_vec2v;
    private _uniform_vec3;
    private _uniform_vec3v;
    private _uniform_vec4;
    private _uniform_vec4v;
    private _uniformMatrix2fv;
    private _uniformMatrix3fv;
    private _uniformMatrix4fv;
    private _uniform1i;
    private _uniform1iv;
    private _uniform_ivec2;
    private _uniform_ivec2v;
    private _uniform_vec3i;
    private _uniform_vec3vi;
    private _uniform_vec4i;
    private _uniform_vec4vi;
    private _uniform_sampler2D;
    private _uniform_samplerCube;
    private _noSetValue;
    uploadOne(name: string, value: any): void;
    uploadTexture2D(value: any): void;
    /**
     * 提交shader到GPU
     * @param	shaderValue
     */
    upload(shaderValue: ShaderValue, params?: any[]): void;
    /**
     * 按数组的定义提交
     * @param	shaderValue 数组格式[name,value,...]
     */
    uploadArray(shaderValue: any[], length: number, _bufferUsage: any): void;
    /**
     * 得到编译后的变量及相关预定义
     * @return
     */
    getParams(): any[];
    /**
     * 设置shader里面的attribute绑定到哪个location，必须与mesh2d的对应起来，
     * 这个必须在编译之前设置。
     * @param attribDesc 属性描述，格式是 [attributeName, location, attributeName, location ... ]
     */
    setAttributesLocation(attribDesc: any[]): void;
}
