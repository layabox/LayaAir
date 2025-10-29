import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { IK_Chain } from "../IK_Chain";
import { IK_ISolver } from "../IK_ISolver";
import { IK_Joint } from "../IK_Joint";
import { IK_Target } from "../IK_Target";
import { quaternionFromTo } from "../IK_Utils";


let dPos = new Vector3();
let v1 = new Vector3();
let v2 = new Vector3();
const Z = new Vector3(0, 0, 1);

export class IK_FABRIK_Solver implements IK_ISolver {
    maxIterations: number;
    tolerance: number;
    debugProc = false;
    poleTarget:IK_Target = null;

    constructor(maxIterations: number = 10, tolerance: number = 0.01) {
        //ClsInst.addInst(this);
        this.maxIterations = maxIterations;
        this.tolerance = tolerance;
    }
    dampingFactor: number;

    solve(chain: IK_Chain, targetPos: Vector3, endOffline:boolean) {
        const joints = chain.joints;
        const totalLength = chain.totalLength;
        const basePos = joints[0].position.clone();

        targetPos.vsub(basePos, dPos);
        //如果长度超出伸直之后的范围，直接朝向目标
        if (dPos.length() > totalLength) {
            this.stretchToTarget(chain, targetPos);
            return;
        }

        // 直线检测：共线时微扰以避免退化（与 CCD 保持一致）
        if (chain.isCollinear(targetPos)) {
            for (let i = joints.length - 2; i >= 0; i--) {
                const joint = joints[i];
                if (joint.perturbJoint())
                    break;
            }
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
            chain.updateRotations();
            // 应用关节约束，并回推子节点位置
            this.applyConstraints(chain);
            // 将结果同步到骨骼，避免约束读取到旧的矩阵
            //chain.applyIKResult();

            if (joints[joints.length - 1].position.vsub(targetPos,v1).length() < this.tolerance) {
                break;
            }
        }

        // 极向修正：若设置了 poleTarget，用根->目标轴的小角度旋转将肘部朝向极点
        if (this.poleTarget && joints.length > 2) {
            let axis = dPos;
            targetPos.vsub(basePos, axis);
            let polePos = this.poleTarget.pos;
            let baseToPole = new Vector3();
            polePos.vsub(basePos, baseToPole);
            let baseToMid = new Vector3();
            let middPos = chain.joints[1].position;
            middPos.vsub(basePos, baseToMid);
            const EPS = 1e-6;
            if (axis.length() > EPS && baseToPole.length() > EPS && baseToMid.length() > EPS) {
                axis.normalize();
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
                const EPSL = 0.1;
                if (lenMid > EPSL && lenPole > EPSL) {
                    projMid.scale(1 / lenMid, projMid);
                    projPole.scale(1 / lenPole, projPole);
                    const cosTheta = Math.max(-1, Math.min(1, Vector3.dot(projMid, projPole)));
                    const cross = new Vector3();
                    Vector3.cross(projMid, projPole, cross);
                    const sinTheta = Vector3.dot(cross, axis);
                    let angle = Math.atan2(sinTheta, cosTheta);
                    if (isFinite(angle)) {
                        const clamp = (v:number, lo:number, hi:number)=> Math.max(lo, Math.min(hi, v));
                        const maxStep = 0.5;
                        const damp = this.dampingFactor>0 ? clamp(this.dampingFactor, 0.05, 0.5) : 0.1;
                        angle = clamp(angle, -maxStep, maxStep) * damp;
                        if (Math.abs(angle) > 1e-5) {
                            const rot = new Quaternion();
                            Quaternion.createFromAxisAngle(axis, angle, rot);
                            chain.rotateJoint(0, rot);
                            //chain.applyIKResult();
                        }
                    }
                }
            }
        }

        // 调整完位置,最后再计算朝向，确保未受约束的关节也得到合理四元数
        chain.updateRotations();
    }

    // 按照从根到末端逐节应用约束。通过零旋转触发 rotateJoint 的约束逻辑并更新后续关节位置
    private applyConstraints(chain: IK_Chain): void {
        const joints = chain.joints;
        if (joints.length < 2)
            return;
        const iq = new Quaternion(); // identity
        for (let i = 0; i < joints.length - 1; i++) {
            chain.rotateJoint(i, iq);
        }
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
        // 拉伸情况下也需要施加约束，避免越界
        this.applyConstraints(chain);
        //chain.applyIKResult();
    }

    /**
     * 这个虽然叫做forward，其实是从末端到根，其实更符合传统骨骼动画的backward的定义。
     * @param currentJoint 当前关节
     * @param nextJoint  下一个关节，更接近末端
     */
    private forwardStep(currentJoint: IK_Joint, nextJoint: IK_Joint): void {
        //dir = j5-j4 j5=next
        const direction = nextJoint.position.vsub(currentJoint.position,v1).normalize();
        //修改当前关节（从next改当前）的位置 current.pos =  next.pos - current.length*dir
        nextJoint.position.vsub(direction.scale(currentJoint.length,v2),currentJoint.position);
    }

    private backwardStep(prevJoint: IK_Joint, currentJoint: IK_Joint): void {
        //dir = j1-j0  current=j1
        const direction = currentJoint.position.vsub(prevJoint.position,v1).normalize();
        //修改当前关节(prev的下一个）的位置 current.pos = prev.pos + dir*prev.length
        prevJoint.position.vadd(direction.scale(prevJoint.length,v2),currentJoint.position);
    }
}