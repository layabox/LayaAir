import { StringKey } from "../../utils/StringKey";
import { ShaderCompile } from "../utils/ShaderCompile";
import { BaseShader } from "./BaseShader";
import { ShaderValue } from "./ShaderValue";
import { LayaGL } from "../../layagl/LayaGL";
import { IRender2DContext } from "../../RenderEngine/RenderInterface/IRender2DContext";
import { RenderStateContext } from "../../RenderEngine/RenderStateContext";

export class Shader extends BaseShader {
    private static _count: number = 0;
    /**@internal */
    static _preCompileShader: any = {}; //存储预编译结果，可以通过名字获得内容,目前不支持#ifdef嵌套和条件
    private _attribInfo: any[]|null = null;

    static SHADERNAME2ID: number = 0.0002;


    static nameKey: StringKey = new StringKey();

    static sharders: any[] = new Array(0x20);// (sharders = [], sharders.length = 0x20, sharders);

    //TODO:coverage
    static create(vs: string, ps: string, saveName: any = null, nameMap: any = null, bindAttrib: any[] = null): Shader {
        return new Shader(vs, ps, saveName, nameMap, bindAttrib);
    }

	// /**
	//  * 根据宏动态生成shader文件，支持#include?COLOR_FILTER "parts/ColorFilter_ps_logic.glsl";条件嵌入文件
	//  * @param	name
	//  * @param	vs
	//  * @param	ps
	//  * @param	define 宏定义，格式:{name:value...}
	//  * @return
	//  */
    // //TODO:coverage
    // static withCompile(nameID: number, define: any, shaderName: any, createShader: Function): Shader {
    //     if (shaderName && Shader.sharders[shaderName])
    //         return Shader.sharders[shaderName];

    //     var pre: ShaderCompile = Shader._preCompileShader[Shader.SHADERNAME2ID * nameID];
    //     if (!pre)
    //         throw new Error("withCompile shader err!" + nameID);
    //     return pre.createShader(define, shaderName, createShader, null);
    // }

	/**
	 * 根据宏动态生成shader文件，支持#include?COLOR_FILTER "parts/ColorFilter_ps_logic.glsl";条件嵌入文件
	 * @param	name
	 * @param	vs
	 * @param	ps
	 * @param	define 宏定义，格式:{name:value...}
	 * @return
	 */
    static withCompile2D(nameID: number, mainID: number, define: any, shaderName: any, createShader: Function, bindAttrib: any[] = null): Shader {
        if (shaderName && Shader.sharders[shaderName])
            return Shader.sharders[shaderName];

        var pre: ShaderCompile = Shader._preCompileShader[Shader.SHADERNAME2ID * nameID + mainID];
        if (!pre)
            throw new Error("withCompile shader err!" + nameID + " " + mainID);
        return pre.createShader(define, shaderName, createShader, bindAttrib);
    }

    static addInclude(fileName: string, txt: string): void {
        ShaderCompile.addInclude(fileName, txt);
    }

	/**
	 * 预编译shader文件，主要是处理宏定义
	 * @param	nameID,一般是特殊宏+shaderNameID*0.0002组成的一个浮点数当做唯一标识
	 * @param	vs
	 * @param	ps
	 */
    //TODO:coverage
    static preCompile(nameID: number, vs: string, ps: string, nameMap: any): void {
        var id: number = Shader.SHADERNAME2ID * nameID;
        Shader._preCompileShader[id] = new ShaderCompile(vs, ps, nameMap);
    }

	/**
	 * 预编译shader文件，主要是处理宏定义
	 * @param	nameID,一般是特殊宏+shaderNameID*0.0002组成的一个浮点数当做唯一标识
	 * @param	vs
	 * @param	ps
	 */
    static preCompile2D(nameID: number, mainID: number, vs: string, ps: string, nameMap: any): void {
        var id: number = Shader.SHADERNAME2ID * nameID + mainID;
        Shader._preCompileShader[id] = new ShaderCompile(vs, ps, nameMap);
    }

    private _nameMap: any; //shader参数别名，语义
    private _vs: string
    private _ps: string;
    private _curActTexIndex: number = 0;
    private _reCompile: boolean;
    private _render2DContext:IRender2DContext;

    //存储一些私有变量
    tag: any = {};
    /**@internal */
    _vshader: any;
    /**@internal */
    _pshader: any
    /**@internal */
    _program: any = null;
    /**@internal */
    _params: any[] = null;
    /**@internal */
    _paramsMap: any = {};

	/**
	 * 根据vs和ps信息生成shader对象
	 * 把自己存储在 sharders 数组中
	 * @param	vs
	 * @param	ps
	 * @param	name:
	 * @param	nameMap 帮助里要详细解释为什么需要nameMap
	 */
    constructor(vs: string, ps: string, saveName: any = null, nameMap: any = null, bindAttrib: any[]|null = null) {
        super();
        if ((!vs) || (!ps)) throw "Shader Error";
        this._attribInfo = bindAttrib;
        this._id = ++Shader._count;
        this._vs = vs;
        this._ps = ps;
        this._nameMap = nameMap ? nameMap : {};
        saveName != null && (Shader.sharders[saveName] = this);
        this.recreateResource();
        this.lock = true;
        this._render2DContext = LayaGL.render2DContext;
    }

    protected recreateResource(): void {
        this._compile();
        this._setGPUMemory(0);//忽略尺寸尺寸
    }

    //TODO:coverage
    /**
     * @override
     */
    protected _disposeResource(): void {
        RenderStateContext.mainContext.deleteShader(this._vshader);
        RenderStateContext.mainContext.deleteShader(this._pshader);
        RenderStateContext.mainContext.deleteProgram(this._program);
        this._vshader = this._pshader = this._program = null;
        this._params = null;
        this._paramsMap = {};
        this._setGPUMemory(0);
        this._curActTexIndex = 0;
    }

    private _compile(): void {
        if (!this._vs || !this._ps || this._params)
            return;
        this._reCompile = true;
        this._params = [];

        var result: any;
        
        var gl: WebGLRenderingContext = RenderStateContext.mainContext;
        this._program = gl.createProgram();
        this._vshader = Shader._createShader(gl, this._vs, gl.VERTEX_SHADER);
        this._pshader = Shader._createShader(gl, this._ps, gl.FRAGMENT_SHADER);

        gl.attachShader(this._program, this._vshader);
        gl.attachShader(this._program, this._pshader);

        var one: any, i: number, j: number, n: number, location: any;

        //属性用指定location的方法，这样更灵活，更方便与vao结合。
        //注意注意注意 这个必须放到link前面
        var attribDescNum: number = this._attribInfo ? this._attribInfo.length : 0;
        for (i = 0; i < attribDescNum; i += 2) {
            gl.bindAttribLocation(this._program, this._attribInfo[i + 1], this._attribInfo[i]);
        }

        gl.linkProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(this._program);
        }
   
        var nUniformNum: number = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS); //个数

        for (i = 0; i < nUniformNum; i++) {
            var uniform: any = gl.getActiveUniform(this._program, i);//得到uniform对象，包括名字等信息 {name,type,size}
            location = gl.getUniformLocation(this._program, uniform.name); //用名字来得到location
            one = { vartype: "uniform", glfun: null, ivartype: 1, location: location, name: uniform.name, type: uniform.type, isArray: false, isSame: false, preValue: null, indexOfParams: 0 };
            if (one.name.indexOf('[0]') > 0) {
                one.name = one.name.substr(0, one.name.length - 3);
                one.isArray = true;
                one.location = gl.getUniformLocation(this._program, one.name);
            }
            this._params.push(one);
        }

        for (i = 0, n = this._params.length; i < n; i++) {
            one = this._params[i];
            one.indexOfParams = i;
            one.index = 1;
            one.value = [one.location, null];
            one.codename = one.name;
            one.name = this._nameMap[one.codename] ? this._nameMap[one.codename] : one.codename;
            this._paramsMap[one.name] = one;
            one._this = this;
            one.uploadedValue = [];

            switch (one.type) {
                case gl.INT:
                    one.fun = one.isArray ? this._uniform1iv : this._uniform1i;
                    break;
                case gl.FLOAT:
                    one.fun = one.isArray ? this._uniform1fv : this._uniform1f;
                    break;
                case gl.FLOAT_VEC2:
                    one.fun = one.isArray ? this._uniform_vec2v : this._uniform_vec2;
                    break;
                case gl.FLOAT_VEC3:
                    one.fun = one.isArray ? this._uniform_vec3v : this._uniform_vec3;
                    break;
                case gl.FLOAT_VEC4:
                    one.fun = one.isArray ? this._uniform_vec4v : this._uniform_vec4;
                    break;
                case gl.SAMPLER_2D:
                    one.fun = this._uniform_sampler2D;
                    break;
                case gl.SAMPLER_CUBE:
                    one.fun = this._uniform_samplerCube;
                    break;
                case gl.FLOAT_MAT4:
                    one.glfun = gl.uniformMatrix4fv;
                    one.fun = this._uniformMatrix4fv;
                    break;
                case gl.BOOL:
                    one.fun = this._uniform1i;
                    break;
                case gl.FLOAT_MAT2:
                case gl.FLOAT_MAT3:
                    //TODO 这个有人会用的。
                    throw new Error("compile shader err!");
                default:
                    throw new Error("compile shader err!");
            }
        }
    }

    private static _createShader(gl: WebGLRenderingContext, str: string, type: any): any {
        var shader: any = gl.createShader(type);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        } else {
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }
    }

	/**
	 * 根据变量名字获得
	 * @param	name
	 * @return
	 */
    //TODO:coverage
    getUniform(name: string): any {
        return this._paramsMap[name];
    }

    //TODO:coverage
    private _uniform1f(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            RenderStateContext.mainContext.uniform1f(one.location, uploadedValue[0] = value);
            return 1;
        }
        return 0;
    }

    //TODO:coverage
    private _uniform1fv(one: any, value: any): number {
        if (value.length < 4) {
            var uploadedValue: any[] = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                RenderStateContext.mainContext.uniform1fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        } else {
            RenderStateContext.mainContext.uniform1fv(one.location, value);
            return 1;
        }
    }

    private _uniform_vec2(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
            RenderStateContext.mainContext.uniform2f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
            return 1;
        }
        return 0;
    }

    //TODO:coverage
    private _uniform_vec2v(one: any, value: any): number {
        if (value.length < 2) {
            var uploadedValue: any[] = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                RenderStateContext.mainContext.uniform2fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        } else {
            RenderStateContext.mainContext.uniform2fv(one.location, value);
            return 1;
        }
    }

    //TODO:coverage
    private _uniform_vec3(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
            RenderStateContext.mainContext.uniform3f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
            return 1;
        }
        return 0;
    }

    //TODO:coverage
    private _uniform_vec3v(one: any, value: any): number {
        RenderStateContext.mainContext.uniform3fv(one.location, value);
        return 1;
    }

    private _uniform_vec4(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
            RenderStateContext.mainContext.uniform4f(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
            return 1;
        }
        return 0;
    }

    //TODO:coverage
    private _uniform_vec4v(one: any, value: any): number {
        RenderStateContext.mainContext.uniform4fv(one.location, value);
        return 1;
    }

    private _uniformMatrix4fv(one: any, value: any): number {
        RenderStateContext.mainContext.uniformMatrix4fv(one.location, false, value);
        return 1;
    }

    //TODO:coverage
    private _uniform1i(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            RenderStateContext.mainContext.uniform1i(one.location, uploadedValue[0] = value);
            return 1;
        }
        return 0;
    }

    //TODO:coverage
    private _uniform1iv(one: any, value: any): number {
        RenderStateContext.mainContext.uniform1iv(one.location, value);
        return 1;
    }

    private _uniform_sampler2D(one: any, value: any): number {//TODO:TEXTURTE ARRAY
        var gl: WebGLRenderingContext = RenderStateContext.mainContext;
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] == null) {
            uploadedValue[0] = this._curActTexIndex;
            gl.uniform1i(one.location, this._curActTexIndex);
            this._render2DContext.activeTexture(gl.TEXTURE0+this._curActTexIndex);
            this._render2DContext.bindTexture(gl.TEXTURE_2D,value);
            //WebGLContext.activeTexture(gl, gl.TEXTURE0 + this._curActTexIndex);
            //WebGLContext.bindTexture(gl, gl.TEXTURE_2D, value);
            this._curActTexIndex++;
            return 1;
        } else {
            this._render2DContext.activeTexture(gl.TEXTURE0 + uploadedValue[0]);
            this._render2DContext.bindTexture( gl.TEXTURE_2D, value);
            return 0;
        }
    }

    //TODO:coverage
    private _uniform_samplerCube(one: any, value: any): number {//TODO:TEXTURTECUBE ARRAY
        var gl: WebGLRenderingContext = RenderStateContext.mainContext;
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] == null) {
            uploadedValue[0] = this._curActTexIndex;
            gl.uniform1i(one.location, this._curActTexIndex);
            this._render2DContext.activeTexture( gl.TEXTURE0 + this._curActTexIndex);
             this._render2DContext.bindTexture( gl.TEXTURE_CUBE_MAP, value);
            this._curActTexIndex++;
            return 1;
        } else {
            this._render2DContext.activeTexture( gl.TEXTURE0 + uploadedValue[0]);
            this._render2DContext.bindTexture( gl.TEXTURE_CUBE_MAP, value);
            return 0;
        }
    }

    uploadTexture2D(value: any): void {
        //这个可能执行频率非常高，所以这里能省就省点
        //Stat.shaderCall++;
        //var gl:WebGLContext = WebGLContext.mainContext;
        //WebGLContext.activeTexture(gl,WebGLContext.TEXTURE0);	2d必须是active0
        // var CTX: any = RenderStateContext;

        // if (CTX._activeTextures[0] !== value) {
            this._render2DContext.bindTexture( RenderStateContext.mainContext.TEXTURE_2D, value);
            // CTX._activeTextures[0] = value;
        //}
    }

	/**
	 * 提交shader到GPU
	 * @param	shaderValue
	 */
    upload(shaderValue: ShaderValue, params: any[] = null): void {
        BaseShader.activeShader = BaseShader.bindShader = this;
        //recreateResource();
        this._render2DContext.bindUseProgram(this._program);

        if (this._reCompile) {
            params = this._params;
            this._reCompile = false;
        } else {
            params = params || this._params;
        }


        var one: any, value: any, n: number = params.length, shaderCall: number = 0;

        for (var i: number = 0; i < n; i++) {
            one = params[i];
            if ((value = (shaderValue as any)[one.name]) !== null)

                shaderCall += one.fun.call(this, one, value);
        }

    }
}

