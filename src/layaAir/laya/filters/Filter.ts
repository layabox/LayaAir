import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { Context } from "../renders/Context";
import { Render2D } from "../renders/Render2D";
import { RenderSprite } from "../renders/RenderSprite";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { MeshQuadTexture } from "../webgl/utils/MeshQuadTexture";
import { ColorFilter } from "./ColorFilter";
import { IFilter } from "./IFilter";

/**
 * <code>Filter</code> 是滤镜基类。滤镜是针对节点的后处理过程，所以必然操作一个rendertexture
 */
export abstract class Filter implements IFilter {
    /**@private 颜色滤镜。*/
    static COLOR = 0x20;
    /** @internal*/
    _glRender: any;

    //结果的原点的坐标，相对于sprite的原始原点，如果扩展了，left和top可能是负的
    protected left = 0;
    protected top = 0;
    //渲染后大小
    protected width = 0;
    protected height = 0;
    protected texture: RenderTexture2D;  //TODO 创建 优化
    protected _render2D: Render2D;

    //当前使用的
    protected _rectMesh: MeshQuadTexture;
    protected _rectMeshVB: Float32Array;

    //uv坐标正常的版本
    private _rectMeshNormY:MeshQuadTexture;
    private _rectMeshVBNormY:Float32Array;
    //uv坐标翻转的版本
    private _rectMeshInvY:MeshQuadTexture;
    private _rectMeshVBInvY:Float32Array;

    constructor() {
        let rect1 = this._rectMeshNormY = new MeshQuadTexture();
        rect1.addQuad([0, 0, 1, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1], 0xffffffff, true)
        this._rectMeshVBNormY = new Float32Array(rect1.vbBuffer);

        let rectInvY = this._rectMeshInvY = new MeshQuadTexture();
        rectInvY.addQuad([0, 0, 1, 0, 1, 1, 0, 1], [0, 1, 1, 1, 1, 0, 0, 0], 0xffffffff, true)
        this._rectMeshVBInvY = new Float32Array(rectInvY.vbBuffer);
        this.useFlipY(false);
    }

    useFlipY(b: boolean) {
        this._rectMesh = b ? this._rectMeshInvY : this._rectMeshNormY;
        this._rectMeshVB = b ? this._rectMeshVBInvY : this._rectMeshVBNormY;
    }

    set render2D(r: Render2D) {
        this._render2D = r;
    }
    /**
     * 不需要位置
     * @param texture 
     * @param width 
     * @param height 
     */
    abstract render(texture: RenderTexture2D, width: number, height: number): void;

    /**@private 滤镜类型。*/
    get type(): number { return -1 }

    /**
     * @internal
     * @param this 
     * @param sprite 
     * @param context 
     * @param x 
     * @param y 
     * @returns 
     */
    static _filter = function (this: RenderSprite, sprite: Sprite, context: Context, x: number, y: number): void {
        var next = this._next;
        if (!next) return;

        var filters = sprite.filters, len = filters.length;
        //如果只有一个滤镜，那么还用原来的方式
        if (len == 1 && (filters[0].type == Filter.COLOR)) {
            context.save();
            context.setColorFilter(filters[0] as ColorFilter);
            next._fun.call(next, sprite, context, x, y);
            context.restore();
            return;
        }

        let cache = sprite._getCacheStyle();
        // 先把节点渲染到一个贴图上
        //if(RenderSprite.RenderToCacheTexture(sprite,context,x,y)){
        //多个滤镜off会累加，例如blur一次导致偏移50，两次就是100
        let rtOffX = 0, rtOffY = 0;
        if (this._renderNextToCacheRT(sprite, context)) {
            let src = cache.renderTexture;
            let dst = src;
            let width = src.width;// cache.cacheRect.width;     不能用cacheRect,因为可能有空白，而src补充了这个空白
            let height = src.height; //cache.cacheRect.height;
            // 针对这个贴图，依次应用filter
            for (let i = 0; i < len; i++) {
                src = dst;
                var filter = filters[i];
                filter._render2D = context.render2D;
                filter.useFlipY(i!=0);
                filter.render(src, width, height);
                width = filter.width;
                height = filter.height;
                dst = filter.texture;
                rtOffX += filter.left;
                rtOffY += filter.top;
            }
            //context.render2D.out=lastRT;
            // 把最终结果保存到cache
            cache.renderTexture = dst;
            cache.renderTexOffx = rtOffX;
            cache.renderTexOffy = rtOffY;
        }
        //直接使用缓存的
        cache.renderTexture && context._drawRenderTexture(cache.renderTexture,
            x + cache.renderTexOffx,
            y + cache.renderTexOffy,
            cache.renderTexture.width,
            cache.renderTexture.height,
            null, 1.0, RenderTexture2D.defuv);
    }
}