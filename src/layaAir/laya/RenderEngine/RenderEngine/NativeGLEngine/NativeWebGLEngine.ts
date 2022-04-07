import { Color } from "../../../d3/math/Color";
import { Vector4 } from "../../../d3/math/Vector4";
import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { BaseTexture } from "../../../resource/BaseTexture";
import { BufferTargetType, BufferUsage } from "../../RenderEnum/BufferTargetType";
import { RenderCapable } from "../../RenderEnum/RenderCapable";
import { RenderClearFlag } from "../../RenderEnum/RenderClearFlag";
import { RenderParams } from "../../RenderEnum/RenderParams";
import { IRender2DContext } from "../../RenderInterface/IRender2DContext";
import { IRenderBuffer } from "../../RenderInterface/IRenderBuffer";
import { IRenderDrawContext } from "../../RenderInterface/IRenderDrawContext";
import { IRenderEngine } from "../../RenderInterface/IRenderEngine";
import { IRenderShaderInstance } from "../../RenderInterface/IRenderShaderInstance";
import { IRenderVertexState } from "../../RenderInterface/IRenderVertexState";
import { ITextureContext } from "../../RenderInterface/ITextureContext";
import { Shader3D } from "../../RenderShader/Shader3D";
import { ShaderVariable } from "../../RenderShader/ShaderVariable";
import { RenderStateCommand } from "../../RenderStateCommand";
import { NativeGL2TextureContext } from "./NativeGL2TextureContext";
import { NativeGlBuffer } from "./NativeGLBuffer";
import { NativeGlCapable } from "./NativeGlCapable";
import { WebGLMode } from "../WebGLEngine/GLEnum/WebGLMode";
import { NativeGLParams } from "./NativeGLParams";
import { NativeGLRender2DContext } from "./NativeGLRender2DContext";
import { NativeGLRenderDrawContext } from "./NativeGLRenderDrawContext";
import { NativeGLRenderState } from "./NativeGLRenderState";
import { NativeGLShaderInstance } from "./NativeGLShaderInstance";
import { NativeGLTextureContext } from "./NativeGLTextureContext";
import { NativeGLVertexState } from "./NativeGLVertexState";
import { WebGlConfig } from "../WebGLEngine/WebGLConfig";
import { IRenderOBJCreate } from "../../RenderInterface/IRenderOBJCreate";


/**
 * @private 封装Webgl
 */
export class NativeWebGLEngine implements IRenderEngine {

  private _gl: WebGLRenderingContext | WebGL2RenderingContext;

  private _config: WebGlConfig;

  private _isWebGL2: boolean;

  private _webglMode: WebGLMode;

  /**@internal */
  _IDCounter: number;

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
  _GLBindVertexArray: NativeGLVertexState;

  /**
   * @internal
   * bind Program
   */
  _glUseProgram: NativeGLShaderInstance;

  //bind glBuffer by glBuffer target
  //key BufferTargetType
  private _GLBufferBindMap: { [key: number]: NativeGlBuffer | null };

  //bind viewport
  private _lastViewport: Vector4;
  private _lastScissor: Vector4;

  //bind clearColor
  private _lastClearColor: Color = new Color;
  private _lastClearDepth: number = 1;

  /**
   * @internal
   * 支持功能
   */
  _supportCapatable: NativeGlCapable;

  //GL参数
  private _GLParams: NativeGLParams;

  //GL纹理生成
  private _GLTextureContext: NativeGLTextureContext;
  //Gl Draw
  private _GLRenderDrawContext: NativeGLRenderDrawContext;

  private _GL2DRenderContext: NativeGLRender2DContext;

  //GLRenderState
  private _GLRenderState: NativeGLRenderState;

  //TODO:管理Buffer
  private _bufferResourcePool: any;
  //TODO:管理Texture
  private _textureResourcePool: any;
  //TODO:管理FrameBuffer
  private _RenderBufferResource: any;
  _nativeObj: any;
  constructor(config: WebGlConfig, webglMode: WebGLMode = WebGLMode.Auto) {
    /*this._config = config;
    this._isWebGL2 = false;
    //init data
    this._lastViewport = new Vector4(0, 0, 0, 0);
    this._lastClearColor = new Color(0, 0, 0, 0);
    this._lastScissor = new Vector4(0, 0, 0, 0);*/
    this._webglMode = webglMode;
    this._nativeObj = new (window as any).conchWebGLEngine(webglMode);
  }

  /**
   * GL Context
   * @member {WebGLRenderingContext}
   */
  get gl() {
    return this._gl;
  }

  get isWebGL2() {
    return this._nativeObj.isWebGL2;
  }

  get webglConfig() {
    return this._config;
  }

  /**
   * create GL
   * @param canvas 
   */
  initRenderEngine(canvas: any) {
    this._nativeObj.initRenderEngine();
    /*let names;
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
      } catch (e) {
      }
      if (gl) {
        if (names[i] === 'webgl2' || names[i] === 'experimental-webgl2') {
          this._isWebGL2 = true;
        }
        break;
      }
    }*/
    //this._isWebGL2 = false;
    //this._gl = gl;

    //init Other
    this._initBindBufferMap();
    //this._supportCapatable = new NativeGlCapable(this);
    //this._GLParams = new NativeGLParams(this);
    //this._GLRenderState = new NativeGLRenderState(this);
    //this._glTextureIDParams = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7, gl.TEXTURE8, gl.TEXTURE9, gl.TEXTURE10, gl.TEXTURE11, gl.TEXTURE12, gl.TEXTURE13, gl.TEXTURE14, gl.TEXTURE15, gl.TEXTURE16, gl.TEXTURE17, gl.TEXTURE18, gl.TEXTURE19, gl.TEXTURE20, gl.TEXTURE21, gl.TEXTURE22, gl.TEXTURE23, gl.TEXTURE24, gl.TEXTURE25, gl.TEXTURE26, gl.TEXTURE27, gl.TEXTURE28, gl.TEXTURE29, gl.TEXTURE30, gl.TEXTURE31];
    //this._activedTextureID = gl.TEXTURE0;//默认激活纹理区为0;
    this._activeTextures = [];
    //this._GLTextureContext = this.isWebGL2 ? new NativeGL2TextureContext(this) : new NativeGLTextureContext(this);
    //this._GLRenderDrawContext = new NativeGLRenderDrawContext(this);
    //this._GL2DRenderContext = new NativeGLRender2DContext(this);

    if (this.isWebGL2) {
      this._GLTextureContext = new NativeGL2TextureContext(this, new (window as any).conchGL2TextureContext);
    }
    else {
      this._GLTextureContext = new NativeGLTextureContext(this, new (window as any).conchGLTextureContext);
    }
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

  _setbindBuffer(target: BufferTargetType, buffer: NativeGlBuffer | null) {
    this._GLBufferBindMap[target] = buffer;
  }

  /**
   * @internal
   * @param target 
   * @param texture 
   */
  _bindTexture(target: number, texture: WebGLTexture) {
    const texID = this._activedTextureID - this._gl.TEXTURE0;
    if (this._activeTextures[texID] !== texture) {
      this._gl.bindTexture(target, texture);
      this._activeTextures[texID] = texture;
    }
  }

  bindTexture(texture: BaseTexture) {
    this._bindTexture(texture._texture.target, texture._getSource());
  }

  //set render State
  applyRenderState(stateData: any) {
    //this._GLRenderState.applyRenderState(stateData);
    this._nativeObj.applyRenderState(stateData);
  }

  applyRenderStateCMD(cmd: RenderStateCommand): void {
    //this._GLRenderState.applyRenderStateCommand(cmd);
    this._nativeObj.applyRenderStateCommand(cmd);
  }

  //get capable of webgl
  getCapable(capatableType: RenderCapable): boolean {
    //return this._supportCapatable.getCapable(capatableType);
    return this._nativeObj.getCapable(capatableType);
  }

  viewport(x: number, y: number, width: number, height: number): void {
    // gl.enable(gl.SCISSOR_TEST);
    // gl.scissor(x, transformY, width, height);
    /*const gl = this._gl;
    const lv = this._lastViewport;
    if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
      gl.viewport(x, y, width, height);
      lv.setValue(x, y, width, height);
    }*/
    this._nativeObj.viewport(x, y, width, height);
  }

  scissor(x: number, y: number, width: number, height: number) {
    /*const gl = this._gl;
    const lv = this._lastScissor;
    if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
      gl.scissor(x, y, width, height);
      lv.setValue(x, y, width, height);
    }*/
    this._nativeObj.scissor(x, y, width, height);
  }

  scissorTest(value: boolean) {
    /*if (value)
      this._gl.enable(this._gl.SCISSOR_TEST);
    else
      this._gl.disable(this._gl.SCISSOR_TEST);*/

      this._nativeObj.scissorTest(value);
  }



  clearRenderTexture(clearFlag: RenderClearFlag, clearcolor: Color = null, clearDepth: number = 1) {
    /*var flag: number;
    this.gl.enable(this._gl.SCISSOR_TEST)
    if(clearFlag&RenderClearFlag.Color){
        if (clearcolor && !this._lastClearColor.equal(this._lastClearColor)) {
          this._gl.clearColor(clearcolor.r, clearcolor.g, clearcolor.b, clearcolor.a);
          clearcolor.cloneTo(this._lastClearColor);
        }
        flag |= this.gl.COLOR_BUFFER_BIT;
    }
    if(clearFlag&RenderClearFlag.Depth){
      if (this._lastClearDepth != clearDepth) {
        this._gl.clearDepth(clearDepth);
        this._lastClearDepth = clearDepth;
      }
      this._GLRenderState.setDepthMask(true);
      flag |= this._gl.DEPTH_BUFFER_BIT;
    }
    if(clearFlag&RenderClearFlag.Stencil){
      this._gl.clearStencil(0);
      this._GLRenderState.setStencilMask(true);
      flag |= this._gl.STENCIL_BUFFER_BIT;
    }
    this._gl.clear(flag);
    this._gl.disable(this._gl.SCISSOR_TEST);*/

    if (clearcolor)
      this._nativeObj.clearRenderTexture(clearFlag, true, clearcolor.r, clearcolor.g, clearcolor.b, clearcolor.a, clearDepth);
    else
      this._nativeObj.clearRenderTexture(clearFlag, false, Color.BLACK.r, Color.BLACK.g , Color.BLACK.b, Color.BLACK.a, clearDepth);
  }

  copySubFrameBuffertoTex(texture: BaseTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number) {
    this._bindTexture(texture._texture.target, texture._getSource());
    this._gl.copyTexSubImage2D(texture._texture.target, level, xoffset, yoffset, x, y, width, height);
  }

  colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void {
    //this._gl.colorMask(r, g, b, a);
    this._nativeObj.colorMask(r, g, b, a);
  }

  getParams(params: RenderParams): number {
    //return this._GLParams.getParams(params);
    return this._nativeObj.getParams(params);
  }


  createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): IRenderBuffer {
    //TODO SourceManager
    return new NativeGlBuffer(this, targetType, bufferUsageType);
  }

  createShaderInstance(vs: string, ps: string, attributeMap: { [key: string]: number }): IRenderShaderInstance {
    //TODO SourceManager
    return new NativeGLShaderInstance(this, vs, ps, attributeMap);
  }

  createVertexState(): IRenderVertexState {
    return new NativeGLVertexState(this);
  }

  getTextureContext(): ITextureContext {
    return this._GLTextureContext;
  }

  //TODO 先写完测试，这种封装过于死板
  getDrawContext(): IRenderDrawContext {
    return this._GLRenderDrawContext;
  }

  get2DRenderContext(): IRender2DContext {
    return this._GL2DRenderContext;
  }

  getCreateRenderOBJContext():IRenderOBJCreate{
    //TODO
    return null;
  }

  //TODO:
  getPropertyNameToID(name: string): number {
    return Shader3D.propertyNameToID(name);
  }

  

  /**
   * @internal
   */
  uploadUniforms(shader: NativeGLShaderInstance, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number {
    shader.bind();
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
  uploadCustomUniforms(shader: NativeGLShaderInstance, custom: any[], index: number, data: any): number {
    shader.bind();
    var shaderCall: number = 0;
    var one: ShaderVariable = custom[index];
    if (one && data != null)
      shaderCall += one.fun.call(one.caller, one, data);
    return shaderCall;
  }

}


