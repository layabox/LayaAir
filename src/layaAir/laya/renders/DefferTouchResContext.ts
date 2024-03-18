import { Context } from "./Context";
import { IAutoExpiringResource } from "./ResNeedTouch";

export class DefferTouchResContext extends Context{
    // context只是负责设置和收集引用的资源，并不管如何touch
    mustTouchRes:IAutoExpiringResource[]=[];
    randomTouchRes:IAutoExpiringResource[]=[];


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