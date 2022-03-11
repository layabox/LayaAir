import { Color } from "../d3/math/Color";
import { Vector4 } from "../d3/math/Vector4";
import { BufferTargetType, BufferUsage } from "./RenderEnum/BufferTargetType";
import { RenderCapable } from "./RenderEnum/RenderCapable";
import { WebGLMode } from "./GLEnum/WebGLMode";
import { GlBuffer } from "./GLBuffer";
import { WebGlConfig } from "./WebGLConfig";
import { GLRenderState } from "./GLRenderState";
import { GLShaderInstance } from "./GLShaderInstance";
import { Shader3D } from "../d3/shader/Shader3D";
import { GLParams } from "./GLParams";
import { CommandEncoder } from "../layagl/CommandEncoder";
import { ShaderVariable } from "../d3/shader/ShaderVariable";
import { RenderParams } from "./RenderEnum/RenderParams";
import { GlCapable } from "./GlCapable";
import { ITextureContext } from "./RenderInterface/ITextureContext";
import { GL2TextureContext } from "./GL2TextureContext";
import { GLTextureContext } from "./GLTextureContext";
import { IRenderEngine } from "./RenderInterface/IRenderEngine";
import { IRenderBuffer } from "./RenderInterface/IRenderBuffer";
import { IRenderShaderInstance } from "./RenderInterface/IRenderShaderInstance";
import { IRenderVertexState } from "./RenderInterface/IRenderVertexState";
import { IRenderDrawContext } from "./RenderInterface/IRenderDrawContext";
import { BaseTexture } from "../resource/BaseTexture";
import { RenderStateCommand } from "./RenderStateCommand";
import { GLVertexState } from "./GLVertexState";
import { GLRenderDrawContext } from "./GLRenderDrawContext";
import { RenderTexture } from "../d3/resource/RenderTexture";
import { RenderTargetFormat } from "./RenderEnum/RenderTargetFormat";
import { RenderClearFlag } from "./RenderEnum/RenderClearFlag";

/**
 * @private 封装Webgl
 */
export class WebGLEngine implements IRenderEngine {

  private _gl: WebGLRenderingContext | WebGL2RenderingContext;

  private _config: WebGlConfig;

  private _isWebGL2: boolean;

  private _webglMode: WebGLMode;

  /**@internal */
  _IDCounter: number;

  /**@internal ShaderDebugMode*/
  _isShaderDebugMode: boolean;

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
   * bind Program
   */
  _glUseProgram: GLShaderInstance;

  //bind glBuffer by glBuffer target
  //key BufferTargetType
  private _GLBufferBindMap: { [key: number]: GlBuffer | null };

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
  _supportCapatable: GlCapable;

  //GL参数
  private _GLParams: GLParams;

  //GL纹理生成
  private _GLTextureContext: GLTextureContext;
  //Gl Draw
  private _GLRenderDrawContext: GLRenderDrawContext;

  //GLRenderState
  private _GLRenderState: GLRenderState;

  //TODO:管理Buffer
  private _bufferResourcePool: any;
  //TODO:管理Texture
  private _textureResourcePool: any;
  //TODO:管理FrameBuffer
  private _RenderBufferResource: any;

  constructor(config: WebGlConfig, webglMode: WebGLMode = WebGLMode.Auto) {
    this._config = config;
    this._isWebGL2 = false;
    //init data
    this._lastViewport = new Vector4(0, 0, 0, 0);
    this._lastClearColor = new Color(0, 0, 0, 0);
    this._lastScissor = new Vector4(0,0,0,0);
    this._webglMode = webglMode;
  }

  /**
   * GL Context
   * @member {WebGLRenderingContext}
   */
  get gl() {
    return this._gl;
  }

  get isWebGL2() {
    return this._isWebGL2;
  }

  get webglConfig() {
    return this._config;
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
      } catch (e) {
      }
      if (gl) {
        if (names[i] === 'webgl2' || names[i] === 'experimental-webgl2') {
          this._isWebGL2 = true;
        }
        break;
      }
    }
    this._gl = gl;

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

  _setbindBuffer(target: BufferTargetType, buffer: GlBuffer | null) {
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
    this._GLRenderState.applyRenderState(stateData);
  }

  applyRenderStateCMD(cmd: RenderStateCommand): void {
    this._GLRenderState.applyRenderStateCommand(cmd);
  }

  //get capable of webgl
  getCapable(capatableType: RenderCapable): boolean {
    return this._supportCapatable.getCapable(capatableType);
  }

  viewport(x: number, y: number, width: number, height: number): void {
    // gl.enable(gl.SCISSOR_TEST);
    // gl.scissor(x, transformY, width, height);
    const gl = this._gl;
    const lv = this._lastViewport;
    if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
      gl.viewport(x, y, width, height);
      lv.setValue(x, y, width, height);
    }
  }

  scissor(x: number, y: number, width: number, height: number) {
    const gl = this._gl;
    const lv = this._lastScissor;
    if (x !== lv.x || y !== lv.y || width !== lv.z || height !== lv.w) {
      gl.scissor(x, y, width, height);
      lv.setValue(x, y, width, height);
    }
  }

  scissorTest(value:boolean){
    if(value)
      this._gl.enable(this._gl.SCISSOR_TEST);
    else
      this._gl.disable(this._gl.SCISSOR_TEST);
  }

  

  clearRenderTexture(rendertexture: RenderTexture, clearFlag: RenderClearFlag, clearcolor: Color = null, clearDepth: number = 1) {
    var flag: number;
    this.gl.enable(this._gl.SCISSOR_TEST)
    switch (clearFlag) {
      case RenderClearFlag.ColorDepth:
        if (clearcolor&&!this._lastClearColor.equal(clearcolor)){
            this._gl.clearColor(clearcolor.r, clearcolor.g, clearcolor.b, clearcolor.a);
            clearcolor.cloneTo(this._lastClearColor);
        }
        if(this._lastClearDepth!=clearDepth){
          this._gl.clearDepth(clearDepth);
          this._lastClearDepth = clearDepth;
        }
        if (rendertexture) {
					flag = this._gl.COLOR_BUFFER_BIT;
					switch (rendertexture.depthStencilFormat) {
						case RenderTargetFormat.DEPTH_16:
							flag |= this._gl.DEPTH_BUFFER_BIT;
							break;
						case RenderTargetFormat.STENCIL_8:
							flag |= this._gl.STENCIL_BUFFER_BIT;
							break;
						case RenderTargetFormat.DEPTHSTENCIL_24_8:
							flag |= this._gl.DEPTH_BUFFER_BIT;
							flag |= this._gl.STENCIL_BUFFER_BIT;
							
              this._gl.clearStencil(0);
							this._GLRenderState.setStencilMask(true);
							break;
					}
				} else {
					flag = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT;
				}
        break;
      case RenderClearFlag.Depth:
        if(this._lastClearDepth!=clearDepth){
          this._gl.clearDepth(clearDepth);
          this._lastClearDepth = clearDepth;
        }
        if (rendertexture) {
					switch (rendertexture.depthStencilFormat) {
						case RenderTargetFormat.DEPTH_16:
							flag = this._gl.DEPTH_BUFFER_BIT;
							break;
						case RenderTargetFormat.STENCIL_8:
							flag = this._gl.STENCIL_BUFFER_BIT;
							break;
						case RenderTargetFormat.DEPTHSTENCIL_24_8:
							//打开模板缓存 再清理
							this._gl.clearStencil(0);
              this._GLRenderState.setStencilMask(true);
							flag = this._gl.DEPTH_BUFFER_BIT | this._gl.STENCIL_BUFFER_BIT;
							break;
					}
				} else {
					flag = this._gl.DEPTH_BUFFER_BIT;
				}
        break;
        case RenderClearFlag.Color:
          if (clearcolor&&!this._lastClearColor.equal(clearcolor)){
            this._gl.clearColor(clearcolor.r, clearcolor.g, clearcolor.b, clearcolor.a);
            clearcolor.cloneTo(this._lastClearColor);
          }
          flag = this.gl.COLOR_BUFFER_BIT;
          break;
      

    }
    this._gl.clear(flag);
    this._gl.disable(this._gl.SCISSOR_TEST);
  }

  copySubFrameBuffertoTex(texture: BaseTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number) {
    this._bindTexture(texture._texture.target, texture._getSource());
    this._gl.copyTexSubImage2D(texture._texture.target, level, xoffset, yoffset, x, y, width, height);
  }

  colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void {
    this._gl.colorMask(r, g, b, a);
  }

  getParams(params: RenderParams): number {
    return this._GLParams.getParams(params);
  }


  createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): IRenderBuffer {
    //TODO SourceManager
    return new GlBuffer(this, targetType, bufferUsageType);
  }

  createShaderInstance(vs: string, ps: string, attributeMap: { [key: string]: number }): IRenderShaderInstance {
    //TODO SourceManager
    return new GLShaderInstance(this, vs, ps, attributeMap);
  }

  createVertexState(): IRenderVertexState {
    return new GLVertexState(this);
  }

  getTextureContext(): ITextureContext {
    return this._GLTextureContext;
  }

  //TODO 先写完测试，这种封装过于死板
  getDrawContext(): IRenderDrawContext {
    return this._GLRenderDrawContext;
  }

  //TODO:
  getPropertyNameToID(name: string): number {
    return Shader3D.propertyNameToID(name);
  }

  /**
   * @internal
   */
  uploadUniforms(shader: GLShaderInstance, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number {
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
  uploadCustomUniforms(shader: GLShaderInstance, custom: any[], index: number, data: any): number {
    shader.bind();
    var shaderCall: number = 0;
    var one: ShaderVariable = custom[index];
    if (one && data != null)
      shaderCall += one.fun.call(one.caller, one, data);
    return shaderCall;
  }

}


