import { PixelLineSprite3D } from "../d3/core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Color } from "../maths/Color";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_AngleLimit, IK_Constraint } from "./IK_Constraint";
import { ClsInst } from "./IK_Utils";

export class IK_JointUserData{
    bone:Sprite3D;
    rotOff:Quaternion;
    //调试用模型
    dbgModel:Sprite3D;
}

var invQuat = new Quaternion();
let Z = new Vector3(0,0,1);
let X = new Vector3(1,0,0);
let Y = new Vector3(0,1,0);

// 实现基本关节类
export class IK_Joint {
    static clsid = '98b0d837-e648-412e-873a-6c4bcf43af1d';
    // 内部存储使用四元数
    private _rotationQuat = new Quaternion();
    //构造的时候的朝向，以后都用这个朝向来计算，以产生最短旋转（测地线）
    _angleLimit: IK_Constraint = null;  //null就是不限制，-PI到PI
    type: "revolute" | "prismatic";
    //世界空间的(system空间的)
    position: Vector3;
    tailPosition = new Vector3();
    length = 1;
    preferredDirection:Vector3;// 偏好方向 TODO
    parent:IK_Joint = null;
    name=''
    userData = new IK_JointUserData();
    front = Z;
    left = X;

    constructor(bone?:Sprite3D) {
        //debug
        ClsInst.addInst(this);
        //debug
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
        //画出left 临时
        let left = this.left;
        let newLeft = new Vector3();
        Vector3.transformQuat(left, this.rotationQuat, newLeft);
        line.addLine(this.position, this.position.vadd(newLeft,newLeft), Color.RED, Color.RED);

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
