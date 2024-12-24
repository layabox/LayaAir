import { Vector3 } from "../../maths/Vector3";
import { Quaternion } from "../../maths/Quaternion";
import { IK_Chain } from "../IK_Chain";
import { IK_ISolver } from "../IK_ISolver";
import { IK_Joint } from "../IK_Joint";
import { IK_Target } from "../IK_Pose1";
import { rotationTo } from "../IK_Utils";

let dPos = new Vector3();
let v1 = new Vector3();
let v2 = new Vector3();
const Z = new Vector3(0, 0, 1);

export class IK_FABRIK_Solver implements IK_ISolver {
    maxIterations: number;
    tolerance: number;

    constructor(maxIterations: number = 10, tolerance: number = 0.01) {
        this.maxIterations = maxIterations;
        this.tolerance = tolerance;
    }

    solve(chain: IK_Chain, target: IK_Target): void {
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

            if (joints[joints.length - 1].position.vsub(targetPos,v1).length() < this.tolerance) {
                break;
            }
        }

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

            // Apply angle limits if needed
            // applyAngleLimits_euler(currentJoint);
        }
    }
}