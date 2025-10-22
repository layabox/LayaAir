import { Sprite3D } from "../d3/core/Sprite3D";
import { IK_Joint } from "./IK_Joint";

//管理所有对象的_mapBoneJoint
var allMap = new Map<Sprite3D, IK_JointManager>();

export function getJointMgr(sp:Sprite3D){
    let ret = allMap.get(sp);
    if(!ret){
        ret = new IK_JointManager();
    }
    allMap.set(sp,ret);
    return ret;
}


export class IK_JointManager{
    //名字到joint的映射，可以避免多个joint控制一个骨骼，也可以用来查找joint，确定链接关系
    //例如找parent
    private _mapBoneJoint:{[key:string]:IK_Joint}={}

    getJoint(name:string):IK_Joint{
        return this._mapBoneJoint[name];
    }
    
    addJoint(name:string,joint:IK_Joint):void{
        this._mapBoneJoint[name]=joint;
    }
}