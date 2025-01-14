import { Vector3 } from "../../maths/Vector3";
import { MMDBone } from "./mmdToLaya";

export function pickBone(rayStart: Vector3, rayDir: Vector3, maxdist: number, bones: MMDBone[], picks: MMDBone[]) {
    let tmpStart = new Vector3();
    let tmpEnd = new Vector3();
    let tmpVec = new Vector3();
    let tmpDir = new Vector3();

    // 遍历所有骨骼
    for (let bone of bones) {
        // 如果骨骼长度为0，则跳过
        if (bone.boneLength <= 0.01) continue;

        // 获取骨骼的世界位置
        bone.transform.position.cloneTo(tmpStart);
        
        // 计算骨骼终点的世界位置
        tmpDir.setValue(0, 0, bone.boneLength);
        Vector3.transformQuat(tmpDir,bone.transform.rotation,tmpDir);
        tmpStart.vadd(tmpDir,tmpEnd);

        // 计算射线到骨骼线段的最短距离
        let t = rayHit(tmpStart, tmpEnd, rayStart, rayDir, tmpVec);

        if (t < maxdist) {
            // 计算射线起点到最近点的距离
            tmpVec.vsub(rayStart, tmpVec);
            picks.push(bone);
        }
    }

    // 按距离排序
    picks.sort((a, b) => {
        let distA = Vector3.distance(rayStart, a.transform.position);
        let distB = Vector3.distance(rayStart, b.transform.position);
        return distA - distB;
    });
}

var rayDir = new Vector3();
var lineDir = new Vector3();
// 临时
var v1 = new Vector3();
/**
 * 射线与移动轴的碰撞检测，取最近距离对应的点作为碰撞点。
 * 返回最近点和距离
 */
function rayHit(lineStart:Vector3, lineEnd:Vector3, rayStart:Vector3, rayd:Vector3, nearestPos: Vector3): number {
    let rdir = rayDir;
    Vector3.normalize(rayd, rdir);

    let P1 = lineStart;
    lineEnd.vsub(lineStart,lineDir);
    let endT = lineDir.length();
    lineDir.normalize();
    let D1 = lineDir;

    let P2 = rayStart;
    let D2 = rdir;

    let d = v1;
    Vector3.subtract(P1, P2, d);

    // 两个线段之间的距离: | P1+t1D1 -(P2+t2D2) |
    // P1-P2 = d
    // (d + t1D1-t2D2)^2 是距离的平方，对这个取全微分
    // 2(d+t1D1-t2D2)*D1, -2(d+t1D1-t2D2)*D2 这两个都是0
    // 显然这时候与D1,D2都垂直
    // -dD1 -t1D1^2 + t2D1D2  = 0
    // -dD2 -t1D1D2 + t2D2^2  = 0
    // 先用多项式的方法求解 Ax=b
    // | -D1^2  D1D2 | |t1|    |dD1|
    // |             | |  |  = |   |
    // | -D1D2  D2^2 | |t2|    |dD2|
    //
    // 如果平行，则有个方向的d永远为0
    let A = -Vector3.dot(D1, D1); let B = Vector3.dot(D1, D2);
    let C = -B; let D = Vector3.dot(D2, D2);
    let b1 = Vector3.dot(d, D1);
    let b2 = Vector3.dot(d, D2);
    let adbc = A * D - B * C;
    if (adbc > -1e-6 && adbc < 1e-6) {
        // 平行情况处理
        // 计算点到直线的垂直距离
        let cross = new Vector3();
        Vector3.cross(d, D1, cross);
        let parallelDist = cross.length() / D1.length();
        
        // 计算射线起点在轴上的投影
        let proj = Vector3.dot(d, D1);
        let t1 = -proj;  // 投影位置
        
        // 确保t1在线段范围内
        if(t1 < 0) t1 = 0;
        if(t1 > endT) t1 = endT;
        
        // 计算最近点
        nearestPos.setValue(
            P1.x + t1 * D1.x,
            P1.y + t1 * D1.y,
            P1.z + t1 * D1.z
        );
        return parallelDist;
    } else {
        let dd = 1 / adbc;
        let t1 = (D * b1 - B * b2) * dd;	// 轴
        let t2 = (-C * b1 + A * b2) * dd;	// 射线
        if(t1<0)t1=0;
        if(t1>endT) t1=endT;
        // 射线只考虑正向
        if(t2 < 0) t2=0;
                
        nearestPos.setValue(
            P1.x + t1 * D1.x,
            P1.y + t1 * D1.y,
            P1.z + t1 * D1.z
        );
        let p2 = new Vector3(
            P2.x + t2 * D2.x,
            P2.y + t2 * D2.y,
            P2.z + t2 * D2.z
        );        
        return Vector3.distance(nearestPos, p2);
    }
}