import { Matrix4x4 } from "../d3/math/Matrix4x4";
import { Vector2 } from "../d3/math/Vector2";
import { Vector3 } from "../d3/math/Vector3";
import { Vector4 } from "../d3/math/Vector4";
import { Shader3D } from "../d3/shader/Shader3D";

import { ShaderData } from "../d3/shader/ShaderData";
import { ShaderVariable } from "../d3/shader/ShaderVariable";
import { CommandEncoder } from "../layagl/CommandEncoder";
import { LayaGL } from "../layagl/LayaGL";
import { LayaGLRunner } from "../layagl/LayaGLRunner";
import { BaseTexture } from "../resource/BaseTexture";
import { Resource } from "../resource/Resource";
import { Stat } from "../utils/Stat";
import { WebGLContext } from "../webgl/WebGLContext";


/**
 * 编译shader
 */
export class ShaderInstanceBase extends Resource {
    /**是否开启调试模式。 */
    static debugMode: boolean = false;
    /**@internal */
    protected _vs: string;
    /**@internal */
    protected _ps: string;
    /**@internal TextureId*/
    protected _curActTexIndex: number;
    /**@internal */
    protected _vshader: any;
    /**@internal */
    protected _pshader: any
    /**@internal */
    protected _program: any;
    /**@internal */
    protected _attributeMap: { [key: string]: number };
    protected _uniformMap: CommandEncoder;


    constructor(vs: string, ps: string, attributeMap: any) {
        super();
        this._vs = vs;
        this._ps = ps;
        this._attributeMap = attributeMap;
        this._uniformMap = new CommandEncoder();
        this.lock = true;
    }

    protected _create(): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        this._program = gl.createProgram();
        this._vshader = this._createShader(gl, this._vs, gl.VERTEX_SHADER);
        this._pshader = this._createShader(gl, this._ps, gl.FRAGMENT_SHADER);
        gl.attachShader(this._program, this._vshader);
        gl.attachShader(this._program, this._pshader);

        for (var k in this._attributeMap)//根据声明调整location,便于VAO使用
            gl.bindAttribLocation(this._program, this._attributeMap[k], k);

        gl.linkProgram(this._program);
        //Uniform
        var nUniformNum: number = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
        WebGLContext.useProgram(gl, this._program);
        this._curActTexIndex = 0;
        var one: ShaderVariable, i: number, n: number;
        for (i = 0; i < nUniformNum; i++) {
            var uniformData: any = gl.getActiveUniform(this._program, i);
            var uniName: string = uniformData.name;
            one = new ShaderVariable();
            one.location = gl.getUniformLocation(this._program, uniName);
            if (uniName.indexOf('[0]') > 0) {
                one.name = uniName = uniName.substr(0, uniName.length - 3);
                one.isArray = true;
            } else {
                one.name = uniName;
                one.isArray = false;
            }
            one.type = uniformData.type;
            this._addShaderUnifiormFun(one);
            this._uniformMap.addShaderUniform(one);
            one.dataOffset = Shader3D.propertyNameToID(uniName);
        }
    }

    protected splitUnifromData() {
    }

    /**
     * @internal
     */
    protected _createShader(gl: WebGLRenderingContext, str: string, type: any): any {
        var shader: any = gl.createShader(type);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (Shader3D.debugMode && !gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw gl.getShaderInfoLog(shader);
        return shader;
    }

    /**
     * @internal
     */
    _addShaderUnifiormFun(one: ShaderVariable): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        one.caller = this;
        var isArray: boolean = one.isArray;
        switch (one.type) {
            case gl.BOOL:
                one.fun = this._uniform1i;
                one.uploadedValue = new Array(1);
                break;
            case gl.INT:
                one.fun = isArray ? this._uniform1iv : this._uniform1i;//TODO:优化
                one.uploadedValue = new Array(1);
                break;
            case gl.FLOAT:
                one.fun = isArray ? this._uniform1fv : this._uniform1f;
                one.uploadedValue = new Array(1);
                break;
            case gl.FLOAT_VEC2:
                one.fun = isArray ? this._uniform_vec2v : this._uniform_vec2;
                one.uploadedValue = new Array(2);
                break;
            case gl.FLOAT_VEC3:
                one.fun = isArray ? this._uniform_vec3v : this._uniform_vec3;
                one.uploadedValue = new Array(3);
                break;
            case gl.FLOAT_VEC4:
                one.fun = isArray ? this._uniform_vec4v : this._uniform_vec4;
                one.uploadedValue = new Array(4);
                break;
            case gl.FLOAT_MAT2:
                one.fun = this._uniformMatrix2fv;
                break;
            case gl.FLOAT_MAT3:
                one.fun = this._uniformMatrix3fv;
                break;
            case gl.FLOAT_MAT4:
                one.fun = isArray ? this._uniformMatrix4fv : this._uniformMatrix4f;
                break;
            case gl.SAMPLER_2D:
            case (<WebGL2RenderingContext>gl).SAMPLER_2D_SHADOW:
                gl.uniform1i(one.location, this._curActTexIndex);
                one.textureID = WebGLContext._glTextureIDs[this._curActTexIndex++];
                one.fun = this._uniform_sampler2D;
                break;
            case 0x8b5f://sampler3D
                gl.uniform1i(one.location, this._curActTexIndex);
                one.textureID = WebGLContext._glTextureIDs[this._curActTexIndex++];
                one.fun = this._uniform_sampler3D;
                break;
            case gl.SAMPLER_CUBE:
                gl.uniform1i(one.location, this._curActTexIndex);
                one.textureID = WebGLContext._glTextureIDs[this._curActTexIndex++];
                one.fun = this._uniform_samplerCube;
                break;
            default:
                throw new Error("compile shader err!");
                break;
        }
    }


    /**
     * @internal
     */
    bind(): boolean {
        return WebGLContext.useProgram(LayaGL.instance, this._program);
    }

    /**
	 * @internal
	 */
	uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: ShaderData, uploadUnTexture: boolean): void {
		Stat.shaderCall += LayaGLRunner.uploadShaderUniforms((<any>LayaGL.instance), shaderUniform, shaderDatas, uploadUnTexture);
	}

    /**
     * @internal
     */
    _uniform1f(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            LayaGL.instance.uniform1f(one.location, uploadedValue[0] = value);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform1fv(one: any, value: any): number {
        if (value.length < 4) {
            var uploadedValue: any[] = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                LayaGL.instance.uniform1fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        } else {
            LayaGL.instance.uniform1fv(one.location, value);
            return 1;
        }
    }

    /**
     * @internal
     */
    _uniform_vec2(one: any, v: Vector2): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y) {
            LayaGL.instance.uniform2f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec2v(one: any, value: Float32Array): number {
        if (value.length < 2) {
            var uploadedValue: any[] = one.uploadedValue;
            if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
                LayaGL.instance.uniform2fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        } else {
            LayaGL.instance.uniform2fv(one.location, value);
            return 1;
        }
    }

    /**
     * @internal
     */
    _uniform_vec3(one: any, v: Vector3): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y || uploadedValue[2] !== v.z) {
            LayaGL.instance.uniform3f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y, uploadedValue[2] = v.z);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec3v(one: any, v: Float32Array): number {
        LayaGL.instance.uniform3fv(one.location, v);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_vec4(one: any, v: Vector4): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y || uploadedValue[2] !== v.z || uploadedValue[3] !== v.w) {
            LayaGL.instance.uniform4f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y, uploadedValue[2] = v.z, uploadedValue[3] = v.w);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec4v(one: any, v: Float32Array): number {
        LayaGL.instance.uniform4fv(one.location, v);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix2fv(one: any, value: any): number {
        LayaGL.instance.uniformMatrix2fv(one.location, false, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix3fv(one: any, value: any): number {
        LayaGL.instance.uniformMatrix3fv(one.location, false, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix4f(one: any, m: Matrix4x4): number {
        var value: Float32Array = m.elements;
        LayaGL.instance.uniformMatrix4fv(one.location, false, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix4fv(one: any, m: Float32Array): number {
        LayaGL.instance.uniformMatrix4fv(one.location, false, m);
        return 1;
    }

    /**
     * @internal
     */
    _uniform1i(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            LayaGL.instance.uniform1i(one.location, uploadedValue[0] = value);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform1iv(one: any, value: any): number {
        LayaGL.instance.uniform1iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_ivec2(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
            LayaGL.instance.uniform2i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_ivec2v(one: any, value: any): number {
        LayaGL.instance.uniform2iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_vec3i(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
            LayaGL.instance.uniform3i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec3vi(one: any, value: any): number {
        LayaGL.instance.uniform3iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_vec4i(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
            LayaGL.instance.uniform4i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec4vi(one: any, value: any): number {
        LayaGL.instance.uniform4iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_sampler2D(one: any, texture: BaseTexture): number {//TODO:TEXTURTE ARRAY
        var value: any = texture._getSource() || texture.defaulteTexture._getSource();
        var gl: WebGLRenderingContext = LayaGL.instance;
        WebGLContext.activeTexture(gl, one.textureID);
        WebGLContext.bindTexture(gl, gl.TEXTURE_2D, value);
        return 0;
    }

    _uniform_sampler3D(one: any, texture: BaseTexture): number {//TODO:TEXTURTE ARRAY
        var value: any = texture._getSource() || texture.defaulteTexture._getSource();
        var gl: WebGLRenderingContext = LayaGL.instance;
        WebGLContext.activeTexture(gl, one.textureID);
        WebGLContext.bindTexture(gl, WebGL2RenderingContext.TEXTURE_3D, value);
        return 0;
    }

    /**
     * @internal
     */
    _uniform_samplerCube(one: any, texture: BaseTexture): number {//TODO:TEXTURTECUBE ARRAY
        var value: any = texture._getSource() || texture.defaulteTexture._getSource();
        var gl: WebGLRenderingContext = LayaGL.instance;
        WebGLContext.activeTexture(gl, one.textureID);
        WebGLContext.bindTexture(gl, gl.TEXTURE_CUBE_MAP, value);
        return 0;
    }



}
