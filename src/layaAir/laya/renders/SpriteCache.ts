import { ILaya } from "../../ILaya";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Rectangle } from "../maths/Rectangle";
import { Vector2 } from "../maths/Vector2";
import { Stat } from "../utils/Stat";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { TextTexture } from "../webgl/text/TextTexture";
import { Context } from "./Context";
import { DefferTouchResContext } from "./DefferTouchResContext";
import { IMesh2D } from "./Render2D";
import { RenderSprite } from "./RenderSprite";
import { RenderToCache } from "./RenderToCache";
import { IAutoExpiringResource } from "./ResNeedTouch";

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

//sprite中保存自己相对于所在page的一些相对信息。对于根page来说，就是世界位置
//只有需要挂其他cacheas noraml的对象才有这个结构
export class SpriteInfoInPage{
    page:CachePage=null;
    x=0;y=0;                //这个sprite相对page的位置。
    rot=0;
    scalex=1;scaley=1;
    alpha=1;                //alpha要继承，所以也要记录
    clip:Rectangle=null;    //clip也要继承
}

export class Cache_Info{
    //世界信息
    wMat=new Matrix();
    wAlpha:number;
    //相对所在page的信息
    page:CachePage;
    mat:Matrix;
    alpha:number;
}

//page是在渲染的过程中动态创建的
export class CachePage{
    sprite:Sprite=null;     //这个page对应的根sprite，具体挂点信息从parent节点的SpriteInfoInPage中找
    meshes:RenderObject2D[]=null;
    defferTouchRes:IAutoExpiringResource[]=null;
    defferTouchResRand:IAutoExpiringResource[]=null;
    
    //挂载其他cacheas normal的sprite。实际的缓存数据保存在sprite身上，这里保存sprite比较方便。
    children:Sprite[]=null;

    //与父的相对关系
    //位置
    //clip是全局的
    //alpha是相对的
    //相对clip,渲染的时候要与父的相交
    //clipRect:Rectangle;

    /**
     * 从节点构造。构造的过程其实就是渲染每个小节点组成mesh的过程
     * sp的父节点一定在指定的parentPage中
     * @param parentPage 如果sp是第一层cache，则这个应该是context对应的根page
     * @param sp 
     */
    constructFromSprite(parentPage:CachePage, sprite:Sprite){
        //把sp加到


    }

    render(sprite:Sprite,context:Context,x:number,y:number){
        let spriteTrans = sprite.transform;
        let curMat = context._curMat;
        if(spriteTrans){
            //如果sprite有旋转，则用矩阵乘法，否则用简单的偏移
            Matrix.mul(spriteTrans,curMat,worldMat);
        }else{
            worldMat.a=curMat.a; worldMat.b=curMat.b;
            worldMat.c=curMat.c; worldMat.d=curMat.d;
            worldMat.tx=curMat.a*x+curMat.c*y+curMat.tx; 
            worldMat.ty=curMat.b*x+curMat.d*y+curMat.ty;
        }

        this.meshes.forEach(renderinfo=>{
            let render = context.render2D;
            let curMtl = renderinfo.mtl;
            if(curMtl.textureHost instanceof TextTexture){
                curMtl.textureHost.touchTexture();
            }
            //通过context的裁剪，透明，矩阵等参数修改当前材质
            //TODO
            vec21.setValue(context.width, context.height);
            curMtl.size=vec21;
            context._copyClipInfo(curMtl,context._globalClipMatrix);
            //世界矩阵
            let mate = worldMat4.elements;
            mate[0]=worldMat.a; mate[1]=worldMat.b;
            mate[4]=worldMat.c; mate[5]=worldMat.d;
            mate[12]=worldMat.tx;  mate[13]=worldMat.ty;
            curMtl.mmat = worldMat4;
            render.draw(renderinfo,renderinfo.vboff,renderinfo.vblen, renderinfo.iboff, renderinfo.iblen, curMtl);
        })

        //touch资源
        this.defferTouchRes.forEach(res=>{res.touch();});
        //TODO 随机touch
        this.defferTouchResRand.forEach(res=>res.touch());

        //渲染子
        this.children && this.children.forEach(sp=>{
            //根据sp更新shader数据，例如偏移等
            sp._cacheStyle.cacheAsNormal.render(sp,context,0,0);
        });
    }
}


var vec21 = new Vector2();
/**
 * 把渲染结果保存成mesh和材质
 */
export class SpriteCache{
    static createRootCachePage(){
        //context对应的page，其他的都是他的子
    }

    static renderCacheAsNormal(context:Context|DefferTouchResContext,sprite:Sprite,next:RenderSprite,x:number,y:number){
        let rebuild=false;
        var cacheResult = sprite._cacheStyle.cacheAsNormal;
        if (!cacheResult || sprite._needRepaint() || ILaya.stage.isGlobalRepaint()) {
            //计算包围盒
            //sprite._cacheStyle._calculateCacheRect(sprite, "bitmap", 0, 0);
            //let tRec = sprite._cacheStyle.cacheRect;
            //if(tRec.width<=0||tRec.height<=0)
            //    return rebuild;
            rebuild=true;

            // 如果已经是在构造缓存的过程中了，这表示cacheas normal又包含cacheas normal，则
            if(context instanceof DefferTouchResContext){
                let parentCache = context.cache;
                // 把自己加到缓存的children中
                if(!parentCache.children){
                    parentCache.children=[sprite];
                }else if(parentCache.children.indexOf(sprite)<0){
                    parentCache.children.push(sprite);
                }
                //记录incache可以通过sprite找到父cache
                let parentNode = sprite.parent as Sprite
                //parentNode._cacheStyle.inCache = parentCache;
                // 更新记录parent节点的cache信息
                //if(parentNode._cacheStyle.c)
            }

            cacheResult = sprite._cacheStyle.cacheAsNormal = new CachePage();
            Stat.canvasNormal++;
            let ctx = new DefferTouchResContext();
            ctx.cache = cacheResult;
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

        if(!(context instanceof DefferTouchResContext)){
            //根cache则开始渲染
            cacheResult.render(sprite,context,x,y);
        }
        return rebuild;
    }
}

var worldMat = new Matrix;
var worldMat4 = new Matrix4x4;