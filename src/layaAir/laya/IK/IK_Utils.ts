import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";

let xUnitVec3: Vector3;
let yUnitVec3: Vector3;
let tmpVec3: Vector3;
export function rotationTo(from: Vector3, to: Vector3, out: Quaternion): boolean {
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
        rotationTo(fromVector, toVector, unconstrained);

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
            }
        }
    }
}