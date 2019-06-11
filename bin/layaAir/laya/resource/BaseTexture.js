import { LayaGL } from "../layagl/LayaGL";
import { Bitmap } from "./Bitmap";
import { WebGLContext } from "../webgl/WebGLContext";
import { ILaya } from "../../ILaya";
/**
 * <code>BaseTexture</code> 纹理的父类，抽象类，不允许实例。
 */
export class BaseTexture extends Bitmap {
    /**
     * 创建一个 <code>BaseTexture</code> 实例。
     */
    constructor(format, mipMap) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        this._wrapModeU = BaseTexture.WARPMODE_REPEAT;
        this._wrapModeV = BaseTexture.WARPMODE_REPEAT;
        this._filterMode = BaseTexture.FILTERMODE_BILINEAR;
        this._readyed = false;
        this._width = -1;
        this._height = -1;
        this._format = format;
        this._mipmap = mipMap;
        this._anisoLevel = 1;
        this._glTexture = LayaGL.instance.createTexture();
    }
    /**
     * 是否使用mipLevel
     */
    get mipmap() {
        return this._mipmap;
    }
    /**
     * 纹理格式
     */
    get format() {
        return this._format;
    }
    /**
     * 获取纹理横向循环模式。
     */
    get wrapModeU() {
        return this._wrapModeU;
    }
    /**
     * 设置纹理横向循环模式。
     */
    set wrapModeU(value) {
        if (this._wrapModeU !== value) {
            this._wrapModeU = value;
            (this._width !== -1) && (this._setWarpMode(WebGLContext.TEXTURE_WRAP_S, value));
        }
    }
    /**
     * 获取纹理纵向循环模式。
     */
    get wrapModeV() {
        return this._wrapModeV;
    }
    /**
     * 设置纹理纵向循环模式。
     */
    set wrapModeV(value) {
        if (this._wrapModeV !== value) {
            this._wrapModeV = value;
            (this._height !== -1) && (this._setWarpMode(WebGLContext.TEXTURE_WRAP_T, value));
        }
    }
    /**
     * 缩小过滤器
     */
    get filterMode() {
        return this._filterMode;
    }
    /**
     * 缩小过滤器
     */
    set filterMode(value) {
        if (value !== this._filterMode) {
            this._filterMode = value;
            ((this._width !== -1) && (this._height !== -1)) && (this._setFilterMode(value));
        }
    }
    /**
     * 各向异性等级
     */
    get anisoLevel() {
        return this._anisoLevel;
    }
    /**
     * 各向异性等级
     */
    set anisoLevel(value) {
        if (value !== this._anisoLevel) {
            this._anisoLevel = Math.max(1, Math.min(16, value));
            ((this._width !== -1) && (this._height !== -1)) && (this._setAnisotropy(value));
        }
    }
    /**
     * 获取默认纹理资源。
     */
    get defaulteTexture() {
        throw "BaseTexture:must override it.";
    }
    /**
     * @private
     */
    _isPot(size) {
        return (size & (size - 1)) === 0;
    }
    /**
     * @private
     */
    _getGLFormat() {
        var glFormat;
        let gpu = LayaGL.layaGPUInstance;
        switch (this._format) {
            case BaseTexture.FORMAT_R8G8B8:
                glFormat = WebGLContext.RGB;
                break;
            case BaseTexture.FORMAT_R8G8B8A8:
                glFormat = WebGLContext.RGBA;
                break;
            case BaseTexture.FORMAT_ALPHA8:
                glFormat = WebGLContext.ALPHA;
                break;
            case BaseTexture.FORMAT_DXT1:
                if (gpu._compressedTextureS3tc)
                    glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGB_S3TC_DXT1_EXT;
                else
                    throw "BaseTexture: not support DXT1 format.";
                break;
            case BaseTexture.FORMAT_DXT5:
                if (gpu._compressedTextureS3tc)
                    glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                else
                    throw "BaseTexture: not support DXT5 format.";
                break;
            case BaseTexture.FORMAT_ETC1RGB:
                if (gpu._compressedTextureEtc1)
                    glFormat = gpu._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
                else
                    throw "BaseTexture: not support ETC1RGB format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGB_2BPPV format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGBA_2BPPV format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGB_4BPPV format.";
                break;
            case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
                if (gpu._compressedTexturePvrtc)
                    glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                else
                    throw "BaseTexture: not support PVRTCRGBA_4BPPV format.";
                break;
            default:
                throw "BaseTexture: unknown texture format.";
        }
        return glFormat;
    }
    /**
     * @private
     */
    _setFilterMode(value) {
        var gl = LayaGL.instance;
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        switch (value) {
            case BaseTexture.FILTERMODE_POINT:
                if (this._mipmap)
                    gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.NEAREST_MIPMAP_NEAREST);
                else
                    gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.NEAREST);
                gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MAG_FILTER, WebGLContext.NEAREST);
                break;
            case BaseTexture.FILTERMODE_BILINEAR:
                if (this._mipmap)
                    gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.LINEAR_MIPMAP_NEAREST);
                else
                    gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.LINEAR);
                gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MAG_FILTER, WebGLContext.LINEAR);
                break;
            case BaseTexture.FILTERMODE_TRILINEAR:
                if (this._mipmap)
                    gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.LINEAR_MIPMAP_LINEAR);
                else
                    gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.LINEAR);
                gl.texParameteri(this._glTextureType, WebGLContext.TEXTURE_MAG_FILTER, WebGLContext.LINEAR);
                break;
            default:
                throw new Error("BaseTexture:unknown filterMode value.");
        }
    }
    /**
     * @private
     */
    _setWarpMode(orientation, mode) {
        var gl = LayaGL.instance;
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        if (this._isPot(this._width) && this._isPot(this._height)) {
            switch (mode) {
                case BaseTexture.WARPMODE_REPEAT:
                    gl.texParameteri(this._glTextureType, orientation, WebGLContext.REPEAT);
                    break;
                case BaseTexture.WARPMODE_CLAMP:
                    gl.texParameteri(this._glTextureType, orientation, WebGLContext.CLAMP_TO_EDGE);
                    break;
            }
        }
        else {
            gl.texParameteri(this._glTextureType, orientation, WebGLContext.CLAMP_TO_EDGE);
        }
    }
    /**
     * @private
     */
    _setAnisotropy(value) {
        var anisotropic = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
        if (anisotropic && !ILaya.Browser.onLimixiu) {
            value = Math.max(value, 1);
            var gl = LayaGL.instance;
            WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
            value = Math.min(gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT), value);
            gl.texParameterf(this._glTextureType, anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, value);
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _disposeResource() {
        if (this._glTexture) {
            LayaGL.instance.deleteTexture(this._glTexture);
            this._glTexture = null;
            this._setGPUMemory(0);
        }
    }
    /**
     * 获取纹理资源。
     */
    /*override*/ _getSource() {
        if (this._readyed)
            return this._glTexture;
        else
            return null;
    }
    /**
     * 通过基础数据生成mipMap。
     */
    generateMipmap() {
        if (this._isPot(this.width) && this._isPot(this.height))
            LayaGL.instance.generateMipmap(this._glTextureType);
    }
}
/** @private */
BaseTexture.WARPMODE_REPEAT = 0;
/** @private */
BaseTexture.WARPMODE_CLAMP = 1;
/**寻址模式_重复。*/
BaseTexture.FILTERMODE_POINT = 0;
/**寻址模式_不循环。*/
BaseTexture.FILTERMODE_BILINEAR = 1;
/**寻址模式_不循环。*/
BaseTexture.FILTERMODE_TRILINEAR = 2;
/**纹理格式_R8G8B8。*/
BaseTexture.FORMAT_R8G8B8 = 0;
/**纹理格式_R8G8B8A8。*/
BaseTexture.FORMAT_R8G8B8A8 = 1;
/**纹理格式_ALPHA8。*/
BaseTexture.FORMAT_ALPHA8 = 2;
/**纹理格式_DXT1。*/
BaseTexture.FORMAT_DXT1 = 3;
/**纹理格式_DXT5。*/
BaseTexture.FORMAT_DXT5 = 4;
/**纹理格式_ETC2RGB。*/
BaseTexture.FORMAT_ETC1RGB = 5;
///**纹理格式_ETC2RGB。*/
//public static const FORMAT_ETC2RGB:int = 6;
///**纹理格式_ETC2RGBA。*/
//public static const FORMAT_ETC2RGBA:int = 7;
/**纹理格式_ETC2RGB_PUNCHTHROUGHALPHA。*/
//public static const FORMAT_ETC2RGB_PUNCHTHROUGHALPHA:int = 8;
/**纹理格式_PVRTCRGB_2BPPV。*/
BaseTexture.FORMAT_PVRTCRGB_2BPPV = 9;
/**纹理格式_PVRTCRGBA_2BPPV。*/
BaseTexture.FORMAT_PVRTCRGBA_2BPPV = 10;
/**纹理格式_PVRTCRGB_4BPPV。*/
BaseTexture.FORMAT_PVRTCRGB_4BPPV = 11;
/**纹理格式_PVRTCRGBA_4BPPV。*/
BaseTexture.FORMAT_PVRTCRGBA_4BPPV = 12;
/**渲染纹理格式_16位半精度RGBA浮点格式。*/
BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT = 14;
/**深度格式_DEPTH_16。*/
BaseTexture.FORMAT_DEPTH_16 = 0;
/**深度格式_STENCIL_8。*/
BaseTexture.FORMAT_STENCIL_8 = 1;
/**深度格式_DEPTHSTENCIL_16_8。*/
BaseTexture.FORMAT_DEPTHSTENCIL_16_8 = 2;
/**深度格式_DEPTHSTENCIL_NONE。*/
BaseTexture.FORMAT_DEPTHSTENCIL_NONE = 3;
