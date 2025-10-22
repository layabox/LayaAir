import { Matrix4x4 } from "../maths/Matrix4x4";
import { IK_Joint } from "./IK_Joint";


export class IK_TwoBoneChain{
    root:IK_Joint=null;
    kee:IK_Joint=null;
    end:IK_Joint=null;

    solve(target:Matrix4x4, poleTarget?:Matrix4x4){
        let rootMat = this.root.bone.transform.worldMatrix;
        let keeMat = this.kee.bone.transform.worldMatrix;
        let endMat = this.kee.bone.transform.worldMatrix;

    }
}