import { IFilter } from "./IFilter";
import { Sprite } from "../display/Sprite"
import { Matrix } from "../maths/Matrix"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { RenderSprite } from "../renders/RenderSprite"
import { Context } from "../resource/Context"
import { RenderTexture2D } from "../resource/RenderTexture2D"
import { Texture2D } from "../resource/Texture2D"
import { WebGLRTMgr } from "../resource/WebGLRTMgr"
import { BlendMode } from "../webgl/canvas/BlendMode"
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D"
import { Value2D } from "../webgl/shader/d2/value/Value2D"
import { SubmitCMD } from "../webgl/submit/SubmitCMD"
import { ColorFilter } from "./ColorFilter";

/**
 * <code>Filter</code> 是滤镜基类。
 */
export class Filter implements IFilter {
    /**@private 模糊滤镜。*/
    static BLUR: number = 0x10;
    /**@private 颜色滤镜。*/
    static COLOR: number = 0x20;
    /**@private 发光滤镜。*/
    static GLOW: number = 0x08;
    /** @internal*/
    _glRender: any;

    /**
     * 创建一个 <code>Filter</code> 实例。
     * */
    constructor() { }

    /**@private 滤镜类型。*/
    get type(): number { return -1 }

    static _filter = function (this:RenderSprite,sprite: Sprite, context: Context, x: number, y: number): void {
        var webglctx: Context = context;
        var next: any = ((<RenderSprite>this))._next;
        if (next) {
            var filters: any[] = sprite.filters, len: number = filters.length;
            //如果只有一个滤镜，那么还用原来的方式
            if (len == 1 && (filters[0].type == Filter.COLOR)) {
                context.save();
                context.setColorFilter(filters[0]);
                next._fun.call(next, sprite, context, x, y);
                context.restore();
                return;
            }
            //思路：依次遍历滤镜，每次滤镜都画到out的RenderTarget上，然后把out画取src的RenderTarget做原图，去叠加新的滤镜
            var svCP: Value2D = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);	//拷贝用shaderValue
            var b: Rectangle;

            var p: Point = Point.TEMP;
            var tMatrix: Matrix = webglctx._curMat;
            var mat: Matrix = Matrix.create();
            tMatrix.copyTo(mat);
            var tPadding: number = 0;	//给glow用
            var tHalfPadding: number = 0;
            var tIsHaveGlowFilter: boolean = false;
            //这里判断是否存储了out，如果存储了直接用;
            var source: RenderTexture2D = null;
            var out: RenderTexture2D = sprite._cacheStyle.filterCache || null;
            if (!out || sprite.getRepaint() != 0) {
                tIsHaveGlowFilter = sprite._isHaveGlowFilter();
                //glow需要扩展边缘
                if (tIsHaveGlowFilter) {
                    tPadding = 50;
                    tHalfPadding = 25;
                }
                b = new Rectangle();
                b.copyFrom(sprite.getSelfBounds());
                b.x += sprite.x;
                b.y += sprite.y;
                b.x -= sprite.pivotX + 4;//blur 
                b.y -= sprite.pivotY + 4;//blur
                var tSX: number = b.x;
                var tSY: number = b.y;
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
                webglctx.pushRT();
                webglctx.useRT(source);
                var tX: number = sprite.x - tSX + tHalfPadding;
                var tY: number = sprite.y - tSY + tHalfPadding;
                //执行节点的渲染
                next._fun.call(next, sprite, context, tX, tY);
                webglctx.useRT(outRT);
                for (var i: number = 0; i < len; i++) {
                    if (i != 0) {
                        //把out往src上画。这只是一个拷贝的过程，下面draw(src) to outRT 才是真正的应用filter
                        //由于是延迟执行，不能直接在这里swap。 TODO 改成延迟swap
                        webglctx.useRT(source);
                        webglctx.drawTarget(outRT, 0, 0, b.width, b.height, Matrix.TEMP.identity(), svCP, null, BlendMode.TOINT.overlay);
                        webglctx.useRT(outRT);
                    }
                    var fil: Filter = filters[i];
                    //把src往out上画
                    switch (fil.type) {
                        case Filter.BLUR:
                            fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                            //BlurFilterGLRender.render(source, context, b.width, b.height, fil as BlurFilter);
                            break;
                        case Filter.GLOW:
                            //GlowFilterGLRender.render(source, context, b.width, b.height, fil as GlowFilter);
                            fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                            break;
                        case Filter.COLOR:
                            webglctx.setColorFilter((<ColorFilter>fil));
                            webglctx.drawTarget(source, 0, 0, b.width, b.height, Matrix.EMPTY.identity(), Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                            webglctx.setColorFilter(null);
                            break;
                    }
                }
                webglctx.popRT();
            } else {
                tIsHaveGlowFilter = sprite._cacheStyle.hasGlowFilter || false;
                if (tIsHaveGlowFilter) {
                    tPadding = 50;
                    tHalfPadding = 25;
                }
                b = sprite.getBounds();
                if (b.width <= 0 || b.height <= 0) {
                    return;
                }
                b.width += tPadding;
                b.height += tPadding;
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
            webglctx._drawRenderTexture(out, x, y, b.width, b.height, Matrix.TEMP.identity(), 1.0, RenderTexture2D.defuv);

            //把对象放回池子中
            //var submit:SubmitCMD = SubmitCMD.create([scope], Filter._recycleScope, this);
            if (source) {
                var submit: SubmitCMD = SubmitCMD.create([source], function (s: Texture2D): void {
                    s.destroy();
                }, this);
                source = null;
                context.addRenderObject(submit);
            }
            mat.destroy();
        }
    }
}

