import { property, regClass } from "../../Decorators";
import { Sprite3D } from "../d3/core/Sprite3D";
export class BoneData {
    data: Sprite3D;
    disabled: boolean;
}

//@regClass()
export class IK_ChainData{

    //@property(String)
    name:string

    //@property({type:String,enumSource: [{name:"position"}, {name:"lookat"}],default:'position'})
    type="position"    

    //@property(Sprite3D)
    end:Sprite3D=null;

    //@property(Sprite3D)
    root:Sprite3D=null;    

    //@property({type:BoneData})
    bones: BoneData[];


    //@property({type:Boolean,caption:'末端关节固定'})
    fixedEnd=false

    //@property({type:String,enumSource:['no','y','all'],default:'',caption:'末端朝向对齐'})
    alignTarget:'no'|'y'|'all'='no'

    //@property(Sprite3D)
    target:Sprite3D=null;

    enablePoleTarget:boolean=false
    //@property(Sprite3D)
    PoleTarget:Sprite3D=null;
    // @property(Boolean)
    // set alignWithTarget(v:boolean){
    //     this.comp && this.comp.onChainDataChange(this,'alignWithTarget',v,this._alignWithTarget);
    //     this._alignWithTarget = v;
    // }
    // get alignWithTarget(){
    //     return this._alignWithTarget;
    // }

    //@property({type:"int",hidden:"data.type=='lookat'",min:2,max:5})
    jointCount=2;

    //@property({type:"int",hidden:"data.type=='position'",min:1,max:5,default:1})
    //lookJointCount=1

    //@property({type:Number,caption:"混合权重",default:1})
    blendWeight=1;
    //@property({type:Number,default:1,caption:"平滑权重"})
    smoothBlendWeight=1

    //@property({type:Boolean,default:true})
    enable=true

    //@property({type:Number,default:0.001})
    maxError=0.001

}