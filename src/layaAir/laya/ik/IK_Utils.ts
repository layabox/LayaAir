import { Sprite3D } from "../d3/core/Sprite3D";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";

let xUnitVec3: Vector3;
let yUnitVec3: Vector3;
let tmpVec3: Vector3;

export function quaternionFromTo(from: Vector3, to: Vector3, out: Quaternion): boolean {
    if (!xUnitVec3) {
        xUnitVec3 = new Vector3(1, 0, 0);
        yUnitVec3 = new Vector3(0, 1, 0);
        tmpVec3 = new Vector3();
    }
    var dot: number = Vector3.dot(from, to);
    if (dot < -0.999999) {// 180度了，可以选择多个轴旋转
        Vector3.cross(xUnitVec3, from, tmpVec3);
        if (Vector3.scalarLength(tmpVec3) < 0.000001)
            Vector3.cross(yUnitVec3, from, tmpVec3);
        Vector3.normalize(tmpVec3, tmpVec3);
        Quaternion.createFromAxisAngle(tmpVec3, Math.PI, out);
        return true
    } else if (dot > 0.999999) {// 没有变化
        out.x = 0;
        out.y = 0;
        out.z = 0;
        out.w = 1;
        return false;
    } else {
        // 下面是求这个四元数，这是一个简化求法，根据cos(a/2)=√((1+dot)/2), cos(a/2)sin(a/2)=sin(a)/2 就能推导出来
        Vector3.cross(from, to, tmpVec3);
        out.x = tmpVec3.x;
        out.y = tmpVec3.y;
        out.z = tmpVec3.z;
        out.w = 1 + dot;
        out.normalize(out);
        return true;
    }
    return false;
}

export function delay(time:number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}


class ConstrainedRotation {
    // 计算约束后的四元数
    static calculateConstrainedQuaternion(fromVector: Vector3, toVector: Vector3, axis: Vector3): Quaternion {
        // 步骤 1: 计算未约束的四元数
        let unconstrained = new Quaternion();
        quaternionFromTo(fromVector, toVector, unconstrained);

        // 步骤 2: 将四元数投影到指定轴上
        let constrainedQ = this.projectQuaternionOnAxis(unconstrained, axis);

        // 步骤 3: 归一化结果
        constrainedQ.normalize(constrainedQ);

        return constrainedQ;
    }

    // 将四元数投影到指定轴上
    private static projectQuaternionOnAxis(q: Quaternion, axis: Vector3): Quaternion {
        // 计算四元数的轴角表示
        let angle = 2 * Math.acos(q.w);
        let sinHalfAngle = Math.sin(angle / 2);

        let qAxis = new Vector3();
        if (sinHalfAngle !== 0) {
            qAxis.x = q.x / sinHalfAngle;
            qAxis.y = q.y / sinHalfAngle;
            qAxis.z = q.z / sinHalfAngle;
        }

        // 计算投影
        let dotProduct = Vector3.dot(qAxis, axis);
        let projectedAxis = new Vector3();
        Vector3.scale(axis, dotProduct, projectedAxis);

        // 创建新的四元数
        let projectedQ = new Quaternion();
        Quaternion.createFromAxisAngle(projectedAxis, angle, projectedQ);

        return projectedQ;
    }
}

/**
 * 判断3点共线
 */
let dv1 = new Vector3();
let dv2 = new Vector3();
export function isCollinear(p1: Vector3, p2: Vector3, p3: Vector3, epsilon: number = 1e-6): boolean {
    const v1 = p2.vsub(p1,dv1).normalize();
    const v2 = p3.vsub(p1,dv2).normalize();
    
    // 如果点积的绝对值接近1，则三点共线
    const dot = Math.abs(v1.dot(v2));
    return Math.abs(dot - 1) < epsilon;
}

export class ClsInst{
    static map = new Map<string,any[]>();
    static addInst(obj:any){
        let clsid = obj.constructor.clsid;
        //debug
        if(!clsid){
            console.error('no clsid');
            return;
        }
        //debug
        let list = this.map.get(clsid);
        if(!list){
            list = [];
            this.map.set(clsid,list);
        }else{
            if(list.indexOf(obj)>=0)
                return;
        }
        list.push(obj);
    }

    static upateType(cls:any){
        let list = this.map.get(cls.clsid);
        if(list){
            for(let o of list){
                o.__proto__ = cls.prototype;
                if(o['onProtoChange']){
                    o['onProtoChange'].call(o);
                }
            }
        }
    }
}

//||v1+λv2||=||v3|| 求λ（返回绝对值最小的实根，若无实解返回NaN）
export function solveLambdaForNormEquality(v1:Vector3,v2:Vector3,v3:Vector3):number{
    const EPS = 1e-8;

    const a = Vector3.dot(v2, v2);
    const b = 2 * Vector3.dot(v1, v2);
    const c = Vector3.dot(v1, v1) - Vector3.dot(v3, v3);

    if (Math.abs(a) < EPS) {
        if (Math.abs(b) < EPS) {
            return Math.abs(c) < EPS ? 0 : NaN;
        }
        const x = -c / b;
        return x >= -EPS ? (x < 0 ? 0 : x) : NaN;
    }

    const delta = b * b - 4 * a * c;
    if (delta < -EPS) {
        return NaN;
    }
    if (Math.abs(delta) <= EPS) {
        const x = -b / (2 * a);
        return x >= -EPS ? (x < 0 ? 0 : x) : NaN;
    }

    const sqrtDelta = Math.sqrt(delta);
    const r1 = (-b + sqrtDelta) / (2 * a);
    const r2 = (-b - sqrtDelta) / (2 * a);
    let has1 = false, has2 = false;
    let c1 = 0, c2 = 0;
    if (r1 >= -EPS) { has1 = true; c1 = r1 < 0 ? 0 : r1; }
    if (r2 >= -EPS) { has2 = true; c2 = r2 < 0 ? 0 : r2; }
    if (!has1 && !has2) return NaN;
    if (has1 && !has2) return c1;
    if (!has1 && has2) return c2;
    return Math.abs(c1) <= Math.abs(c2) ? c1 : c2;
}

/**
 * 
 * @param target 目标位置
 * @param endPose 末端的位置和朝向。
 * @param deltaQ 输出 旋转四元数，可以把末端的z指向target
 */
export function solveLookat(target:Vector3, endPose:Matrix4x4 , deltaQ:Quaternion){
    let ele = endPose.elements;
    let endPos = new Vector3(ele[12],ele[13],ele[14]);
    let endDir = new Vector3(ele[8],ele[9],ele[10]);
    endDir.normalize();
    //target-Q(endPos) = k*Q(endDir)
    //所以 target = Q(k*endDir+endPos)
    //所以 ||endpos + k*endDir||= ||target||
    //求k
    let k = solveLambdaForNormEquality(endPos,endDir,target);
    if(isNaN(k)){
        return  false;
    }
    let v1 = new Vector3();
    Vector3.scale(endDir,k,v1);
    Vector3.add(endPos,v1,v1);
    //此时的v1是没有调整的时候的端点，经过调整，这个端点就会与target重合
    //计算旋转
    v1.normalize();
    let  t = target.clone().normalize();
    quaternionFromTo(v1,t,deltaQ);
    return true;
}

export function ripMatScale(mat:Matrix4x4):Matrix4x4{
    let e = mat.elements;
    let d = Math.sqrt(e[0]**2+e[1]**2+e[2]**2);
    e[0]/=d; e[1]/=d; e[2]/=d;
    d = Math.sqrt(e[4]**2+e[5]**2+e[6]**2);
    e[4]/=d; e[5]/=d; e[6]/=d;
    d = Math.sqrt(e[8]**2+e[9]**2+e[10]**2);
    e[8]/=d; e[9]/=d; e[10]/=d;
    return mat;
}


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
    let v = dot / v1l / v2l;
    if(v>1)v=1;
    if(v<-1)v-1;
    return Math.acos(v);
}

//方向：看向axis负方向，逆时针为正
export function getVecAngInPlane(axisPos:Vector3, axis:Vector3, zero:Vector3, vec:Vector3){
    let v1 = new Vector3();
    vec.vsub(axisPos,v1);
    let dot = Vector3.dot(v1, axis);
    //投影到平面的向量
    let projVec = new Vector3(
        v1.x - dot * axis.x,
        v1.y - dot * axis.y,
        v1.z - dot * axis.z
    );

    //zero也投影一下
    let dot1 = Vector3.dot(zero, axis);
    let projZero = new Vector3(
        zero.x - dot1 * axis.x,
        zero.y - dot1 * axis.y,
        zero.z - dot1 * axis.z
    );

    let angle = VecAngle(projZero, projVec);
    let cross = new Vector3();
    Vector3.cross(projZero, projVec, cross);
    if (Vector3.dot(cross, axis) < 0) {
        angle = -angle;
    }
    return angle;
}


var cspaceX = new Vector3();
var cspaceY = new Vector3();
var cspaceZ = new Vector3();
export function getSpaceByDir(bone: Sprite3D, axisDir: number) {
    let ydir = cspaceY;
    let bonepos = bone.transform.position;
    if (bone && bone.parent) {
        let parentTransform = (bone.parent as Sprite3D).transform;
        parentTransform.position.vsub(bonepos, ydir);
        ydir.normalize();

        //从父骨骼的坐标轴中选一个合适的用来确定xz平面，然后按照x,z,y的顺序选择一个起点轴，然后旋转axisDir,形成约束空间。
        let myMat = parentTransform.worldMatrix.elements;
        let x1 = new Vector3(myMat[0], myMat[1], myMat[2]);
        let y1 = new Vector3(myMat[4], myMat[5], myMat[6]);
        let z1 = new Vector3(myMat[8], myMat[9], myMat[10]);
        x1.normalize(); y1.normalize(); z1.normalize();

        let dotx = Math.abs(ydir.dot(x1));
        let doty = Math.abs(ydir.dot(y1));
        let dotz = Math.abs(ydir.dot(z1));

        let startx: Vector3;
        if (doty > dotx && doty > dotz) {
            //ydir偏向y轴，选择x
            startx = x1;
        } else if (dotx > doty && dotx > dotz) {
            //ydir偏向x轴，选择z
            startx = z1;
        } else if (dotz > dotx && dotz > doty) {
            //ydir偏向z轴，选择x
            startx = x1;
        }

        //构建旋转前的约束空间。世界空间
        let tmpZ = new Vector3();
        startx.cross(ydir, tmpZ);
        ydir.cross(tmpZ, startx);
        startx.cross(ydir, cspaceZ);

        //把x转到parent空间
        let invMat = new Matrix4x4();
        parentTransform.worldMatrix.invert(invMat);
        Vector3.TransformNormal(startx, invMat, startx);
        startx.normalize();//矩阵可能有缩放
        startx.cloneTo(cspaceX);

        //把y转到parent空间
        Vector3.TransformNormal(ydir, invMat, ydir);
        ydir.normalize();

        //parent空间的z
        startx.cross(ydir, cspaceZ);

        //此时定义了一个尽量与parent对齐的约束空间，下面应用旋转
        let rad = axisDir * Math.PI / 180;
        let quat = new Quaternion();
        Quaternion.createFromAxisAngle(ydir, rad, quat);

        Vector3.transformQuat(cspaceX, quat, cspaceX);
        Vector3.transformQuat(cspaceZ, quat, cspaceZ);

        let ax = cspaceX;
        let ay = cspaceY;
        let az = cspaceZ;
        let localPos = bone.transform.localPosition;
        var space = new Matrix4x4(ax.x, ax.y, ax.z, 0,
            ay.x, ay.y, ay.z, 0,
            az.x, az.y, az.z, 0,
            localPos.x, localPos.y, localPos.z, 1
        )
        return space;
    }
}