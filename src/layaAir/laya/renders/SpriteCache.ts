import { ILaya } from "../../ILaya";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Sprite } from "../display/Sprite";
import { resultForCacheAsNormal } from "../display/css/CacheStyle";
import { Matrix } from "../maths/Matrix";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector2 } from "../maths/Vector2";
import { Stat } from "../utils/Stat";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
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
    renderCacheAsNormal(context:Context,sprite:Sprite,next:RenderSprite,x:number,y:number){
        let rebuild=false;
        var cacheResult = sprite._cacheStyle.cacheAsNormal;
        if (!cacheResult || sprite._needRepaint() || ILaya.stage.isGlobalRepaint()) {
            //计算包围盒
            //sprite._cacheStyle._calculateCacheRect(sprite, "bitmap", 0, 0);
            //let tRec = sprite._cacheStyle.cacheRect;
            //if(tRec.width<=0||tRec.height<=0)
            //    return rebuild;
            rebuild=true;

            cacheResult = sprite._cacheStyle.cacheAsNormal = new resultForCacheAsNormal();
            Stat.canvasNormal++;
            let ctx = new DefferTouchResContext();
            let renderer = new RenderToCache();
            ctx.render2D= renderer;
            ctx.startRender();
            /*
                对于cacheas normal 不存在rt原点与节点原点的问题
                可以直接使用节点原点。
                由于这里没有考虑旋转缩放平移，记得实际使用的时候要加上
            */
            next._fun(sprite,ctx,0, 0);
            ctx.endRender();

            cacheResult.meshes = renderer.renderResult;
            cacheResult.defferTouchRes = ctx.mustTouchRes;
            cacheResult.defferTouchResRand = ctx.randomTouchRes;
        }

        //
        let spriteTrans = sprite.transform;
        let curMat = context._curMat;
        if(spriteTrans){
            Matrix.mul(spriteTrans,curMat,worldMat);
        }else{
            worldMat.a=curMat.a; worldMat.b=curMat.b;
            worldMat.c=curMat.c; worldMat.d=curMat.d;
            worldMat.tx=curMat.a*x+curMat.c*y+curMat.tx; 
            worldMat.ty=curMat.b*x+curMat.d*y+curMat.ty;
        }

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
            //世界矩阵
            let mate = worldMat4.elements;
            mate[0]=worldMat.a; mate[1]=worldMat.b;
            mate[4]=worldMat.c; mate[5]=worldMat.d;
            mate[12]=worldMat.tx;  mate[13]=worldMat.ty;
            curMtl.mmat = worldMat4;
            render.draw(renderinfo,renderinfo.vboff,renderinfo.vblen, renderinfo.iboff, renderinfo.iblen, curMtl);
        })

        //touch资源
        cacheResult.defferTouchRes.forEach(res=>{res.touch();});
        //TODO 随机touch
        cacheResult.defferTouchResRand.forEach(res=>res.touch());
        return rebuild;
    }

}

var worldMat = new Matrix;
var worldMat4 = new Matrix4x4;