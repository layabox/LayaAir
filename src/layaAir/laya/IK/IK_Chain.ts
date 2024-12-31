import { BlinnPhongMaterial } from "../d3/core/material/BlinnPhongMaterial";
import { MeshFilter } from "../d3/core/MeshFilter";
import { MeshRenderer } from "../d3/core/MeshRenderer";
import { PixelLineSprite3D } from "../d3/core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Mesh } from "../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../d3/resource/models/PrimitiveMesh";
import { Color } from "../maths/Color";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_AngleLimit } from "./IK_Constraint";
import { IK_EndEffector } from "./IK_EndEffector";
import { IK_Joint } from "./IK_Joint";
import { IK_Pose1, IK_Target } from "./IK_Pose1";
import { rotationTo } from "./IK_Utils";

const Z = new Vector3(0, 0, 1);
let dpos = new Vector3();

/**
 * 从IK_pose1可以方便的绑定到某个骨骼上，随着动画动
 */
export class IK_Chain extends IK_Pose1 {
    name=''
    //顺序是从根到末端
    joints: IK_Joint[];
    //先只支持单个末端执行器
    end_effector: IK_EndEffector;
    //构造的时候的位置，以后的位置都是相对这个做偏移
    private _lastPos = new Vector3();
    //设置世界矩阵或者修改某个joint的时候更新。0表示需要全部更新
    //private _dirtyIndex = 0;
    private _showDbg = false;
    private _target:IK_Target=null;

    constructor() {
        super();
        this.joints = [];
    }

    /**
     * 
     * @param joint 
     * @param pos 
     * @param isWorldPos 是否是世界空间，所谓的世界空间不一定真的是世界空间，如果是在system中，则是system空间
     */
    addJoint(joint: IK_Joint, pos: Vector3, isWorldPos = false, isEnd = false): void {
        if (this.end_effector) {
            throw '已经结束了'
        }
        let PI = Math.PI;
        joint.angleLimit =new IK_AngleLimit(new Vector3(-PI,-PI,-PI),new Vector3(PI,PI,PI))
        //this.updateWorldPos();
        let lastJoint = this.joints[this.joints.length - 1];
        joint.position = new Vector3();
        if (!lastJoint) {
            this._lastPos = pos.clone();
            joint.rotationQuat = new Quaternion();  //第一个固定为单位旋转
            pos.cloneTo(joint.position);
        } else {
            if (isWorldPos) {
                pos.cloneTo(joint.position);
                //先转成本地空间
                let localPos = new Vector3();
                //与上一个joint的世界空间对比。这时候上一个joint的position已经计算了。
                pos.vsub(lastJoint.position, localPos);
                pos = localPos;
            } else {
                //累加
                lastJoint.position.vadd(pos, joint.position);
            }
            lastJoint.length = pos.length();
            //计算朝向
            pos.normalize();
            let quat = lastJoint.rotationQuat;
            rotationTo(Z, pos, quat);
            lastJoint.rotationQuat = quat;
            joint.parent = lastJoint;
        }
        this.joints.push(joint);
        //为了简化，末端就是最后一个joint
        if (isEnd) {
            this.setEndEffector(this.joints.length - 1);
        }
    }

    visualize(line:PixelLineSprite3D){
        let joints = this.joints;
        for(let i=0,n=joints.length; i<n; i++){
            let joint = joints[i];
            joint.visualize(line);
            let next = joints[i+1];
            if(next){
                //line.addLine(joint.position, next.position, new Color(1,0,0,1), new Color(0,1,0,1));
            }
        }
    }

    //给一个相对空间的，如果都是null则使用最后一个joint作为end effector
    //chain只是允许设置相对空间的，如果要设置世界空间，需要在system中设置，那里能得到世界信息
    setEndEffector(index=-1) {
        let joints = this.joints;
        if(index<0){
            index = joints.length-1;
        }
        this.end_effector = new IK_EndEffector(joints[index]);

        //设置结束，可以做一些预处理
        this.onLinkEnd();
    }

    private onLinkEnd(){
        //计算每个joint的相对于bone的旋转偏移
        let joincnt = this.joints.length;
        let lastJointZ = new Vector3();
        for(let i=0; i<joincnt-1; i++){
            let curJoint = this.joints[i];
            let nextJoint = this.joints[i+1];
            let curnode = curJoint.userData.bone;
            let curBoneZ:Vector3;
            if(curnode){
                let wmat = curnode.transform.worldMatrix.elements;
                curBoneZ = new Vector3(wmat[8],wmat[9],wmat[10]);
            }else{
                curBoneZ = Z;
            }
            //旋转偏移：ik默认的骨骼朝向是(0,0,1),因此这里先要找出实际z的朝向，作为一个旋转偏移
            nextJoint.position.vsub(curJoint.position,lastJointZ);
            lastJointZ.normalize();
            let rotoff = new Quaternion();
            rotationTo(lastJointZ,curBoneZ,rotoff);
            curJoint.userData.rotOff = rotoff;

            //初始化约束信息
            let limit = curJoint.angleLimit;
            if(limit){
                limit.init(curJoint);
            }
        }
    }

    //附加一个末端。
    appendEndEffector(pos: Vector3, isWorldSpace = false) {
        this.addJoint(new IK_Joint(), pos, isWorldSpace);
        this.setEndEffector();
    }

    enable(b: boolean) {
    }

    set showDbg(b:boolean){
        this._showDbg=b;
        if(!b){
            for(let joint of this.joints){
                if(joint.userData.dbgModel){
                    if(joint.userData.dbgModel.scene){
                        joint.userData.dbgModel.scene.removeChild(joint.userData.dbgModel);
                    }
                }
                joint.userData.dbgModel = null;
            }
        }
    }

    get showDbg(){
        return this._showDbg;
    }


    /**
     * 设置根节点的位置
     * @param pos 
     */
    setWorldPos(pos: Vector3) {
        pos.vsub(this._lastPos,dpos);
        //更新所有节点的位置
        for(let joint of this.joints){
            joint.position.vadd(dpos,joint.position);
        }
        //为了避免误差，第一个直接设置。这样后续的即使有误差，也会被solve的过程中修正（长度固定）
        pos.cloneTo(this.joints[0].position);
        pos.cloneTo(this._lastPos);
    }

    //应用一下骨骼的动画
    updateBoneAnim(){
        if(!this.joints[0])return;
        let rootBone = this.joints[0]?.userData?.bone;
        if(!rootBone) return;
        let rootPos = rootBone.transform.position;
        this.setWorldPos(rootPos);        
    }

    private _addMeshSprite(mesh:Mesh,color:Color,pos:Vector3){
        let sp3 = new Sprite3D();
        let mf = sp3.addComponent(MeshFilter);
        mf.sharedMesh = mesh;
        let r = sp3.addComponent(MeshRenderer)
        let mtl = new BlinnPhongMaterial();
        r.material = mtl;
        sp3.transform.position=pos;
        //this.rootSprite.scene.addChild(sp3);
        mtl.albedoColor = color;
        return sp3;
    }        

    applyIKResult(){
        for(let i=0, n=this.joints.length; i<n; i++){
            let joint = this.joints[i];
            let bone = joint.userData.bone;
            if(!bone) continue;
            //bone.transform.position = joint.position;
            let rot = joint.rotationQuat;
            let rotOff = joint.userData.rotOff;
            if(rotOff){
                let r = bone.transform.rotation;
                Quaternion.multiply(rot,rotOff,r);
                bone.transform.rotation = r;
            }else{
                //bone.transform.rotation = rot;
            }

            if(this._showDbg){
                let udata = joint.userData;
                if(udata){
                    let mod = udata.dbgModel;
                    if(!mod){
                        mod = udata.dbgModel = new Sprite3D();
                        //mod.addChild(this._addMeshSprite(PrimitiveMesh.createSphere(0.2),new Color(1,1,1,1),new Vector3()))

                        //创建一个向上的，原点在中心的模型
                        let up = this._addMeshSprite(PrimitiveMesh.createCylinder(0.1,1.0),new Color(0,1,0,1),new Vector3());
                        let spup = new Sprite3D();
                        spup.addChild(up);
                        up.transform.localPosition = new Vector3(0,0.5,0);
                        mod.addChild(spup);
                        bone.scene.addChild(mod);
                    }
                    mod.transform.position = joint.position;
                    mod.transform.rotation = joint.rotationQuat;
                }
            }
        }
    }

    //从某个joint开始旋转，会调整每个joint的位置
    rotateJoint(jointId: number, deltaQuat: Quaternion) {
        let joints = this.joints;
        for (let i = jointId; i < joints.length - 1; i++) {
            const current = joints[i];

            //先更新自己的朝向
            const curQuat = current.rotationQuat;
            Quaternion.multiply(deltaQuat, curQuat, curQuat);
            curQuat.normalize(curQuat);
            if(current.angleLimit){
                current.angleLimit.constraint(current);
            }

            const direction = new Vector3(0, 0, 1);
            Vector3.transformQuat(direction, curQuat, direction);
            direction.scale(current.length, direction);

            //再更新子关节的位置：从当前位置累加
            const next = joints[i + 1];
            next.position.setValue(
                current.position.x + direction.x,
                current.position.y + direction.y,
                current.position.z + direction.z
            );
        }
    }

    /**
     * startJoint 节点的朝向或者长度变了,更新子关节的位置.
     * 不会导致子关节的旋转
     * @param startJoint 
     */
    applyJointChange(startJoint:number){
        let joints = this.joints;
        if(startJoint>=joints.length - 1)
            return;
        let current = joints[startJoint];
        let next = joints[startJoint+1];
        const direction = new Vector3(0, 0, current.length);
        Vector3.transformQuat(direction, current.rotationQuat, direction);
        let deltaPos = new Vector3(
            current.position.x + direction.x - next.position.x,
            current.position.y + direction.y - next.position.y,
            current.position.z + direction.z - next.position.z
        );
        if(deltaPos.length()<1e-5) 
            return;

        //从下个位置开始,应用delta位置
        for (let i = startJoint+1; i < joints.length; i++) {
            const next = joints[i];
            next.position.vadd(deltaPos,next.position);
        }
    }

    set target(tar:IK_Target){
        this._target = tar;
    }

    get target(){
        return this._target;
    }
}