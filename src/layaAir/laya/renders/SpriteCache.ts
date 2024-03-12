import { ILaya } from "../../ILaya";
import { Sprite } from "../display/Sprite";
import { Vector2 } from "../maths/Vector2";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { Context } from "./Context";
import { IMesh2D } from "./Render2D";
import { RenderSprite } from "./RenderSprite";
import { RenderToCache } from "./RenderToCache";

export class RenderObject2D{
    mesh2d: IMesh2D;
    vboff: number;
    vblen: number;
    iboff: number;
    iblen: number;
    mtl: Value2D
}


var vec21 = new Vector2();
/**
 * 把渲染结果保存成mesh和材质
 */
export class SpriteCache{
    renderElements:RenderObject2D[]=[];
    renderCacheAsNormal(context:Context,sprite:Sprite,next:RenderSprite){
        var cacheResult = sprite._cacheStyle.cacheAsNormal;
        if (!cacheResult || sprite._needRepaint() || ILaya.stage.isGlobalRepaint()) {
            let ctx = new Context();
            //ctx.copyState(context);
            //ctx.size(w,h);
            let renderer = new RenderToCache();
            ctx.render2D= renderer;
            ctx.startRender();
            //由于context是新的，所以画到0,0上就行
            next._fun(sprite,ctx,0, 0);
            ctx.endRender();

            cacheResult = sprite._cacheStyle.cacheAsNormal = renderer.renderResult;
        }

        //
        cacheResult.forEach(renderinfo=>{
            let render = context.render2D;
            let curMtl = renderinfo.mtl;
            //通过context的裁剪，透明，矩阵等参数修改当前材质
            //TODO
            vec21.setValue(context.width, context.height);
            curMtl.size=vec21;
            render.draw(renderinfo.mesh2d,renderinfo.vboff,renderinfo.vblen, renderinfo.iboff, renderinfo.iblen, curMtl);
        })
    }

}