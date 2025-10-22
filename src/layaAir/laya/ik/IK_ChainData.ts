import { prototype } from "events";
import { IK_Comp } from "./IK_Comp";
import { property, regClass } from "../../Decorators";
import { Sprite3D } from "../d3/core/Sprite3D";


@regClass()
export class IK_ChainData{
    comp:IK_Comp;
    private _name=''
    private _target:Sprite3D;
    private _PoleTarget:Sprite3D;
    private _end:Sprite3D;
    private _chainLength=2
    private _lookChainLength=0;
    //lookat是否有偏移对象，即有两个joint
    private _lookAtOff=false;
    private _enable=true;
    private _type='position';
    private _alignWithTarget = false;
    private _blendWeight=0.8;

    @property(String)
    set name(v:string){
        this.comp && this.comp.onChainDataChange(this,'name',v,this._name);
        this._name=v;
    }
    get name(){
        return this._name;
    }

    @property({type:String,enumSource: [{name:"position"}, {name:"lookat"}],default:'position'})
    set type(v:string){    
        this.comp && this.comp.onChainDataChange(this,'type',v,this._type);
        this._type=v;
    }
    get type(){
        return this._type;
    }

    @property(Sprite3D)
    set end(v:Sprite3D){
        this.comp && this.comp.onChainDataChange(this,'end',v,this._end);
        this._end = v;
    }
    get end(){
        return this._end;
    }

    @property(Sprite3D)
    set target(v:Sprite3D){
        this.comp && this.comp.onChainDataChange(this,'target',v,this._target);
        this._target = v;
    }
    get target(){
        return this._target;
    }

    @property(Sprite3D)
    set PoleTarget(v:Sprite3D){
        this.comp && this.comp.onChainDataChange(this,'PoleTarget',v,this._PoleTarget);
        this._PoleTarget = v;
    }
    get PoleTarget(){
        return this._PoleTarget;
    }    
    // @property(Boolean)
    // set alignWithTarget(v:boolean){
    //     this.comp && this.comp.onChainDataChange(this,'alignWithTarget',v,this._alignWithTarget);
    //     this._alignWithTarget = v;
    // }
    // get alignWithTarget(){
    //     return this._alignWithTarget;
    // }

    @property({type:"int",hidden:"data.type=='lookat'",min:2,max:5})
    set jointCount(v:number){
        this.comp && this.comp.onChainDataChange(this,'chainLength',v,this._chainLength);
        this._chainLength = v;
    }
    get jointCount(){
        return this._chainLength;
    }

    @property({type:"int",hidden:"data.type=='position'",min:1,max:5})
    set lookJointCount(v:number){
        this.comp && this.comp.onChainDataChange(this,'lookJointCount',v,this._lookChainLength);
        this._lookChainLength = v;
    }
    get lookJointCount(){
        return this._lookChainLength;
    }    

    // @property({type:Boolean,hidden:"data.type=='position'"})
    // set lookAtOff(v:boolean){
    //     this.comp && this.comp.onChainDataChange(this,'lookAtOff',v,this._lookAtOff);
    //     this._lookAtOff = v;
    // }
    // get lookAtOff(){
    //     return this._lookAtOff;
    // }

    @property({type:Number,caption:"混合权重"})
    set blendWeight(v:number){
        this.comp && this.comp.onChainDataChange(this,'blendWeight',v,this._blendWeight);
        this._blendWeight = v;
    }
    get blendWeight(){
        return this._blendWeight;
    }

    @property(Boolean)
    set enable(v:boolean){
        this.comp && this.comp.onChainDataChange(this,'enable',v,this._enable);
        this._enable = v;
    }
    get enable(){
        return this._enable;
    }

}