import { Vector3 } from "../../maths/Vector3";
import { Quaternion } from "../../maths/Quaternion";
import { IK_Chain } from "../IK_Chain";
import { IK_ISolver } from "../IK_ISolver";
import { IK_Joint } from "../IK_Joint";
import { IK_Target } from "../IK_Pose1";
import { ClsInst, delay, rotationTo } from "../IK_Utils";
import { Pool } from "../../utils/Pool";

let dPos = new Vector3();
let v1 = new Vector3();
let v2 = new Vector3();
const Z = new Vector3(0, 0, 1);

export class IK_FABRIK_Solver implements IK_ISolver {
    static clsid = '5c4f01ab-ca1a-43ba-87d9-ad5277bcb9fb'
    maxIterations: number;
    tolerance: number;
    debugProc=false;

    constructor(maxIterations: number = 10, tolerance: number = 0.01) {
        ClsInst.addInst(this);
        this.maxIterations = maxIterations;
        this.tolerance = tolerance;
    }

    async solve(chain: IK_Chain, target: IK_Target) {
        const joints = chain.joints;
        const totalLength = this.getTotalLength(joints);
        const targetPos = target.pos;
        const basePos = joints[0].position.clone();

        targetPos.vsub(basePos, dPos);
        //如果长度超出伸直之后的范围，直接朝向目标
        if (dPos.length() > totalLength) {
            this.stretchToTarget(chain, targetPos);
            return;
        }

        let constraintDpos = new Vector3();
        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            // Forward pass
            //先把末端设置到目标位置上
            targetPos.cloneTo(joints[joints.length - 1].position);
            for (let i = joints.length - 2; i >= 0; i--) {
                this.forwardStep(joints[i], joints[i + 1]);
            }

            //debug
            if(this.debugProc){
                await delay(100);
                //this.updateRotations(chain);
            }
            //debug

            // Backward pass
            // 先把第一个的位置设置到原始位置上
            basePos.cloneTo(joints[0].position);
            for (let i = 1; i < joints.length; i++) {
                this.backwardStep(joints[i - 1], joints[i]);
            }

            //debug
            if(this.debugProc){
                await delay(100);
            }
            //debug

            //TODO 优化 由于约束需要朝向,需要有机会计算一下.可以只计算相关的.
            chain.updateRotations();


            if (joints[joints.length - 1].position.vsub(targetPos,v1).length() < this.tolerance) {
                break;
            }
            //debug
            if(this.debugProc){
                await delay(1000);
                console.log('ii=',iteration)
                chain.updateRotations();
            }
            //debug
        }

        //调整完位置,最后再计算朝向.上面在约束的时候可能已经求解了,但是有的可能没有约束,所以,这里再算一遍
        // 并且前面是迭代计算,会导致不合理的四元数
        chain.updateRotations();
    }

    private getTotalLength(joints: IK_Joint[]): number {
        let length = 0;
        for (let i = 0; i < joints.length - 1; i++) {
            length += joints[i].length;
        }
        return length;
    }

    private stretchToTarget(chain: IK_Chain, targetPos: Vector3): void {
        //let v1 = Pool.getItemByClass('vec3',Vector3);
        const joints = chain.joints;
        const direction = targetPos.vsub(joints[0].position,v1).normalize();
        
        for (let i = 1; i < joints.length; i++) {
            const joint = joints[i];
            const prevJoint = joints[i - 1];
            //curpos = prevpos + prev.length*dir
            prevJoint.position.vadd( direction.scale(prevJoint.length,v2), joint.position);
        }

        chain.updateRotations();
    }

    /**
     * 这个虽然叫做forward，其实是从末端到根，其实更符合传统骨骼动画的backward的定义。
     * @param currentJoint 当前关节
     * @param nextJoint  下一个关节，更接近末端
     */
    private forwardStep(currentJoint: IK_Joint, nextJoint: IK_Joint): void {
        //dir = j5-j4
        const direction = nextJoint.position.vsub(currentJoint.position,v1).normalize();
        //修改当前关节（从next改当前）的位置 current.pos =  next.pos - current.length*dir
        nextJoint.position.vsub(direction.scale(currentJoint.length,v2),currentJoint.position);
        // 前向过程的约束
        if((window as any).uselimit && currentJoint.angleLimit){
            //计算现在的朝向，在这个朝向的基础上应用约束
            rotationTo(Z, direction, currentJoint.rotationQuat);
            //
            let dpos = new Vector3();
            //这个会修改nextJoint的朝向，并得到被约束了多少距离（约束后位置-无约束位置）
            //由于希望调整当前节点之后，nextJoint的位置还是在没有约束的情况，所以要进去dpos
            if(currentJoint.angleLimit.constraintPos(nextJoint, dpos)){
                currentJoint.position.vsub(dpos, currentJoint.position);
            }
        }
    }

    private backwardStep(prevJoint: IK_Joint, currentJoint: IK_Joint): void {
        //dir = j1-j0
        const direction = currentJoint.position.vsub(prevJoint.position,v1).normalize();
        //修改当前关节(prev的下一个）的位置 current.pos = prev.pos + dir*prev.length
        prevJoint.position.vadd(direction.scale(prevJoint.length,v2),currentJoint.position);
    }
}