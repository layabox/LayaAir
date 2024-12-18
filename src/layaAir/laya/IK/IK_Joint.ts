import { join } from "path";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";

// 定义关节接口
export interface IK_IJoint {
    position: Vector3;
    //startPosition:Vector3;
    rotationQuat:Quaternion;
    //rotationEuler: Vector3;
    length: number;
    angleLimit: IK_AngleLimit;
    type: "revolute" | "prismatic";    //旋转，平移

    updatePosition(): void;
    rotate(axis: Vector3, angle: number): void;
}

export class IK_AngleLimit {
    constructor(
        public min: Vector3,    //弧度
        public max: Vector3
    ) { }
}

export class IK_RotLimit{
    constructor(
        public axis:Vector3,
        public minAng:number,
        public maxAng:number,
    ){

    }
}

export class IK_JointUserData{
    bone:Sprite3D;
    rotOff:Quaternion;
    //调试用模型
    dbgModel:Sprite3D;
}

// 实现基本关节类
export class IK_Joint implements IK_IJoint {
    // 内部存储使用四元数
    private _rotationQuat = new Quaternion();
    //构造的时候的朝向，以后都用这个朝向来计算，以产生最短旋转（测地线）
    angleLimit: IK_AngleLimit = null;  //null就是不限制，-PI到PI
    type: "revolute" | "prismatic";
    //世界空间的(system空间的)
    position: Vector3;
    length = 1;
    parent:IK_Joint = null;
    userData = new IK_JointUserData();

    constructor(bone?:Sprite3D) {
        if(bone){
            this.userData.bone = bone;
            this.userData.rotOff = new Quaternion();
        }
    }

    updatePosition(): void {
        // 根据旋转更新位置
    }

    rotate(axis: Vector3, angle: number): void {
        // 实现旋转逻辑，考虑角度限制
    }

    // 设置旋转（四元数接口）世界空间
    set rotationQuat(q: Quaternion) {
        q.normalize(this._rotationQuat);
    }

    get rotationQuat() {
        return this._rotationQuat;
    }

    setAngleLimit(min: Vector3, max: Vector3): void {
        if (!this.angleLimit) {
            this.angleLimit = new IK_AngleLimit(min, max);
        } else {
            this.angleLimit.min.setValue(min.x, min.y, min.z);
            this.angleLimit.max.setValue(max.x, max.y, max.z);
        }
    }
}

const localEuler = new Vector3();
const localRot = new Quaternion();
const parentInv = new Quaternion();

/**
 * 根据joint来限制rot，返回被限制后的rot
 * @param joint 
 * @param rot 
 * @returns 
 */
export function applyAngleLimits_euler(joint: IK_Joint) {
    if(!joint.angleLimit)
        return joint.rotationQuat;

    // 获取父关节的世界旋转（如果是根节点，使用单位四元数）
    const parentWorldRot = joint.parent ? joint.parent.rotationQuat : new Quaternion();

    // 计算局部旋转
    parentWorldRot.invert(parentInv);
    Quaternion.multiply(parentInv, joint.rotationQuat, localRot);

    // 转换为欧拉角
    //注意laya引擎这里得到的euler对应的是x:yaw,y:pitch,z:roll,所以相当于x和y是交换的
    localRot.getYawPitchRoll(localEuler);

    const min = joint.angleLimit.min;
    const max = joint.angleLimit.max;

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

    return newWorldRot;
}

export function applyAngleLimits_Swing_Twist(joint: IK_Joint) {
}

export function applyAngleLimits_Axis_Angle(joint: IK_Joint){

}