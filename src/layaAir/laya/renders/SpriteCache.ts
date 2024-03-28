import { ILaya } from "../../ILaya";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Sprite } from "../display/Sprite";
import { SpriteConst } from "../display/SpriteConst";
import { Matrix } from "../maths/Matrix";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Rectangle } from "../maths/Rectangle";
import { Vector2 } from "../maths/Vector2";
import { Stat } from "../utils/Stat";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { TextTexture } from "../webgl/text/TextTexture";
import { Context } from "./Context";
import { DefferTouchResContext } from "./DefferTouchResContext";
import { IMesh2D, Render2D } from "./Render2D";
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
    //wMat=new Matrix();
    wAlpha:number;
    //相对所在page的信息
    page:CachePage;
    mat:Matrix;
    alpha:number;
    contextID=NaN;
}

class RenderPageContex{
    //简化的context，只是
    curMatrix:Matrix;
    alpha=1;
    render2d:Render2D;
    width=0;    //TODO这个不应该在这里
    height=0;
    clipInfo: Matrix;
    /**
     * 这里的xy就是渲染的xy，需要这个参数是为了正确计算当前矩阵
     * @param ctx 
     * @param x 
     * @param y 
     */
    constructor(ctx:Context,x:number,y:number){
        let mat = this.curMatrix = ctx._curMat.clone();
        mat.tx+=mat.a*x+mat.c*y;
        mat.ty+=mat.b*x+mat.d*y;
        this.alpha=ctx.globalAlpha;
        this.render2d = ctx.render2D;
        this.width=ctx.width;
        this.height=ctx.height;
        this.clipInfo = ctx._globalClipMatrix.clone();
    }
    _copyClipInfo(shaderValue: Value2D): void {
        let clipInfo = this.clipInfo;
        var cm = shaderValue.clipMatDir;
        cm.x = clipInfo.a; cm.y = clipInfo.b; cm.z = clipInfo.c; cm.w = clipInfo.d;
        shaderValue.clipMatDir = cm;
        var cmp = shaderValue.clipMatPos;
        cmp.x = clipInfo.tx; cmp.y = clipInfo.ty;
        shaderValue.clipMatPos = cmp;
    }    
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
     * 根据sprite的相对矩阵（相对于parent）画出缓存的mesh
     * 为了位置能正确，需要context中提供的矩阵是sprite的parent的世界矩阵
     * @param sprite 
     * @param context 
     * @param isRoot  如果为true的话，则可以直接使用当前矩阵。优化用。
     */
    render(sprite:Sprite,context:RenderPageContex,isRoot:boolean){
        let spriteTrans = sprite.transform;
        let curMat = context.curMatrix;
        if(isRoot){
            curMat.copyTo(worldMat);
        }else{
            //如果sprite有旋转，则用矩阵乘法，否则用简单的偏移
            let x = sprite._x;
            let y = sprite._y;
            if(spriteTrans){
                spriteTrans.copyTo(tmpMat);
                //现在transform本身没有偏移，所以要单独加上
                tmpMat.tx=x; tmpMat.ty=y;
                Matrix.mul(tmpMat,curMat,worldMat);
            }else{
                worldMat.a=curMat.a; worldMat.b=curMat.b;
                worldMat.c=curMat.c; worldMat.d=curMat.d;
                worldMat.tx=curMat.a*x+curMat.c*y+curMat.tx; 
                worldMat.ty=curMat.b*x+curMat.d*y+curMat.ty;
            }
        }

        vec21.setValue(context.width, context.height);
        //世界矩阵
        let wMat4 = new Matrix4x4();
        let mate = wMat4.elements;
        mate[0]=worldMat.a;    mate[1]=worldMat.b;
        mate[4]=worldMat.c;    mate[5]=worldMat.d;
        mate[12]=worldMat.tx;  mate[13]=worldMat.ty;

        this.meshes.forEach(renderinfo=>{
            let render = context.render2d;
            let curMtl = renderinfo.mtl;
            if(curMtl.textureHost instanceof TextTexture){
                //针对texture的touch
                curMtl.textureHost.touchTexture();
            }
            //通过context的裁剪，透明，矩阵等参数修改当前材质
            curMtl.size=vec21;
            context._copyClipInfo(curMtl);
            curMtl.mmat = wMat4;
            render.draw(renderinfo,renderinfo.vboff,renderinfo.vblen, renderinfo.iboff, renderinfo.iblen, curMtl);
        })

        //touch资源
        this.defferTouchRes.forEach(res=>{res.touch();});
        //TODO 随机touch
        this.defferTouchResRand.forEach(res=>res.touch());

        //渲染子
        this.children && this.children.forEach(sp=>{
            //根据sp更新shader数据，例如偏移等
            let oldmat = context.curMatrix.clone();
            //原点设置为父节点的世界坐标，所以加上父节点的相对偏移
            let offmat = (sp.parent as Sprite)._cacheStyle.cacheInfo.mat;
            Matrix.mul(offmat,oldmat,context.curMatrix);
            //context.curMatrix.copyTo((sp.parent as Sprite)._cacheStyle.cacheInfo.wMat);//TODO需要么
            sp._cacheStyle.cacheAsNormal.render(sp,context,false);
            //恢复矩阵
            context.curMatrix = oldmat;
        });
    }
}


var vec21 = new Vector2();
/**
 * 把渲染结果保存成mesh和材质
 */
export class SpriteCache{

    /**
     * 已知sprite和当前世界矩阵curMat, 把sprite的偏移减掉，就是得到parent的世界矩阵
     * @param sprite 
     * @param curMat 当前的矩阵，这是增加了sprite自身的偏移后的矩阵
     * @param outMat 把curMat去掉sprite自身的偏移得到的结果
     */
    static curMatSubSpriteMat(sprite:Sprite, curMat:Matrix, outMat:Matrix){
        //下面要把自己对矩阵的影响消掉，得到parent的矩阵
        if(sprite._renderType&SpriteConst.TRANSFORM){
            //如果有矩阵
            sprite.transform.copyTo(invMat);
            invMat.tx=sprite._x;    //直接设置，不用+，因为transform就是没有记录xy
            invMat.ty=sprite._y;
            invMat.invert();//注意要clone，否则会直接修改原始矩阵
            Matrix.mul(invMat,curMat,outMat);
        }else{
            curMat.copyTo(outMat);
            //只有平移。把自己的相对位置减回去即可
            let cx = -sprite._x;
            let cy = -sprite._y;
            outMat.tx += (outMat.a*cx+outMat.c*cy);
            outMat.ty += (outMat.b*cx+outMat.d*cy);
        }
        return outMat;
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
                let parentPage = context.cache;
                // 把自己加到缓存的children中
                if(!parentPage.children){
                    parentPage.children=[sprite];
                }else if(parentPage.children.indexOf(sprite)<0){
                    parentPage.children.push(sprite);
                }
                //记录incache可以通过sprite找到父cache
                let parentNode = sprite.parent as Sprite
                let parentCacheInfo = parentNode._cacheStyle.cacheInfo;
                parentCacheInfo.page = parentPage;
                if(context.genID!=parentCacheInfo.contextID){
                    parentCacheInfo.contextID = context.genID;
                    //这里稍微麻烦一些，需要计算parent的相对于所在page的矩阵
                    //自己相对于parent的page的矩阵= 在curMat 下(x,y)偏移
                    let curMat = context._curMat.clone();
                    if(x!=0||y!=0){
                        //需要把xy加进去
                        curMat.tx+=x*curMat.a+y*curMat.c;
                        curMat.ty+=x*curMat.b+y*curMat.d;
                    }
                    //记录parent的相对所在page的矩阵
                    parentNode._cacheStyle.cacheInfo.mat = SpriteCache.curMatSubSpriteMat(sprite,curMat,curMat);
                }
                //parentNode._cacheStyle.cacheInfo.mat = curMat;
                //计算parent的透明度
                //记录parent的透明度
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
            /**
                对于第一个page，直接使用自己的世界坐标渲染就行
                    parent的page的世界坐标是I
                对于子
                    （parent的page的世界坐标 * parent的相对page的坐标） 这是自己的原点，
                        然后加上自己的相对坐标

                ctx.toSpriteParen
                    先更新parent的相关信息
                    如果
                render(sprite,ctx)
                render(sprite)

             */
            let ctx = new RenderPageContex(context,x,y);
            // 此时的ctx.curMatrix是sprite节点所在的世界矩阵
            //先给ctx计算正确的矩阵，即sprite的parent的世界矩阵，直接修改结果到ctx.curMatrix
            //SpriteCache.curMatSubSpriteMat(sprite,ctx.curMatrix, ctx.curMatrix);
            cacheResult.render(sprite,ctx,true);
        }
        return rebuild;
    }
}

var worldMat = new Matrix;
var invMat = new Matrix;
var tmpMat = new Matrix;