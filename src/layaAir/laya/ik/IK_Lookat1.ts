import { Color } from "../maths/Color";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_ChainBase } from "./IK_ChainBase";
import { IK_Comp } from "./IK_Comp";
import { IK_Joint } from "./IK_Joint";
import { IK_Target } from "./IK_Pose1";
import { quaternionFromTo } from "./IK_Utils";
import { ILinerender } from "./LineRender";


let IQ = new Quaternion();

export class IK_Lookat1 extends IK_ChainBase {
    private _chainLength = 0;
    private _end: IK_Joint = null;
    private _hasOff = false;
    static dirIt=1;
    alignWithTarget=false;
    constructor(
        joints: IK_Joint[],
        mgr:IK_Comp
    ) {
        super(mgr);
        this._chainLength = joints.length;
        //判断链的顺序，IK_ChainBase希望是从根到end
        let root2end=true;
        if(joints.length>1){
            if(joints[0].bone.parent == joints[1].bone){
                root2end = false;
            }else if(joints[1].bone.parent == joints[0].bone){
                root2end = true;
            }else{
                console.warn('无法确定lookat的ik链的顺序')
            }
        }
        if(root2end){
            for(let i=0,n=joints.length;i<n;i++){
                this.addJoint(joints[i])
            }
        }else{
            this.joints = new Array(0);
            for(let i=joints.length-1;i>=0;i--){
                this.addJoint(joints[i])
            }
        }
        this._end = this.joints[this.joints.length-1];
        if (!this._end.bone._isRenderNode) {
            //这种情况认为是固定关节（末端偏移关节），不参与旋转
            this._hasOff = true;
            this._end.fixed=true;
        }
        this.onLinkEnd();
    }

    override visualize(line: ILinerender) {
        for(let j of this.joints){
            if(j.constraint){
                j.constraint.visualize(j,line);
            }
        }
        if(this._target){
            let end = this._end;
            let wmat = end.bone.transform.worldMatrix.elements;
            let st = new Vector3(wmat[12], wmat[13], wmat[14]);
            let dir = new Vector3(wmat[8], wmat[9], wmat[10]);
            dir.normalize();
            let ed = new Vector3();
            this._target.pos.vsub(st, ed);
            let len = ed.length();
            ed.setValue(st.x + len * dir.x, st.y + len * dir.y, st.z + len * dir.z);
            line.addLine(st, ed, Color.RED, Color.RED);
        }
    }

    // 全局 Ray-CCD：让目标到末端Z射线的垂距收敛到0
    override solve() {
        if (!this.enable)
            return;
        if (!this._chainLength || !this._target)
            return;
        let deltaQ = new Quaternion();
        let target = this._target.pos.clone();
        let end = this._end;

        //一块骨骼
        if (this._chainLength == 1) {
            let oriw = end.worldMatrix;
            let todir = new Vector3(target.x-oriw.elements[12], target.y-oriw.elements[13],target.z-oriw.elements[14]);
            todir.normalize();
            let zdir = new Vector3(oriw.elements[8], oriw.elements[9], oriw.elements[10]);
            zdir.normalize();
            quaternionFromTo(zdir, todir, deltaQ);
            //应用旋转
            let curR = end.rotationQuat;
            let resultQ = new Quaternion();
            Quaternion.multiply(deltaQ,curR, resultQ);
            end.rotationQuat = resultQ;
            //约束调整后的结果
            let joint = this.joints[0]
            if(joint.constraint && joint.constraint.enable){
                joint.constraint.doConsraint(joint);
            }
        } else {
            let adjJoint = this._chainLength;
            if(this._hasOff)
                adjJoint-=1;
            //每一关节的旋转系数，先平均分
            let k = 1 / adjJoint;
            let it = IK_Lookat1.dirIt;
            let succ=false;
            while(it-- && !succ){
                for (let i = adjJoint-1; i>=0; i--) {
                    let joint = this.joints[i];
                    // 读取最新的末端姿态（偏移关节），形成全局“Ray-CCD”目标
                    let endPose = end.worldMatrix;
                    let ele = endPose.elements;
                    let endPosW = new Vector3(ele[12], ele[13], ele[14]);
                    let endDirW = new Vector3(ele[8], ele[9], ele[10]);
                    endDirW.normalize();

                    // 代理末端：目标在末端Z射线上的投影点（沿Z方向参数解）
                    let toTar = new Vector3(target.x - endPosW.x, target.y - endPosW.y, target.z - endPosW.z);
                    let dproj = Vector3.dot(toTar, endDirW);
                    let probeW = new Vector3(
                        endPosW.x + endDirW.x * dproj,
                        endPosW.y + endDirW.y * dproj,
                        endPosW.z + endDirW.z * dproj
                    );

                    // 当前关节原点（世界）
                    let je = joint.worldMatrix.elements;
                    let jPosW = new Vector3(je[12], je[13], je[14]);

                    // 让关节把 probe 朝向 target（世界向量下的最小旋转）
                    let vCur = new Vector3(probeW.x - jPosW.x, probeW.y - jPosW.y, probeW.z - jPosW.z);
                    let vTgt = new Vector3(target.x - jPosW.x, target.y - jPosW.y, target.z - jPosW.z);
                    vCur.normalize();
                    vTgt.normalize();
                    quaternionFromTo(vCur, vTgt, deltaQ);
                    Quaternion.slerp(IQ, deltaQ, k, deltaQ);
                    this.rotateJoint(i, deltaQ);
                }

                // 早停：目标到末端Z射线的垂距
                let ee = end.worldMatrix.elements;
                let epos = new Vector3(ee[12], ee[13], ee[14]);
                let edir = new Vector3(ee[8], ee[9], ee[10]);
                edir.normalize();
                let e2t = new Vector3(target.x - epos.x, target.y - epos.y, target.z - epos.z);
                let proj = Vector3.dot(e2t, edir);
                let perp = new Vector3(e2t.x - proj * edir.x, e2t.y - proj * edir.y, e2t.z - proj * edir.z);
                if (perp.length() < 1e-3) {
                    succ = true;
                }
            }
        }
    }

    override applyIKResult(){
        if(!this.enable)
            return;
        for(let joint of this.joints){
            if(joint.fixed)continue;
            joint.applyTransform();
        }
    }
}


