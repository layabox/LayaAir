import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { IK_Chain } from "../IK_Chain";
import { IK_ISolver } from "../IK_ISolver";
import { IK_Target } from "../IK_Pose1";
import {quaternionFromTo} from "../IK_Utils"

var dpos = new Vector3();

export class IK_CCDSolver implements IK_ISolver {
    dampingFactor: number = 0.1; // 阻尼因子，0-1之间
    maxIterations: number;
    epsilon: number;
    poleTarget:IK_Target = null;

    constructor(maxIterations: number = 1, epsilon: number = 0.001) {
        this.maxIterations = maxIterations;
        this.epsilon = epsilon;
    }

    private _targetPos=new Vector3();
    solve(chain: IK_Chain, target:Vector3, endOffline:boolean) {
        let targetPos = this._targetPos;
        target.cloneTo(targetPos);
        let joints = chain.joints;
        let cnt = joints.length;
        const endEffector = chain.joints[endOffline?cnt-2:cnt-1];
        let iteration = 0;
        const jointToEndEffector = new Vector3();
        const jointToTarget = new Vector3();
        let rotation = new Quaternion();
        const basePos = chain.joints[0].position;

        let dist = 0;
        // 直线检测相关
        if(chain.isCollinear(targetPos) ){
            //共线了，随机动一个关节离开共线状态
            for (let i = joints.length - 2; i >= 0; i--) {
                const joint = joints[i];
                if(joint.perturbJoint())
                    break;
            }
        }
        let touched = false;
        while (iteration < this.maxIterations) {
            //从末端开始 -2 是因为规定最后一个是end
            let start = joints.length-2;
            if(endOffline) start-=1;
            for (let i = start; i >= 0; i--) {
                const joint = joints[i];
                if(joint.fixed)
                    continue;
                endEffector.position.vsub(joint.position, jointToEndEffector);
                if(jointToEndEffector.lengthSquared()<1e-5)
                    //endeffector和joint重合的情况
                    continue;

                if ((dist = Vector3.distanceSquared(endEffector.position, targetPos)) < this.epsilon**2) {
                    touched = true;
                    break;
                }

                jointToEndEffector.normalize();

                //toTarget
                targetPos.vsub(joint.position,jointToTarget);
                jointToTarget.normalize();

                //得到一个相对旋转，用来调整末端
                quaternionFromTo(jointToEndEffector, jointToTarget, rotation);
                // if(!quaternionFromTo(jointToEndEffector, jointToTarget, rotation)){
                //     //没有旋转，放弃后面的调整 //这个会导致约束失效
                //     continue;
                // }

                // 应用阻尼因子限制旋转幅度。可以避免抖动，柔化形状
                let iq = new Quaternion();
                rotation = Quaternion.slerp(
                    iq,
                    rotation,
                    this.dampingFactor,
                    iq
                );
                //更新朝向
                chain.rotateJoint(i,iq);
            }
            //赋值给实际的骨骼，否则约束的时候直接取骨骼的矩阵是错误的，会导致剧烈抖动
            //chain.applyIKResult();
            if (touched || (dist = Vector3.distanceSquared(endEffector.position, targetPos)) < this.epsilon**2) {
                break;
            }
            iteration++;
        }
        if(this.poleTarget && chain.joints.length>2){
            let axis = dpos;
            targetPos.vsub(basePos, axis);
            let polePos = this.poleTarget.pos;
            let baseToPole = new Vector3();
            polePos.vsub(basePos,baseToPole);
            let baseToMid = new Vector3();
            let middPos = chain.joints[1].position;
            middPos.vsub(basePos,baseToMid);
            let EPS = 1e-6;
            if(axis.length()>EPS && baseToPole.length()>EPS && baseToMid.length()>EPS){
                // 归一化旋转轴（base->target）
                axis.normalize();

                // 将 base->mid 与 base->pole 投影到垂直于轴的平面
                const projMid = new Vector3();
                const projPole = new Vector3();
                const tmp = new Vector3();

                // proj(v) = v - axis * dot(v, axis)
                axis.scale(Vector3.dot(baseToMid, axis), tmp);
                baseToMid.vsub(tmp, projMid);

                axis.scale(Vector3.dot(baseToPole, axis), tmp);
                baseToPole.vsub(tmp, projPole);

                const lenMid = projMid.length();
                const lenPole = projPole.length();
                // 中间点或极点在轴上，平面不稳定，跳过
                const EPSL=0.1; 
                if(lenMid <= EPSL || lenPole <= EPSL){
                    return;
                }

                // 归一化投影用于稳健的 atan2 计算
                projMid.scale(1/lenMid, projMid);
                projPole.scale(1/lenPole, projPole);

                const cosTheta = Math.max(-1, Math.min(1, Vector3.dot(projMid, projPole)));
                const cross = new Vector3();
                Vector3.cross(projMid, projPole, cross);
                const sinTheta = Vector3.dot(cross, axis);
                let angle = Math.atan2(sinTheta, cosTheta);

                if(isFinite(angle)){
                    // 加阻尼与角度上限，避免一次性大旋转
                    const clamp = (v:number, lo:number, hi:number)=> Math.max(lo, Math.min(hi, v));
                    const maxStep = 0.5; // ~28.6°
                    const damp = this.dampingFactor>0 ? clamp(this.dampingFactor, 0.05, 0.5) : 0.1;
                    angle = clamp(angle, -maxStep, maxStep) * damp;

                    if(Math.abs(angle) > 1e-5){
                        const rot = new Quaternion();
                        Quaternion.createFromAxisAngle(axis, angle, rot);
                        // 绕根节点（base）轴对整链做小角度旋转，微调肘部朝向极点
                        chain.rotateJoint(0, rot);
                        //chain.applyIKResult();
                    }
                }
            }
        }
    }

}