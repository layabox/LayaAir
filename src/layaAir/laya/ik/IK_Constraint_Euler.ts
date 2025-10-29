import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_Constraint1 } from "./IK_Constraint1";
import { ILinerender } from "./LineRender";
import { drawEulerRange } from "./skeleton/RenderUtils";

var z = new Vector3(0,0,1);

function neq(v1:number,v2:number){
    return Math.abs(v1-v2)>1e-6
}

let d2r = Math.PI/180;
let ypr = new Vector3();
/**
 * 从0度开始，0度对应父joint
 * 实际使用的时候，需要放到一个指定的空间，主要是指定转轴
 */
export class IK_Constraint_Euler implements IK_Constraint1{
    rotation = new Quaternion();
    cur=0;
    constructor(
        public xmin=-Math.PI/2,
        public xmax=Math.PI/2,
        public ymin=-Math.PI,
        public ymax=Math.PI,
        public zmin=-Math.PI,
        public zmax=Math.PI
    ){
    }

    constraintMat(mat:Matrix4x4,outQ:Quaternion){
        //let ypr = new Vector3();
        mat.decomposeYawPitchRoll(ypr);
        let yaw = ypr.x;
        let pitch = ypr.y;
        let roll = ypr.z;
        //let k = 180/Math.PI

        if(pitch>this.xmax){
            pitch = this.xmax;
        }
        if(pitch<this.xmin){
            pitch = this.xmin;
        }
        if(yaw>this.ymax){
            yaw=this.ymax;
        }
        if(yaw<this.ymin){
            yaw=this.ymin;
        }
        if(roll<this.zmin){
            roll = this.zmin;
        }
        if(roll>this.zmax){
            roll = this.zmax;
        }

        let q = outQ || new Quaternion();
        Quaternion.createFromYawPitchRoll(yaw,pitch,roll,q);
        return q;
    }

    constraintQ(q:Quaternion): Quaternion {
        return null;
    }

    visualize(liner:ILinerender,mat:Matrix4x4):void{
        drawEulerRange(liner,mat,this.xmin,this.xmax,this.ymin,this.ymax,this.zmin,this.zmax);
    }

}
