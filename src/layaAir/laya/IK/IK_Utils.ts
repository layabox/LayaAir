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