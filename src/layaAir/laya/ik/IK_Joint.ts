import { Sprite3D } from "../d3/core/Sprite3D";
import { Transform3D } from "../d3/core/Transform3D";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_ConstraintInstance } from "./IK_Constraint";
import { ILinerender } from "./LineRender";

// 实现基本关节类
export class IK_Joint {
    // 内部存储使用四元数
    transform = new Transform3D(null);
    //position = new Vector3();
    //private _rotationQuat = new Quaternion();
    constraint:IK_ConstraintInstance;
    type: "revolute" | "prismatic";
    length = 1;
    private _parent:IK_Joint = null;
    name=''
    bone:Sprite3D;
    //从当前z到当前关节到子关节形成的向量的偏移  rotFrom(curZ, dir).toMat
    //用来显示更自然一些的约束框
    childDirOff:Matrix4x4=null;

    //关节在父关节的相对位置。到时候可以直接根据父关节的朝向计算新的位置，而不用做x轴或者z轴的假设
    relPos=new Vector3();
    //不允许ik调整，所以也不允许应用transform，因为他的transform可能是错误的
    fixed=false;

    constructor(bone?:Sprite3D) {
        if(bone){
            this.name = bone.name;
            this.bone = bone;
            this.copyTransform();
        }
    }

    copyTransform(){
        let sp = this.bone;
        if(!sp)return;
        this.transform.position = sp.transform.position;
        this.transform.rotation = sp.transform.rotation;
    }

    applyTransform(weight:number){
        if(!this.bone)
            return;
        if(weight<0)weight=0;
        if(weight==0)
            return;
        if(weight>1)weight=1;

        let boneTrans = this.bone.transform;
        let p0 = boneTrans.position;
        let p1 = this.transform.position;
        let r0 = boneTrans.rotation;
        let r1 = this.transform.rotation;

        if(weight==1){
            boneTrans.position = p1;
            boneTrans.rotation = r1;
        }else{
            //position
            //位置不用设置，设置了旋转自然会影响位置。而且如果位置插值，会导致与旋转对不上而散架
            //p1.vsub(p0,dp);
            //dp.scale(weight,dp);
            //p0.vadd(dp,p0);
            //boneTrans.position=p0;
            //rotation
            Quaternion.slerp(r0,r1,weight,r0);
            boneTrans.rotation = r0;
        }
    }

    // 设置旋转（四元数接口）世界空间
    set rotationQuat(q: Quaternion) {
        q.normalize(q);
        this.transform.rotation = q;
        //q.normalize(this._rotationQuat);
    }

    get rotationQuat() {
        return this.transform.rotation;
        //return this._rotationQuat;
    }

    set position(p: Vector3) {
        this.transform.position = p;
    }
    get position() {
        return this.transform.position;
    }

    get worldMatrix() {
        return this.transform.worldMatrix;
    }

    set parent(p:IK_Joint) {
        this._parent = p;
        if(p){
            this.transform._parent = p.transform;
        }else{
            if(this.bone?.parent instanceof Sprite3D){
                this.transform._parent = this.bone.parent?.transform;
            }else{
                this.transform._parent = null;
            }
        }
    }
    get parent() {
        return this._parent;
    }

    visualize(line:ILinerender){
        if (this.constraint && this.constraint.enable) {
            this.constraint.visualize(this, line);
        }
    }
    //test 实际要到 hinge 类
    random(axis:Vector3, baseVec:Vector3, childVec:Vector3){
        let cur = 178;
        // 基于当前角度计算childVec
        let quat = new Quaternion();
        Quaternion.createFromAxisAngle(axis,cur * Math.PI/180, quat);
        Vector3.transformQuat(baseVec, quat, childVec);
        return childVec;
    }    
    //随机动一下，跳出共线状态。如果自己无法调整，则返回false，外面会继续向上找
    /**
     * 扰动关节以跳出共线状态
     * @returns 如果成功扰动返回true，如果无法扰动返回false
     */
    perturbJoint(){
        //TODO 如果自己的parent有约束，则更新自己的朝向
        let parJoint = this.parent;
        if(!parJoint)
            return false;

        // 获取父关节到当前关节的方向
        let parDir = new Vector3();
        this.position.vsub(this.parent.position, parDir);
        parDir.normalize();

        // 根据关节类型和约束选择扰动策略
        if(this.type === 'revolute'){
            // 旋转关节：随机选择一个垂直于父方向的轴进行小角度旋转
            let randomAxis = new Vector3();
            Vector3.cross(parDir, new Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1), randomAxis);
            randomAxis.normalize();

            // 生成一个小的随机角度 (-5° 到 5°)
            const angle = (Math.random() * 10 - 5) * Math.PI / 180;

            // 创建旋转四元数
            let rotQuat = new Quaternion();
            Quaternion.createFromAxisAngle(randomAxis, angle, rotQuat);

            // 应用旋转
            let newRot = new Quaternion();
            Quaternion.multiply(this.transform.rotation, rotQuat, newRot);

            // 检查是否在约束范围内

            // 应用有效的旋转
            this.transform.rotation = newRot;
            //newRot.cloneTo(this._rotationQuat);
            return true;
        }
        else if(this.type === 'prismatic'){
            // 移动关节：沿轴线进行小距离移动
            // 注意：这里需要根据实际的移动关节实现进行调整
            return false; // 暂未实现
        }
        else{
            // 默认情况下尝试旋转
            let randomAxis = new Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1);
            randomAxis.normalize();
            const angle = (Math.random() * 10 - 5) * Math.PI / 180;

            let rotQuat = new Quaternion();
            Quaternion.createFromAxisAngle(randomAxis, angle, rotQuat);
            let rot = this.transform.rotation;
            Quaternion.multiply(rot,rotQuat,rot);
            this.transform.rotation = rot;
            return true;
        }
    }

}
