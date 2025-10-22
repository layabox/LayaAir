import { IK_Target } from "./IK_Pose1";
import { isCollinear, quaternionFromTo } from "./IK_Utils";
import { IK_Comp } from "./IK_Comp";
import { IK_ISolver } from "./IK_ISolver";
import { IK_ChainBase } from "./IK_ChainBase";
import { Vector3 } from "../maths/Vector3";
import { Quaternion } from "../maths/Quaternion";
import { Color } from "../maths/Color";
import { ILinerender } from "./LineRender";


const Z = new Vector3(0, 0, 1);
let dpos = new Vector3();
let drot = new Quaternion();
let v1 = new Vector3();
const QuatI = new Quaternion();

/**
 * 从IK_pose1可以方便的绑定到某个骨骼上，随着动画动
 */
export class IK_Chain extends IK_ChainBase{
    //name=''
    //顺序是从根到末端
    //joints: IK_Joint[];
    //先只支持单个末端执行器
    private _showDbg = false;
    private _alignWithTarget = false;
    solver:IK_ISolver = null;

    poleTarget:IK_Target=null;

    constructor(name:string,mgr:IK_Comp) {
        super(mgr);
        this.name = name;
        this.joints = [];
        //debug
        (window as any).ccc=this;
    }

    //注意这个必须在构建完成之后做
    set alignWithTarget(v:boolean){
        let end = this.joints[this.joints.length-1];
        let hasRender = !!end.bone._isRenderNode;
        if(v){
            if(!hasRender){
                //如果end不可见，又要求朝向对齐，则认为是不可调节的固定偏移。因为不可见end的对齐没有意义，一定是希望调整上一个节点
            }else{
                //如果end可见，就是直接对齐end就行。
            }
        }else{

        }
        this._alignWithTarget = v;
    }

    get alignWithTarget(){
        return this._alignWithTarget;
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
        for (let i = 1; i < joints.length - 1; i++) {
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
            let len = 0.1
            let end1 = new Vector3(pos.x+len,pos.y,pos.z);
            let end2 = new Vector3(pos.x-len,pos.y,pos.z);
            let end3 = new Vector3(pos.x,pos.y+len,pos.z);
            let end4 = new Vector3(pos.x,pos.y-len,pos.z);
            let end5 = new Vector3(pos.x,pos.y,pos.z+len);
            let end6 = new Vector3(pos.x,pos.y,pos.z-len);
            line.addLine(pos,end1,Color.RED,Color.RED);
            line.addLine(pos,end2,Color.RED,Color.RED);
            line.addLine(pos,end3,Color.GREEN,Color.GREEN);
            line.addLine(pos,end4,Color.GREEN,Color.GREEN);
            line.addLine(pos,end5,Color.BLUE,Color.BLUE);
            line.addLine(pos,end6,Color.BLUE,Color.BLUE);
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

    override solve(){
        if(!this._target)
            return ;
        let solver = this.solver;
        if(this._alignWithTarget){
            //如果要对齐朝向，则要先把end对齐到target上，然后得到一个新的target，并用来控制上一级
        }
        solver.poleTarget = this.poleTarget;
        solver.solve(this,this._target);
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