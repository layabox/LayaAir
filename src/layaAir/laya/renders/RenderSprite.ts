import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { NodeFlags } from "../Const";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Sprite } from "../display/Sprite";
import { SpriteConst } from "../display/SpriteConst";
import { SpriteStyle } from "../display/css/SpriteStyle";
import { Filter } from "../filters/Filter";
import { Rectangle } from "../maths/Rectangle";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { HitArea } from "../utils/HitArea";
import { Stat } from "../utils/Stat";
import { Context } from "./Context";
import { LayaGLQuickRunner } from "./LayaGLQuickRunner";
import { Render2DSimple } from "./Render2D";
import { SpriteCache } from "./SpriteCache";

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
    /** @private*/
    static cacheNormalEnable = true;
    /** @private */
    static renders: RenderSprite[] = [];
    /** @private */
    protected static NORENDER = new RenderSprite(0, null);
    /** @internal */
    _next: RenderSprite;
    /** @internal */
    _fun: (sp: Sprite, ctx: Context, x: number, y: number) => void;

    /** @internal */
    static __init__(): void {
        LayaGLQuickRunner.__init__();
        var initRender = new RenderSprite(INIT, null);
        //总共的组合数量
        let len = RenderSprite.renders.length = SpriteConst.CHILDS * 2;
        for (let i = 0; i < len; i++)
            RenderSprite.renders[i] = initRender;

        RenderSprite.renders[0] = new RenderSprite(0, null);
    }

    //初始化，这个函数是一个引导函数，主要是用来构建每个type对应的函数链
    private static _initRenderFun(sprite: Sprite, context: Context, x: number, y: number): void {
        var type = sprite._renderType;
        var r = RenderSprite.renders[type] = RenderSprite._getTypeRender(type);
        r._fun(sprite, context, x, y);
    }

    private static _getTypeRender(type: number): RenderSprite {
        if (LayaGLQuickRunner.map[type] && LayaEnv.isPlaying) return new RenderSprite(type, null);
        var rst: RenderSprite | null = null;
        var tType = SpriteConst.CHILDS;
        while (tType > 0) {
            if (tType & type)
                rst = new RenderSprite(tType, rst);
            tType = tType >> 1;
        }
        return rst;
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
                this._fun = this._mask;
                return;
            case SpriteConst.CLIP:
                this._fun = this._clip;
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
                this._fun = Filter._filter;
                return;
            case SpriteConst.HITAREA:
                this._fun = this._hitarea;
                return;
            case SpriteConst.RENDERNODE2D:
                this._fun = this._renderNode2D;
                break;
            case INIT:
                this._fun = RenderSprite._initRenderFun;
                return;
        }
    }

    _renderNode2D(sprite: Sprite, context: Context, x: number, y: number): void {

        if (sprite._renderNode.addCMDCall)
            sprite._renderNode.addCMDCall(context, x, y);
        
        context.drawLeftData();//强制渲染之前的遗留
        if (context._render2DManager._renderEnd) {
            context._render2DManager._renderEnd = false;
            context._render2DManager.addRenderObject(sprite._renderNode);
        }else{
            context._render2DManager.addRenderObject(sprite._renderNode);
        }
        
        if (this._next != RenderSprite.NORENDER)
            this._next._fun(sprite, context, x, y);
    }

    /**@internal */
    _no(sprite: Sprite, context: Context, x: number, y: number): void {
    }

    /**@internal */
    _custom(sprite: Sprite, context: Context, x: number, y: number): void {
        sprite.customRender(context, x, y);
        this._next._fun(sprite, context, 0, 0);
    }

    /**@internal */
    _clip(sprite: Sprite, context: Context, x: number, y: number): void {
        let next = this._next;
        if (next == RenderSprite.NORENDER) return;

        if (sprite._getBit(NodeFlags.DISABLE_INNER_CLIPPING)) {
            next._fun(sprite, context, x, y);
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
        next._fun(sprite, context, x - r.x, y - r.y);
        context.restore();
    }

    /**@internal */
    _texture(sprite: Sprite, context: Context, x: number, y: number): void {
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR)) {
            var tex = sprite.texture;
            if (tex._getSource()) {
                var width = sprite._isWidthSet ? sprite._width : tex.sourceWidth;
                var height = sprite._isHeightSet ? sprite._height : tex.sourceHeight;
                var wRate = width / tex.sourceWidth;
                var hRate = height / tex.sourceHeight;
                width = tex.width * wRate;
                height = tex.height * hRate;
                if (width > 0 && height > 0) {
                    let px = x - sprite.pivotX + tex.offsetX * wRate;
                    let py = y - sprite.pivotY + tex.offsetY * hRate;
                    context._material = sprite.graphics.material;
                    context.drawTexture(tex, px, py, width, height, 0xffffffff);
                    context._material = null;
                }
            }
        }
        if (this._next != RenderSprite.NORENDER)
            this._next._fun(sprite, context, x, y);
    }

    /**@internal */
    _graphics(sprite: Sprite, context: Context, x: number, y: number): void {
        if (!sprite._getBit(NodeFlags.HIDE_BY_EDITOR)) {
            let style = sprite._style;
            let g = sprite._graphics;
            g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
        }

        if (this._next != RenderSprite.NORENDER)
            this._next._fun(sprite, context, x, y);
    }

    /**@internal IDE only*/
    _hitarea(sprite: Sprite, context: Context, x: number, y: number): void {
        if (sprite.hitArea) {
            var style = sprite._style;
            var g = (<HitArea>sprite.hitArea)._hit;
            var temp = context.globalAlpha;
            context.globalAlpha *= 0.5;
            g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
            g = (<HitArea>sprite.hitArea)._unHit;
            g && g._render(sprite, context, x - style.pivotX, y - style.pivotY);
            context.globalAlpha = temp;
        }
        if (this._next != RenderSprite.NORENDER)
            this._next._fun(sprite, context, x, y);
    }

    /**@internal */
    _alpha(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        var alpha = style.alpha;
        if (alpha > 0.01 || sprite._needRepaint()) {
            //save alpha to temp
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            if (this._next != RenderSprite.NORENDER)
                this._next._fun(sprite, context, x, y);
            //restore alpha
            context.globalAlpha = temp;
        }
    }

    /**@internal */
    _transform(sprite: Sprite, context: Context, x: number, y: number): void {
        var transform = sprite.transform, _next = this._next;
        if (transform && _next != RenderSprite.NORENDER) {
            context.save();
            context.transform(transform.a, transform.b, transform.c, transform.d, transform.tx + x, transform.ty + y);
            _next._fun(sprite, context, 0, 0);
            context.restore();
        } else {
            if (_next != RenderSprite.NORENDER)
                _next._fun(sprite, context, x, y);
        }
    }

    /**@internal */
    _children(sprite: Sprite, context: Context, x: number, y: number): void {
        let style: SpriteStyle = sprite._style;
        let childs = <Sprite[]>sprite._children, n = childs.length;
        x = x - sprite.pivotX;
        y = y - sprite.pivotY;
        let textLastRender: boolean = sprite._getBit(NodeFlags.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
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
            let visFlag = ele._visible || ele._getBit(NodeFlags.DISABLE_VISIBILITY);
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

    /**
     * 把sprite的下一步渲染到缓存的rt上
     * 要求外面可以直接使用，不用考虑图集的偏移之类的问题
     * @param sprite 
     * @param context 
     * @returns 
     */
    _renderNextToCacheRT(sprite: Sprite, context: Context) {
        var _cacheStyle = sprite._getCacheStyle();
        if (sprite._needRepaint() || !_cacheStyle.renderTexture || ILaya.stage.isGlobalRepaint()) {
            if (_cacheStyle.renderTexture) {
                _cacheStyle.renderTexture.destroy();//TODO 优化， 如果大小相同，可以重复利用
            }
            //如果需要构造RenderTexture
            // 先计算需要的texuture的大小。
            let scaleInfo = sprite._cacheStyle._calculateCacheRect(sprite, "bitmap"/*sprite._cacheStyle.cacheAs*/, 0, 0);
            let tRec = _cacheStyle.cacheRect;
            if (tRec.width <= 0 || tRec.height <= 0)
                return false;
            //计算cache画布的大小
            Stat.canvasBitmap++;

            let w = tRec.width * scaleInfo.x;  //,
            let h = tRec.height * scaleInfo.y;
            let rt = new RenderTexture2D(w, h, RenderTargetFormat.R8G8B8A8);
            let ctx = new Context();
            ctx.copyState(context);
            ctx.size(w, h);
            ctx.render2D = new Render2DSimple(rt);
            ctx.startRender();
            /*
                由于tRec与rt的原点并不重合：
                1. 图集中的小图可能有被裁掉的空白，这时候tRec.x>0 ，rt的原点就在节点原点的右边
                2. 节点下的子可能在负的位置渲染，这时候rt的原点就在原点的左边
                所以为了rt能正确的包含节点的渲染效果，应该偏移一下节点再渲染，具体就是取节点在rt坐标系下的值
                当使用这个rt的时候，要反向偏移，即偏移rt在节点坐标系下的值
            */
            this._next._fun(sprite, ctx, -tRec.x, -tRec.y);
            ctx.endRender();
            //临时，恢复
            ctx.render2D.setRenderTarget(context.render2D.out);
            _cacheStyle.renderTexture = rt;
            return true;    //重绘
        }
        return false;
    }

    /**@internal */
    _canvas(sprite: Sprite, context: Context, x: number, y: number): void {
        var _cacheStyle = sprite._cacheStyle;
        var _next = this._next;

        if (_cacheStyle.mask && _cacheStyle.mask._getBit(NodeFlags.DISABLE_VISIBILITY)) {
            //虽然有mask但是mask不可见，则不走这个流程。
            _next._fun(sprite, context, x, y);
            return;
        }

        let isbmp = sprite.cacheAs === 'bitmap';
        if (isbmp) {
            //temp
            context.drawLeftData();
            this._renderNextToCacheRT(sprite, context);
            // RenderSprite.RenderToCacheTexture(sprite,context,x,y)
            var tRec = _cacheStyle.cacheRect;
            context._material = sprite.graphics.material;
            let rt = _cacheStyle.renderTexture;
            rt && context._drawRenderTexture(rt, x + tRec.x, y + tRec.y, rt.width, rt.height, null, 1, [0, 1, 1, 1, 1, 0, 0, 0]);
            context._material = null;
        } else {
            if (!RenderSprite.cacheNormalEnable) {
                _next._fun(sprite, context, x, y);
                return;
            } else {
                context.drawLeftData();
                SpriteCache.renderCacheAsNormal(context, sprite, this._next, x, y);
            }
        }
    }

    static RenderToRenderTexture(sprite: Sprite, context: Context | null, x: number, y: number, renderTexture: RenderTexture2D = null) {
        //如果需要构造RenderTexture
        // 先计算需要的texuture的大小。
        let scaleInfo = sprite._getCacheStyle()._calculateCacheRect(sprite, "bitmap"/*sprite._cacheStyle.cacheAs*/, 0, 0);
        let tRec = sprite._cacheStyle.cacheRect;
        let ctx = new Context();
        context && ctx.copyState(context);
        let rt = renderTexture;
        if (rt) {
            ctx.size(rt.width, rt.height);
            ctx.clearBG(RenderTexture2D._clearColor.r, RenderTexture2D._clearColor.g, RenderTexture2D._clearColor.b, RenderTexture2D._clearColor.a);
        } else {
            //计算cache画布的大小
            let w = tRec.width * scaleInfo.x;
            let h = tRec.height * scaleInfo.y;
            rt = new RenderTexture2D(w, h, RenderTargetFormat.R8G8B8A8);
            ctx.size(w, h);
            ctx.clearBG(0, 0, 0, 0);
        }
        ctx.render2D = ctx.render2D.clone(rt);

        ctx.startRender();
        //把位置移到0，所以要-sprite.xy, 考虑图集空白，所以要-tRec.xy,因为tRec.xy是sprite空间的，所以转到贴图空间是取反
        sprite.render(ctx, x - sprite.x - tRec.x, y - sprite.y - tRec.y);
        ctx.endRender();
        //临时，恢复
        context && ctx.render2D.setRenderTarget(context.render2D.out);
        return rt;
    }
    /**
     * 把sprite画在当前贴图的x,y位置
     * @param sprite 
     * @param context 
     * @param x 
     * @param y 
     * @returns 
     */
    static RenderToCacheTexture(sprite: Sprite, context: Context | null, x: number, y: number) {
        var _cacheStyle = sprite._getCacheStyle();
        if (sprite._needRepaint() || !_cacheStyle.renderTexture || ILaya.stage.isGlobalRepaint()) {
            if (_cacheStyle.renderTexture) {
                _cacheStyle.renderTexture.destroy();//TODO 优化， 如果大小相同，可以重复利用
            }
            _cacheStyle.renderTexture = RenderSprite.RenderToRenderTexture(sprite, context, x, y);
            return true;    //重绘
        }
        return false;
    }

    /**@internal */
    _blend(sprite: Sprite, context: Context, x: number, y: number): void {
        var style = sprite._style;
        context.save();
        context.globalCompositeOperation = style.blendMode;
        this._next._fun(sprite, context, x, y);
        context.restore();
    }

    //保存rect，避免被修改。例如 RenderSprite.RenderToCacheTexture 会修改cache的rect
    private _spriteRect_TextureSpace=new Rectangle();
    private _maskRect_TextureSpace = new Rectangle();
    _mask(sprite: Sprite, ctx: Context, x: number, y: number): void {
        let cache = sprite._getCacheStyle();
        //由于mask必须是sprite的子，因此mask变了必然导致sprite的重绘，所以就不缓存多个rt了
        if (sprite._needRepaint() || !cache.renderTexture || cache.renderTexture.destroyed || ILaya.stage.isGlobalRepaint()) {
            if (cache.renderTexture) {
                cache.renderTexture.destroy();//TODO 优化， 如果大小相同，可以重复利用
            }

            /**
             * 这里比较绕，需要解释一下
             * 目前的做法是把sprite的rect和mask的rect都转到sprite的原始原点（左上角）空间，这里叫做TextureSpace，简称t空间
             * 然后在t空间做rect交集
             */
            sprite._cacheStyle._calculateCacheRect(sprite, "bitmap", 0, 0);
            let spRect_TS = this._spriteRect_TextureSpace.copyFrom(cache.cacheRect);
            if (spRect_TS.width <= 0 || spRect_TS.height <= 0)
                return;
            //转到sprite的原始空间
            spRect_TS.x+=sprite.pivotX;
            spRect_TS.y+=sprite.pivotY;            
            
            //这个时候获得的rect是包含pivot的。下面的mask按照规则是作为sprite的子来计算，但是，他的位置是相对于原始位置
            //而不是pivot，所以需要根据mask的pivot调整mask的rect的位置

            let mask = sprite.mask;
            //TODO mask如果非常简单，就不要先渲染到texture上
            let maskcache = mask._getCacheStyle();
            maskcache._calculateCacheRect(mask, "bitmap", 0, 0);  //后面的参数传入mask.xy没有效果，只能后面自己单独加上
            let maskRect_TS = this._maskRect_TextureSpace.copyFrom(maskcache.cacheRect);
            //maskRect是mask自己的,相对于自己的锚点，要转到sprite原始空间
            //把mask的xy应用一下，就是在sprite原始空间（t空间）的位置
            maskRect_TS.x+=mask._x;
            maskRect_TS.y+=mask._y;

            //计算cache画布的大小，就是两个rect的交集，这个交集作为渲染区域。t空间
            let x1 = Math.max(spRect_TS.x, maskRect_TS.x);
            let y1 = Math.max(spRect_TS.y, maskRect_TS.y);
            let x2 = Math.min(spRect_TS.x + spRect_TS.width, maskRect_TS.x + maskRect_TS.width);
            let y2 = Math.min(spRect_TS.y + spRect_TS.height, maskRect_TS.y + maskRect_TS.height);

            let width1 = x2 - x1; 
            let height1 = y2 - y1; 
            if (width1 <= 0||height1<=0) return;

            //先渲染mask，避免rt混乱的可能性。这里的ctx目前只是用来恢复rt的
            RenderSprite.RenderToCacheTexture(mask, ctx, 0, 0);
            let rt = new RenderTexture2D(width1, height1, RenderTargetFormat.R8G8B8A8);
            let ctx1 = new Context();
            ctx1.clearBG(0, 0, 0, 0);
            ctx1.size(width1, height1);
            ctx1.render2D = new Render2DSimple(rt);
            ctx1.startRender();
            //由于是t空间，需要抵消掉pivot的设置（_fun会应用pivot），-x1y1是为了对齐到裁剪的rt
            this._next._fun(sprite, ctx1, sprite.pivotX-x1, sprite.pivotY-y1);
            let maskRT = maskcache.renderTexture;
            ctx1.globalCompositeOperation = 'mask';
            ctx1._drawRenderTexture(maskRT,
                maskRect_TS.x - x1,     //maskRect_TS已经考虑了mask的位置了，所以不要加mask.x。-x1y1是对齐到裁剪rt
                maskRect_TS.y - y1,
                maskRect_TS.width, maskRect_TS.height, null, 1,
                [0, 1, 1, 1, 1, 0, 0, 0])

            ctx1.endRender();
            //临时，恢复
            ctx1.render2D.setRenderTarget(ctx.render2D.out);

            cache.renderTexture = rt;
            cache.cacheRect.x = x1-sprite.pivotX;   //x1是t空间的，要转回sprite空间，所以-pivot
            cache.cacheRect.y = y1-sprite.pivotY;
            cache.cacheRect.width = rt.width;
            cache.cacheRect.height = rt.height;
        }

        let tex = cache.renderTexture;
        let rect = cache.cacheRect;
        ctx._drawRenderTexture(tex,
            x + rect.x, y + rect.y, tex.width, tex.height, null, 1, [0, 1, 1, 1, 1, 0, 0, 0])    
    }
}

