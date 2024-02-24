import { IFilter } from "./IFilter";
import { Sprite } from "../display/Sprite"
import { Matrix } from "../maths/Matrix"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { RenderSprite } from "../renders/RenderSprite"
import { Context } from "../renders/Context"
import { RenderTexture2D } from "../resource/RenderTexture2D"
import { Texture2D } from "../resource/Texture2D"
import { WebGLRTMgr } from "../resource/WebGLRTMgr"
import { BlendMode } from "../webgl/canvas/BlendMode"
import { RenderSpriteData, Value2D } from "../webgl/shader/d2/value/Value2D"
import { SubmitCMD } from "../webgl/submit/SubmitCMD"
import { ColorFilter } from "./ColorFilter";
import { Render2D } from "../renders/Render2D";
import { MeshQuadTexture } from "../webgl/utils/MeshQuadTexture";

/**
 * <code>Filter</code> 是滤镜基类。滤镜是针对节点的后处理过程，所以必然操作一个rendertexture
 */
export abstract class Filter implements IFilter {
    /**@private 颜色滤镜。*/
    static COLOR = 0x20;
    /** @internal*/
    _glRender: any;

    //结果的原点的位置，如果扩展了，left和top可能是负的
    protected left=0;
    protected top=0;
    //渲染后大小
    protected width=0;
    protected height=0;
    protected texture:RenderTexture2D;  //TODO 创建 优化
    protected _render2D:Render2D;
    protected _rectMesh:MeshQuadTexture;
    protected _rectMeshVB:Float32Array;

    constructor(){
        let rect = this._rectMesh = new MeshQuadTexture();
        rect.addQuad([0,0,1,0,1,1,0,1],[0,1,1,1,1,0,0,0],0xffffffff,true)
        this._rectMeshVB = new Float32Array(rect.vbBuffer);
    }

    set render2D(r:Render2D){
        this._render2D=r;
    }
    /**
     * 不需要位置
     * @param texture 
     * @param width 
     * @param height 
     */
    abstract render(texture:RenderTexture2D, width:number, height:number):void;

    /**@private 滤镜类型。*/
    get type(): number { return -1 }

    static _filter = function (this: RenderSprite, sprite: Sprite, context: Context, x: number, y: number): void {
        var next = this._next;
        if(!next) return;

        var filters = sprite.filters, len = filters.length;
        //如果只有一个滤镜，那么还用原来的方式
        if (len == 1 && (filters[0].type == Filter.COLOR)) {
            context.save();
            context.setColorFilter(filters[0] as ColorFilter);
            next._fun.call(next, sprite, context, x, y);
            context.restore();
            return;
        }

        let cache = sprite._cacheStyle;
        // 先把节点渲染到一个贴图上
        if(RenderSprite.RenderToCacheTexture(sprite,context,x,y)){
            let src = cache.renderTexture;
            let dst = src;
            let width = cache.cacheRect.width;
            let height = cache.cacheRect.height;
            let lastRT = context.render2D.out;
            // 针对这个贴图，依次应用filter
            for (let i = 0; i < len; i++) {
                src = dst;
                var filter = filters[i];
                filter._render2D = context.render2D;
                filter.render(src,width,height);
                width=filter.width;
                height=filter.height;
                dst = filter.texture;
            }
            context.render2D.out=lastRT;
            // 把最终结果保存到cache
            cache.renderTexture = dst;
            cache.renderTexOffx=filters[len-1].top;
            cache.renderTexOffy=filters[len-1].left;
        }
        //直接使用缓存的
        context._drawRenderTexture(cache.renderTexture, 
            x+cache.renderTexOffx, 
            y+cache.renderTexOffy, 
            cache.renderTexture.width, 
            cache.renderTexture.height, 
            Matrix.TEMP.identity(), 1.0, RenderTexture2D.defuv);
        return;

        //思路：依次遍历滤镜，每次滤镜都画到out的RenderTarget上，然后把out画取src的RenderTarget做原图，去叠加新的滤镜
        var svCP = Value2D.create(RenderSpriteData.Texture2D);	//拷贝用shaderValue
        var b: Rectangle;

        var p = Point.TEMP;
        var mat = Matrix.create();
        context._curMat.copyTo(mat);
        var tPadding = 0;	//给glow用
        var tHalfPadding = 0;
        var hasGlowFilter = false;
        //这里判断是否存储了out，如果存储了直接用;
        var source: RenderTexture2D = null;
        var out: RenderTexture2D = sprite._cacheStyle.filterCache || null;
        if (!out || sprite.getRepaint() != 0) {
            hasGlowFilter = false
            //glow需要扩展边缘
            if (hasGlowFilter) {
                tPadding = 50;
                tHalfPadding = 25;
            }
            b = new Rectangle();
            b.copyFrom(sprite.getSelfBounds());
            b.x += sprite.x;
            b.y += sprite.y;
            b.x -= sprite.pivotX + 4;//blur 
            b.y -= sprite.pivotY + 4;//blur
            var tSX = b.x;
            var tSY = b.y;
            //重新计算宽和高
            b.width += (tPadding + 8);//增加宽度 blur  由于blur系数为9
            b.height += (tPadding + 8);//增加高度 blur
            p.x = b.x * mat.a + b.y * mat.c;
            p.y = b.y * mat.d + b.x * mat.b;
            b.x = p.x;
            b.y = p.y;
            p.x = b.width * mat.a + b.height * mat.c;
            p.y = b.height * mat.d + b.width * mat.b;
            b.width = p.x;
            b.height = p.y;
            if (b.width <= 0 || b.height <= 0) {
                return;
            }
            out && WebGLRTMgr.releaseRT(out);// out.recycle();
            source = WebGLRTMgr.getRT(b.width, b.height);
            var outRT: RenderTexture2D = out = WebGLRTMgr.getRT(b.width, b.height);
            sprite._getCacheStyle().filterCache = out;
            //使用RT
            context.pushRT();
            context.useRT(source);
            var tX = sprite.x - tSX + tHalfPadding;
            var tY = sprite.y - tSY + tHalfPadding;
            //执行节点的渲染
            next._fun.call(next, sprite, context, tX, tY);
            context.useRT(outRT);
            for (var i = 0; i < len; i++) {
                if (i != 0) {
                    //把out往src上画。这只是一个拷贝的过程，下面draw(src) to outRT 才是真正的应用filter
                    //由于是延迟执行，不能直接在这里swap。 TODO 改成延迟swap
                    context.useRT(source);
                    context.drawTarget(outRT, 0, 0, b.width, b.height, Matrix.TEMP.identity(), svCP, null, BlendMode.TOINT.overlay);
                    context.useRT(outRT);
                }
                var fil: Filter = filters[i];
                //把src往out上画
                switch (fil.type) {
                    // case Filter.BLUR:
                    //     fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                    //     //BlurFilterGLRender.render(source, context, b.width, b.height, fil as BlurFilter);
                    //     break;
                    // case Filter.GLOW:
                    //     //GlowFilterGLRender.render(source, context, b.width, b.height, fil as GlowFilter);
                    //     fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                    //     break;
                    case Filter.COLOR:
                        context.setColorFilter(<ColorFilter>fil);
                        context.drawTarget(source, 0, 0, b.width, b.height, Matrix.EMPTY.identity(), Value2D.create(RenderSpriteData.Texture2D));
                        context.setColorFilter(null);
                        break;
                }
            }
            context.popRT();
        } else {
            // tIsHaveGlowFilter = sprite._cacheStyle.hasGlowFilter || false;
            hasGlowFilter = false;
            if (hasGlowFilter) {
                tPadding = 50;
                tHalfPadding = 25;
            }
            b = sprite.getBounds();
            if (b.width <= 0 || b.height <= 0) {
                return;
            }
            //edit
            b.width += (tPadding + 8);//增加宽度 blur  由于blur系数为9
            b.height += (tPadding + 8);//增加高度 blur
            b.x -= sprite.pivotX + 4; //blur 
            b.y -= sprite.pivotY + 4;//blur 
            p.x = b.x * mat.a + b.y * mat.c;
            p.y = b.y * mat.d + b.x * mat.b;
            b.x = p.x;
            b.y = p.y;
            p.x = b.width * mat.a + b.height * mat.c;
            p.y = b.height * mat.d + b.width * mat.b;
            b.width = p.x;
            b.height = p.y;
            //scope.addValue("out", out);
        }
        x = x - tHalfPadding - sprite.x;
        y = y - tHalfPadding - sprite.y;
        p.setTo(x, y);
        mat.transformPoint(p);
        x = p.x + b.x;
        y = p.y + b.y;
        //把最后的out纹理画出来
        context._drawRenderTexture(out, x, y, b.width, b.height, Matrix.TEMP.identity(), 1.0, RenderTexture2D.defuv);

        //把对象放回池子中
        //var submit:SubmitCMD = SubmitCMD.create([scope], Filter._recycleScope, this);
        if (source) {
            var submit = SubmitCMD.create([source], function (s: Texture2D): void {
                s.destroy();
            }, this);
            source = null;
            context.addRenderObject(submit);
        }
        mat.destroy();
    }
}

