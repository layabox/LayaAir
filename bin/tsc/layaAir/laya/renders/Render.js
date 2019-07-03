import { ILaya } from "./../../ILaya";
import { Config } from "./../../Config";
import { LayaGL } from "../layagl/LayaGL";
import { Context } from "../resource/Context";
import { WebGL } from "../webgl/WebGL";
import { WebGLContext } from "../webgl/WebGLContext";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { Shader2D } from "../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { Buffer2D } from "../webgl/utils/Buffer2D";
import { SubmitBase } from "../webgl/submit/SubmitBase";
import { LayaGPU } from "../webgl/LayaGPU";
/**
 * <code>Render</code> 是渲染管理类。它是一个单例，可以使用 Laya.render 访问。
 */
export class Render {
    /**
     * 初始化引擎。
     * @param	width 游戏窗口宽度。
     * @param	height	游戏窗口高度。
     */
    constructor(width, height, mainCanv) {
        /**@private */
        this._timeId = 0;
        Render._mainCanvas = mainCanv;
        //创建主画布。改到Browser中了，因为为了runtime，主画布必须是第一个
        Render._mainCanvas.source.id = "layaCanvas";
        Render._mainCanvas.source.width = width;
        Render._mainCanvas.source.height = height;
        if (Render.isConchApp) {
            document.body.appendChild(Render._mainCanvas.source);
        }
        this.initRender(Render._mainCanvas, width, height);
        window.requestAnimationFrame(loop);
        function loop(stamp) {
            ILaya.stage._loop();
            window.requestAnimationFrame(loop);
        }
        ILaya.stage.on("visibilitychange", this, this._onVisibilitychange);
    }
    /**@private */
    _onVisibilitychange() {
        if (!ILaya.stage.isVisibility) {
            this._timeId = window.setInterval(this._enterFrame, 1000);
        }
        else if (this._timeId != 0) {
            window.clearInterval(this._timeId);
        }
    }
    initRender(canvas, w, h) {
        function getWebGLContext(canvas) {
            var gl;
            var names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
            if (!Config.useWebGL2) {
                names.shift();
            }
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = canvas.getContext(names[i], { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer }); //antialias为true,premultipliedAlpha为false,IOS和部分安卓QQ浏览器有黑屏或者白屏底色BUG
                }
                catch (e) {
                }
                if (gl) {
                    (names[i] === 'webgl2') && (WebGL._isWebGL2 = true);
                    new LayaGL();
                    return gl;
                }
            }
            return null;
        }
        var gl = LayaGL.instance = WebGLContext.mainContext = getWebGLContext(Render._mainCanvas.source);
        if (!gl)
            return false;
        LayaGL.instance = gl;
        LayaGL.layaGPUInstance = new LayaGPU(gl, WebGL._isWebGL2);
        canvas.size(w, h); //在ctx之后调用。
        Context.__init__();
        SubmitBase.__init__();
        var ctx = new Context();
        ctx.isMain = true;
        Render._context = ctx;
        canvas._setContext(ctx);
        //TODO 现在有个问题是 gl.deleteTexture并没有走WebGLContex封装的
        ShaderDefines2D.__init__();
        Value2D.__init__();
        Shader2D.__init__();
        Buffer2D.__int__(gl);
        BlendMode._init_(gl);
        return true;
    }
    /**@private */
    _enterFrame(e = null) {
        ILaya.stage._loop();
    }
    /** 目前使用的渲染器。*/
    static get context() {
        return Render._context;
    }
    /** 渲染使用的原生画布引用。 */
    static get canvas() {
        return Render._mainCanvas.source;
    }
}
Render.supportWebGLPlusCulling = false;
Render.supportWebGLPlusAnimation = false;
Render.supportWebGLPlusRendering = false;
/**是否是加速器 只读*/
Render.isConchApp = false;
{
    Render.isConchApp = (window.conch != null);
    if (Render.isConchApp) {
        Render.supportWebGLPlusCulling = true;
        Render.supportWebGLPlusAnimation = true;
        Render.supportWebGLPlusRendering = true;
    }
}
