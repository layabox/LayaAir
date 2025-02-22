import { NodeFlags } from "../Const";
import { CacheStyle } from "../display/css/CacheStyle";
import { SpriteStyle } from "../display/css/SpriteStyle";
import { Sprite } from "../display/Sprite";
import { SpriteConst } from "../display/SpriteConst";
import { Filter } from "../filters/Filter";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Context } from "../resource/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Texture } from "../resource/Texture";
import { WebGLRTMgr } from "../resource/WebGLRTMgr";
import { Stat } from "../utils/Stat";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { WebGLCacheAsNormalCanvas } from "../webgl/canvas/WebGLCacheAsNormalCanvas";
import { RenderSpriteData, Value2D } from "../webgl/shader/d2/value/Value2D";
import { SubmitCMD } from "../webgl/submit/SubmitCMD";
import { LayaGLQuickRunner } from "./LayaGLQuickRunner";
import { ILaya } from "../../ILaya";
import { NativeFilter } from "../filters/NativeFilter";
import { LayaEnv } from "../../LayaEnv";
import { HitArea } from "../utils/HitArea";

/**
 * @private
 * 
 */
export interface _RenderFunction {
    (sp: Sprite, ctx: Context, x: number, y: number): void;
}

const INIT = 0x11111;
/**
 * @private
 * 精灵渲染器
 */
export class RenderSprite {
    /** @private */
    static renders: RenderSprite[] = [];
    /** @private */
    protected static NORENDER: RenderSprite = new RenderSprite(0, null);
    /** @internal */
    _next: RenderSprite;
    /** @internal */
    _fun: Function;

    /** @internal */
    static __init__(): void {
        LayaGLQuickRunner.__init__();
        var i: number, len: number;
        var initRender: RenderSprite;
        initRender = new RenderSprite(INIT, null);
        len = RenderSprite.renders.length = SpriteConst.CHILDS * 2;
        for (i = 0; i < len; i++)
            RenderSprite.renders[i] = initRender;

        RenderSprite.renders[0] = new RenderSprite(0, null);
    }

    private static _initRenderFun(sprite: Sprite, context: Context, x: number, y: number): void {
        var type: number = sprite._renderType;
        var r: RenderSprite = RenderSprite.renders[type] = RenderSprite._getTypeRender(type);
        r._fun(sprite, context, x, y);
    }

    private static _getTypeRender(type: number): RenderSprite {
        if (LayaGLQuickRunner.map[type] && LayaEnv.isPlaying) return new RenderSprite(type, null);
        var rst: RenderSprite | null = null;
        var tType: number = SpriteConst.CHILDS;
        while (tType > 0) {
            if (tType & type)
                rst = new RenderSprite(tType, rst);
            tType = tType >> 1;
        }
        return rst as RenderSprite;
    }

    constructor(type: number, next: RenderSprite | null) {

        if (LayaGLQuickRunner.map[type] && LayaEnv.isPlaying) {
            this._fun = LayaGLQuickRunner.map[type];
            this._next = RenderSprite.NORENDER;
            return;
        }
        this._next = next || RenderSprite.NORENDER;
        switch (type) {
            case 0:
                this._fun = this._no;
                return;
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
                if (LayaEnv.isConch && !(window as any).conchConfig.conchWebGL) {
                    this._fun = this._maskNative;
                }
                else {
                    this._fun = this._mask;
                }
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
            case SpriteConst.FILTERS:
                if (LayaEnv.isConch && !(window as any).conchConfig.conchWebGL) {
                    this._fun = NativeFilter._filter;
                }
                else {
                    this._fun = Filter._filter;
                }
                return;
            case SpriteConst.HITAREA:
                this._fun = this._hitarea;
                return;
            case INIT:
                this._fun = RenderSprite._initRenderFun;
                return;
        }

        this.onCreate(type);
    }

    protected onCreate(type: number): void {

    }

    /**@internal */
    _style(sprite: Sprite, context: Context, x: number, y: number): void {
        //这里的功能取消了，应该不会走进这里
    }

    /**@internal */
    _no(sprite: Sprite, context: Context, x: number, y: number): void {
    }

    /**@internal */
    _custom(sprite: Sprite, context: Context, x: number, y: number): void {
        sprite.customRender(context, x, y);
        this._next._fun.call(this._next, sprite, context, 0, 0);
    }

    /**@internal */
    _clip(sprite: Sprite, context: Context, x: number, y: number): void {
        let next: RenderSprite = this._next;
        if (next == RenderSprite.NORENDER) return;

        if (sprite._getBit(NodeFlags.DISABLE_INNER_CLIPPING) && !context._drawingToTexture) {
            next._fun.call(next, sprite, context, x, y);
            return;
        }

        let r = sprite._style.scrollRect;
        let width = r.width;
        let height = r.height;
        if (width === 0)
            width = 0.001;
        if (height === 0)
            height = 0.001;
        context.save();
        context.clipRect(x, y, width, height);
        next._fun.call(next, sprite, context, x - r.x, y - r.y);
        context.restore();
    }

    /**@internal */
    _texture(sprite: Sprite, context: Context, x: number, y: number): void {
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR)) {
            var tex: Texture = sprite.texture;
            if (tex._getSource()) {
                var width: number = sprite._isWidthSet ? sprite._width : tex.sourceWidth;
                var height: number = sprite._isHeightSet ? sprite._height : tex.sourceHeight;
                var wRate: number = width / tex.sourceWidth;
                var hRate: number = height / tex.sourceHeight;
                width = tex.width * wRate;
                height = tex.height * hRate;
                if (width > 0 && height > 0) {
                    let px = x - sprite.pivotX + tex.offsetX * wRate;
                    let py = y - sprite.pivotY + tex.offsetY * hRate;
                    context.material = sprite.graphics.material;
                    context.drawTexture(tex, px, py, width, height, 0xffffffff);
                    context.material = null;
                }
            }
        }
        var next: RenderSprite = this._next;
        if (next != RenderSprite.NORENDER)
            next._fun.call(next, sprite, context, x, y);
    }

    /**@internal */
    _graphics(sprite: Sprite, context: Context, x: number, y: number): void {
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR)) {
            var style = sprite._style;
            var g = sprite._graphics;
            g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
        }
        var next = this._next;
        if (next != RenderSprite.NORENDER)
            next._fun.call(next, sprite, context, x, y);
    }

    /**@internal IDE only*/
    _hitarea(sprite: Sprite, context: Context, x: number, y: number): void {
        if (!context._drawingToTexture && sprite.hitArea) {
            var style = sprite._style;
            var g = (<HitArea>sprite.hitArea)._hit;
            var temp: number = context.globalAlpha;
            context.globalAlpha *= 0.5;
            g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
            g = (<HitArea>sprite.hitArea)._unHit;
            g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
            context.globalAlpha = temp;
        }
        var next = this._next;
        if (next != RenderSprite.NORENDER)
            next._fun.call(next, sprite, context, x, y);
    }

    /**@internal */
    //TODO:coverage
    _alpha(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        var alpha: number;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp: number = context.globalAlpha;
            context.globalAlpha *= alpha;
            var next: RenderSprite = this._next;
            next._fun.call(next, sprite, context, x, y);
            context.globalAlpha = temp;
        }
    }

    /**@internal */
    _transform(sprite: Sprite, context: Context, x: number, y: number): void {
        var transform: Matrix = sprite.transform, _next: RenderSprite = this._next;
        if (transform && _next != RenderSprite.NORENDER) {
            context.save();
            context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx + x, transform.ty + y);
            _next._fun.call(_next, sprite, context, 0, 0);
            context.restore();
        } else {
            if (_next != RenderSprite.NORENDER)
                _next._fun.call(_next, sprite, context, x, y);
        }
    }

    /**@internal */
    _children(sprite: Sprite, context: Context, x: number, y: number): void {
        let style: SpriteStyle = sprite._style;
        let childs = <Sprite[]>sprite._children, n: number = childs.length;
        x = x - sprite.pivotX;
        y = y - sprite.pivotY;
        let textLastRender: boolean = sprite._getBit(NodeFlags.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
        let drawingToTexture = context._drawingToTexture;
        let rect: Rectangle;
        let left: number, top: number, right: number, bottom: number, x2: number, y2: number;

        if (style.viewport) {
            rect = style.viewport;
            left = rect.x;
            top = rect.y;
            right = rect.right;
            bottom = rect.bottom;
        }

        for (let i = 0; i < n; ++i) {
            let ele = childs[i];
            let visFlag: boolean;
            if (drawingToTexture)
                visFlag = ele._visible && !ele._getBit(NodeFlags.ESCAPE_DRAWING_TO_TEXTURE);
            else
                visFlag = ele._visible || ele._getBit(NodeFlags.DISABLE_VISIBILITY);
            if (visFlag) {
                if (rect && ((x2 = ele._x) >= right || (x2 + ele.width) <= left || (y2 = ele._y) >= bottom || (y2 + ele.height) <= top))
                    visFlag = false;
                else if (sprite._cacheStyle.mask == ele && !ele._getBit(NodeFlags.DISABLE_VISIBILITY))
                    visFlag = false;
            }

            if (visFlag) {
                if (ele._getBit(NodeFlags.DISABLE_OUTER_CLIPPING))
                    context.clipRect(0, 0, 1, 1, true);

                ele.render(context, x, y);
            }
        }
        textLastRender && context.drawCallOptimize(false);
    }

    /**@internal */
    _canvas(sprite: Sprite, context: Context, x: number, y: number): void {

        var _cacheStyle: CacheStyle = sprite._cacheStyle;
        var _next: RenderSprite = this._next;

        if (!_cacheStyle.enableCanvasRender || !context._drawingToTexture && _cacheStyle.mask && _cacheStyle.mask._getBit(NodeFlags.DISABLE_VISIBILITY)) {
            _next._fun.call(_next, sprite, context, x, y);
            return;
        }
        _cacheStyle.cacheAs === 'bitmap' ? (Stat.canvasBitmap++) : (Stat.canvasNormal++);

        //检查保存的文字是否失效了
        var cacheNeedRebuild: boolean = false;
        var textNeedRestore: boolean = false;

        if (_cacheStyle.canvas) {
            // 检查文字是否被释放了，以及clip是否改变了，需要重新cache了
            var canv: any = _cacheStyle.canvas;
            textNeedRestore = canv.isTextNeedRestore && canv.isTextNeedRestore();
            cacheNeedRebuild = canv.isCacheValid && !canv.isCacheValid();
        }

        if (sprite._needRepaint() || (!_cacheStyle.canvas) || textNeedRestore || cacheNeedRebuild || ILaya.stage.isGlobalRepaint()) {
            if (_cacheStyle.cacheAs === 'normal') {
                if (context._targets) {// 如果有target说明父节点已经是一个cacheas bitmap了，就不再走cacheas normal的流程了
                    _next._fun.call(_next, sprite, context, x, y);
                    return;	//不再继续
                } else {
                    this._canvas_webgl_normal_repaint(sprite, context);
                }
            } else {
                this._canvas_repaint(sprite, context, x, y);
            }
        }
        var tRec: Rectangle = _cacheStyle.cacheRect;
        //Stage._dbgSprite.graphics.drawRect(x, y, 30,30, null, 'red');
        context.material = sprite.graphics.material;
        context.drawCanvas(_cacheStyle.canvas, x + tRec.x, y + tRec.y, tRec.width, tRec.height);
        context.material = null;
    }

    /**@internal */
    _canvas_repaint(sprite: Sprite, context: Context, x: number, y: number): void {

        var _cacheStyle: CacheStyle = sprite._cacheStyle;
        var _next: RenderSprite = this._next;
        var tx: Context;
        var canvas: HTMLCanvas = _cacheStyle.canvas;
        var left: number;
        var top: number;
        var tRec: Rectangle;
        var tCacheType: string = _cacheStyle.cacheAs;

        var w: number, h: number;
        var scaleX: number, scaleY: number;

        var scaleInfo: Point;
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
            console.warn("cache bitmap size larger than 2048, cache ignored");
            _cacheStyle.releaseContext();
            _next._fun.call(_next, sprite, context, x, y);
            return;
        }
        if (!canvas) {
            _cacheStyle.createContext();
            canvas = _cacheStyle.canvas;
        }
        tx = canvas.context as Context;

        //WebGL用
        tx.sprite = sprite;

        (canvas.width != w || canvas.height != h) && canvas.size(w, h);//asbitmap需要合理的大小，所以size放到前面

        if (tCacheType === 'bitmap') tx.asBitmap = true;
        else if (tCacheType === 'normal') tx.asBitmap = false;

        //清理画布。之前记录的submit会被全部清掉
        tx.clear();

        //TODO:测试webgl下是否有缓存模糊
        if (scaleX != 1 || scaleY != 1) {
            var ctx: any = tx;
            ctx.save();
            ctx.scale(scaleX, scaleY);
            _next._fun.call(_next, sprite, tx, -left, -top);
            ctx.restore();
            sprite._applyFilters();
        } else {
            ctx = tx;
            _next._fun.call(_next, sprite, tx, -left, -top);
            sprite._applyFilters();
        }

        if (_cacheStyle.staticCache) _cacheStyle.reCache = false;
        Stat.canvasReCache++;
    }

    /**@internal */
    _canvas_webgl_normal_repaint(sprite: Sprite, context: Context): void {

        var _cacheStyle: CacheStyle = sprite._cacheStyle;
        var _next: RenderSprite = this._next;
        var canvas: WebGLCacheAsNormalCanvas = _cacheStyle.canvas as unknown as WebGLCacheAsNormalCanvas;

        var tCacheType: string = _cacheStyle.cacheAs;
        _cacheStyle._calculateCacheRect(sprite, tCacheType, 0, 0);

        if (!canvas) {
            canvas = new WebGLCacheAsNormalCanvas(context, sprite);
            _cacheStyle.canvas = ((canvas as any) as HTMLCanvas);
        }
        var tx: Context = canvas.context as Context;


        canvas.startRec();
        _next._fun.call(_next, sprite, tx, sprite.pivotX, sprite.pivotY);	// 由于后面的渲染会减去pivot，而cacheas normal并不希望这样，只希望创建一个原始的图像。所以在这里补偿。
        sprite._applyFilters();

        Stat.canvasReCache++;
        canvas.endRec();

        //context.drawCanvas(canvas, x , y , 1, 1); // 这种情况下宽高没用
    }

    /**@internal */
    _blend(sprite: Sprite, context: Context, x: number, y: number): void {
        var style: SpriteStyle = sprite._style;
        var next: RenderSprite = this._next;
        if (style.blendMode) {
            context.save();
            context.globalCompositeOperation = style.blendMode;
            next._fun.call(next, sprite, context, x, y);
            context.restore();
        } else {
            next._fun.call(next, sprite, context, x, y);
        }
    }

    /**
     * @internal
     * mask的渲染。 sprite有mask属性的情况下，来渲染这个sprite
     * @param sprite
     * @param context
     * @param x
     * @param y
     */
    _mask(sprite: Sprite, ctx: Context, x: number, y: number): void {
        let next = this._next;
        let mask = sprite.mask;
        if (mask && (!mask._getBit(NodeFlags.DISABLE_VISIBILITY) || ctx._drawingToTexture)) {
            ctx.save();

            let preBlendMode: string = ctx.globalCompositeOperation;
            let tRect: Rectangle = new Rectangle();
            //裁剪范围是根据mask来定的
            tRect.copyFrom(mask.getBounds());
            // 为什么round
            let w = tRect.width = Math.round(tRect.width);
            let h = tRect.height = Math.round(tRect.height);
            tRect.x = Math.round(tRect.x);
            tRect.y = Math.round(tRect.y);

            if (w > 0 && h > 0) {
                let tmpRT: RenderTexture2D = WebGLRTMgr.getRT(w, h);

                ctx.breakNextMerge();
                //先把mask画到tmpTarget上
                ctx.pushRT();
                ctx.addRenderObject(SubmitCMD.create([ctx, tmpRT, w, h], RenderSprite.tmpTarget, this));
                mask.render(ctx, -tRect.x, -tRect.y);
                ctx.breakNextMerge();
                ctx.popRT();
                //设置裁剪为mask的大小。要考虑pivot。有pivot的话，可能要从负的开始
                ctx.save();

                /**
                 * 有时候会有浮点误差，例如起点在0.5的时候，有的像素中心正好处于边界，可能会出错。
                 * 对于mask来说，一般缩小一点点是没有问题的，所以缩小0.1个像素
                 */
                let shrink = 0.1;
                ctx.clipRect(x + tRect.x - sprite.getStyle().pivotX + shrink, y + tRect.y - sprite.getStyle().pivotY + shrink, w - shrink * 2, h - shrink * 2);
                //ctx.clipRect(x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h);

                //画出本节点的内容
                next._fun.call(next, sprite, ctx, x, y);
                ctx.restore();

                //设置混合模式
                preBlendMode = ctx.globalCompositeOperation;
                ctx.addRenderObject(SubmitCMD.create(["mask"], RenderSprite.setBlendMode, this));

                let shaderValue: Value2D = Value2D.create(RenderSpriteData.Texture2D);
                let uv = Texture.INV_UV;
                //这个地方代码不要删除，为了解决在iphone6-plus上的诡异问题
                //renderTarget + StencilBuffer + renderTargetSize < 32 就会变得超级卡
                //所以增加的限制。王亚伟
                //  180725 本段限制代码已经删除，如果出了问题再找王亚伟

                ctx.drawTarget(tmpRT, x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h, Matrix.TEMP.identity(), shaderValue, uv, 6);
                ctx.addRenderObject(SubmitCMD.create([tmpRT], RenderSprite.recycleTarget, this));
            }

            //恢复混合模式
            ctx.addRenderObject(SubmitCMD.create([preBlendMode], RenderSprite.setBlendMode, this));

            ctx.restore();
        } else {
            next._fun.call(next, sprite, ctx, x, y);
        }

    }
    _maskNative(sprite: Sprite, ctx: Context, x: number, y: number): void {
        var next: RenderSprite = this._next;
        var mask: Sprite = sprite.mask;
        if (mask) {
            ctx.save();
            var preBlendMode: string = ctx.globalCompositeOperation;
            var tRect: Rectangle = new Rectangle();
            //裁剪范围是根据mask来定的
            tRect.copyFrom(mask.getBounds());
            // 为什么round
            let w = tRect.width = Math.round(tRect.width);
            let h = tRect.height = Math.round(tRect.height);
            tRect.x = Math.round(tRect.x);
            tRect.y = Math.round(tRect.y);

            if (w > 0 && h > 0) {
                let tmpRT: any = (ctx as any).drawMask(w, h);
                /*var tmpRT: RenderTexture2D = WebGLRTMgr.getRT(w, h);

                ctx.breakNextMerge();
                //先把mask画到tmpTarget上
                ctx.pushRT();
                ctx.addRenderObject(SubmitCMD.create([ctx, tmpRT, w, h], RenderSprite.tmpTarget, this));*/
                mask.render(ctx, -tRect.x, -tRect.y);
                let shrink = 0.1;
                (ctx as any).drawMasked(x + tRect.x - sprite.getStyle().pivotX + shrink, y + tRect.y - sprite.getStyle().pivotY + shrink, w - shrink * 2, h - shrink * 2);
                //ctx.breakNextMerge();
                //ctx.popRT();
                //设置裁剪为mask的大小。要考虑pivot。有pivot的话，可能要从负的开始
                //ctx.save();

                /**
                 * 有时候会有浮点误差，例如起点在0.5的时候，有的像素中心正好处于边界，可能会出错。
                 * 对于mask来说，一般缩小一点点是没有问题的，所以缩小0.1个像素
                 */
                //let shrink = 0.1;
                //ctx.clipRect(x + tRect.x - sprite.getStyle().pivotX + shrink, y + tRect.y - sprite.getStyle().pivotY + shrink, w-shrink*2, h-shrink*2);
                //ctx.clipRect(x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h);

                //画出本节点的内容
                next._fun.call(next, sprite, ctx, x, y);

                (ctx as any).drawMaskComposite(tmpRT, x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h);
                //ctx.restore();

                //设置混合模式
                //preBlendMode = ctx.globalCompositeOperation;
                //ctx.addRenderObject(SubmitCMD.create(["mask"], RenderSprite.setBlendMode, this));

                //var shaderValue: Value2D = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
                //var uv = Texture.INV_UV;
                //这个地方代码不要删除，为了解决在iphone6-plus上的诡异问题
                //renderTarget + StencilBuffer + renderTargetSize < 32 就会变得超级卡
                //所以增加的限制。王亚伟
                //  180725 本段限制代码已经删除，如果出了问题再找王亚伟

                //ctx.drawTarget(tmpRT, x + tRect.x - sprite.getStyle().pivotX, y + tRect.y - sprite.getStyle().pivotY, w, h, Matrix.TEMP.identity(), shaderValue, uv, 6);
                //ctx.addRenderObject(SubmitCMD.create([tmpRT], RenderSprite.recycleTarget, this));

                //恢复混合模式
                //ctx.addRenderObject(SubmitCMD.create([preBlendMode], RenderSprite.setBlendMode, this));
            }
            ctx.restore();
        } else {
            next._fun.call(next, sprite, ctx, x, y);
        }

    }

    //static tempUV: any[] = new Array(8);
    static tmpTarget(ctx: Context, rt: RenderTexture2D, w: number, h: number): void {
        rt.start();
        rt.clear(0, 0, 0, 0);
    }

    static recycleTarget(rt: RenderTexture2D): void {
        WebGLRTMgr.releaseRT(rt);
    }

    static setBlendMode(blendMode: string): void {
        BlendMode.targetFns[BlendMode.TOINT[blendMode]]();
    }
}

