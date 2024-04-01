import { Context } from "./Context";
import { IAutoExpiringResource } from "./ResNeedTouch";
import { CachePage } from "./SpriteCache";

var DefferTouchResContextID=0;
export class DefferTouchResContext extends Context{
    // context只是负责设置和收集引用的资源，并不管如何touch
    cache:CachePage=null;
    mustTouchRes:IAutoExpiringResource[]=[];
    randomTouchRes:IAutoExpiringResource[]=[];
    genID=DefferTouchResContextID++;    //版本id


    /**
     * 添加需要touch的资源
     * @param res 
     */
    override touchRes(res:IAutoExpiringResource){
        if(res.isRandomTouch){
            this.randomTouchRes.push(res);
        }else{
            this.mustTouchRes.push(res);
        }
    }    
}