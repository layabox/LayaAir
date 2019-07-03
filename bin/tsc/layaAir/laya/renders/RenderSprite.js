import { Const } from "../Const";
import { SpriteConst } from "../display/SpriteConst";
import { Filter } from "../filters/Filter";
import { Matrix } from "../maths/Matrix";
import { Rectangle } from "../maths/Rectangle";
import { Texture } from "../resource/Texture";
import { WebGLRTMgr } from "../resource/WebGLRTMgr";
import { Stat } from "../utils/Stat";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { WebGLCacheAsNormalCanvas } from "../webgl/canvas/WebGLCacheAsNormalCanvas";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { SubmitCMD } from "../webgl/submit/SubmitCMD";
import { WebGLContext } from "../webgl/WebGLContext";
import { LayaGLQuickRunner } from "./LayaGLQuickRunner";
/**
 * @private
 * 精灵渲染器
 */
export class RenderSprite {
    constructor(type, next) {
        if (LayaGLQuickRunner.map[type]) {
            this._fun = LayaGLQuickRunner.map[type];
            this._next = RenderSprite.NORENDER;
            return;
        }
        this._next = next || RenderSprite.NORENDER;
        switch (type) {
            case 0:
                this._fun = this._no;
                return;
            //case SpriteConst.IMAGE: 
            //_fun = this._image;
            //return;
            case SpriteConst.ALPHA:
                this._fun = this._alpha;
                return;
            case SpriteConst.TRANSFORM:
                this._fun = this._transform;
                return;
            case SpriteConst.BLEND:
                this._fun = this._blend;
                return;
            case SpriteConst.CANVAS:
                this._fun = this._canvas;
                return;
            case SpriteConst.MASK:
                this._fun = this._mask;
                return;
            case SpriteConst.CLIP:
                this._fun = this._clip;
                return;
            case SpriteConst.STYLE:
                this._fun = this._style;
                return;
            case SpriteConst.GRAPHICS:
                this._fun = this._graphics;
                return;
            case SpriteConst.CHILDS:
                this._fun = this._children;
                return;
            case SpriteConst.CUSTOM:
                this._fun = this._custom;
                return;
            case SpriteConst.TEXTURE:
                this._fun = this._texture;
                return;
            //case SpriteConst.IMAGE | SpriteConst.GRAPHICS: 
            //_fun = this._image2;
            //return;
            //case SpriteConst.IMAGE | SpriteConst.TRANSFORM | SpriteConst.GRAPHICS: 
            //_fun = this._image2;
            //return;
            case SpriteConst.FILTERS:
                this._fun = Filter._filter;
                return;
            case RenderSprite.INIT:
                this._fun = RenderSprite._initRenderFun;
                return;
        }
        this.onCreate(type);
    }
    /** @internal */
    static __init__() {
        LayaGLQuickRunner.__init__();
        var i, len;
        var initRender;
        initRender = new RenderSprite(RenderSprite.INIT, null);
        len = RenderSprite.renders.length = SpriteConst.CHILDS * 2;
        for (i = 0; i < len; i++)
            RenderSprite.renders[i] = initRender;
        RenderSprite.renders[0] = new RenderSprite(0, null);
        function _initSame(value, o) {
            var n = 0;
            for (var i = 0; i < value.length; i++) {
                n |= value[i];
                RenderSprite.renders[n] = o;
            }
        }
        //_initSame([SpriteConst.IMAGE, SpriteConst.GRAPHICS, SpriteConst.TRANSFORM, SpriteConst.ALPHA], RunDriver.createRenderSprite(SpriteConst.IMAGE, null));
        //
        //renders[SpriteConst.IMAGE | SpriteConst.GRAPHICS] = RunDriver.createRenderSprite(SpriteConst.IMAGE | SpriteConst.GRAPHICS, null);
        //
        //renders[SpriteConst.IMAGE | SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = RunDriver.createRenderSprite(SpriteConst.IMAGE | SpriteConst.TRANSFORM | SpriteConst.GRAPHICS, null);
    }
    static _initRenderFun(sprite, context, x, y) {
        var type = sprite._renderType;
        var r = RenderSprite.renders[type] = RenderSprite._getTypeRender(type);
        r._fun(sprite, context, x, y);
    }
    static _getTypeRender(type) {
        if (LayaGLQuickRunner.map[type])
            return new RenderSprite(type, null);
        var rst = null;
        var tType = SpriteConst.CHILDS;
        while (tType > 0) {
            if (tType & type)
                rst = new RenderSprite(tType, rst);
            tType = tType >> 1;
        }
        return rst;
    }
    onCreate(type) {
    }
    /**@internal */
    _style(sprite, context, x, y) {
        //现在只有Text会走这里，Html已经不走这里了
        var style = sprite._style;
        if (style.render != null)
            style.render(sprite, context, x, y);
        var next = this._next;
        next._fun.call(next, sprite, context, x, y);
    }
    /**@internal */
    _no(sprite, context, x, y) {
    }
    /**@internal */
    _custom(sprite, context, x, y) {
        sprite.customRender(context, x, y);
        this._next._fun.call(this._next, sprite, context, x - sprite.pivotX, y - sprite.pivotY);
    }
    /**@internal */
    _clip(sprite, context, x, y) {
        var next = this._next;
        if (next == RenderSprite.NORENDER)
            return;
        var r = sprite._style.scrollRect;
        context.save();
        context.clipRect(x, y, r.width, r.height);
        next._fun.call(next, sprite, context, x - r.x, y - r.y);
        context.restore();
    }
    /*
    public function _mask(sprite:Sprite, context:Context, x:Number, y:Number):void {
        var next:RenderSprite = this._next;
        next._fun.call(next, sprite, context, x, y);
        var mask:Sprite = sprite.mask;
        if (mask) {
            context.globalCompositeOperation = "destination-in";
            if (mask.numChildren > 0 || !mask.graphics._isOnlyOne()) {
                mask.cacheAs = "bitmap";
            }
            mask.render(context, x - sprite._style.pivotX, y - sprite._style.pivotY);
        }
        context.globalCompositeOperation = "source-over";
    }
    */
    /**@internal */
    _texture(sprite, context, x, y) {
        var tex = sprite.texture;
        if (tex._getSource())
            context.drawTexture(tex, x - sprite.pivotX + tex.offsetX, y - sprite.pivotY + tex.offsetY, sprite._width || tex.width, sprite._height || tex.height);
        var next = this._next;
        if (next != RenderSprite.NORENDER)
            next._fun.call(next, sprite, context, x, y);
    }
    /**@internal */
    _graphics(sprite, context, x, y) {
        var style = sprite._style;
        var g = sprite._graphics;
        g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
        var next = this._next;
        if (next != RenderSprite.NORENDER)
            next._fun.call(next, sprite, context, x, y);
    }
    /**@internal */
    _image(sprite, context, x, y) {
        var style = sprite._style;
        context.drawTexture2(x, y, style.pivotX, style.pivotY, sprite.transform, sprite._graphics._one);
    }
    /**@internal */
    _image2(sprite, context, x, y) {
        var style = sprite._style;
        context.drawTexture2(x, y, style.pivotX, style.pivotY, sprite.transform, sprite._graphics._one);
    }
    /**@internal */
    //TODO:coverage
    _alpha(sprite, context, x, y) {
        var style = sprite._style;
        var alpha;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            var next = this._next;
            next._fun.call(next, sprite, context, x, y);
            context.globalAlpha = temp;
        }
    }
    /**@internal */
    _transform(sprite, context, x, y) {
        var transform = sprite.transform, _next = this._next;
        var style = sprite._style;
        if (transform && _next != RenderSprite.NORENDER) {
            context.save();
            context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx + x, transform.ty + y);
            _next._fun.call(_next, sprite, context, 0, 0);
            context.restore();
        }
        else {
            if (_next != RenderSprite.NORENDER)
                _next._fun.call(_next, sprite, context, x, y);
        }
    }
    /**@internal */
    _children(sprite, context, x, y) {
        var style = sprite._style;
        var childs = sprite._children, n = childs.length, ele;
        x = x - sprite.pivotX;
        y = y - sprite.pivotY;
        var textLastRender = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
        if (style.viewport) {
            var rect = style.viewport;
            var left = rect.x;
            var top = rect.y;
            var right = rect.right;
            var bottom = rect.bottom;
            var _x, _y;
            for (i = 0; i < n; ++i) {
                if ((ele = childs[i])._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                    ele.render(context, x, y);
                }
            }
        }
        else {
            for (var i = 0; i < n; ++i)
                (ele = childs[i])._visible && ele.render(context, x, y);
        }
        textLastRender && context.drawCallOptimize(false);
    }
    /**@internal */
    _canvas(sprite, context, x, y) {
        var _cacheStyle = sprite._cacheStyle;
        var _next = this._next;
        if (!_cacheStyle.enableCanvasRender) {
            _next._fun.call(_next, sprite, context, x, y);
            return;
        }
        _cacheStyle.cacheAs === 'bitmap' ? (Stat.canvasBitmap++) : (Stat.canvasNormal++);
        //检查保存的文字是否失效了
        var cacheNeedRebuild = false;
        var textNeedRestore = false;
        if (_cacheStyle.canvas) {
            // 检查文字是否被释放了，以及clip是否改变了，需要重新cache了
            var canv = _cacheStyle.canvas;
            var ctx = canv.context;
            var charRIs = canv.touches;
            if (charRIs) {
                for (var ci = 0; ci < charRIs.length; ci++) {
                    if (charRIs[ci].deleted) {
                        textNeedRestore = true;
                        break;
                    }
                }
            }
            cacheNeedRebuild = canv.isCacheValid && !canv.isCacheValid();
        }
        if (sprite._needRepaint() || (!_cacheStyle.canvas) || textNeedRestore || cacheNeedRebuild || window.Laya.stage.isGlobalRepaint()) {
            if (_cacheStyle.cacheAs === 'normal') {
                if (context._targets) { // 如果有target说明父节点已经是一个cacheas bitmap了，就不再走cacheas normal的流程了
                    _next._fun.call(_next, sprite, context, x, y);
                    return; //不再继续
                }
                else {
                    this._canvas_webgl_normal_repaint(sprite, context);
                }
            }
            else {
                this._canvas_repaint(sprite, context, x, y);
            }
        }
        var tRec = _cacheStyle.cacheRect;
        //Stage._dbgSprite.graphics.drawRect(x, y, 30,30, null, 'red');
        context.drawCanvas(_cacheStyle.canvas, x + tRec.x, y + tRec.y, tRec.width, tRec.height);
    }
    /**@internal */
    _canvas_repaint(sprite, context, x, y) {
        var _cacheStyle = sprite._cacheStyle;
        var _next = this._next;
        var tx;
        var canvas = _cacheStyle.canvas;
        var left;
        var top;
        var tRec;
        var tCacheType = _cacheStyle.cacheAs;
        var w, h;
        var scaleX, scaleY;
        var scaleInfo;
        scaleInfo = _cacheStyle._calculateCacheRect(sprite, tCacheType, x, y);
        scaleX = scaleInfo.x;
        scaleY = scaleInfo.y;
        //显示对象实际的绘图区域
        tRec = _cacheStyle.cacheRect;
        //计算cache画布的大小
        w = tRec.width * scaleX;
        h = tRec.height * scaleY;
        left = tRec.x;
        top = tRec.y;
        if (tCacheType === 'bitmap' && (w > 2048 || h > 2048)) {
            console.warn("cache bitmap size larger than 2048,cache ignored");
            _cacheStyle.releaseContext();
            _next._fun.call(_next, sprite, context, x, y);
            return;
        }
        if (!canvas) {
            _cacheStyle.createContext();
            canvas = _cacheStyle.canvas;
        }
        tx = canvas.context;
        //WebGL用
        tx.sprite = sprite;
        (canvas.width != w || canvas.height != h) && canvas.size(w, h); //asbitmap需要合理的大小，所以size放到前面
        if (tCacheType === 'bitmap')
            tx.asBitmap = true;
        else if (tCacheType === 'normal')
            tx.asBitmap = false;
        //清理画布。之前记录的submit会被全部清掉
        tx.clear();
        //TODO:测试webgl下是否有缓存模糊
        if (scaleX != 1 || scaleY != 1) {
            var ctx = tx;
            ctx.save();
            ctx.scale(scaleX, scaleY);
            _next._fun.call(_next, sprite, tx, -left, -top);
            ctx.restore();
            sprite._applyFilters();
        }
        else {
            ctx = tx;
            _next._fun.call(_next, sprite, tx, -left, -top);
            sprite._applyFilters();
        }
        if (_cacheStyle.staticCache)
            _cacheStyle.reCache = false;
        Stat.canvasReCache++;
    }
    /**@internal */
    _canvas_webgl_normal_repaint(sprite, context) {
        var _cacheStyle = sprite._cacheStyle;
        var _next = this._next;
        var canvas = _cacheStyle.canvas;
        var tCacheType = _cacheStyle.cacheAs;
        var scaleInfo = _cacheStyle._calculateCacheRect(sprite, tCacheType, 0, 0);
        if (!canvas) {
            canvas = _cacheStyle.canvas = new WebGLCacheAsNormalCanvas(context, sprite);
        }
        var tx = canvas.context;
        canvas['startRec']();
        _next._fun.call(_next, sprite, tx, sprite.pivotX, sprite.pivotY); // 由于后面的渲染会减去pivot，而cacheas normal并不希望这样，只希望创建一个原始的图像。所以在这里补偿。
        sprite._applyFilters();
        Stat.canvasReCache++;
        canvas['endRec']();
        //context.drawCanvas(canvas, x , y , 1, 1); // 这种情况下宽高没用
    }
    /**@internal */
    _blend(sprite, context, x, y) {
        var style = sprite._style;
        var next = this._next;
        if (style.blendMode) {
            context.save();
            context.globalCompositeOperation = style.blendMode;
            next._fun.call(next, sprite, context, x, y);
            context.restore();
        }
        else {
            next._fun.call(next, sprite, context, x, y);
        }
    }
    /**
     * @internal
     * mask的渲染。 sprite有mask属性的情况下，来渲染这个sprite
     * @param	sprite
     * @param	context
     * @param	x
     * @param	y
     */
    _mask(sprite, context, x, y) {
        var next = this._next;
        var mask = sprite.mask;
        var submitCMD;
        var ctx = context;
        if (mask) {
            ctx.save();
            var preBlendMode = ctx.globalCompositeOperation;
            var tRect = new Rectangle();
            //裁剪范围是根据mask来定的
            tRect.copyFrom(mask.getBounds());
            tRect.width = Math.round(tRect.width);
            tRect.height = Math.round(tRect.height);
            tRect.x = Math.round(tRect.x);
            tRect.y = Math.round(tRect.y);
            if (tRect.width > 0 && tRect.height > 0) {
                var w = tRect.width;
                var h = tRect.height;
                var tmpRT = WebGLRTMgr.getRT(w, h);
                ctx.breakNextMerge();
                //先把mask画到tmpTarget上
                ctx.pushRT();
                ctx.addRenderObject(SubmitCMD.create([ctx, tmpRT, w, h], RenderSprite.tmpTarget, this));
                mask.render(ctx, -tRect.x, -tRect.y);
                ctx.breakNextMerge();
                ctx.popRT();
                //设置裁剪为mask的大小。要考虑pivot。有pivot的话，可能要从负的开始
                ctx.save();
                ctx.clipRect(x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h);
                //画出本节点的内容
                next._fun.call(next, sprite, ctx, x, y);
                ctx.restore();
                //设置混合模式
                preBlendMode = ctx.globalCompositeOperation;
                ctx.addRenderObject(SubmitCMD.create(["mask"], RenderSprite.setBlendMode, this));
                var shaderValue = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
                var uv = Texture.INV_UV;
                //这个地方代码不要删除，为了解决在iphone6-plus上的诡异问题
                //renderTarget + StencilBuffer + renderTargetSize < 32 就会变得超级卡
                //所以增加的限制。王亚伟
                //  180725 本段限制代码已经删除，如果出了问题再找王亚伟
                ctx.drawTarget(tmpRT, x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h, Matrix.TEMP.identity(), shaderValue, uv, 6);
                ctx.addRenderObject(SubmitCMD.create([tmpRT], RenderSprite.recycleTarget, this));
                //恢复混合模式
                ctx.addRenderObject(SubmitCMD.create([preBlendMode], RenderSprite.setBlendMode, this));
            }
            ctx.restore();
        }
        else {
            next._fun.call(next, sprite, context, x, y);
        }
    }
    static tmpTarget(ctx, rt, w, h) {
        rt.start();
        rt.clear(0, 0, 0, 0);
    }
    static recycleTarget(rt) {
        WebGLRTMgr.releaseRT(rt);
    }
    static setBlendMode(blendMode) {
        var gl = WebGLContext.mainContext;
        BlendMode.targetFns[BlendMode.TOINT[blendMode]](gl);
    }
}
/** @private */
//public static const IMAGE:int = 0x01;
/** @private */
//public static const ALPHA:int = 0x02;
/** @private */
//public static const TRANSFORM:int = 0x04;
/** @private */
//public static const BLEND:int = 0x08;
/** @private */
//public static const CANVAS:int = 0x10;
/** @private */
//public static const FILTERS:int = 0x20;
/** @private */
//public static const MASK:int = 0x40;
/** @private */
//public static const CLIP:int = 0x80;
/** @private */
//public static const STYLE:int = 0x100;
/** @private */
//public static const GRAPHICS:int = 0x200;
/** @private */
//public static const CUSTOM:int = 0x400;
/** @private */
//public static const CHILDS:int = 0x800;
/** @internal */
RenderSprite.INIT = 0x11111;
/** @private */
RenderSprite.renders = [];
/** @private */
RenderSprite.NORENDER = new RenderSprite(0, null);
RenderSprite.tempUV = new Array(8);
