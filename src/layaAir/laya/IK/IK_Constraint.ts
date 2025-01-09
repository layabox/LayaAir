import { PixelLineSprite3D } from "../d3/core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Color } from "../maths/Color";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_Joint } from "./IK_Joint";
import { ClsInst, rotationTo } from "./IK_Utils";

/**
 * 两个向量夹角的弧度
 * @param v1 
 * @param v2 
 * @returns 
 */
function VecAngle(v1: Vector3, v2: Vector3) {
    let v1l = v1.length();
    let v2l = v2.length();
    let dot = v1.dot(v2);
    return Math.acos(dot / v1l / v2l);
}

var v1 = new Vector3();
var v2 = new Vector3();
var v3 = new Vector3();
var end = new Vector3();
const Z = new Vector3(0, 0, 1);
var _visualAxis = new Vector3;
var _visualRefDir = new Vector3();

const localEuler = new Vector3();
const localRot = new Quaternion();
const parentInv = new Quaternion();
const quatI = new Quaternion();

export interface IK_Constraint {
    /**
     * 旋转这个约束
     * @param q 
     */
    setQuat(q: Quaternion): void;
    //setDQuat(q:Quaternion):void;
    /**
     * 约束一个joint，会直接修改joint的朝向，后续可以应用这个朝向来修改下一个节点的位置
     * @param baseAxis 父朝向，0度的方向
     * @param v 要限制的向量
     * @param constraintedV 限制后的向量，为null则不需要
     * @param outQuat 把父朝向转到限制后朝向的四元数，为null则不要
     * @return true则表示发生限制了
     */
    constraint(joint: IK_Joint,dpos:Vector3): boolean;

    init(joint: IK_Joint): void;

    visualize(line: PixelLineSprite3D, joint: IK_Joint): void;
}

export function updateAxis(joint: IK_Joint, axis: Vector3) {
    let q = joint.rotationQuat;
}

export class IK_AngleLimit implements IK_Constraint {
    static clsid = '18b77d93-b503-474a-b513-3119bc81eadc'
    constructor(
        public min: Vector3,    //弧度
        public max: Vector3
    ) { 
        ClsInst.addInst(this);
    }

    setQuat(q: Quaternion): void {
        throw new Error("Method not implemented.");
    }

    constraint(joint: IK_Joint,dpos:Vector3): boolean{
        if (!joint.angleLimit)
            return false;
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

    init(joint: IK_Joint) { }
    visualize(line: PixelLineSprite3D, joint: IK_Joint) { }
}


export class IK_HingeConstraint implements IK_Constraint {
    static clsid = '9d1c1d57-bd6e-4b94-a59a-b735553da1ab'
    private curHingeAxis = new Vector3();
    private curRefDir = new Vector3();

    //debug
    __projVec = new Vector3()
    __tailVec = new Vector3();
    //debug

    constructor(
        private hingeAxis: Vector3,    // 转轴
        private refDir: Vector3,       // 参考方向，用来定义0度
        private min: number,           // 最小角度（弧度）
        private max: number,           // 最大角度（弧度）
        private refParendDir = true    //父关节的方向就是参考方向
    ) {
        this.hingeAxis.normalize();
        //refDir一定与轴是垂直的
        //TODO
        if (!refDir)
            this.refDir = new Vector3(0, 1, 0);
        this.refDir.normalize();
        this.hingeAxis.cloneTo(this.curHingeAxis);
        this.refDir.cloneTo(this.curRefDir);
        ClsInst.addInst(this);
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
        if (!this.refParendDir)
            Vector3.transformQuat(this.refDir, q, this.curRefDir);
    }

    init(joint: IK_Joint): void {
        //TODO
        if (joint.parent) {
            joint.parent.worldVecToLocal(this.hingeAxis);
            joint.parent.worldVecToLocal(this.refDir);
        }
    }

    /**
     * 约束joint
     * joint实际是受到父joint的约束
     * 经过约束后，会修改自己的位置
     * 注意：目前先只是修改位置，因此朝向需要后面再计算
     * @param joint 
     * @param dpos 约束后位置与原位置的差
     * @returns 
     */
    constraint(joint: IK_Joint,dpos:Vector3): boolean{
        if(joint.angleLimit!=this){
            throw "joint.angleLimit!=this";
        }
        let parent = joint.parent;
        let parentRot:Quaternion;
        if(!parent){
            //TODO 没有parent的处理 
            quatI.identity();
            parentRot = quatI;
        }else{
            parentRot = parent.rotationQuat;
        }

        //当前关节的朝向.
        let oriEnd = v1;
        Z.scale(joint.length,oriEnd);
        Vector3.transformQuat(oriEnd,joint.rotationQuat,oriEnd);
        //parent?joint.position.vsub(parent.position,oriEnd):joint.position.cloneTo(oriEnd);

        let refDir = v3;
        Vector3.transformQuat(this.refDir,parentRot, refDir);
        refDir.normalize();

        // 投影到铰链平面
        let projectedTail = new Vector3();
        // 计算轴被parent旋转后的值
        let curAxis = v2;
        Vector3.transformQuat(this.hingeAxis,parentRot,curAxis);
        curAxis.normalize();
        curAxis.cloneTo(this.__projVec)
        this.projectToHingePlane(oriEnd, curAxis, projectedTail);

        // 计算当前角度
        let currentAngle = this.calculateAngle(projectedTail, refDir, curAxis);

        // 限制角度
        if (currentAngle >= this.min && currentAngle <= this.max) {
            //return false;  // 无需调整
            //在范围内,则约束到平面上
            projectedTail.scale(joint.length,end);
        }else{
            refDir.scale(joint.length,refDir);
            let q1 = new Quaternion();
            //在范围外,约束到边界
            if(currentAngle>this.max){
                Quaternion.createFromAxisAngle(curAxis,this.max,q1);
            }else{
                Quaternion.createFromAxisAngle(curAxis,this.min,q1);                
            }
            Vector3.transformQuat(refDir,q1,end);
        }

        dpos && end.vsub(oriEnd,dpos);
        end.vadd(joint.position,joint.tailPosition);
        rotationTo(Z, end.normalize(), joint.rotationQuat);

        //简化,全部算true
        return true;
    }

    /**
     * 把vector分解出一个与合页轴垂直的方向分量
     * @param vector 
     * @param out 
     */
    private projectToHingePlane(vector: Vector3, axis:Vector3, out: Vector3): void {
        let dot = Vector3.dot(vector, axis);
        out.set(
            vector.x - dot * axis.x,
            vector.y - dot * axis.y,
            vector.z - dot * axis.z
        );
        //debug
        //out.cloneTo(this.__projVec)
        //debug

        out.normalize();
    }

    /**
     * 计算角度，有正负
     * @param projectedVector 
     * @returns 
     */
    private calculateAngle(projectedVector: Vector3, refDir:Vector3, axis:Vector3): number {
        let angle = VecAngle(refDir, projectedVector);
        let cross = new Vector3();
        Vector3.cross(refDir, projectedVector, cross);
        if (Vector3.dot(cross, axis) < 0) {
            angle = -angle;
        }
        return angle;
    }

    visualize(line: PixelLineSprite3D, joint: IK_Joint) {
        //位置在当前joint上,但是空间是parent的
        let parent = joint.parent;
        if(!parent){
            console.log('TODO parent 为空的处理');
            //TODO 实际不能用单位四元数
            quatI.identity();
        }
        let jointDir = parent?parent.rotationQuat:quatI
        let ori = joint.position;
        let length=0.5;
        Vector3.transformQuat(this.hingeAxis, jointDir, _visualAxis);
        Vector3.transformQuat(this.refDir, jointDir, _visualRefDir);
        _visualAxis.normalize();
        _visualRefDir.normalize();

        let end = new Vector3();
        //转轴
        line.addLine(ori, ori.vadd( _visualAxis.scale(length,end), end), Color.GREEN, Color.GREEN);
        //0度的朝向
        //line.addLine(ori, ori.vadd( _visualRefDir.scale(length,end), end), Color.RED, Color.RED);

        //在与转轴垂直并且经过参考向量的平面上,画出一个扇形,从min到max,min和max是弧度,指与参考向量的夹角(有正负)
        // 画出一个扇形，从min到max
        const segments = 20; // 扇形的段数
        const radius = 1; // 扇形的半径

        let quatMark = new Quaternion();

        let curPoint = new Vector3();
        let lastPoint = new Vector3();
        let curPointOri = new Vector3(); //没有偏移的curPoint,用来持续旋转
        //min边
        Quaternion.createFromAxisAngle(_visualAxis, this.min, quatMark);
        Vector3.transformQuat(_visualRefDir.scale(radius,end),quatMark,end);
        end.cloneTo(curPointOri);//扇形的起点
        line.addLine(ori, ori.vadd(end,end), Color.YELLOW, Color.YELLOW);
        end.cloneTo(lastPoint); //加了偏移的起点
        
        let dAng = (this.max-this.min)/segments;
        Quaternion.createFromAxisAngle(_visualAxis, dAng, quatMark);

        for (let i = 0; i <segments-2; i++) {
            Vector3.transformQuat(curPointOri, quatMark, curPointOri);
            curPointOri.vadd(ori,curPoint);
            line.addLine(lastPoint,curPoint,Color.YELLOW, Color.YELLOW);
            curPoint.cloneTo(lastPoint);
        }

        //max边
        Quaternion.createFromAxisAngle(_visualAxis, this.max, quatMark);
        Vector3.transformQuat(_visualRefDir.scale(radius,end),quatMark,end);
        line.addLine(ori, ori.vadd(end,end), Color.YELLOW, Color.YELLOW);
        line.addLine(lastPoint,end,Color.YELLOW, Color.YELLOW);

        //debug
        let e1 = new Vector3();
        line.addLine(ori, ori.vadd(this.__projVec,e1),Color.BLACK,Color.RED)
        //line.addLine(ori, ori.vadd(this.__tailVec,e1),Color.GREEN,Color.RED)
        //debug

    }
}

//只能是一个锥形限制，所以只用一个角度，这个角度没有正负
export class IK_BallConstraint implements IK_Constraint {
    static clsid = 'c6d68804-4126-4edc-8a08-c68a48059dfb'
    //轴,就是0度轴. 旋转需要修改轴，所以需要记录原始朝向，计算修改后的朝向
    private curAxis = new Vector3();
    constructor(
        private axis = new Vector3(0, 0, 1),
        private minRad = 0,
        private maxRad = Math.PI,
        private refParendDir = true    //父关节的方向就是参考方向
    ) {
        axis.cloneTo(this.curAxis);
        ClsInst.addInst(this);
    }

    setQuat(q: Quaternion): void {
        if (!this.refParendDir)
            Vector3.transformQuat(this.axis, q, this.curAxis);
        //else 直接计算
    }

    init(joint: IK_Joint): void {

    }
    /**
     * 约束当前joint的方向
     * @param joint 
     * @returns 
     */
    constraint(joint: IK_Joint,dpos:Vector3): boolean {
        //先根据parent来更新axis
        if (this.refParendDir) {
            let parent = joint.parent;
            if (parent) {
                let dir = v1;
                joint.position.vsub(parent.position, dir);
                dir.cloneTo(this.curAxis);
            }
        } else {

        }

        let tailPos = v1;
        Z.scale(joint.length, tailPos);
        let hit = this.limitVector(tailPos, this.curAxis, this.minRad, this.maxRad, joint.rotationQuat);

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
    private limitVector(v: Vector3, baseAxis: Vector3, minRad: number, maxRad: number, outQuat: Quaternion) {
        // 计算相对于父关节的角度
        let rad = VecAngle(baseAxis, v);

        // 将角度限制在指定范围内
        if (rad > minRad && rad < maxRad) {
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

    visualize(line: PixelLineSprite3D, joint: IK_Joint) {

    }
}


export class IK_FixConstraint implements IK_Constraint {
    static clsid = '5473857a-c1fe-457f-b00f-33934754c822'
    
    constructor(){
        ClsInst.addInst(this);
    }
    setQuat(q: Quaternion): void {
    }

    init(joint: IK_Joint): void {
    }

    constraint(joint: IK_Joint,dpos:Vector3): boolean {
        let oriEnd = new Vector3();
        let bone = new Vector3(0,0,joint.length);
        Vector3.transformQuat(bone,joint.rotationQuat,oriEnd);

        if(joint.parent){
            joint.parent.rotationQuat.cloneTo(joint.rotationQuat);
        }else{
            joint.rotationQuat.identity();
        }

        let curEnd = new Vector3();
        Vector3.transformQuat(bone,joint.rotationQuat, curEnd );

        curEnd.vsub(oriEnd, dpos);
        return true;
    }

    visualize(line: PixelLineSprite3D, joint: IK_Joint) {

    }
}
