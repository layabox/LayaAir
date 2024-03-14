import { ILaya } from "../../ILaya";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Sprite } from "../display/Sprite";
import { resultForCacheAsNormal } from "../display/css/CacheStyle";
import { Vector2 } from "../maths/Vector2";
import { Stat } from "../utils/Stat";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { TextTexture } from "../webgl/text/TextTexture";
import { Context } from "./Context";
import { DefferTouchResContext } from "./DefferTouchResContext";
import { IMesh2D } from "./Render2D";
import { RenderSprite } from "./RenderSprite";
import { RenderToCache } from "./RenderToCache";

export class RenderObject2D implements IMesh2D{
    vboff: number;
    vblen: number;
    iboff: number;
    iblen: number;
    mtl: Value2D;
    dynaResourcesNeedTouch:any[];
    vertexDeclarition: VertexDeclaration;
    vbBuffer: ArrayBuffer;
    ibBuffer: ArrayBuffer;
    constructor(mesh:IMesh2D,vboff:number,vblen:number,iboff:number,iblen:number,mtl:Value2D){
        this.vertexDeclarition = mesh.vertexDeclarition;
        this.vbBuffer = new ArrayBuffer(vblen);
        this.ibBuffer = new ArrayBuffer(iblen);
        (new Uint8Array(this.vbBuffer)).set(new Uint8Array(mesh.vbBuffer,vboff,vblen));
        (new Uint8Array(this.ibBuffer)).set(new Uint8Array(mesh.ibBuffer,iboff,iblen));
        this.mtl = mtl; //TODO clone?
        this.vboff=0;
        this.vblen=vblen;
        this.iboff=0;
        this.iblen=iblen;        
    }
}


var vec21 = new Vector2();
/**
 * 把渲染结果保存成mesh和材质
 */
export class SpriteCache{
    renderCacheAsNormal(context:Context,sprite:Sprite,next:RenderSprite){
        var cacheResult = sprite._cacheStyle.cacheAsNormal;
        if (!cacheResult || sprite._needRepaint() || ILaya.stage.isGlobalRepaint()) {
            cacheResult = sprite._cacheStyle.cacheAsNormal = new resultForCacheAsNormal();
            Stat.canvasNormal++;
            let ctx = new DefferTouchResContext();
            //ctx.copyState(context);
            //ctx.size(w,h);
            let renderer = new RenderToCache();
            ctx.render2D= renderer;
            ctx.startRender();
            //由于context是新的，所以画到0,0上就行
            next._fun(sprite,ctx,0, 0);
            ctx.endRender();

            cacheResult.meshes = renderer.renderResult;
            cacheResult.defferTouchRes = ctx.mustTouchRes;
            cacheResult.defferTouchResRand = ctx.randomTouchRes;
        }

        //
        cacheResult.meshes.forEach(renderinfo=>{
            let render = context.render2D;
            let curMtl = renderinfo.mtl;
            if(curMtl.textureHost instanceof TextTexture){
                curMtl.textureHost.touchTexture();
            }
            //通过context的裁剪，透明，矩阵等参数修改当前材质
            //TODO
            vec21.setValue(context.width, context.height);
            curMtl.size=vec21;
            render.draw(renderinfo,renderinfo.vboff,renderinfo.vblen, renderinfo.iboff, renderinfo.iblen, curMtl);
        })

        //touch资源
        cacheResult.defferTouchRes.forEach(res=>{res.touch();});
        //TODO 随机touch
        cacheResult.defferTouchResRand.forEach(res=>res.touch());
        
    }

}