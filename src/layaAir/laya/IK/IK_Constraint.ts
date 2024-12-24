import { Sprite3D } from "../d3/core/Sprite3D";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_Joint } from "./IK_Joint";

/**
 * 两个向量夹角的弧度
 * @param v1 
 * @param v2 
 * @returns 
 */
function VecAngle(v1:Vector3, v2:Vector3){
    let v1l = v1.length();
    let v2l = v2.length();
    let dot = v1.dot(v2);
    return Math.acos(dot/v1l/v2l);
}

var v1 = new Vector3();
const Z = new Vector3(0,0,1);

const localEuler = new Vector3();
const localRot = new Quaternion();
const parentInv = new Quaternion();

export interface IK_Constraint{
    /**
     * 旋转这个约束
     * @param q 
     */
    setQuat(q:Quaternion):void;
    //setDQuat(q:Quaternion):void;
    /**
     * 约束一个joint，会直接修改joint的朝向，后续可以应用这个朝向来修改下一个节点的位置
     * @param baseAxis 父朝向，0度的方向
     * @param v 要限制的向量
     * @param constraintedV 限制后的向量，为null则不需要
     * @param outQuat 把父朝向转到限制后朝向的四元数，为null则不要
     * @return true则表示发生限制了
     */
    constraint(joint: IK_Joint):boolean;
}

export class IK_AngleLimit implements IK_Constraint {
    constructor(
        public min: Vector3,    //弧度
        public max: Vector3
    ) { }

    setQuat(q: Quaternion): void {
        throw new Error("Method not implemented.");
    }

    constraint(joint: IK_Joint):boolean{
        if(!joint.angleLimit)
            return false;
    
        // 获取父关节的世界旋转（如果是根节点，使用单位四元数）
        const parentWorldRot = joint.parent ? joint.parent.rotationQuat : new Quaternion();
    
        // 计算局部旋转
        parentWorldRot.invert(parentInv);
        Quaternion.multiply(parentInv, joint.rotationQuat, localRot);
    
        // 转换为欧拉角
        //注意laya引擎这里得到的euler对应的是x:yaw,y:pitch,z:roll,所以相当于x和y是交换的
        localRot.getYawPitchRoll(localEuler);
    
        const min = this.min;
        const max = this.max;
    
        // 应用限制
        localEuler.x = Math.max(Math.min(localEuler.x, max.y), min.y);
        localEuler.y = Math.max(Math.min(localEuler.y, max.x), min.x);
        localEuler.z = Math.max(Math.min(localEuler.z, max.z), min.z);
    
        // 从限制后的欧拉角创建新的局部旋转
        Quaternion.createFromYawPitchRoll(localEuler.x, localEuler.y, localEuler.z, localRot);
    
        // 转换回世界空间
        const newWorldRot = joint.rotationQuat;
        Quaternion.multiply(parentWorldRot, localRot, newWorldRot);
        joint.rotationQuat = newWorldRot;        
        return false;
    }
}


export class IK_HingeConstraint implements IK_Constraint{
    private curHingeAxis = new Vector3();
    private curRefDir = new Vector3();

    constructor(
        private hingeAxis: Vector3,    // 转轴
        private refDir: Vector3,       // 参考方向，用来定义0度
        private min: number,           // 最小角度（弧度）
        private max: number,           // 最大角度（弧度）
        private refParendDir=true    //父关节的方向就是参考方向
    ){
        if(!refDir)
            this.refDir = new Vector3(0,1,0);
        this.hingeAxis.normalize();
        this.refDir.normalize();
        this.hingeAxis.cloneTo(this.curHingeAxis);
        this.refDir.cloneTo(this.curRefDir);
    }

    setHingeAxisBySprite(sp: Sprite3D, axis: 'x' | 'y' | 'z') {
        let wmat = sp.transform.worldMatrix.elements;
        switch (axis) {
            case 'x':
                this.hingeAxis.setValue(wmat[0], wmat[1], wmat[2]).normalize();
                break;
            case 'y':
                this.hingeAxis.setValue(wmat[4], wmat[5], wmat[6]).normalize();
                break;
            default:
                this.hingeAxis.setValue(wmat[8], wmat[9], wmat[10]).normalize();
                break;
        }
        this.hingeAxis.cloneTo(this.curHingeAxis);
    }

    setQuat(q: Quaternion): void {
        Vector3.transformQuat(this.hingeAxis, q, this.curHingeAxis);
        if(!this.refParendDir)
            Vector3.transformQuat(this.refDir, q, this.curRefDir);
    }

    constraint(joint: IK_Joint): boolean {
        if(!joint.angleLimit)
            return false;

        let tailDir = v1;
        Z.scale(joint.length, tailDir);
        Vector3.transformQuat(tailDir, joint.rotationQuat, tailDir);

        // 投影到铰链平面
        let projectedTail = new Vector3();
        this.projectToHingePlane(tailDir, projectedTail);

        // 计算当前角度
        let currentAngle = this.calculateAngle(projectedTail);

        // 限制角度
        if (currentAngle >= this.min && currentAngle <= this.max) {
            return false;  // 无需调整
        }

        let limitedAngle = Math.max(this.min, Math.min(this.max, currentAngle));

        // 计算新的旋转
        let rotationAxis = this.curHingeAxis;
        let rotationAngle = limitedAngle - currentAngle;

        Quaternion.createFromAxisAngle(rotationAxis, rotationAngle, joint.rotationQuat);
        return true;
    }

    /**
     * 把vector分解出一个与合页轴垂直的分量
     * @param vector 
     * @param out 
     */
    private projectToHingePlane(vector: Vector3, out: Vector3): void {
        let dot = Vector3.dot(vector, this.curHingeAxis);
        out.set(
            vector.x - dot * this.curHingeAxis.x,
            vector.y - dot * this.curHingeAxis.y,
            vector.z - dot * this.curHingeAxis.z
        );
        out.normalize();
    }

    /**
     * 计算角度，有正负
     * @param projectedVector 
     * @returns 
     */
    private calculateAngle(projectedVector: Vector3): number {
        let angle = VecAngle(this.curRefDir, projectedVector);
        let cross = v1;
        Vector3.cross(this.curRefDir, projectedVector, cross);
        if (Vector3.dot(cross, this.curHingeAxis) < 0) {
            angle = -angle;
        }
        return angle;
    }
}

//只能是一个锥形限制，所以只用一个角度，这个角度没有正负
export class IK_BallConstraint implements IK_Constraint{
    //旋转需要修改轴，所以需要记录原始朝向，计算修改后的朝向
    private curAxis = new Vector3();
    constructor(
        private axis=new Vector3(0,0,1),
        private minRad=0,
        private maxRad=Math.PI,
        private refParendDir=true    //父关节的方向就是参考方向
    ){
        axis.cloneTo(this.curAxis);
    }

    setQuat(q:Quaternion):void{
        if(!this.refParendDir)
            Vector3.transformQuat(this.axis,q, this.curAxis);
        //else 直接计算
    }

    /**
     * 约束当前joint的方向
     * @param joint 
     * @returns 
     */
    constraint(joint: IK_Joint):boolean{
        //先根据parent来更新axis
        if(this.refParendDir){
            let parent = joint.parent;
            if( parent){
                let dir = v1;
                joint.position.vsub(parent.position,dir);
                dir.cloneTo(this.curAxis);
            }
        }else{
            
        }

        let tailPos = v1;
        Z.scale(joint.length,tailPos);
        let hit = this.limitVector(tailPos,this.curAxis, this.minRad,this.maxRad,joint.rotationQuat);

        return hit;
    }

    /**
     * 把v相对于baseAxis的夹角限制在min，max之间,返回一个四元数，使用这个四元数可以把baseAixs转到限制的位置上
     * @param v 
     * @param baseAxis 
     * @param minRad 
     * @param maxRad 
     * @returns 
     */
    private limitVector(v: Vector3, baseAxis: Vector3, minRad: number, maxRad: number,outQuat:Quaternion) {
        // 计算相对于父关节的角度
        let rad = VecAngle(baseAxis, v);

        // 将角度限制在指定范围内
        if(rad>minRad&& rad<maxRad){
            return false;
        }

        rad = Math.max(minRad, Math.min(maxRad, rad));
        // 计算新的旋转
        let axis = v1;
        Vector3.cross(baseAxis, v, axis);
        axis.normalize();

        Quaternion.createFromAxisAngle(axis, rad, outQuat);

        return true;
    }
}
