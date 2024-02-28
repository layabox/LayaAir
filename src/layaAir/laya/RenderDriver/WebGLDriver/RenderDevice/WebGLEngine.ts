import { LayaEnv } from "../../../../LayaEnv";
import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { InternalTexture } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { ShaderVariable } from "../../../RenderEngine/RenderShader/ShaderVariable";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { GL2TextureContext } from "./GL2TextureContext";
import { GLTextureContext } from "./GLTextureContext";
import { GLBuffer } from "./WebGLEngine/GLBuffer";
import { WebGLExtension } from "./WebGLEngine/GLEnum/WebGLExtension";
import { WebGLMode } from "./WebGLEngine/GLEnum/WebGLMode";
import { GLParams } from "./WebGLEngine/GLParams";
import { GLRenderDrawContext } from "./WebGLEngine/GLRenderDrawContext";
import { GLRenderState } from "./WebGLEngine/GLRenderState";
import { GLShaderInstance } from "./WebGLEngine/GLShaderInstance";
import { GLVertexState } from "./WebGLEngine/GLVertexState";
import { GlCapable } from "./WebGLEngine/GlCapable";
import { WebGLConfig } from "./WebGLEngine/WebGLConfig";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";

/**
 * 封装Webgl
 */
export class WebGLEngine implements IRenderEngine {

    /**
     * @internal
     * 存储 texture uniform gamma define
     */
    static _texGammaDefine: { [key: number]: ShaderDefine } = {};


    _context: WebGLRenderingContext | WebGL2RenderingContext;

    private _config: WebGLConfig;

    private _isWebGL2: boolean;

    private _webglMode: WebGLMode;

    /**@internal */
    private _propertyNameMap: any = {};
    /**@internal */
    private _propertyNameCounter: number = 0;
    /**@internal */
    _renderOBJCreateContext: IRenderEngineFactory;

    /**@internal */
    _IDCounter: number = 0;

    /**@internal ShaderDebugMode*/
    _isShaderDebugMode: boolean = true;

    /**@internal gl.TextureID*/
    _glTextureIDParams: Array<number>;

    /**@internal bind active Texture*/
    _activedTextureID: number;

    /**@internal bindTexture */
    //RenderTexture TODO
    _activeTextures: WebGLTexture[];

    /**
    * @internal
    * bind GLVertexArray
    */
    _GLBindVertexArray: GLVertexState;

    /**
    * @internal
    * 支持功能
    */
    _supportCapatable: GlCapable;

    /**
     * @internal
     * bind Program
     */
    _glUseProgram: GLShaderInstance;

    //bind glBuffer by glBuffer target
    //key BufferTargetType
    private _GLBufferBindMap: { [key: number]: GLBuffer | null };

    private _curUBOPointer: number = 0;
    //记录绑定UBO的glPointer
    private _GLUBOPointerMap: Map<string, number> = new Map();
    //记录绑定Pointer的UBO
    private _GLBindPointerUBOMap: Map<number, GLBuffer> = new Map();
    //bind viewport
    private _lastViewport: Vector4;
    private _lastScissor: Vector4;

    //bind clearColor
    private _lastClearColor: Color = new Color;
    private _lastClearDepth: number = 1;

    //GL参数
    private _GLParams: GLParams;

    //GL纹理生成
    private _GLTextureContext: GLTextureContext | GL2TextureContext;
    //Gl Draw
    private _GLRenderDrawContext: GLRenderDrawContext;

    //GLRenderState
    _GLRenderState: GLRenderState;
    // todo  这个 map 和 get 函数转移到 ShaderDefine 里面
    /**@internal */
    private static _defineMap: { [key: string]: ShaderDefine } = {};
    /**@internal */
    private static _defineCounter: number = 0;
    /**@internal */
    static _maskMap: Array<{ [key: number]: string }> = [];
    // //TODO:管理Buffer
    // private _bufferResourcePool: any;
    // //TODO:管理Texture
    // private _textureResourcePool: any;
    // //TODO:管理FrameBuffer
    // private _RenderBufferResource: any;

    //GPU统计数据
    private _GLStatisticsInfo: Map<RenderStatisticsInfo, number> = new Map();
    static instance: WebGLEngine;
    constructor(config: WebGLConfig, webglMode: WebGLMode = WebGLMode.Auto) {
        this._config = config;
        this._isWebGL2 = false;
        //init data
        this._lastViewport = new Vector4(0, 0, 0, 0);
        this._lastClearColor = new Color(0, 0, 0, 0);
        this._lastScissor = new Vector4(0, 0, 0, 0);
        this._webglMode = webglMode;
        this._initStatisticsInfo();
        WebGLEngine.instance = this;
    }
    addTexGammaDefine(key: number, value: ShaderDefine): void {
        WebGLEngine._texGammaDefine[key] = value;
    }

    /**
     * GL Context
     * @member {WebGLRenderingContext}
     */
    get gl() {
        return this._context;
    }

    get isWebGL2() {
        return this._isWebGL2;
    }

    get webglConfig() {
        return this._config;
    }

    private _initStatisticsInfo() {
        this._GLStatisticsInfo.set(RenderStatisticsInfo.DrawCall, 0);
        this._GLStatisticsInfo.set(RenderStatisticsInfo.InstanceDrawCall, 0);
        this._GLStatisticsInfo.set(RenderStatisticsInfo.Triangle, 0);
        this._GLStatisticsInfo.set(RenderStatisticsInfo.UniformUpload, 0);
        this._GLStatisticsInfo.set(RenderStatisticsInfo.TextureMemeory, 0);
        this._GLStatisticsInfo.set(RenderStatisticsInfo.GPUMemory, 0);
        this._GLStatisticsInfo.set(RenderStatisticsInfo.RenderTextureMemory, 0);
        this._GLStatisticsInfo.set(RenderStatisticsInfo.BufferMemory, 0);
    }

    /**
     * @internal
     * @param info 
     * @param value 
     */
    _addStatisticsInfo(info: RenderStatisticsInfo, value: number) {
        this._GLStatisticsInfo.set(info, this._GLStatisticsInfo.get(info) + value);
    }

    /**
     * 清除
     * @internal
     * @param info 
     */
    clearStatisticsInfo(info: RenderStatisticsInfo) {
        this._GLStatisticsInfo.set(info, 0);
    }

    /**
     * @internal
     * @param info 
     * @returns 
     */
    getStatisticsInfo(info: RenderStatisticsInfo): number {
        return this._GLStatisticsInfo.get(info);
    }

    /**
     * @internal
     * @param glPointer 
     * @returns 
     */
    _getBindUBOBuffer(glPointer: number): GLBuffer {
        return this._GLBindPointerUBOMap.get(glPointer);
    }

    /**
     * @internal
     * @param glPointer 
     * @param buffer 
     */
    _setBindUBOBuffer(glPointer: number, buffer: GLBuffer): void {
        this._GLBindPointerUBOMap.set(glPointer, buffer);
    }

    /**
     * create GL
     * @param canvas 
     */
    initRenderEngine(canvas: any) {
        let names;
        let gl;
        switch (this._webglMode) {
            case WebGLMode.Auto:
                names = ["webgl2", "experimental-webgl2", "webgl", "experimental-webgl"];
                break;
            case WebGLMode.WebGL1:
                names = ["webgl", "experimental-webgl"];
                break;
            case WebGLMode.WebGL2:
                names = ["webgl2", "experimental-webgl2"];
                break;
        }
        for (var i: number = 0; i < names.length; i++) {
            try {
                gl = canvas.getContext(names[i], this._config);
                // gl.drawingBufferColorSpace = "display-p3";
            } catch (e) {
            }
            if (gl) {
                if (names[i] === 'webgl2' || names[i] === 'experimental-webgl2') {
                    this._isWebGL2 = true;
                }
                break;
            }
        }
        this._context = gl;

        //init Other
        this._initBindBufferMap();
        this._supportCapatable = new GlCapable(this);
        this._GLParams = new GLParams(this);
        this._GLRenderState = new GLRenderState(this);
        this._glTextureIDParams = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7, gl.TEXTURE8, gl.TEXTURE9, gl.TEXTURE10, gl.TEXTURE11, gl.TEXTURE12, gl.TEXTURE13, gl.TEXTURE14, gl.TEXTURE15, gl.TEXTURE16, gl.TEXTURE17, gl.TEXTURE18, gl.TEXTURE19, gl.TEXTURE20, gl.TEXTURE21, gl.TEXTURE22, gl.TEXTURE23, gl.TEXTURE24, gl.TEXTURE25, gl.TEXTURE26, gl.TEXTURE27, gl.TEXTURE28, gl.TEXTURE29, gl.TEXTURE30, gl.TEXTURE31];
        this._activedTextureID = gl.TEXTURE0;//默认激活纹理区为0;
        this._activeTextures = [];
        this._GLTextureContext = this.isWebGL2 ? new GL2TextureContext(this) : new GLTextureContext(this);
        this._GLRenderDrawContext = new GLRenderDrawContext(this);
    }

    private _initBindBufferMap() {
        this._GLBufferBindMap = {};
        this._GLBufferBindMap[BufferTargetType.ARRAY_BUFFER] = null;
        this._GLBufferBindMap[BufferTargetType.ELEMENT_ARRAY_BUFFER] = null;
        this._GLBufferBindMap[BufferTargetType.UNIFORM_BUFFER] = null;
    }


    _getbindBuffer(target: BufferTargetType) {
        return this._GLBufferBindMap[target];
    }

    _setbindBuffer(target: BufferTargetType, buffer: GLBuffer | null) {
        this._GLBufferBindMap[target] = buffer;
    }

    /**
     * @internal
     * @param target 
     * @param texture 
     */
    _bindTexture(target: number, texture: WebGLTexture) {
        const texID = this._activedTextureID - this._context.TEXTURE0;
        if (this._activeTextures[texID] !== texture) {
            this._context.bindTexture(target, texture);
            this._activeTextures[texID] = texture;
        }
    }

    //get capable of webgl
    getCapable(capatableType: RenderCapable): boolean {
        return this._supportCapatable.getCapable(capatableType);
    }

    viewport(x: number, y: number, width: number, height: number): void {
        const gl = this._context;
        const lv = this._lastViewport;
        if (LayaEnv.isConch) {
            gl.viewport(x, y, width, height);
        } else if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
            gl.viewport(x, y, width, height);
            lv.setValue(x, y, width, height);
        }
    }

    scissor(x: number, y: number, width: number, height: number) {
        const gl = this._context;
        const lv = this._lastScissor;
        if (LayaEnv.isConch) {
            gl.scissor(x, y, width, height);
        } else if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
            gl.scissor(x, y, width, height);
            lv.setValue(x, y, width, height);
        }
    }

    scissorTest(value: boolean) {
        if (value)
            this._context.enable(this._context.SCISSOR_TEST);
        else
            this._context.disable(this._context.SCISSOR_TEST);
    }



    clearRenderTexture(clearFlag: RenderClearFlag, clearcolor: Color = null, clearDepth: number = 1, clearStencilValue = 0) {
        var flag: number;
        //this.gl.enable(this._gl.SCISSOR_TEST)
        if (clearFlag & RenderClearFlag.Color) {
            if (clearcolor && !this._lastClearColor.equal(clearcolor)) {
                this._context.clearColor(clearcolor.r, clearcolor.g, clearcolor.b, clearcolor.a);
                clearcolor.cloneTo(this._lastClearColor);
            }
            flag |= this.gl.COLOR_BUFFER_BIT;
        }
        if (clearFlag & RenderClearFlag.Depth) {
            if (this._lastClearDepth != clearDepth) {
                this._context.clearDepth(clearDepth);
                this._lastClearDepth = clearDepth;
            }
            this._GLRenderState.setDepthMask(true);
            flag |= this._context.DEPTH_BUFFER_BIT;
        }
        if (clearFlag & RenderClearFlag.Stencil) {
            this._context.clearStencil(clearStencilValue);
            this._GLRenderState.setStencilMask(true);
            flag |= this._context.STENCIL_BUFFER_BIT;
        }
        if (flag)
            this._context.clear(flag);
        //this._gl.disable(this._gl.SCISSOR_TEST);
    }

    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number) {
        this._bindTexture(texture.target, texture.resource);
        this._context.copyTexSubImage2D(texture.target, level, xoffset, yoffset, x, y, width, height);
    }

    colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void {
        this._context.colorMask(r, g, b, a);
    }

    getParams(params: RenderParams): number {
        return this._GLParams.getParams(params);
    }


    createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): GLBuffer {
        //TODO SourceManager
        return new GLBuffer(this, targetType, bufferUsageType);
    }

    createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }): GLShaderInstance {
        //TODO SourceManager
        return new GLShaderInstance(this, vs, ps, attributeMap);
    }

    createVertexState(): GLVertexState {
        return new GLVertexState(this);
    }

    getUBOPointer(name: string): number {
        if (!this._GLUBOPointerMap.has(name))
            this._GLUBOPointerMap.set(name, this._curUBOPointer++);
        return this._GLUBOPointerMap.get(name);
    }



    getTextureContext(): ITextureContext {
        return this._GLTextureContext;
    }

    //TODO 先写完测试，这种封装过于死板
    getDrawContext(): GLRenderDrawContext {
        return this._GLRenderDrawContext;
    }

    getCreateRenderOBJContext(): IRenderEngineFactory {
        return this._renderOBJCreateContext;
    }

    // //TODO:
    // propertyNameToID(name: string): number {
    //   return this.propertyNameToID(name);
    // }

    /**
   * 通过Shader属性名称获得唯一ID。
   * @param name Shader属性名称。
   * @return 唯一ID。
   */
    propertyNameToID(name: string): number {
        if (this._propertyNameMap[name] != null) {
            return this._propertyNameMap[name];
        } else {
            var id: number = this._propertyNameCounter++;
            this._propertyNameMap[name] = id;
            this._propertyNameMap[id] = name;
            return id;
        }
    }

    propertyIDToName(id: number): string {
        return this._propertyNameMap[id];
    }

    getNamesByDefineData(defineData: IDefineDatas, out: Array<string>): void {
        var maskMap: Array<{ [key: number]: string }> = WebGLEngine._maskMap;
        var mask: Array<number> = defineData._mask;
        out.length = 0;
        for (var i: number = 0, n: number = defineData._length; i < n; i++) {
            var subMaskMap: { [key: number]: string } = maskMap[i];
            var subMask: number = mask[i];
            for (var j: number = 0; j < 32; j++) {
                var d: number = 1 << j;
                if (subMask > 0 && d > subMask)//如果31位存在subMask为负数,避免break
                    break;
                if (subMask & d)
                    out.push(subMaskMap[d]);
            }
        }
    }

    /**
    * 注册宏定义。
    * @param name 
    */
    getDefineByName(name: string): ShaderDefine {
        var define: ShaderDefine = WebGLEngine._defineMap[name];
        if (!define) {
            var maskMap = WebGLEngine._maskMap;
            var counter: number = WebGLEngine._defineCounter;
            var index: number = Math.floor(counter / 32);
            var value: number = 1 << counter % 32;
            define = new ShaderDefine(index, value);
            WebGLEngine._defineMap[name] = define;
            if (index == maskMap.length) {
                maskMap.length++;
                maskMap[index] = {};
            }
            maskMap[index][value] = name;
            WebGLEngine._defineCounter++;
        }
        return define;
    }
    /**
     * @internal
     */
    uploadUniforms(shader: GLShaderInstance, commandEncoder: CommandEncoder, shaderData: WebGLShaderData, uploadUnTexture: boolean): number {
        shaderData.applyUBO && shaderData.applyUBOData();
        var data: any = shaderData._data;
        var shaderUniform: any[] = commandEncoder.getArrayData();
        var shaderCall: number = 0;
        for (var i: number = 0, n: number = shaderUniform.length; i < n; i++) {
            var one: any/*ShaderVariable*/ = shaderUniform[i];
            if (uploadUnTexture || one.textureID !== -1) {//如uniform为纹理切换Shader时需要重新上传
                var value: any = data[one.dataOffset];
                if (value != null)
                    shaderCall += one.fun.call(one.caller, one, value);
            }
        }
        return shaderCall;
    }

    /**
     * @internal
     */
    uploadCustomUniforms(shader: GLShaderInstance, custom: any[], index: number, data: any): number {
        shader.bind();
        var shaderCall: number = 0;
        var one: ShaderVariable = custom[index];
        if (one && data != null)
            shaderCall += one.fun.call(one.caller, one, data);
        return shaderCall;
    }

    unbindVertexState(): void {
        if (this.isWebGL2)
            (<WebGL2RenderingContext>this._context).bindVertexArray(null);
        else
            this._supportCapatable.getExtension(WebGLExtension.OES_vertex_array_object).bindVertexArrayOES(null);
        this._GLBindVertexArray = null;
    }

}


