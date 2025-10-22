import { Color } from "../../maths/Color";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ILinerender } from "../LineRender";


var vx = new Vector3();
var vy = new Vector3();
var vz = new Vector3();
var v1 = new Vector3();
var ori = new Vector3();
var rx = new Vector3();
var ry = new Vector3();
var rz = new Vector3();
var v2 = new Vector3();
var v3 = new Vector3();
var vback = new Vector3();
var vrad = new Vector3();
var p0 = new Vector3();
var p1 = new Vector3();
var p2 = new Vector3();
var p3 = new Vector3();

export function drawAxis(lines:ILinerender, mat:Matrix4x4,length:number ,color:Color[]=[Color.RED,Color.GREEN,Color.BLUE]){
    let e = mat.elements;
    ori.set(e[12],e[13],e[14]);
    vx.set(e[0],e[1],e[2]).normalize();
    vy.set(e[4],e[5],e[6]).normalize();
    vz.set(e[8],e[9],e[10]).normalize();

    let arrowLen=Math.min(0.1,length/2);
    let arrowR = arrowLen/4;    

    let xcolor = color[0];
    let ycolor = color[1];
    let zcolor = color[2];

    //x轴
    vx.scale(length,v1);
    ori.vadd(v1,v1);
    lines.addLine(ori,v1,xcolor,xcolor);

    vrad.set(arrowR,arrowR,arrowR);
    vback.set(arrowLen,arrowLen,arrowLen);
    //x轴的两个小箭头
    //v1-vx*(arrowLen,1,1)+vy*(1,arrowR,1)
    v3.set(
        v1.x-vback.x*vx.x+vy.x*vrad.x,
        v1.y-vback.y*vx.y+vy.y*vrad.y,
        v1.z-vback.z*vx.z+vy.z*vrad.z).cloneTo(p0);
    lines.addLine(v1,v3,xcolor,xcolor);
    v3.set(
        v1.x-vback.x*vx.x-vy.x*vrad.x,
        v1.y-vback.y*vx.y-vy.y*vrad.y,
        v1.z-vback.z*vx.z-vy.z*vrad.z).cloneTo(p1);
    lines.addLine(v1,v3,xcolor,xcolor);
    v3.set(
        v1.x-vback.x*vx.x+vz.x*vrad.x,
        v1.y-vback.y*vx.y+vz.y*vrad.y,
        v1.z-vback.z*vx.z+vz.z*vrad.z).cloneTo(p2);
    lines.addLine(v1,v3,xcolor,xcolor);
    v3.set(
        v1.x-vback.x*vx.x-vz.x*vrad.x,
        v1.y-vback.y*vx.y-vz.y*vrad.y,
        v1.z-vback.z*vx.z-vz.z*vrad.z).cloneTo(p3);
    lines.addLine(v1,v3,xcolor,xcolor);
    lines.addLine(p0,p2,xcolor,xcolor);
    lines.addLine(p2,p1,xcolor,xcolor);
    lines.addLine(p1,p3,xcolor,xcolor);
    lines.addLine(p3,p0,xcolor,xcolor);
    
    //y轴
    vy.scale(length,v1);
    ori.vadd(v1,v1);
    lines.addLine(ori,v1,ycolor,ycolor);
    //y轴的两个小箭头
    v3.set(
        v1.x-vback.x*vy.x+vx.x*vrad.x,
        v1.y-vback.y*vy.y+vx.y*vrad.y,
        v1.z-vback.z*vy.z+vx.z*vrad.z).cloneTo(p0);
    lines.addLine(v1,v3,ycolor,ycolor);
    v3.set(
        v1.x-vback.x*vy.x-vx.x*vrad.x,
        v1.y-vback.y*vy.y-vx.y*vrad.y,
        v1.z-vback.z*vy.z-vx.z*vrad.z).cloneTo(p1);
    lines.addLine(v1,v3,ycolor,ycolor);
    v3.set(
        v1.x-vback.x*vy.x+vz.x*vrad.x,
        v1.y-vback.y*vy.y+vz.y*vrad.y,
        v1.z-vback.z*vy.z+vz.z*vrad.z).cloneTo(p2);
    lines.addLine(v1,v3,ycolor,ycolor);
    v3.set(
        v1.x-vback.x*vy.x-vz.x*vrad.x,
        v1.y-vback.y*vy.y-vz.y*vrad.y,
        v1.z-vback.z*vy.z-vz.z*vrad.z).cloneTo(p3);
    lines.addLine(v1,v3,ycolor,ycolor);
    lines.addLine(v1,v3,ycolor,ycolor);
    lines.addLine(p0,p2,ycolor,ycolor);
    lines.addLine(p2,p1,ycolor,ycolor);
    lines.addLine(p1,p3,ycolor,ycolor);
    lines.addLine(p3,p0,ycolor,ycolor);    
    //z轴
    vz.scale(length,v1);
    ori.vadd(v1,v1);
    lines.addLine(ori,v1,zcolor,zcolor);
    //z轴的两个小箭头
    v3.set(
        v1.x-vback.x*vz.x+vy.x*vrad.x,
        v1.y-vback.y*vz.y+vy.y*vrad.y,
        v1.z-vback.z*vz.z+vy.z*vrad.z).cloneTo(p0);
    lines.addLine(v1,v3,zcolor,zcolor);
    v3.set(
        v1.x-vback.x*vz.x-vy.x*vrad.x,
        v1.y-vback.y*vz.y-vy.y*vrad.y,
        v1.z-vback.z*vz.z-vy.z*vrad.z).cloneTo(p1);
    lines.addLine(v1,v3,zcolor,zcolor);
    v3.set(
        v1.x-vback.x*vz.x+vx.x*vrad.x,
        v1.y-vback.y*vz.y+vx.y*vrad.y,
        v1.z-vback.z*vz.z+vx.z*vrad.z).cloneTo(p2);
    lines.addLine(v1,v3,zcolor,zcolor);
    v3.set(
        v1.x-vback.x*vz.x-vx.x*vrad.x,
        v1.y-vback.y*vz.y-vx.y*vrad.y,
        v1.z-vback.z*vz.z-vx.z*vrad.z).cloneTo(p3);
    lines.addLine(v1,v3,zcolor,zcolor);
    lines.addLine(v1,v3,zcolor,zcolor);
    lines.addLine(v1,v3,zcolor,zcolor);
    lines.addLine(p0,p2,zcolor,zcolor);
    lines.addLine(p2,p1,zcolor,zcolor);
    lines.addLine(p1,p3,zcolor,zcolor);
    lines.addLine(p3,p0,zcolor,zcolor);       
}


var xrangeColor = new Color(0.9,0.5,0.5);
var yrangeColor = new Color(0.5,0.9,0.5);
var zrangeColor = new Color(0.5,0.5,0.9);
let quatMark = new Quaternion();
let lastPoint = new Vector3();

function draw1Range(liner:ILinerender,pos:Vector3,startVec:Vector3,rotAx:Vector3,min:number,max:number,color:Color){
        let end = new Vector3();
        startVec = startVec.clone();
        //在与转轴垂直并且经过参考向量的平面上,画出一个扇形,从min到max,min和max是弧度,指与参考向量的夹角(有正负)
        // 画出一个扇形，从min到max
        const segments = 20; // 扇形的段数
        const radius = 0.4; // 扇形的半径
        startVec.scale(radius,startVec)

        //min边
        //min = min*Math.PI/180;
        //max = max*Math.PI/180;
        let dAng = (max-min)/segments;

        Quaternion.createFromAxisAngle(rotAx, min, quatMark);
        Vector3.transformQuat(startVec,quatMark,end);
        liner.addLine(pos, pos.vadd(end,end), color, color);
        end.cloneTo(lastPoint); //加了偏移的起点
        
        for (let i = min; i <max; i+=dAng) {
            Quaternion.createFromAxisAngle(rotAx, i, quatMark);
            Vector3.transformQuat(startVec, quatMark, end);
            pos.vadd(end,end);
            liner.addLine(lastPoint,end,color, color);
            end.cloneTo(lastPoint);
        }

        //max边
        Quaternion.createFromAxisAngle(rotAx, max, quatMark);
        Vector3.transformQuat(startVec,quatMark,end);
        liner.addLine(pos, pos.vadd(end,end), color,color);
        liner.addLine(lastPoint,end,color, color);    
}

export function drawEulerRange1(liner:ILinerender,mat:Matrix4x4,xmin:number,xmax:number,ymin:number,ymax:number,zmin:number,zmax:number){
        let w_mat_ele = mat.elements;
        let ori = new  Vector3(w_mat_ele[12],w_mat_ele[13],w_mat_ele[14]);
        let AxX = new Vector3(w_mat_ele[0],w_mat_ele[1],w_mat_ele[2]);
        let AxY = new Vector3(w_mat_ele[4],w_mat_ele[5],w_mat_ele[6]);
        let AxZ = new Vector3(w_mat_ele[8],w_mat_ele[9],w_mat_ele[10]);
        AxX.normalize();
        AxY.normalize();
        AxZ.normalize();

        draw1Range(liner,ori,AxY,AxX,xmin,xmax,xrangeColor);    //绕着x轴旋转的限制
        draw1Range(liner,ori,AxX,AxY,ymin,ymax,yrangeColor);
        draw1Range(liner,ori,AxX,AxZ,zmin,zmax,zrangeColor);
}

let e1 = new Vector3();
let e2 = new Vector3();
let e3 = new Vector3();
let e4 = new Vector3();

//参数都是弧度
export function drawEulerRange(liner:ILinerender,mat:Matrix4x4,xmin:number,xmax:number,ymin:number,ymax:number,zmin:number,zmax:number, ){
        let w_mat_ele = mat.elements;
        let ori = new  Vector3(w_mat_ele[12],w_mat_ele[13],w_mat_ele[14]);
        let AxX = new Vector3(w_mat_ele[0],w_mat_ele[1],w_mat_ele[2]);
        let AxY = new Vector3(w_mat_ele[4],w_mat_ele[5],w_mat_ele[6]);
        let AxZ = new Vector3(w_mat_ele[8],w_mat_ele[9],w_mat_ele[10]);
        AxX.normalize();
        AxY.normalize();
        AxZ.normalize();
        let rmat = new Matrix4x4(
            AxX.x, AxX.y, AxX.z, 0,
            AxY.x, AxY.y, AxY.z, 0,
            AxZ.x, AxZ.y, AxZ.z, 0,
            0,0,0,1
        );

        //先绕着y轴得到两个向量，这两个向量再绕着旋转后的x轴，得到4个向量，这四个向量转到世界空间，然后在保证长度的情况下插值
        //z轴是起点，这样更方便用正负范围表示
        let len = 0.3;
        let stz = new Vector3(0,0,1);
        let end1 = new Vector3();
        let end2 = new Vector3();
        let end3 = new Vector3();
        let end4 = new Vector3();
        let stx = new Vector3(1,0,0);
        let x1 = new Vector3();
        let z1 = new Vector3();
        //let end = new Vector3();
        
        //y最小值旋转后的z
        let q = new Quaternion(0,Math.sin(ymin/2),0,Math.cos(ymin/2));
        Vector3.transformQuat(stz,q,z1);
        //y最小值旋转后的x
        Vector3.transformQuat(stx,q,x1);

        //把x1旋转得到两个
        let q1 = new Quaternion();
        Quaternion.createFromAxisAngle(x1,xmin,q1);
        Vector3.transformQuat(z1,q1,end1);
        Quaternion.createFromAxisAngle(x1,xmax,q1);
        Vector3.transformQuat(z1,q1,end2);

        //y最大值旋转后的z
        q.setValue(0,Math.sin(ymax/2),0,Math.cos(ymax/2));
        Vector3.transformQuat(stz,q,z1);
        //y最大值旋转后的x
        Vector3.transformQuat(stx,q,x1);
        //把x1旋转得到两个
        Quaternion.createFromAxisAngle(x1,xmin,q1);
        Vector3.transformQuat(z1,q1,end3);
        Quaternion.createFromAxisAngle(x1,xmax,q1);
        Vector3.transformQuat(z1,q1,end4);

        //实现平均分布x和y的旋转，组成一个nxn的网格数据
        const gridSize = 8; // 网格大小
        
        // 创建网格数据
        let gridPoints: Vector3[][] = [];
        
        for (let i = 0; i <= gridSize; i++) {
            let row: Vector3[] = [];
            let yAngle = ymin + (ymax - ymin) * (i / gridSize);
            
            for (let j = 0; j <= gridSize; j++) {
                let xAngle = xmin + (xmax - xmin) * (j / gridSize);
                
                // 应用y轴旋转
                let qY = new Quaternion(0, Math.sin(yAngle/2), 0, Math.cos(yAngle/2));
                let rotatedZ = new Vector3();
                Vector3.transformQuat(stz, qY, rotatedZ);
                
                // 应用x轴旋转
                let rotatedX = new Vector3();
                Vector3.transformQuat(stx, qY, rotatedX);
                
                let qX = new Quaternion();
                Quaternion.createFromAxisAngle(rotatedX, xAngle, qX);
                
                let gridPoint = new Vector3();
                Vector3.transformQuat(rotatedZ, qX, gridPoint);
                
                // 转换到世界空间并缩放
                Vector3.TransformNormal(gridPoint, rmat, gridPoint);
                gridPoint.scale(len, gridPoint);
                
                row.push(gridPoint);
            }
            gridPoints.push(row);
        }
        
        // 绘制网格线
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                let worldPoint = new Vector3();
                ori.vadd(gridPoints[i][j], worldPoint);
                
                // 绘制水平线
                if (j > 0) {
                    let prevWorldPoint = new Vector3();
                    ori.vadd(gridPoints[i][j-1], prevWorldPoint);
                    liner.addLine(prevWorldPoint, worldPoint, Color.RED, Color.RED);
                }
                
                // 绘制垂直线
                if (i > 0) {
                    let prevWorldPoint = new Vector3();
                    ori.vadd(gridPoints[i-1][j], prevWorldPoint);
                    liner.addLine(prevWorldPoint, worldPoint, Color.RED, Color.RED);
                }
            }
        }
}


export function drawCircle(liner:ILinerender,pos:Vector3, dir:Vector3,radius:number,color:Color){
    if (radius <= 0) return
    if (dir.x === 0 && dir.y === 0 && dir.z === 0) return

    // Build orthonormal basis (e3,e4) on plane perpendicular to dir (e1)
    e1.set(dir.x, dir.y, dir.z)
    e1.normalize()

    // Choose a helper axis not parallel to e1
    if (Math.abs(e1.y) < 0.999) {
        e2.set(0,1,0)
    } else {
        e2.set(1,0,0)
    }

    Vector3.cross(e2, e1, e3)
    e3.normalize()
    Vector3.cross(e1, e3, e4)
    e4.normalize()

    const segments = 48
    const step = Math.PI * 2 / segments

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        // point 0
        let c = Math.cos(a0)
        let s = Math.sin(a0)
        v2.set(
            radius * (e3.x * c + e4.x * s),
            radius * (e3.y * c + e4.y * s),
            radius * (e3.z * c + e4.z * s)
        )
        pos.vadd(v2, p1)

        // point 1
        c = Math.cos(a1)
        s = Math.sin(a1)
        v2.set(
            radius * (e3.x * c + e4.x * s),
            radius * (e3.y * c + e4.y * s),
            radius * (e3.z * c + e4.z * s)
        )
        pos.vadd(v2, p2)

        liner.addLine(p1, p2, color, color)
    }
}

// 在与 dir 垂直的平面上绘制椭圆
// radiusA、radiusB 分别为两个正交方向半径；可选 axisHint 用于确定椭圆的主轴方向（将其投影到平面上作为e3），未提供则自动选择
export function drawEllipse(liner:ILinerender,pos:Vector3, dir:Vector3, radiusA:number, radiusB:number, color:Color, axisHint?:Vector3){
    if (radiusA <= 0 || radiusB <= 0) return
    if (dir.x === 0 && dir.y === 0 && dir.z === 0) return

    // e1: 法向（归一化的dir）
    e1.set(dir.x, dir.y, dir.z)
    e1.normalize()

    // 在平面上选两条正交基 e3、e4
    if (axisHint && (axisHint.x !== 0 || axisHint.y !== 0 || axisHint.z !== 0)) {
        // 使用 axisHint 的投影作为 e3 的方向
        // proj = axisHint - dot(axisHint,e1)*e1
        const d = axisHint.x*e1.x + axisHint.y*e1.y + axisHint.z*e1.z
        e3.set(axisHint.x - d*e1.x, axisHint.y - d*e1.y, axisHint.z - d*e1.z)
        if (e3.x === 0 && e3.y === 0 && e3.z === 0) {
            // 如果axisHint与法向平行，退化到默认分支
            if (Math.abs(e1.y) < 0.999) {
                e2.set(0,1,0)
            } else {
                e2.set(1,0,0)
            }
            Vector3.cross(e2, e1, e3)
        }
    } else {
        // 自动选择一个不平行的辅助轴
        if (Math.abs(e1.y) < 0.999) {
            e2.set(0,1,0)
        } else {
            e2.set(1,0,0)
        }
        Vector3.cross(e2, e1, e3)
    }
    e3.normalize()
    Vector3.cross(e1, e3, e4)
    e4.normalize()

    const segments = 48
    const step = Math.PI * 2 / segments

    for (let i = 0; i < segments; i++) {
        const a0 = i * step
        const a1 = (i + 1) * step

        // point 0: pos + radiusA*(e3*cos) + radiusB*(e4*sin)
        let c = Math.cos(a0)
        let s = Math.sin(a0)
        v2.set(
            radiusA * e3.x * c + radiusB * e4.x * s,
            radiusA * e3.y * c + radiusB * e4.y * s,
            radiusA * e3.z * c + radiusB * e4.z * s
        )
        pos.vadd(v2, p1)

        // point 1
        c = Math.cos(a1)
        s = Math.sin(a1)
        v2.set(
            radiusA * e3.x * c + radiusB * e4.x * s,
            radiusA * e3.y * c + radiusB * e4.y * s,
            radiusA * e3.z * c + radiusB * e4.z * s
        )
        pos.vadd(v2, p2)

        liner.addLine(p1, p2, color, color)
    }
}