import { property, regClass, runInEditor } from "../../Decorators";
import { Script } from "../components/Script";
import { IK_Comp } from "./IK_Comp";
import { IK_ConstraintData } from "./IK_ConstraintData";


@regClass() @runInEditor
export class BoneConstraints extends Script {
    static DATACHANGE='constraint_data_change';

    private _constraintDatas:IK_ConstraintData[]
    @property({type:[IK_ConstraintData],onChange:'onConstraintDataChange'})
    set constraints(cs:IK_ConstraintData[]){
        this._constraintDatas=cs;
    }
    get constraints(){
        return this._constraintDatas;
    }

    onConstraintDataChange(idx:number){
        this.owner.event(BoneConstraints.DATACHANGE,idx);
    }

    onAwake(): void {
        let ikcomp = this.owner.getComponent(IK_Comp);
        if(!ikcomp)
            return;
        ikcomp.constraints = this.constraints;
    }
    onDestroy(): void {
        let ikcomp = this.owner.getComponent(IK_Comp);
        if(!ikcomp)
            return;
        ikcomp.constraints = null;
    }
}