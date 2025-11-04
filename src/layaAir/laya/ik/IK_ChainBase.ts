import { Sprite3D } from "../d3/core/Sprite3D";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_AnimLayer, IK_LayerMgr } from "./IK_AnimLayer";
import { IK_Comp } from "./IK_Comp";
import { IK_Joint } from "./IK_Joint";
import { getJointMgr, IK_JointManager } from "./IK_JointManager";
import { IK_Target } from "./IK_Target";
import { quaternionFromTo } from "./IK_Utils";
import { ILinerender } from "./LineRender";

let invQ = new Quaternion();
let endPos = new Vector3();
let lastQuat = new Quaternion();

export class IK_ChainBase{
    name=''
    joints: IK_Joint[];
    protected _target:IK_Target=null;
    
    layerMgr = new IK_LayerMgr();
    staticLayer = new IK_AnimLayer();
    animLayer = new IK_AnimLayer();
    ik_result = new IK_AnimLayer();
    private _isRunning = false;

    enable=true;
    protected _jointMgr:IK_JointManager=null;
    protected _end_effector: IK_Joint;
    totalLength=0;
    blendWeight=1.0;

    constructor(mgr:IK_Comp ){
        this._jointMgr = getJointMgr(mgr.owner as Sprite3D);
    }

    set isRunning(v:boolean){
        if(this._isRunning!=v){
            if(v){
                //从停止到运行
                this.layerMgr.stopFade();
            }else{
                //从运行到停止
                this.fadeToAnim();
            }
        }
        this._isRunning=v;
    }
    get isRunning(){
        return this._isRunning;
    }

    set target(tar:IK_Target){
        this._target = tar;
    }

    get target(){
        return this._target;
    }

    set endFixed(v:boolean){
        let n = this.joints.length;
        if(n>2){
            this.joints[n-2].fixed=v;
        }
    }
    get endFixed(){
        let n = this.joints.length;
        if(n>2){
            return this.joints[n-2].fixed;
        }        
        return false;
    }

    visualize(line: ILinerender) {}

    //不可写
    get end_effector(){
        return this._end_effector;
    }

    addJoint(joint: IK_Joint): void {
        if (this.end_effector) {
            throw '已经结束了'
        }
        let bone = joint.bone;
        if(!bone){
            console.log('没有对应的Sprite3D对象就没有ik的必要');
            return;
        }

        if(this._jointMgr){
            if(this._jointMgr.getJoint(joint.name)){
                //if(!this._jointMgr.getJoint(joint.name).isEnd){
                    //throw '已经有关节控制这个骨骼了！！'
                //}
            }else{
                this._jointMgr.addJoint(joint.name,joint)    
            }
        }

        let joints = this.joints;
        let lastJoint = joints[joints.length - 1];
        joints.push(joint);

        // 计算上一个joint的长度和自己的相对位置
        let parentNode:Sprite3D;
        if (!lastJoint) {
            parentNode = (bone.parent instanceof Sprite3D)?bone.parent:null;
            if(bone.parent && this._jointMgr){
                joint.parent = this._jointMgr.getJoint(bone.parent.name);;
            }
        } else {
            joint.parent = lastJoint;
            parentNode = lastJoint.bone;
            if(!parentNode){
                throw 'no parentnode'
            }
         
            //计算相对位置。要忽略缩放
            let parentRot=parentNode.transform.rotation;
            let parentPos=parentNode.transform.position;
            let myPos = bone.transform.position.clone();//下面要修改，所以clone
            myPos.vsub(parentPos,myPos);
            //根据相对位置，设置上一个joint的长度
            lastJoint.length = myPos.length();
            this.totalLength += lastJoint.length;
            //计算相对位置
            Quaternion.invert(parentRot,invQ);
            Vector3.transformQuat(myPos,invQ,joint.relPos);
        }
    }

    getJoint(name:string){
        return this.joints.find((v:IK_Joint)=>v.name==name);
    }

    //从某个joint开始旋转，会调整每个joint的位置
    rotateJoint(jointId: number, deltaQuat: Quaternion) {
        let joints = this.joints;
        //let endPos = new Vector3();
        //let lastQuat = new Quaternion();
        //更新子的位置和朝向
        for (let i = jointId; i < joints.length; i++) { //注意，最后一节也要调整，比如朝向的话需要最后一节的旋转，所以不能是joints.length-1
            const curJoint = joints[i];
            //先更新自己的朝向
            let curQuat = curJoint.rotationQuat;
            if(i==jointId  && curJoint.constraint){
                curQuat.cloneTo(lastQuat);
            }
            Quaternion.multiply(deltaQuat, curQuat, curQuat);
            curQuat.normalize(curQuat);
            curJoint.rotationQuat = curQuat;//先直接应用旋转。下面再做约束
            //第一个要应用约束
            if(i==jointId && curJoint.constraint){
                //约束一下，validDir变成约束后的
                if(curJoint.constraint.enable){
                    //约束会直接修改joint的旋转
                    curJoint.constraint.doConsraint(curJoint);
                    //计算新的delta
                    let invLast = invQ;//new Quaternion();
                    lastQuat.invert(invLast);
                    Quaternion.multiply(curJoint.rotationQuat,invLast,deltaQuat);
                    deltaQuat.normalize(deltaQuat);    
                }
            }
            
            //再更新子关节的位置：从当前位置累加
            const next = joints[i + 1];
            if(next){
                Vector3.transformQuat(next.relPos, curQuat, endPos);
                next.position.setValue(
                    curJoint.position.x + endPos.x,
                    curJoint.position.y + endPos.y,
                    curJoint.position.z + endPos.z
                );
            }
        }
    }


    copyCurPoseAsInitPose(){
        let joints = this.joints;
        //先直接拷贝动画结果，以后可以选择上次结果或者混合结果
        for(let joint of joints){
            joint.copyTransform()
        }
    }

    copyInitPose(){
        let joints = this.joints;
        let startPose = this.animLayer;
        //先直接拷贝动画结果，以后可以选择上次结果或者混合结果
        for(let i=0,n=joints.length;i<n;i++){
            let curJoint = joints[i];
            let curTrans = startPose;
            curTrans.roations[i].cloneTo(curJoint.transform.rotation);
            curTrans.positions[i].cloneTo(curJoint.transform.position);
            curJoint.transform.position = curJoint.transform.position;
            curJoint.transform.rotation = curJoint.transform.rotation;
        }
        //TODO 第一个骨骼的位置直接使用动画的位置
    }

    captureStaticPose(){
        this.staticLayer.captureBonePose(this.joints); 
    }

    resetStaticPose(){
        if(this.staticLayer.roations.length!=this.joints.length)
            return;
        for(let i=0,n=this.joints.length; i<n; i++){
            let joint = this.joints[i];
            let trans = joint.bone.transform;
            trans.position = this.staticLayer.positions[i];
            trans.rotation = this.staticLayer.roations[i];
        }
        //直接设置，不要走set，set会影响后面的finalPose，这个不算动画层管理的内容
        //this.layerMgr.set(this.staticLayer);
    }

    captureAnimPose(){
        this.animLayer.captureBonePose(this.joints);
    }

    fadeToAnim(){
        if(!this.layerMgr.isFading()){
            this.layerMgr.fadeTo(this.animLayer,200);
        }
    }
    isFading(){
        return this.layerMgr.isFading();
    }

    applyResult(){
        this.layerMgr.apply(this.joints);
    }

    solve(){}

    applyIKResult(){
        if(!this.enable)
            return;
        
        for(let joint of this.joints){
            //ik可能有位置修改，所以这里也应用pos。根的pos可能会被动画修改，这里再设置一次也没关系
            joint.applyTransform(this.blendWeight);
        }
    }

    onLinkEnd(){
        let joints = this.joints;
        this._end_effector = joints[joints.length-1];
        //计算骨骼与z之间的偏移
        let quat = new Quaternion();
        for(let i=0,n=joints.length-1; i<n; i++){
            let joint = joints[i];
            let next = joints[i+1];
            let dir = new Vector3();
            next.bone.transform.localPosition.cloneTo(dir);
            dir.normalize();
            let zdir = new Vector3(0,0,1);
            quaternionFromTo(zdir,dir,quat);
            let mat = new Matrix4x4();
            Matrix4x4.createFromQuaternion(quat,mat);
            joint.childDirOff = mat;
        }
        //初始化后，获取静态姿态
        this.captureStaticPose();
    }    

}