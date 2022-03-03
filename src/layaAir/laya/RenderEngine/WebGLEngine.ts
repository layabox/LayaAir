import { Color } from "../d3/math/Color";
import { Vector4 } from "../d3/math/Vector4";
import { BufferTargetType, BufferUsage } from "./RenderEnum/BufferTargetType";
import { RenderCapable } from "./RenderEnum/RenderCapable";
import { WebGLMode } from "./GLEnum/WebGLMode";
import { GlBuffer } from "./GLBuffer";
import { GLVertexArray } from "./GLVertexArray";
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
  _GLBindVertexArray: GLVertexArray;

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

  //bind clearColor
  private _lastClearColor: Color;

  /**
   * @internal
   * 支持功能
   */
  _supportCapatable: GlCapable;

  //GL参数
  private _GLParams: GLParams;

  //GL纹理生成
  private _GLTextureContext: ITextureContext;

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

  //set render State
  applyRenderContext(stateData: any) {
    this._GLRenderState.applyRenderState(stateData);
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

  colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void {
    this._gl.colorMask(r, g, b, a);
  }

  getParams(params: RenderParams): number {
    return this._GLParams.getParams(params);
  }


  createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage):IRenderBuffer {
    //TODO SourceManager
    return new GlBuffer(this,targetType,bufferUsageType);
  }

  createShaderInstance(vs: string, ps: string, attributeMap: { [key: string]: number }):IRenderShaderInstance{
    //TODO SourceManager
    return new GLShaderInstance(this,vs,ps,attributeMap);
  }

  getTextureContext(): ITextureContext {
    return this._GLTextureContext;
  }

  //TODO:
  getPropertyNameToID(name: string): number {
    return Shader3D.propertyNameToID(name);
  }

  /**
   * @internal
   */
  uploadUniforms(commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number {
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
  uploadCustomUniformUniforms(custom: any[], index: number, data: any): number {
    var shaderCall: number = 0;
    var one: ShaderVariable = custom[index];
    if (one && data != null)
      shaderCall += one.fun.call(one.caller, one, data);
    return shaderCall;
  }
}


