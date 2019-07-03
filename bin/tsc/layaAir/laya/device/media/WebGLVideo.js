import { HtmlVideo } from "./HtmlVideo";
import { WebGLContext } from "../../webgl/WebGLContext";
import { ILaya } from "../../../ILaya";
/**
 * @internal
 */
export class WebGLVideo extends HtmlVideo {
    constructor() {
        super();
        if (!ILaya.Render.isConchApp && ILaya.Browser.onIPhone)
            return;
        this.gl = ILaya.Render.isConchApp ? window.LayaGLContext.instance : WebGLContext.mainContext;
        this._source = this.gl.createTexture();
        //preTarget = WebGLContext.curBindTexTarget; 
        //preTexture = WebGLContext.curBindTexValue;
        WebGLContext.bindTexture(this.gl, WebGL2RenderingContext.TEXTURE_2D, this._source);
        this.gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
        this.gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
        this.gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
        this.gl.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        WebGLContext.bindTexture(this.gl, WebGL2RenderingContext.TEXTURE_2D, null);
        //(preTarget && preTexture) && (WebGLContext.bindTexture(gl, preTarget, preTexture));
    }
    updateTexture() {
        if (!ILaya.Render.isConchApp && ILaya.Browser.onIPhone)
            return;
        WebGLContext.bindTexture(this.gl, WebGL2RenderingContext.TEXTURE_2D, this._source);
        this.gl.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGB, WebGL2RenderingContext.RGB, WebGL2RenderingContext.UNSIGNED_BYTE, this.video);
        WebGLVideo.curBindSource = this._source;
    }
    get _glTexture() {
        return this._source;
    }
    /*override*/ destroy() {
        if (this._source) {
            this.gl = ILaya.Render.isConchApp ? window.LayaGLContext.instance : WebGLContext.mainContext;
            if (WebGLVideo.curBindSource == this._source) {
                WebGLContext.bindTexture(this.gl, WebGL2RenderingContext.TEXTURE_2D, null);
                WebGLVideo.curBindSource = null;
            }
            this.gl.deleteTexture(this._source);
        }
        super.destroy();
    }
}
