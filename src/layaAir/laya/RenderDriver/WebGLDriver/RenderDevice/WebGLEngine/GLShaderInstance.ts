import { GPUEngineStatisticsInfo } from "../../../../RenderEngine/RenderEnum/RenderStatInfo";
import { ShaderVariable } from "../../../../RenderEngine/RenderShader/ShaderVariable";
import { Matrix3x3 } from "../../../../maths/Matrix3x3";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2D } from "../../../../resource/Texture2D";
import { TextureCube } from "../../../../resource/TextureCube";
import { ShaderDataType } from "../../../DriverDesign/RenderDevice/ShaderData";
import { WebGLEngine } from "../WebGLEngine";
import { WebGLUniformBufferBase } from "../WebGLUniformBufferBase";
import { GLObject } from "./GLObject";

export class GLShaderInstance extends GLObject {

    _engine: WebGLEngine;

    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    /**@internal */
    private _vs: string;
    /**@internal */
    private _ps: string;
    /**@internal TextureId*/
    private _curActTexIndex: number;
    /**@internal */
    private _vshader: WebGLShader;
    /**@internal */
    private _pshader: WebGLShader;
    /**@internal */
    private _program: WebGLProgram;
    /**@internal */
    private _attributeMap: { [name: string]: [number, ShaderDataType] };
    /**@internal */
    private _uniformMap: ShaderVariable[];
    /**@internal */
    // todo 没用到
    private _uniformObjectMap: { [key: string]: ShaderVariable };
    /**@internal */
    _complete: boolean;

    constructor(engine: WebGLEngine, vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }) {
        super(engine);
        this._vs = vs;
        this._ps = ps;
        this._attributeMap = attributeMap;
        this._uniformMap = [];
        this._create();
    }

    private _create(): void {
        WebGLEngine._lastShaderError = null;
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_ShaderCompile, 1);
        let preTime = performance.now();
        const gl: WebGLRenderingContext = this._gl;

        if (WebGLEngine.instance.lost) {
            //console.log("lost webgl context");
            return;
        }

        let prog = this._program = gl.createProgram();
        let compileErr: string;

        this._vshader = this._createShader(gl, this._vs, gl.VERTEX_SHADER);
        if (!gl.getShaderParameter(this._vshader, gl.COMPILE_STATUS))
            compileErr = gl.getShaderInfoLog(this._vshader);

        this._pshader = this._createShader(gl, this._ps, gl.FRAGMENT_SHADER);
        if (!gl.getShaderParameter(this._pshader, gl.COMPILE_STATUS)) {
            if (compileErr) compileErr += "\n";
            compileErr += gl.getShaderInfoLog(this._pshader);
        }

        gl.attachShader(prog, this._vshader);
        gl.attachShader(prog, this._pshader);

        if (compileErr) {
            WebGLEngine._lastShaderError = compileErr;
            return;
        }

        for (var k in this._attributeMap)//根据声明调整location,便于VAO使用
            gl.bindAttribLocation(prog, this._attributeMap[k][0], k);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            WebGLEngine._lastShaderError = gl.getProgramInfoLog(prog);
            return;
        }

        //Uniform
        //Unifrom Objcet
        const nUniformNum: number = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);

        this.useProgram();
        this._curActTexIndex = 0;
        let one: ShaderVariable, i: number;
        for (i = 0; i < nUniformNum; i++) {
            var uniformData: WebGLActiveInfo = gl.getActiveUniform(prog, i);
            var uniName: string = uniformData.name;
            let location: WebGLUniformLocation = gl.getUniformLocation(prog, uniName);
            if (!location && location != 0)
                continue;
            one = new ShaderVariable();
            one.location = location as number;
            if (uniName.indexOf('[0]') > 0) {
                one.name = uniName = uniName.substr(0, uniName.length - 3);
                one.isArray = true;
            } else {
                one.name = uniName;
                one.isArray = false;
            }
            one.type = uniformData.type;
            this._addShaderUnifiormFun(one);
            this._uniformMap.push(one);
            one.dataOffset = this._engine.propertyNameToID(uniName);
        }
        if (this._engine.isWebGL2) {
            const gl2 = (gl as WebGL2RenderingContext);
            this._uniformObjectMap = {};
            var nUniformBlock: number = gl.getProgramParameter(prog, (gl as WebGL2RenderingContext).ACTIVE_UNIFORM_BLOCKS);
            for (i = 0; i < nUniformBlock; i++) {
                var uniformBlockName: string = gl2.getActiveUniformBlockName(this._program, i);
                one = new ShaderVariable();
                one.name = uniformBlockName;
                one.isArray = false;
                one.type = (gl as WebGL2RenderingContext).UNIFORM_BUFFER;
                one.dataOffset = this._engine.propertyNameToID(uniformBlockName);
                let location = one.location = gl2.getUniformBlockIndex(prog, uniformBlockName);
                let bindingPoint = i;
                gl2.uniformBlockBinding(this._program, location, bindingPoint);
                this._uniformObjectMap[one.name] = one;
                this._uniformMap.push(one);
                this._addShaderUnifiormFun(one);
            }
        }
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.T_ShaderCompile, (performance.now() - preTime) | 0);
        this._complete = true;
    }

    /**
    * @internal
    */
    private _createShader(gl: WebGLRenderingContext, str: string, type: number): WebGLShader {
        let shader: WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        return shader;
    }


    /**
     * @internal
     */
    private _addShaderUnifiormFun(one: ShaderVariable): void {
        var gl: WebGLRenderingContext = this._gl;
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
                one.fun = isArray ? this._uniformMatrix3fv : this._uniformMatrix3f;
                break;
            case gl.FLOAT_MAT4:
                one.fun = isArray ? this._uniformMatrix4fv : this._uniformMatrix4f;
                break;
            case gl.SAMPLER_2D:
            case (<WebGL2RenderingContext>gl).SAMPLER_2D_SHADOW:
                gl.uniform1i(one.location, this._curActTexIndex);
                one.textureID = this._engine._glTextureIDParams[this._curActTexIndex++];
                one.fun = this._uniform_sampler2D;
                break;
            case (<WebGL2RenderingContext>gl).SAMPLER_2D_ARRAY:
                gl.uniform1i(one.location, this._curActTexIndex);
                one.textureID = this._engine._glTextureIDParams[this._curActTexIndex++];
                one.fun = this._uniform_sampler2DArray;
                break;
            case 0x8b5f://sampler3D
                gl.uniform1i(one.location, this._curActTexIndex);
                one.textureID = this._engine._glTextureIDParams[this._curActTexIndex++];
                one.fun = this._uniform_sampler3D;
                break;
            case gl.SAMPLER_CUBE:
                gl.uniform1i(one.location, this._curActTexIndex);
                one.textureID = this._engine._glTextureIDParams[this._curActTexIndex++];
                one.fun = this._uniform_samplerCube;
                break;
            case (gl as WebGL2RenderingContext).UNIFORM_BUFFER:
                one.fun = this._uniform_UniformBuffer;
                break;
            default:
                WebGLEngine._lastShaderError = `unknown uniform type (${one.type})`;
        }
    }

    getUniformMap(): ShaderVariable[] {
        return this._uniformMap;
    }

    /**
     * @internal
     * @returns 
     */
    bind(): boolean {
        return this.useProgram();
    }

    /**
     * @internal
     */
    useProgram(): boolean {
        if (this._engine._glUseProgram === this)
            return false;
        this._gl.useProgram(this._program);
        this._engine._glUseProgram = this;
        //不知道准不准
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_SetRenderPassCount, 1);
        return true;
    }

    /**
    * @internal
    */
    _uniform1f(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            this._gl.uniform1f(one.location, uploadedValue[0] = value);
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
                this._gl.uniform1fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        } else {
            this._gl.uniform1fv(one.location, value);
            return 1;
        }
    }

    /**
     * @internal
     */
    _uniform_vec2(one: any, v: Vector2): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y) {
            this._gl.uniform2f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y);
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
                this._gl.uniform2fv(one.location, value);
                uploadedValue[0] = value[0];
                uploadedValue[1] = value[1];
                uploadedValue[2] = value[2];
                uploadedValue[3] = value[3];
                return 1;
            }
            return 0;
        } else {
            this._gl.uniform2fv(one.location, value);
            return 1;
        }
    }

    /**
     * @internal
     */
    _uniform_vec3(one: any, v: Vector3): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y || uploadedValue[2] !== v.z) {
            this._gl.uniform3f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y, uploadedValue[2] = v.z);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec3v(one: any, v: Float32Array): number {
        this._gl.uniform3fv(one.location, v);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_vec4(one: any, v: Vector4): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== v.x || uploadedValue[1] !== v.y || uploadedValue[2] !== v.z || uploadedValue[3] !== v.w) {
            this._gl.uniform4f(one.location, uploadedValue[0] = v.x, uploadedValue[1] = v.y, uploadedValue[2] = v.z, uploadedValue[3] = v.w);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec4v(one: any, v: Float32Array): number {
        this._gl.uniform4fv(one.location, v);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix2fv(one: any, value: any): number {
        this._gl.uniformMatrix2fv(one.location, false, value);
        return 1;
    }

    /** @internal */
    _uniformMatrix3f(one: any, value: Matrix3x3): number {
        this._gl.uniformMatrix3fv(one.location, false, value.elements);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix3fv(one: any, value: Float32Array): number {
        this._gl.uniformMatrix3fv(one.location, false, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix4f(one: any, m: Matrix4x4): number {
        var value: Float32Array = m.elements;
        this._gl.uniformMatrix4fv(one.location, false, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniformMatrix4fv(one: any, m: Float32Array): number {
        this._gl.uniformMatrix4fv(one.location, false, m);
        return 1;
    }

    /**
     * @internal
     */
    _uniform1i(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value) {
            this._gl.uniform1i(one.location, uploadedValue[0] = value);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform1iv(one: any, value: any): number {
        this._gl.uniform1iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_ivec2(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1]) {
            this._gl.uniform2i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1]);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_ivec2v(one: any, value: any): number {
        this._gl.uniform2iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_vec3i(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2]) {
            this._gl.uniform3i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2]);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec3vi(one: any, value: any): number {
        this._gl.uniform3iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_vec4i(one: any, value: any): number {
        var uploadedValue: any[] = one.uploadedValue;
        if (uploadedValue[0] !== value[0] || uploadedValue[1] !== value[1] || uploadedValue[2] !== value[2] || uploadedValue[3] !== value[3]) {
            this._gl.uniform4i(one.location, uploadedValue[0] = value[0], uploadedValue[1] = value[1], uploadedValue[2] = value[2], uploadedValue[3] = value[3]);
            return 1;
        }
        return 0;
    }

    /**
     * @internal
     */
    _uniform_vec4vi(one: any, value: any): number {
        this._gl.uniform4iv(one.location, value);
        return 1;
    }

    /**
     * @internal
     */
    _uniform_sampler2D(one: any, texture: BaseTexture): number {//TODO:TEXTURTE ARRAY
        var value: any = texture ? texture._getSource() : Texture2D.errorTexture._getSource();
        var gl: WebGLRenderingContext = this._gl;
        this._bindTexture(one.textureID, gl.TEXTURE_2D, value);
        return 0;
    }

    _uniform_sampler2DArray(one: any, texture: BaseTexture): number {
        var value: any = texture ? texture._getSource() : Texture2D.errorTexture._getSource();
        var gl: WebGL2RenderingContext = this._gl as WebGL2RenderingContext;
        this._bindTexture(one.textureID, gl.TEXTURE_2D_ARRAY, value);
        return 0;
    }

    _uniform_sampler3D(one: any, texture: BaseTexture): number {//TODO:TEXTURTE ARRAY
        var value: any = texture ? texture._getSource() : Texture2D.errorTexture._getSource();
        var gl: WebGL2RenderingContext = this._gl as WebGL2RenderingContext;
        this._bindTexture(one.textureID, gl.TEXTURE_3D, value);
        return 0;
    }

    /**
     * @internal
     */
    _uniform_samplerCube(one: any, texture: BaseTexture): number {//TODO:TEXTURTECUBE ARRAY
        var value: any = texture ? texture._getSource() : TextureCube.errorTexture._getSource();
        var gl: WebGLRenderingContext = this._gl;
        this._bindTexture(one.textureID, gl.TEXTURE_CUBE_MAP, value);
        return 0;
    }

    _uniform_UniformBuffer(one: ShaderVariable, value: WebGLUniformBufferBase) {
        //let gl = <WebGL2RenderingContext>this._gl;
        // if (value.needUpload) {
        //     value.upload();
        // }
        value.bind(one.location);
        return 1;
    }

    /**
     * @internal
     */
    _bindTexture(textureID: number, target: number, texture: WebGLTexture): void {
        const gl = this._gl;
        if (this._engine._activedTextureID !== textureID) {
            gl.activeTexture(textureID);
            this._engine._activedTextureID = textureID;
        }
        const texID = this._engine._activedTextureID - this._gl.TEXTURE0;
        if (this._engine._activeTextures[texID] !== texture) {
            gl.bindTexture(target, texture);
            this._engine._activeTextures[texID] = texture;
        }
    }

    destroy() {
        super.destroy();
        const gl = this._gl;
        gl.deleteShader(this._vshader);
        gl.deleteShader(this._pshader);
        gl.deleteProgram(this._program);
        this._vshader = null;
        this._pshader = null;
        this._program = null;
        this._attributeMap = null;
        this._uniformMap = null;
        this._uniformObjectMap = null;
        this._gl = null;
        this._engine = null;
    }

}