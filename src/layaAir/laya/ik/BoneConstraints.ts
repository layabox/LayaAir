import { IK_ConstraintData } from "./IK_ConstraintData";

const {regClass,Script, runInEditor,property } = Laya;

@regClass() @runInEditor
export class BoneConstraints extends Script {
    static DATACHANGE='constraint_data_change';

    private _constraintDatas:IK_ConstraintData[]
    @property({type:[IK_ConstraintData]})
    set constraints(cs:IK_ConstraintData[]){
        this._constraintDatas=cs;
    }
    get constraints(){
        return this._constraintDatas;
    }

    onAwake(): void {
        //this.owner.on(BoneConstraints.DATACHANGE,this,()=>{console.log('datachange')});
    }
    onDestroy(): void {
        
    }
}