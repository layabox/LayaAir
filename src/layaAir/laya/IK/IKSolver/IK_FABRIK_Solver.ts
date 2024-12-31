import { Vector3 } from "../../maths/Vector3";
import { Quaternion } from "../../maths/Quaternion";
import { IK_Chain } from "../IK_Chain";
import { IK_ISolver } from "../IK_ISolver";
import { IK_Joint } from "../IK_Joint";
import { IK_Target } from "../IK_Pose1";
import { delay, rotationTo } from "../IK_Utils";

let dPos = new Vector3();
let v1 = new Vector3();
let v2 = new Vector3();
const Z = new Vector3(0, 0, 1);

export class IK_FABRIK_Solver implements IK_ISolver {
    maxIterations: number;
    tolerance: number;
    debugProc=false;

    constructor(maxIterations: number = 10, tolerance: number = 0.01) {
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

        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            // Forward pass
            //先把末端设置到目标位置上
            targetPos.cloneTo(joints[joints.length - 1].position);
            for (let i = joints.length - 2; i >= 0; i--) {
                this.forwardStep(joints[i], joints[i + 1]);
            }

            // Backward pass
            // 先把第一个的位置设置到原始位置上
            basePos.cloneTo(joints[0].position);
            for (let i = 1; i < joints.length; i++) {
                this.backwardStep(joints[i - 1], joints[i]);
            }

            //TODO 优化 由于约束需要朝向,需要有机会计算一下.可以只计算相关的.
            this.updateRotations(chain);

            // 约束,这个可能会导致位置调整,所以从根开始约束
            for (let i = 0; i < joints.length; i++) {
                let current = joints[i];
                if(!current.angleLimit)
                    continue;
                //如果有约束的话,要更新parent和自己的朝向,因为之前没有计算
                if(current.angleLimit.constraint(current)){
                    //发生限制了,需要调整子的位置
                    chain.applyJointChange(i);
                }
            }

            if (joints[joints.length - 1].position.vsub(targetPos,v1).length() < this.tolerance) {
                break;
            }
            //debug
            if(this.debugProc){
                await delay(1000);
                console.log('ii=',iteration)
                this.updateRotations(chain);
            }
            //debug
        }

        //调整完位置,最后再计算朝向.上面在约束的时候可能已经求解了,但是有的可能没有约束,所以,这里再算一遍
        // 并且前面是迭代计算,会导致不合理的四元数
        this.updateRotations(chain);
    }

    private getTotalLength(joints: IK_Joint[]): number {
        let length = 0;
        for (let i = 0; i < joints.length - 1; i++) {
            length += joints[i].length;
        }
        return length;
    }

    private stretchToTarget(chain: IK_Chain, targetPos: Vector3): void {
        const joints = chain.joints;
        const direction = targetPos.vsub(joints[0].position,v1).normalize();
        
        for (let i = 1; i < joints.length; i++) {
            const joint = joints[i];
            const prevJoint = joints[i - 1];
            //curpos = prevpos + prev.length*dir
            prevJoint.position.vadd( direction.scale(prevJoint.length,v2), joint.position);
        }

        this.updateRotations(chain);
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
    }

    private backwardStep(prevJoint: IK_Joint, currentJoint: IK_Joint): void {
        //dir = j1-j0
        const direction = currentJoint.position.vsub(prevJoint.position,v1).normalize();
        //修改当前关节(prev的下一个）的位置 current.pos = prev.pos + dir*prev.length
        prevJoint.position.vadd(direction.scale(prevJoint.length,v2),currentJoint.position);
    }

    private updateRotations(chain: IK_Chain): void {
        const joints = chain.joints;

        for (let i = 0; i < joints.length - 1; i++) {
            const currentJoint = joints[i];
            const nextJoint = joints[i + 1];
            const direction = nextJoint.position.vsub(currentJoint.position,v1).normalize();

            const rotation = new Quaternion();
            rotationTo(Z, direction, rotation);
            rotation.cloneTo(currentJoint.rotationQuat);

            //更新约束轴
            if(currentJoint.angleLimit){
                
            }

        }
    }
}