import { prototype } from "events";
import { IK_Comp } from "./IK_Comp";
import { property, regClass } from "../../Decorators";
import { Sprite3D } from "../d3/core/Sprite3D";


@regClass()
export class IK_ConstraintData{
    comp:IK_Comp;
    private _bone:Sprite3D;
    private _space:Sprite3D;
    private _enable=true;
    private _axis=0;
    private _type='hinge';
    private _xmin = -45;
    private _xmax = 45;
    private _ymin = -45;
    private _ymax = 45;
    private _zmin = 0;
    private _zmax = 0;
    private _constraintBone=false;

    @property(Boolean)
    set enable(v:boolean){
        this.comp && this.comp.onConstraintDataChange(this,'enable',v,this._enable);
        this._enable = v;
    }
    get enable(){
        return this._enable;
    }

    @property(Sprite3D)
    set bone(v:Sprite3D){
        this.comp && this.comp.onConstraintDataChange(this,'bone',v,this._bone);
        this._bone = v;
    }
    get bone(){
        return this._bone;
    }

    @property({type:String,enumSource: [{name:"hinge"}, {name:"euler"},{name:'swingtwist'}]})
    set type(v:string){
        this.comp && this.comp.onConstraintDataChange(this,'type',v,this._type);
        this._type = v;
    }

    get type(){
        return this._type;
    }

    @property({type:Sprite3D})
    set space(v:Sprite3D){
        this.comp && this.comp.onConstraintDataChange(this,'space',v,this._space);
        this._space = v;
    }
    get space(){
        return this._space;
    }    

    @property({type:Boolean,default:false,caption:'约束骨骼'})
    set constraintBone(v:boolean){
        this.comp && this.comp.onConstraintDataChange(this,'constraintBone',v,this._constraintBone);
        this._constraintBone = v;
    }
    get constraintBone(){
        return this._constraintBone;
    }
    
    // @property({type:Number,min:0,max:360, hidden:'data.type!="hinge"', default:0})
    // set axis(v:number){
    //     this.comp && this.comp.onConstraintDataChange(this,'axis',v,this._axis);
    //     this._axis=v;
    // }
    // get axis(){
    //     return this._axis;
    // }

    @property({type:Number,min:-90,max:90,default:-45,hidden:'data.type=="swingtwist"'})
    set xmin(v:number){
        this.comp && this.comp.onConstraintDataChange(this,'xmin',v,this._xmin);
        this._xmin = v;
        if(this._xmax<v){
            this.xmax=v;
        }
    }

    get xmin(){
        return this._xmin;
    }

    @property({type:Number,min:-90,max:90,default:45})
    set xmax(v:number){
        this.comp && this.comp.onConstraintDataChange(this,'xmax',v,this._xmax);
        this._xmax=v;
        if(this._xmin>v){
            this.xmin=v;
        }
    }
    get xmax(){
        return this._xmax;
    }

    @property({type:Number,min:-180,max:180,hidden:'data.type!="euler"', default:-45})
    set ymin(v:number){
        this.comp && this.comp.onConstraintDataChange(this,'ymin',v,this._ymin);
        this._ymin = v;
        if(this._ymax<v){
            this.ymax=v;
        }
    }

    get ymin(){
        return this._ymin;
    }    

    @property({type:Number,min:-180,max:180,hidden:'data.type=="hinge"',default:45})
    set ymax(v:number){
        this.comp && this.comp.onConstraintDataChange(this,'ymax',v,this._ymax);
        this._ymax = v;
        if(this._ymin>v){
            this.ymin=v;
        }
    }
    get ymax(){
        return this._ymax;
    }        

    @property({type:Number,min:-180,max:180,hidden:'data.type=="hinge"',default:0})
    set zmin(v:number){
        this.comp && this.comp.onConstraintDataChange(this,'zmin',v,this._zmin);
        this._zmin = v;
        if(this._zmax<v){
            this.zmax=v;
        }
    }

    get zmin(){
        return this._zmin;
    }    

    @property({type:Number,min:-180,max:180,hidden:'data.type=="hinge"',default:0})
    set zmax(v:number){
        this.comp && this.comp.onConstraintDataChange(this,'zmax',v,this._zmax);
        this._zmax = v;
        if(this._zmin>v){
            this.zmin=v;
        }
    }
    get zmax(){
        return this._zmax;
    }      

    private _visualHeight=0.5;
    @property({type:Number,min:0,max:1,default:0.5,hidden:'data.type!=="swingtwist"'})
    set visualHeight(v:number){
        this._visualHeight = v;
        this.comp && this.comp.onConstraintDataChange(this,'visualHeight',v,this._visualHeight);
    }

    get visualHeight(){
        return this._visualHeight;
    }

    // _min=new Laya.Vector3(45,45,0);
    // @property({type:Laya.Vector3,min:{x:-90,y:-180,z:-180},max:{x:90,y:180,z:180},default:{x:45,y:45,z:0}})
    // set min(v:Laya.Vector3){
    //     v.cloneTo(this._min);
    // }

    // get min(){
    //     return this._min;
    // }
}