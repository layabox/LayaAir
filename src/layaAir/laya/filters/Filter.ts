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

    //结果的原点的坐标，相对于sprite的原始原点，如果扩展了，left和top可能是负的
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
        rect.addQuad([0,0,1,0,1,1,0,1],[0,0,1,0,1,1,0,1],0xffffffff,true)
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
        //if(RenderSprite.RenderToCacheTexture(sprite,context,x,y)){
        if(this._renderNextToCacheRT(sprite,context)){
            let src = cache.renderTexture;
            let dst = src;
            let width = src.width;// cache.cacheRect.width;     不能用cacheRect,因为可能有空白，而src补充了这个空白
            let height = src.height; //cache.cacheRect.height;
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
        cache.renderTexture && context._drawRenderTexture(cache.renderTexture, 
            x+cache.renderTexOffx, 
            y+cache.renderTexOffy, 
            cache.renderTexture.width, 
            cache.renderTexture.height, 
            Matrix.TEMP.identity(), 1.0, RenderTexture2D.defuv);
    }
}

