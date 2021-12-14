import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "../../resource/BaseTexture";
import { FilterMode } from "../../resource/FilterMode";
import { RenderTextureDepthFormat, RenderTextureFormat, RTDEPTHATTACHMODE } from "../../resource/RenderTextureFormat";
import { WarpMode } from "../../resource/WrapMode";
import { LayaGPU } from "../../webgl/LayaGPU";
import { WebGLContext } from "../../webgl/WebGLContext";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { RenderTexture } from "./RenderTexture";
/**
 * <code>MulSampleRenderTexture</code>类用于创建多重采样渲染目标
 * webGL2.0多重采样才会生效
 */
export class MulSampleRenderTexture extends RenderTexture{
    /**多重采样次数 */
    protected _mulSampler: number = 1;
    /**是否为多重采样贴图 */
    protected _mulSamplerRT = true;
    /** @internal RenderBuffer*/
	protected _mulRenderBuffer: any;
	/** @internal 用来拷贝的frameBuffer*/
	protected _mulFrameBuffer: any;


    static createFromPool(width: number, height: number, format: number = RenderTextureFormat.R8G8B8, depthStencilFormat: number = RenderTextureDepthFormat.DEPTH_16, mulSamples: number = 4, mipmap: boolean = false): MulSampleRenderTexture {
        var tex;
		if (!LayaGL.layaGPUInstance._isWebGL2 || mulSamples == 1) {
            throw "dont support msaa RT";
        }
        
        // todo mipmap 判断
		mipmap = mipmap && (width & (width -1)) === 0 && (height & (height -1)) === 0;

		for (var i: number = 0, n: number = RenderTexture._pool.length; i < n; i++) {
			tex = RenderTexture._pool[i];
			if ((tex instanceof MulSampleRenderTexture)&&tex.width == width && tex.height == height && tex.format == format && tex.depthStencilFormat == depthStencilFormat && tex.mulSampler == mulSamples && tex.mipmap == mipmap) {
				tex._inPool = false;
				var end: RenderTexture = RenderTexture._pool[n - 1];
				RenderTexture._pool[i] = end;
				RenderTexture._pool.length -= 1;
				return tex;
			}
		}
		tex = new MulSampleRenderTexture(width, height, format, depthStencilFormat,mulSamples,mipmap);
		tex.lock = true;//TODO:资源不加锁会被GC掉,或GC时对象池清空
		return tex;
    }

    /**
     * 创建一个 <code>MulSampleRenderTexture</code> 实例。
	 * @param width  宽度。
	 * @param height 高度。
	 * @param format 纹理格式。
	 * @param depthStencilFormat 深度格式。
     * @param mulSampler 多重采样点个数。
     * @param mipmap 是否生成mipmap。
     */
    constructor(width: number, height: number, format: RenderTextureFormat = RenderTextureFormat.R8G8B8, depthStencilFormat: RenderTextureDepthFormat = RenderTextureDepthFormat.DEPTH_16,mulSampler:number = 1, mipmap: boolean = false){
        
        super(width, height, format, depthStencilFormat, mipmap);
        this._mulSampler = mulSampler;
        
    }

    protected _create(width:number,height:number):void{
        var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
		var glTextureType: number = this._glTextureType;
		var layaGPU: LayaGPU = LayaGL.layaGPUInstance;
		var isWebGL2: Boolean = layaGPU._isWebGL2;
		var format: number = this._format;
        this._mulSampler = 4;
        this._frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        
        //createRenderBuffer
        this._mulRenderBuffer = gl2.createRenderbuffer();
        gl2.bindRenderbuffer(gl2.RENDERBUFFER,this._mulRenderBuffer);
        switch(format){
            case RenderTextureFormat.R8G8B8:
                gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.RGB8,width,height);
                break;
            case RenderTextureFormat.R8G8B8A8:
                gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.RGBA8,width,height);
                break;
            case RenderTextureFormat.Alpha8:
                gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.ALPHA,width,height);
                break;
            case RenderTextureFormat.R16G16B16A16:
                gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.RGBA16F,width,height);
                break;
        }
		gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,this._mulRenderBuffer);

        //set gl_Texture
        this._creatGlTexture(width,height);
        if (format !== RenderTextureFormat.Depth && format !== RenderTextureFormat.ShadowMap) {
			this._mulFrameBuffer = gl2.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER,this._mulFrameBuffer);
			gl.framebufferTexture2D(gl2.FRAMEBUFFER,gl2.COLOR_ATTACHMENT0,gl2.TEXTURE_2D,this._glTexture,0);
		}
        
        //set Depth_Gl
        this._createGLDepthRenderbuffer(width,height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
		this._setFilterMode(this._filterMode);
		this._setAnisotropy(this._anisoLevel);

        this._readyed = true;
		this._activeResource();
        // todo ?
        let gpuMemory = width * height * 4;
		if (this._mipmap) {
			gpuMemory *= 4 / 3;
		}
		this._setGPUMemory(gpuMemory);
    }

    protected _createGLDepthRenderbuffer(width:number,height:number){
        var gl: WebGLRenderingContext = LayaGL.instance;
        var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        if (this._depthStencilFormat !== RenderTextureDepthFormat.DEPTHSTENCIL_NONE) {
            this._depthStencilBuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilBuffer);
			
            switch (this._depthStencilFormat) {
                case RenderTextureDepthFormat.DEPTH_16:
                    gl2.renderbufferStorageMultisample(gl.RENDERBUFFER,this._mulSampler,gl2.DEPTH_COMPONENT16,width,height);
                    gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl2.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this._depthStencilBuffer);
                    break;
                case RenderTextureDepthFormat.STENCIL_8:
                    gl2.renderbufferStorageMultisample(gl.RENDERBUFFER,this._mulSampler,gl2.STENCIL_INDEX8,width,height);
                    gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl2.STENCIL_ATTACHMENT,gl.RENDERBUFFER,this._depthStencilBuffer);
                    break;
                case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
                    gl2.renderbufferStorageMultisample(gl.RENDERBUFFER,this._mulSampler,gl2.DEPTH24_STENCIL8,width,height);
                    gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl2.DEPTH_STENCIL_ATTACHMENT,gl.RENDERBUFFER,this._depthStencilBuffer);
                    break;
                default:
                    throw "RenderTexture: unkonw depth format.";
            }
        }
    }

    protected  (width:number,height:number){
        var glTextureType: number = this._glTextureType;
		var layaGPU: LayaGPU = LayaGL.layaGPUInstance;
		var isWebGL2: Boolean = layaGPU._isWebGL2;
		var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
        if (this._depthStencilFormat !== RenderTextureDepthFormat.DEPTHSTENCIL_NONE) {
            this._depthStencilTexture = new BaseTexture(RenderTextureFormat.Depth,false);
			this._depthStencilTexture.lock = true;
			this._depthStencilTexture.width = width;
			this._depthStencilTexture.height = height;
			this._depthStencilTexture.mipmapCount = 1;
			this._depthStencilTexture._glTextureType = LayaGL.instance.TEXTURE_2D;
			this._depthStencilTexture._readyed = true;
            //绑定mulBuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER,this._mulFrameBuffer);
            this._depthStencilTexture.filterMode = FilterMode.Point;
			this._depthStencilTexture.wrapModeU = WarpMode.Clamp;
			this._depthStencilTexture.wrapModeV = WarpMode.Clamp;
            WebGLContext.bindTexture(gl, this._depthStencilTexture._glTextureType, this._depthStencilTexture._getSource());
            switch (this._depthStencilFormat) {
				case RenderTextureDepthFormat.DEPTH_16:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH_COMPONENT16, width, height);
					}
					else {
						gl.texImage2D(glTextureType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
					}
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthStencilTexture._getSource(), 0);
					break;
				case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH24_STENCIL8, width, height);
					}
					else {
						gl.texImage2D(glTextureType, 0, gl.DEPTH_STENCIL, width, height, 0, gl.DEPTH_STENCIL, layaGPU._webgl_depth_texture.UNSIGNED_INT_24_8_WEBGL, null);
					}
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, this._depthStencilTexture._getSource(), 0);
					break;
				case RenderTextureDepthFormat.DEPTH_32:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH_COMPONENT32F, width, height);
					}
					else {
						gl.texImage2D(glTextureType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
					}
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthStencilTexture._getSource(), 0);
					break;
				default:
					break;
			}
        }
        
    }


    _end(){
        var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
		//blitMtlColor TO texture
        gl2.bindFramebuffer(gl2.READ_FRAMEBUFFER,this._frameBuffer);
        gl2.bindFramebuffer(gl2.DRAW_FRAMEBUFFER,this._mulFrameBuffer);
        gl2.clearBufferfv(gl2.COLOR,0,[0.0,0.0,0.0,0.0]);
        gl2.blitFramebuffer(0,0,this.width,this.height,0,0,this._width,this._height,gl2.COLOR_BUFFER_BIT,gl.NEAREST);
		if(this._depthAttachMode==RTDEPTHATTACHMODE.TEXTURE){
            gl2.bindFramebuffer(gl2.READ_FRAMEBUFFER,this._frameBuffer);
            gl2.bindFramebuffer(gl2.DRAW_FRAMEBUFFER,this._mulFrameBuffer);
            gl2.clearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);
            gl2.blitFramebuffer(0,0,this.width,this.height,0,0,this._width,this._height,gl2.DEPTH_BUFFER_BIT,gl.NEAREST);
        }

        if (this.mipmap) {
            WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
            gl.generateMipmap(this._glTextureType);
			WebGLContext.bindTexture(gl, this._glTextureType, null);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
		RenderTexture._currentActive = null;
		(this._isCameraTarget) && (RenderContext3D._instance.invertY = false);
		this._readyed = true;
    }

    	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
        super._disposeResource();
        var gl: WebGLRenderingContext = LayaGL.instance;
        this._mulRenderBuffer && gl.deleteRenderbuffer(this._mulRenderBuffer);
	    this._mulFrameBuffer && gl.deleteFramebuffer(this._mulFrameBuffer);
        this._mulRenderBuffer = null;
        this._mulFrameBuffer = null;
	}
}