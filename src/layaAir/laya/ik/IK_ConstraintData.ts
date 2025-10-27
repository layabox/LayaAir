import { property, regClass } from "../../Decorators";
import { Sprite3D } from "../d3/core/Sprite3D";


@regClass()
export class IK_ConstraintData{
    private _xmin = -45;
    private _xmax = 45;
    private _ymin = -45;
    private _ymax = 45;
    private _zmin = 0;
    private _zmax = 0;

    @property(Boolean)
    enable=true;

    @property(Sprite3D)
    bone:Sprite3D;

    @property({type:String,enumSource: [{name:"hinge"}, {name:"euler"},{name:'swingtwist'}]})
    type='hinge';

    @property({type:Sprite3D})
    space:Sprite3D=null;

    @property({type:Boolean,default:false,caption:'约束骨骼'})
    constraintBone = false;

    @property({type:Number,min:-90,max:90,default:-45,hidden:'data.type=="swingtwist"'})
    set xmin(v:number){
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
        this._zmax = v;
        if(this._zmin>v){
            this.zmin=v;
        }
    }
    get zmax(){
        return this._zmax;
    }      

    @property({type:Number,min:0,max:1,default:0.5,hidden:'data.type!=="swingtwist"'})
    visualHeight = 0.5;
}