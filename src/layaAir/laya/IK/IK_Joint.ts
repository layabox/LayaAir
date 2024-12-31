import { PixelLineSprite3D } from "../d3/core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_AngleLimit, IK_Constraint } from "./IK_Constraint";

export class IK_JointUserData{
    bone:Sprite3D;
    rotOff:Quaternion;
    //调试用模型
    dbgModel:Sprite3D;
}

var invQuat = new Quaternion();

// 实现基本关节类
export class IK_Joint {
    // 内部存储使用四元数
    private _rotationQuat = new Quaternion();
    //构造的时候的朝向，以后都用这个朝向来计算，以产生最短旋转（测地线）
    _angleLimit: IK_Constraint = null;  //null就是不限制，-PI到PI
    type: "revolute" | "prismatic";
    //世界空间的(system空间的)
    position: Vector3;
    length = 1;
    preferredDirection:Vector3;// 偏好方向 TODO
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

    set angleLimit(v:IK_Constraint){
        this._angleLimit = v;
    }

    get angleLimit(){
        return this._angleLimit;
    }

    visualize(line:PixelLineSprite3D){
        if(this.angleLimit){
            this.angleLimit.visualize(line,this);
        }
    }

    /**
     * 把一个世界空间的向量转成本地空间
     */
    worldVecToLocal(v:Vector3,out?:Vector3){
        this._rotationQuat.invert(invQuat);
        let o = out||v;
        Vector3.transformQuat(v,invQuat,o)
        return o;
    }
}