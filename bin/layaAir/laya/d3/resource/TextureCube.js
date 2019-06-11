import { Laya } from "Laya";
import { LayaGL } from "laya/layagl/LayaGL";
import { Render } from "laya/renders/Render";
import { WebGLContext } from "laya/webgl/WebGLContext";
import { BaseTexture } from "laya/resource/BaseTexture";
/**
 * <code>TextureCube</code> 类用于生成立方体纹理。
 */
export class TextureCube extends BaseTexture {
    /**
     * 创建一个 <code>TextureCube</code> 实例。
     * @param	format 贴图格式。
     * @param	mipmap 是否生成mipmap。
     */
    constructor(format = BaseTexture.FORMAT_R8G8B8, mipmap = false) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super(format, mipmap);
        this._glTextureType = WebGLContext.TEXTURE_CUBE_MAP;
    }
    /**
     * @private
     */
    static __init__() {
        var pixels = new Uint8Array(3);
        pixels[0] = 128;
        pixels[1] = 128;
        pixels[2] = 128;
        TextureCube.grayTexture = new TextureCube(BaseTexture.FORMAT_R8G8B8, false);
        TextureCube.grayTexture.setSixSidePixels(1, 1, [pixels, pixels, pixels, pixels, pixels, pixels]);
        TextureCube.grayTexture.lock = true; //锁住资源防止被资源管理释放
    }
    /**
     * @inheritDoc
     */
    static _parse(data, propertyParams = null, constructParams = null) {
        var texture = constructParams ? new TextureCube(constructParams[0], constructParams[1]) : new TextureCube();
        texture.setSixSideImageSources(data);
        return texture;
    }
    /**
     * 加载TextureCube。
     * @param url TextureCube地址。
     * @param complete 完成回调。
     */
    static load(url, complete) {
        Laya.loader.create(url, complete, null, TextureCube.TEXTURECUBE);
    }
    /**
     * @inheritDoc
     */
    /*override*/ get defaulteTexture() {
        return TextureCube.grayTexture;
    }
    /**
     * 通过六张图片源填充纹理。
     * @param 图片源数组。
     */
    setSixSideImageSources(source, premultiplyAlpha = false) {
        var width;
        var height;
        for (var i = 0; i < 6; i++) {
            var img = source[i];
            if (!img) { //TODO:
                console.log("TextureCube: image Source can't be null.");
                return;
            }
            var nextWidth = img.width;
            var nextHeight = img.height;
            if (i > 0) {
                if (width !== nextWidth) {
                    console.log("TextureCube: each side image's width and height must same.");
                    return;
                }
            }
            width = nextWidth;
            height = nextHeight;
            if (width !== height) {
                console.log("TextureCube: each side image's width and height must same.");
                return;
            }
        }
        this._width = width;
        this._height = height;
        var gl = LayaGL.instance;
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        var glFormat = this._getGLFormat();
        if (!Render.isConchApp) {
            (premultiplyAlpha) && (gl.pixelStorei(WebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true));
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFormat, glFormat, WebGLContext.UNSIGNED_BYTE, source[0]); //back
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFormat, glFormat, WebGLContext.UNSIGNED_BYTE, source[1]); //front
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFormat, glFormat, WebGLContext.UNSIGNED_BYTE, source[2]); //right
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFormat, glFormat, WebGLContext.UNSIGNED_BYTE, source[3]); //left
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFormat, glFormat, WebGLContext.UNSIGNED_BYTE, source[4]); //up
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFormat, glFormat, WebGLContext.UNSIGNED_BYTE, source[5]); //down
            (premultiplyAlpha) && (gl.pixelStorei(WebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false));
        }
        else {
            if (premultiplyAlpha == true) {
                for (var j = 0; j < 6; j++)
                    source[j].setPremultiplyAlpha(premultiplyAlpha);
            }
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, WebGLContext.RGBA, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, source[0]); //back
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, WebGLContext.RGBA, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, source[1]); //front
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, WebGLContext.RGBA, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, source[2]); //right
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, WebGLContext.RGBA, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, source[3]); //left
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, WebGLContext.RGBA, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, source[4]); //up
            gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, WebGLContext.RGBA, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, source[5]); //down
        }
        if (this._mipmap && this._isPot(width) && this._isPot(height)) {
            gl.generateMipmap(this._glTextureType);
            this._setGPUMemory(width * height * 4 * (1 + 1 / 3) * 6);
        }
        else {
            this._setGPUMemory(width * height * 4 * 6);
        }
        this._setWarpMode(WebGLContext.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(WebGLContext.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        this._readyed = true;
        this._activeResource();
    }
    /**
     * 通过六张图片源填充纹理。
     * @param 图片源数组。
     */
    setSixSidePixels(width, height, pixels) {
        if (width <= 0 || height <= 0)
            throw new Error("TextureCube:width or height must large than 0.");
        if (!pixels)
            throw new Error("TextureCube:pixels can't be null.");
        this._width = width;
        this._height = height;
        var gl = LayaGL.instance;
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        var glFormat = this._getGLFormat();
        gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFormat, width, height, 0, glFormat, WebGLContext.UNSIGNED_BYTE, pixels[0]); //back
        gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFormat, width, height, 0, glFormat, WebGLContext.UNSIGNED_BYTE, pixels[1]); //front
        gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFormat, width, height, 0, glFormat, WebGLContext.UNSIGNED_BYTE, pixels[2]); //right
        gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFormat, width, height, 0, glFormat, WebGLContext.UNSIGNED_BYTE, pixels[3]); //left
        gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFormat, width, height, 0, glFormat, WebGLContext.UNSIGNED_BYTE, pixels[4]); //up
        gl.texImage2D(WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFormat, width, height, 0, glFormat, WebGLContext.UNSIGNED_BYTE, pixels[5]); //down
        if (this._mipmap && this._isPot(width) && this._isPot(height)) {
            gl.generateMipmap(this._glTextureType);
            this._setGPUMemory(width * height * 4 * (1 + 1 / 3) * 6);
        }
        else {
            this._setGPUMemory(width * height * 4 * 6);
        }
        this._setWarpMode(WebGLContext.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(WebGLContext.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        this._readyed = true;
        this._activeResource();
    }
    /**
     * @inheritDoc
     */
    /*override*/ _recoverResource() {
        //TODO:补充
    }
}
/**TextureCube资源。*/
TextureCube.TEXTURECUBE = "TEXTURECUBE";
