import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { NodeFlags } from "../Const";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Sprite } from "../display/Sprite";
import { SpriteConst } from "../display/SpriteConst";
import { SpriteStyle } from "../display/css/SpriteStyle";
import { Filter } from "../filters/Filter";
import { Matrix } from "../maths/Matrix";
import { Rectangle } from "../maths/Rectangle";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Texture } from "../resource/Texture";
import { WebGLRTMgr } from "../resource/WebGLRTMgr";
import { HitArea } from "../utils/HitArea";
import { Stat } from "../utils/Stat";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { MeshQuadTexture } from "../webgl/utils/MeshQuadTexture";
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

let _quadMesh: MeshQuadTexture;
let _quadMeshVB:Float32Array;
function _fillQuad(x:number, y:number, w:number, h:number){
    let rectVB = _quadMeshVB;
    let stridef32 = _quadMesh.vertexDeclarition.vertexStride/4;
    rectVB[0          ]= x;   rectVB[1            ]= y; 
    rectVB[stridef32  ]= x+w; rectVB[stridef32+1  ]= y;
    rectVB[stridef32*2]= x+w; rectVB[stridef32*2+1]= y+h;
    rectVB[stridef32*3]= y;   rectVB[stridef32*3+1]= y+h;
}

const INIT = 0x11111;
/**
 * @private
 * 精灵渲染器
 */
export class RenderSprite {
    /** @private*/
    static cacheNormalEnable=true;
    /** @private */
    static renders: RenderSprite[] = [];
    /** @private */
    protected static NORENDER: RenderSprite = new RenderSprite(0, null);
    /** @internal */
    _next: RenderSprite;
    /** @internal */
    _fun: (sp:Sprite, ctx:Context, x:number, y:number)=>void;

    /** @internal */
    static __init__(): void {
        _quadMesh = new MeshQuadTexture();
        _quadMesh.addQuad([0,0,1,0,1,1,0,1],[0,0,1,0,1,1,0,1],0xffffffff,true);
        _quadMeshVB = new Float32Array(_quadMesh.vbBuffer);
        
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
                this._fun = Filter._filter;
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

        if (sprite._getBit(NodeFlags.DISABLE_INNER_CLIPPING)) {
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
        if (sprite.hitArea) {
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
    _renderNextToCacheRT(sprite:Sprite,context:Context){
        var _cacheStyle = sprite._cacheStyle;
        if (sprite._needRepaint() || !_cacheStyle.renderTexture || ILaya.stage.isGlobalRepaint()) {
            if(_cacheStyle.renderTexture){
                _cacheStyle.renderTexture.destroy();//TODO 优化， 如果大小相同，可以重复利用
            }
            //如果需要构造RenderTexture
            // 先计算需要的texuture的大小。
            let scaleInfo = sprite._cacheStyle._calculateCacheRect(sprite, "bitmap"/*sprite._cacheStyle.cacheAs*/, 0, 0);
            let tRec = _cacheStyle.cacheRect;
            if(tRec.width<=0||tRec.height<=0)
                return false;
            //计算cache画布的大小
            Stat.canvasBitmap++;

            let w = tRec.width * scaleInfo.x;  //,
            let h = tRec.height * scaleInfo.y;
            let rt = new RenderTexture2D(w,h,RenderTargetFormat.R8G8B8A8);
            let ctx = new Context();
            ctx.copyState(context);
            ctx.size(w,h);
            ctx.render2D=new Render2DSimple(rt);
            ctx.startRender();
            /*
                由于tRec与rt的原点并不重合：
                1. 图集中的小图可能有被裁掉的空白，这时候tRec.x>0 ，rt的原点就在节点原点的右边
                2. 节点下的子可能在负的位置渲染，这时候rt的原点就在原点的左边
                所以为了rt能正确的包含节点的渲染效果，应该偏移一下节点再渲染，具体就是取节点在rt坐标系下的值
                当使用这个rt的时候，要反向偏移，即偏移rt在节点坐标系下的值
            */
            this._next._fun(sprite,ctx,-tRec.x, -tRec.y);
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

        if ( _cacheStyle.mask && _cacheStyle.mask._getBit(NodeFlags.DISABLE_VISIBILITY)) {
            //虽然有mask但是mask不可见，则不走这个流程。
            _next._fun.call(_next, sprite, context, x, y);
            return;
        }

        let isbmp = sprite.cacheAs === 'bitmap';
        if(isbmp){
            //temp
            this._renderNextToCacheRT(sprite,context);
            // RenderSprite.RenderToCacheTexture(sprite,context,x,y)
            var tRec = _cacheStyle.cacheRect;
            context.material = sprite.graphics.material;
            let rt = _cacheStyle.renderTexture;
            rt && context._drawRenderTexture(rt,x+tRec.x , y+tRec.y , rt.width, rt.height,null,1,[0,1, 1,1, 1,0, 0,0]);
        }else{
            if(!RenderSprite.cacheNormalEnable){
                _next._fun.call(_next, sprite, context, x, y);
                return;
            }else{
                let normalCacheRender = new SpriteCache();
                normalCacheRender.renderCacheAsNormal(context,sprite,this._next,x,y);
            }

            // if (sprite._needRepaint() || !_cacheStyle.canvas || textNeedRestore || ILaya.stage.isGlobalRepaint()) {
            //     if (_cacheStyle.cacheAs === 'normal') {
            //         this._canvas_webgl_normal_repaint(sprite, context);
            //     } else {
            //         this._canvas_repaint(sprite, context, x, y);
            //     }
            // }
            // var tRec = _cacheStyle.cacheRect;
            // context.material = sprite.graphics.material;
            //context.drawCanvas(_cacheStyle.canvas, x + tRec.x, y + tRec.y, tRec.width, tRec.height);
        }
    }

    static RenderToRenderTexture(sprite:Sprite,context:Context|null, x:number, y:number, renderTexture:RenderTexture2D=null){
        //如果需要构造RenderTexture
        // 先计算需要的texuture的大小。
        let scaleInfo = sprite._cacheStyle._calculateCacheRect(sprite, "bitmap"/*sprite._cacheStyle.cacheAs*/, 0, 0);
        let tRec = sprite._cacheStyle.cacheRect;
        let ctx = new Context();
        context && ctx.copyState(context);
        let rt = renderTexture;
        if(rt){
            ctx.size(rt.width,rt.height);
        }else{
            //计算cache画布的大小
            let w = tRec.width * scaleInfo.x;
            let h = tRec.height * scaleInfo.y;
            rt = new RenderTexture2D(w,h,RenderTargetFormat.R8G8B8A8);            
            ctx.size(w,h);
        }
        ctx.render2D= ctx.render2D.clone(rt);
        ctx.startRender();
        //把位置移到0，所以要-sprite.xy, 考虑图集空白，所以要-tRec.xy,因为tRec.xy是sprite空间的，所以转到贴图空间是取反
        sprite.render(ctx,x-sprite.x-tRec.x,y-sprite.y-tRec.y);
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
    static RenderToCacheTexture(sprite:Sprite,context:Context|null, x:number, y:number){
        var _cacheStyle = sprite._cacheStyle;
        if (sprite._needRepaint() || !_cacheStyle.renderTexture || ILaya.stage.isGlobalRepaint()) {
            if(_cacheStyle.renderTexture){
                _cacheStyle.renderTexture.destroy();//TODO 优化， 如果大小相同，可以重复利用
            }
            _cacheStyle.renderTexture = RenderSprite.RenderToRenderTexture(sprite,context,x,y);
            return true;    //重绘
        }
        return false;
    }

    /**@internal */
    _canvas_repaint(sprite: Sprite, context: Context, x: number, y: number): void {
        // var _cacheStyle = sprite._cacheStyle;
        // var _next = this._next;
        // var tx: Context;
        // var canvas = _cacheStyle.canvas;
        // var left: number;
        // var top: number;
        // var tRec: Rectangle;
        // var tCacheType = _cacheStyle.cacheAs;

        // var w: number, h: number;
        // var scaleX: number, scaleY: number;

        // var scaleInfo = _cacheStyle._calculateCacheRect(sprite, tCacheType, x, y);
        // scaleX = scaleInfo.x;
        // scaleY = scaleInfo.y;

        // //显示对象实际的绘图区域
        // tRec = _cacheStyle.cacheRect;

        // //计算cache画布的大小
        // w = tRec.width * scaleX;
        // h = tRec.height * scaleY;
        // left = tRec.x;
        // top = tRec.y;
        // if (!canvas) {
        //     _cacheStyle.createContext();
        //     canvas = _cacheStyle.canvas;
        // }
        // tx = canvas.context;

        // tx.sprite = sprite;

        // (canvas.width != w || canvas.height != h) && canvas.size(w, h);//asbitmap需要合理的大小，所以size放到前面

        // //清理画布。之前记录的submit会被全部清掉
        // tx.clear();

        // //TODO:测试webgl下是否有缓存模糊
        // if (scaleX != 1 || scaleY != 1) {
        //     var ctx: any = tx;
        //     ctx.save();
        //     ctx.scale(scaleX, scaleY);
        //     _next._fun.call(_next, sprite, tx, -left, -top);
        //     ctx.restore();
        //     sprite._applyFilters();
        // } else {
        //     ctx = tx;
        //     _next._fun.call(_next, sprite, tx, -left, -top);
        //     sprite._applyFilters();
        // }

        // if (_cacheStyle.staticCache) _cacheStyle.reCache = false;
        // Stat.canvasReCache++;
    }

    /**@internal */
    _canvas_webgl_normal_repaint(sprite: Sprite, context: Context): void {

        // var _cacheStyle: CacheStyle = sprite._cacheStyle;
        // var _next: RenderSprite = this._next;
        // var canvas: WebGLCacheAsNormalCanvas = _cacheStyle.canvas as unknown as WebGLCacheAsNormalCanvas;

        // var tCacheType: string = _cacheStyle.cacheAs;
        // _cacheStyle._calculateCacheRect(sprite, tCacheType, 0, 0);

        // if (!canvas) {
        //     canvas = new WebGLCacheAsNormalCanvas(context, sprite);
        //     _cacheStyle.canvas = ((canvas as any) as HTMLCanvas);
        // }
        // var tx: Context = canvas.context as Context;


        // canvas.startRec();
        // _next._fun.call(_next, sprite, tx, sprite.pivotX, sprite.pivotY);	// 由于后面的渲染会减去pivot，而cacheas normal并不希望这样，只希望创建一个原始的图像。所以在这里补偿。
        // sprite._applyFilters();

        // Stat.canvasReCache++;
        // canvas.endRec();

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

    _mask(sprite: Sprite, ctx: Context, x: number, y: number): void {
        let cache = sprite._getCacheStyle();
        let rtx = 0;  //贴图显示偏移。由于裁剪等导致的，贴图不在原点
        let rty = 0;
        //在sprite上缓存两个rt是为了优化当自己不变，mask变了的情况。
        //上面的不对，由于mask必须是sprite的子，因此mask变了必然导致sprite的重绘，所以就不缓存多个rt了
        if (sprite._needRepaint() || !cache.renderTexture || cache.renderTexture.destroyed || ILaya.stage.isGlobalRepaint()) {
            if (cache.renderTexture) {
                cache.renderTexture.destroy();//TODO 优化， 如果大小相同，可以重复利用
            }
            //如果需要构造RenderTexture
            // 先计算需要的texuture的大小。此时不要扩展rect，直接取实际的
            sprite._cacheStyle._calculateCacheRect(sprite, "bitmap", 0, 0);
            let spRect = cache.cacheRect;
            if (spRect.width <= 0 || spRect.height <= 0)
                return;
            //计算cache画布的大小

            //mask的大小
            let mask = sprite.mask;
            //TODO mask如果非常简单，就不要先渲染到texture上
            //mask是sprite的子，因此，计算包围盒用相对位置就行
            let maskcache = mask._getCacheStyle();
            maskcache._calculateCacheRect(mask, "bitmap", 0, 0);  //后面的参数传入mask.xy没有效果，只能自己单独加上
            let maskRect = maskcache.cacheRect;

            //计算两个rect的交集作为渲染区域
            let x1 = Math.max(spRect.x, maskRect.x + mask.x);
            let y1 = Math.max(spRect.y, maskRect.y + mask.y);
            let x2 = Math.min(spRect.x + spRect.width, mask.x + maskRect.x + maskRect.width);
            let y2 = Math.min(spRect.y + spRect.height, mask.y + maskRect.y + maskRect.height);

            let width1 = x2 - x1; if (width1 <= 0) return;
            let height1 = y2 - y1; if (height1 <= 0) return;

            //先渲染mask，避免rt混乱的可能性。这里的ctx目前只是用来恢复rt的
            if (RenderSprite.RenderToCacheTexture(mask, ctx, 0, 0)) {
            }

            rtx = x1; rty = y1;
            let rt = new RenderTexture2D(width1, height1, RenderTargetFormat.R8G8B8A8);
            let ctx1 = new Context();
            ctx1.size(width1, height1);
            ctx1.render2D = new Render2DSimple(rt);
            ctx1.startRender();
            //渲染节点本身.由于spRect.xy是指贴图相对于节点的位置，所以需要取反表示在贴图空间的什么位置画出节点
            this._next._fun(sprite, ctx1, -x1, -y1);
            let maskRT = maskcache.renderTexture;
            ctx1.globalCompositeOperation = 'mask';
            ctx1._drawRenderTexture(maskRT,
                mask.x - x1 + maskRect.x,     //x1作为原点，所以减去x1,然后加空白
                mask.y - y1 + maskRect.y,
                maskRect.width, maskRect.height, null, 1,
                [0, 1, 1, 1, 1, 0, 0, 0])

            ctx1.endRender();
            //临时，恢复
            ctx1.render2D.setRenderTarget(ctx.render2D.out);

            cache.renderTexture = rt;
            cache.cacheRect.x = x1; cache.cacheRect.y = y1;
            cache.cacheRect.width = rt.width;
            cache.cacheRect.height = rt.height;
        }

        let tex = cache.renderTexture;
        let rect = cache.cacheRect;
        ctx._drawRenderTexture(tex,
            x + rect.x, y + rect.y, tex.width, tex.height, null, 1, [0, 1, 1, 1, 1, 0, 0, 0])

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
        // rt.start();
        // rt.clear(0, 0, 0, 0);
    }

    static recycleTarget(rt: RenderTexture2D): void {
        WebGLRTMgr.releaseRT(rt);
    }

    static setBlendMode(blendMode: string): void {
        BlendMode.targetFns[BlendMode.TOINT[blendMode]]();
    }
}

