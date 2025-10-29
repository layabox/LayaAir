import { Color } from "../maths/Color";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_ChainBase } from "./IK_ChainBase";
import { IK_Comp } from "./IK_Comp";
import { IK_ConstraintInstance } from "./IK_Constraint";
import { IK_Joint } from "./IK_Joint";
import { IK_Target } from "./IK_Target";
import { quaternionFromTo, ripMatScale, solveLookat } from "./IK_Utils";
import { ILinerender } from "./LineRender";

let IQ = new Quaternion();

var targetPose = new Matrix4x4();

export class IK_Lookat extends IK_ChainBase {
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
        this.joints = new Array(0);
        if(root2end){
            //this.joints = joints;
            for(let i=0,n=joints.length;i<n;i++){
                //不直接赋值是需要计算长度等
                this.addJoint(joints[i])
            }
        }else{
            for(let i=joints.length-1;i>=0;i--){
                //不直接赋值是需要计算长度等
                this.addJoint(joints[i])
            }
        }
        this._end = this.joints[this.joints.length-1];
        if (!this._end.bone._isRenderNode) {
            //这种情况认为是固定关节
            this._hasOff = true;
            this._end.fixed=true;
            //this.joints.pop();  //最后一个是固定的，不需要
            //this._chainLength--;
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

    //朝向目标
    override solve() {
        if (!this.enable)
            return;
        if (!this._chainLength || !this._target)
            return;
        let deltaQ = new Quaternion();
        let invw = new Matrix4x4();
        let target = this._target.pos.clone();
        let localTarget = new Vector3();
        let end = this._end;
        //end.copyTransform();

        if(this.alignWithTarget){
            //效果不对，会引起头的移动
            // this._target.getPose(targetPose);
            // //ripMatScale(targetPose);
            // let ypr = new Vector3();
            // targetPose.decomposeYawPitchRoll(ypr);
            // let t = ypr.x;
            // ypr.x=ypr.y; ypr.y=t;
            // ypr.scale(180/Math.PI,ypr)
            // //控制实际的骨骼
            // let bone = end;
            // if(this._hasOff && this._chainLength>1){
            //     bone = this.bones[1];
            // }
            // bone.transform.rotationEuler = ypr;
        }
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
            //end.applyTransform();

        } else {
            let adjJoint = this._chainLength;
            if(this._hasOff)
                adjJoint-=1;
            //每一关节的旋转系数，先平均分
            let k = 1 / adjJoint;
            let it = IK_Lookat.dirIt;
            let succ=false;
            while(it-- && !succ){
                for (let i = adjJoint-1; i>=0; i--) {
                    //转到本地空间
                    let joint = this.joints[i];
                    //joint.copyTransform();
                    joint.worldMatrix.invert(invw);  //TODO 第一节可以不用转本地
                    Vector3.transformCoordinate(target, invw, localTarget);
                    
                    let endPose = end.worldMatrix;//由于调整，每次都要重新获得

                    //先判断是否到达目标了
                    if(true){
                        let ele = endPose.elements;
                        let endPos = new Vector3(ele[12],ele[13],ele[14]);
                        let endDir = new Vector3(ele[8],ele[9],ele[10]);
                        let end2tar = new Vector3();
                        target.vsub(endPos,end2tar);
                        end2tar.normalize();
                        endDir.normalize();
                        let c = endDir.dot(end2tar);
                        if(c>0.9){
                            //succ = true;  //TODO 早停
                            //break;
                        }
                    }

                    let endPoseLocal = new Matrix4x4();
                    Matrix4x4.multiply(invw,endPose,endPoseLocal);
                    if (!solveLookat(localTarget, endPoseLocal, deltaQ)) {
                        console.log('无法解决lookat问题');
                        return;
                    }

                    Quaternion.slerp(
                        IQ,
                        deltaQ,
                        k,
                        deltaQ
                    );
                    //应用旋转
                    let resultQ = new Quaternion();
                    let curR = joint.rotationQuat;
                    Quaternion.multiply(curR, deltaQ, resultQ);
                    //joint.rotationQuat = resultQ;

                    //由于rotateJoint传入的是世界空间的delta，即要求先当前，再delta，而上面计算的
                    //是本地空间的delta，所以需要先转换一下。
                    let invCur = new Quaternion();
                    curR.invert(invCur);
                    Quaternion.multiply(resultQ,invCur,deltaQ);
                    this.rotateJoint(i,deltaQ);
                    //joint.applyTransform();
                }
            }
        }
    }
}