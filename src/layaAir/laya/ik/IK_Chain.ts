import { IK_Target } from "./IK_Target";
import { isCollinear, quaternionFromTo, ripMatScale } from "./IK_Utils";
import { IK_Comp } from "./IK_Comp";
import { IK_ISolver } from "./IK_ISolver";
import { IK_ChainBase } from "./IK_ChainBase";
import { Vector3 } from "../maths/Vector3";
import { Quaternion } from "../maths/Quaternion";
import { Color } from "../maths/Color";
import { ILinerender } from "./LineRender";
import { Matrix4x4 } from "../maths/Matrix4x4";


const Z = new Vector3(0, 0, 1);
let dpos = new Vector3();
let drot = new Quaternion();
let v1 = new Vector3();
const QuatI = new Quaternion();
var tmpMat = new Matrix4x4();

/**
 * 从IK_pose1可以方便的绑定到某个骨骼上，随着动画动
 */
export class IK_Chain extends IK_ChainBase{
    //name=''
    //顺序是从根到末端
    //joints: IK_Joint[];
    //先只支持单个末端执行器
    private _showDbg = false;
    solver:IK_ISolver = null;

    poleTarget:IK_Target=null;
    _endAlign:'no'|'y'|'all'='no';
    private _isEndAlign=false;
    //如果末端对齐，这个记录parent在末端空间的位置
    private _parentInEnd:Matrix4x4 = null;

    private lastBoneDir:Vector3[]=[];
    private lastQuat:Quaternion[]=[];

    constructor(name:string,mgr:IK_Comp) {
        super(mgr);
        this.name = name;
        this.joints = [];
        //debug
        (window as any).ccc=this;
    }

    //所有的关节是否与目标点共线
    isCollinear(target: Vector3, epsilon= 1e-3): boolean {
        let joints = this.joints;
        if (joints.length < 2){
            return false;
        }
        
        // 获取链条的起点和终点
        const start = joints[0].position;
        const end = joints[joints.length - 1].position;
        let d1 = new Vector3();
        target.vsub(start,d1);
        if(this.totalLength<d1.length())
            return false;//够不着不算共线
        
        // 检查每个中间关节是否与起点和终点共线
        let n=joints.length-1;
        if(this._endAlign&&this._endAlign!=='no'){
            n-=1;
        }
        for (let i = 1; i < n; i++) {
            if (!isCollinear(start, joints[i].position, end, epsilon)) {
                return false;
            }
        }
        
        // 检查目标点是否与链条共线
        return isCollinear(start, end, target, epsilon);
    }    

    override visualize(line:ILinerender){
        //目标
        if(this.target){
            //在target位置画一个十字
            const pos = this.target.pos;
            this.target.getPose(tmpMat);
            ripMatScale(tmpMat);
            let e = tmpMat.elements;
            let len = 0.1
            let end1 = new Vector3(pos.x + e[0]*len, pos.y+e[1]*len,pos.z+e[2]*len);
            let end2 = new Vector3(pos.x - e[0]*len, pos.y-e[1]*len,pos.z-e[2]*len);
            let end3 = new Vector3(pos.x + e[4]*len, pos.y+e[5]*len,pos.z+e[6]*len);
            let end4 = new Vector3(pos.x - e[4]*len, pos.y-e[5]*len,pos.z-e[6]*len);
            let end5 = new Vector3(pos.x + e[8]*len, pos.y+e[9]*len,pos.z+e[10]*len);
            let end6 = new Vector3(pos.x - e[8]*len, pos.y-e[9]*len,pos.z-e[10]*len);
            line.addLine(pos,end1,Color.RED,Color.RED);
            line.addLine(pos,end2,Color.RED,Color.RED);
            line.addLine(pos,end3,Color.GREEN,Color.GREEN);
            line.addLine(pos,end4,Color.GREEN,Color.GREEN);
            line.addLine(pos,end5,Color.BLUE,Color.BLUE);
            line.addLine(pos,end6,Color.BLUE,Color.BLUE);
        }
        if(this.endAlign!='no'){
            let e = this.joints[this.joints.length-1].bone.transform.worldMatrix.elements;
            let ori = new Vector3(e[12],e[13],e[14]);
            let len = 53;
            let end = new Vector3(ori.x+e[4]*len,ori.y+e[5]*len,ori.z+e[6]*len);
            
            line.addLine(ori,end,Color.RED,Color.YELLOW);
        }
        let joints = this.joints;
        for(let i=0,n=joints.length; i<n; i++){
            let joint = joints[i];
            joint.visualize(line);
            let next = joints[i+1];
            if(next){
                line.addLine(joint.position, 
                    next.position, 
                    new Color(1,0,0,1), new Color(0,1,0,1));
            }
        }
    }
   
    set showDbg(b:boolean){
        this._showDbg=b;
        if(!b){
        }
    }

    get showDbg(){
        return this._showDbg;
    }

    set endAlign(v:'no'|'y'|'all'){
        this._endAlign = v;
        if(v&&v!='no'){
            //this.endFixed=true  不能设置这个，这个会导致rotateJoint无效
            this._isEndAlign=true;
        }else{
            this._isEndAlign=false;
            this._parentInEnd = null;
        }
    }

    get endAlign(){
        return this._endAlign;
    }

    private _firstGetParentInEnd = true;
    override solve(comp:IK_Comp){
        if(!this._target){
            return ;
        }
        let solver = this.solver;
        solver.poleTarget = this.poleTarget;

        let joints = this.joints;
        let targetPos = this.target.pos.clone();
        //如果需要对齐的处理
        let alignQ:Quaternion=null;
        if(this._isEndAlign){
            joints[joints.length-1].fixed=true;
            if(true || this._firstGetParentInEnd){
                //由于不知道什么时候需要重新计算，例如ide调整end朝向，程序调整，所以每次都算
                this._firstGetParentInEnd=false;
                let end = this.joints[this.joints.length-1];
                //根据parent在这个空间的位置，计算parent的世界空间的位置
                let matEnd = end.bone.transform.worldMatrix.clone();// end.worldMatrix.clone();
                let matParent = end.parent.bone.transform.worldMatrix.clone();//end.parent.worldMatrix.clone();
                //都是在世界空间计算，最终的target位置也是世界空间，因此要去掉缩放
                ripMatScale(matEnd);
                ripMatScale(matParent);
                let invMatEnd = new Matrix4x4();
                matEnd.invert(invMatEnd);
                let parentInEnd = this._parentInEnd = new Matrix4x4();
                Matrix4x4.multiply(invMatEnd,matParent, parentInEnd);
            }
            let target = this.target;
            alignQ = new Quaternion();
          
            let parentInEnd = this._parentInEnd;
            switch(this._endAlign){
                case 'y':{
                    //目标的朝向
                    let dir = new Vector3();
                    if(target.targetSprite){
                        let tarMat = target.targetSprite.transform.worldMatrix.elements;
                        dir.setValue(tarMat[4],tarMat[5],tarMat[6]);
                    }else{
                        target.dir.cloneTo(dir);
                    }
                    dir.normalize();

                    //end的朝向
                    let endMat = joints[joints.length-1].transform.worldMatrix;
                    ripMatScale(endMat);
                    let endY = new Vector3(endMat.elements[4],endMat.elements[5],endMat.elements[6]);
                    let dq = new Quaternion();
                    quaternionFromTo(endY,dir,dq);

                    //调整end的姿态，得到矩阵，计算实际目标点
                    let dmat = new Matrix4x4();
                    Matrix4x4.createFromQuaternion(dq,dmat);
                    let endTarget = new Matrix4x4();
                    Matrix4x4.multiply(dmat,endMat,endTarget);

                    //把end矩阵设置到target上，计算目标位置
                    endTarget.elements[12]=targetPos.x;
                    endTarget.elements[13]=targetPos.y;
                    endTarget.elements[14]=targetPos.z;

                    let parentTarget = dmat;
                    Matrix4x4.multiply(endTarget,parentInEnd,parentTarget);
                    let e = parentTarget.elements;
                    targetPos.setValue(e[12],e[13],e[14]);    
                    //计算parent的目标朝向
                    Quaternion.createFromMatrix4x4(parentTarget,alignQ);
                }
                    break;
                case 'all':{
                    let targetMat = new Matrix4x4();
                    target.getPose(targetMat);
                    ripMatScale(targetMat)

                    let parentTarget = new Matrix4x4();
                    Matrix4x4.multiply(targetMat,parentInEnd,parentTarget);
                    //得到位置和朝向
                    let e = parentTarget.elements;
                    targetPos.setValue(e[12],e[13],e[14]);    
                    ripMatScale(parentTarget)
                    Quaternion.createFromMatrix4x4(parentTarget,alignQ);
                    break;
                }
                default:
                    break;
            }
        }

        for(let i=0,n=joints.length; i<n-1; i++){
            let cjoint = joints[i];
            if(cjoint.fixed)
                continue;
            let njoint = joints[i+1];
            let boneDir:Vector3;
            if(this.lastBoneDir[i])boneDir = this.lastBoneDir[i]
            else{
                boneDir = this.lastBoneDir[i] = new Vector3();
            }
            njoint.position.vsub(cjoint.position,boneDir);
            boneDir.normalize();
            this.lastQuat[i] = joints[i].rotationQuat.clone();
        }

        solver.solve(comp,this,targetPos,this._isEndAlign);

        //美化旋转，根据骨骼方向简化旋转四元数
        for(let i=0,n=joints.length; i<n-1; i++){
            let cjoint = joints[i];
            if(cjoint.fixed)
                continue;
            let njoint = joints[i+1];
            let boneDir = new Vector3();
            njoint.position.vsub(cjoint.position,boneDir);
            boneDir.normalize();
            let lastDir = this.lastBoneDir[i];
            let q = cjoint.rotationQuat
            let dq = new Quaternion();
            quaternionFromTo(lastDir,boneDir,dq);
            Quaternion.multiply(dq,this.lastQuat[i],q)
            cjoint.rotationQuat = q;
        }


        //根据 alignQ 更新一下末端的朝向
        if(this._isEndAlign && alignQ){
            //计算dq。根据parent的旋转和parent的期望的旋转，计算一个dq，用来旋转parent，这样就会导致末端符合朝向要求
            let curParentQ = joints[joints.length-2].rotationQuat;
            let invParQ = new Quaternion();
            curParentQ.invert(invParQ)
            let dq = new Quaternion();
            Quaternion.multiply(alignQ,invParQ,dq);
            this.rotateJoint(joints.length-2,dq);
        }
        //this.ik_result.captureIKResult(this.joints);
        //this.layerMgr.set(this.ik_result)
        //return this.ik_result;
    }

    /**
     * 根据关节的位置计算关节的朝向。
     * 为了避免扭的效果，按照从根到末端计算，并且都按照相对parent的来计算，而不是按照Z
     */
    updateRotations(): void {
        const joints = this.joints;
        const jointCount = joints.length;
        if (jointCount < 2)
            return;
        const rotation = new Quaternion();
        const relDir = new Vector3();
        const dirWorld = v1;

        // 逐节：将本地 relPos 方向对齐到当前世界方向，避免固定 Z 轴假设
        for (let i = 0; i < jointCount - 1; i++) {
            const cur = joints[i];
            const nxt = joints[i + 1];

            // 期望的世界方向
            nxt.position.vsub(cur.position, dirWorld).normalize();

            // 该段在本地空间的方向
            cur === joints[jointCount - 1] ? relDir.setValue(0, 0, 1) : nxt.relPos.cloneTo(relDir);
            const len = relDir.length();
            if (len < 1e-6) {
                // 退化，保持原旋转
                continue;
            }
            relDir.scale(1 / len, relDir);

            // 计算从本地方向到世界方向的旋转
            quaternionFromTo(relDir, dirWorld, rotation);
            rotation.cloneTo(cur.rotationQuat);
        }

        // 末端没有子节点，简单继承上一个的旋转以保持连续
        joints[jointCount - 2].rotationQuat.cloneTo(joints[jointCount - 1].rotationQuat);
    }
}