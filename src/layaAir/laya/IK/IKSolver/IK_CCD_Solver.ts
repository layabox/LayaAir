import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { IK_Chain } from "../IK_Chain";
import { IK_ISolver } from "../IK_ISolver";
import { IK_Target } from "../IK_Pose1";
import {ClsInst, rotationTo} from "../IK_Utils"

export class IK_CCDSolver implements IK_ISolver {
    static clsid = '2f0b2565-ebee-49bf-9e2b-88d68d4fc8f5'
    maxIterations: number;
    epsilon: number;

    constructor(maxIterations: number = 10, epsilon: number = 0.001) {
        ClsInst.addInst(this);
        this.maxIterations = maxIterations;
        this.epsilon = epsilon;
    }


    async solve(chain: IK_Chain, target: IK_Target) {
        const endEffector = chain.end_effector;
        let iteration = 0;

        const toEndEffector = new Vector3();
        const toTarget = new Vector3();
        let rotation = new Quaternion();
        while (iteration < this.maxIterations) {
            //从末端开始
            for (let i = chain.joints.length - 1; i >= 0; i--) {
                const joint = chain.joints[i];

                endEffector.position.vsub(joint.position, toEndEffector);
                if(toEndEffector.lengthSquared()<1e-5) 
                    //endeffector和joint重合的情况
                    continue;

                toEndEffector.normalize();

                target.pos.vsub(joint.position,toTarget);
                toTarget.normalize();
                //得到一个相对旋转，用来调整末端
                rotationTo(toEndEffector, toTarget, rotation);
                //更新朝向
                chain.rotateJoint(i,rotation);
            }

            if (Vector3.distanceSquared(endEffector.position, target.pos) < this.epsilon * this.epsilon) {
                break;
            }

            iteration++;
        }

        //重新计算朝向
        // let joints = chain.joints;
        // let dPos = new Vector3();
        // for (let i=0,n=joints.length; i<n-1; i++) {
        //     let curJoint = joints[i];
        //     let nextJoint = joints[i+1];
        //     let curRot = curJoint.rotationQuat;
        //     nextJoint.position.vsub(curJoint.position,dPos);
        //     dPos.normalize();
        //     rotationTo(Z, dPos, curRot);
        //     if(curRot.w<0){
        //         curRot.setValue(-curRot.x, -curRot.y, -curRot.z, -curRot.w)
        //     }
        //     curJoint.rotationQuat = curRot;
        // }        
    }

}