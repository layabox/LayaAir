import { Color } from "../maths/Color";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_Constraint1 } from "./IK_Constraint1";
import { quaternionFromTo, ripMatScale } from "./IK_Utils";
import { ILinerender } from "./LineRender";
import { drawEllipse } from "./skeleton/RenderUtils";

var z = new Vector3(0,0,1);

let totalRotation = new Quaternion();
let curz = new Vector3();
let qSwingOrig = new Quaternion();
let qSwingClamped = new Quaternion();
let axis = new Vector3
let qSwingInv = new Quaternion();
let qTwistClamped = new Quaternion();
let qTwistOrig = new Quaternion();
/**
 * 从0度开始，0度对应父joint
 * 实际使用的时候，需要放到一个指定的空间，主要是指定转轴
 */
export class IK_Constraint_SwingTwist implements IK_Constraint1{
    rotation = new Quaternion();
    cur=0;
    visual_height=0.5;
    visual_zheight=0.5;
    constructor(
        public xmax=Math.PI/4,
        public ymax=Math.PI/4,
        public zmin=-Math.PI,
        public zmax=Math.PI
    ){
    }

	constraintMat(mat:Matrix4x4,outQ:Quaternion){
		// 先去除缩放，保证旋转正交
		ripMatScale(mat);
		let mate = mat.elements;
		const EPS = 1e-6;

		// 从矩阵提取整体旋转
		//let totalRotation = new Quaternion();
		Quaternion.createFromMatrix4x4(mat, totalRotation);
		totalRotation.normalize(totalRotation);

		// 1) 由 z→curz 得到原始 swing（最小摆动，将 z 旋到当前前向）

		//let curz = new Vector3(mate[8],mate[9],mate[10]);
		curz.setValue(mate[8],mate[9],mate[10]);
		curz.normalize();
		//let qSwingOrig = new Quaternion();
		quaternionFromTo(z, curz, qSwingOrig);

		// 提取轴-角
		const sinHalf = Math.sqrt(qSwingOrig.x*qSwingOrig.x + qSwingOrig.y*qSwingOrig.y + qSwingOrig.z*qSwingOrig.z);
		const cosHalf = qSwingOrig.w;
		let theta = 2 * Math.atan2(sinHalf, cosHalf);
		const invSinHalf = 1 / Math.max(sinHalf, EPS);

		// swing 轴应位于 xy 平面（数值上 z≈0）
		const ux = sinHalf < EPS ? 1 : (qSwingOrig.x * invSinHalf);
		const uy = sinHalf < EPS ? 0 : (qSwingOrig.y * invSinHalf);

		// 2) 计算该方位下的最大摆动角 θ_max(φ)
		const clampAng = (a: number) => Math.min(Math.max(a, EPS), Math.PI/2 - 1e-3);
		const ax = Math.max(Math.tan(clampAng(this.xmax)), EPS);
		const ay = Math.max(Math.tan(clampAng(this.ymax)), EPS);
		const phi = Math.atan2(uy, ux);
		const c = Math.cos(phi), s = Math.sin(phi);
		const denom = Math.sqrt((c/ax)*(c/ax) + (s/ay)*(s/ay));
		const thetaMax = denom < EPS ? (Math.PI/2 - 1e-3) : Math.atan(1/denom);

		// 3) 仅裁剪 swing 的角度，保持摆动轴不变
		const thetaClamped = Math.min(theta, thetaMax);
		//let qSwingClamped = new Quaternion();
		if (thetaClamped < EPS) {
			qSwingClamped.x = 0; qSwingClamped.y = 0; qSwingClamped.z = 0; qSwingClamped.w = 1;
		} else {
			//let axis = new Vector3(ux, uy, 0);
			axis.setValue(ux,uy,0);
			axis.normalize();
			Quaternion.createFromAxisAngle(axis, thetaClamped, qSwingClamped);
		}

		// 4) 计算原始 twist = swingOrig^-1 * totalRotation
		//let qSwingInv = new Quaternion();
		qSwingOrig.invert(qSwingInv);
		//let qTwistOrig = new Quaternion();
		Quaternion.multiply(qSwingInv, totalRotation, qTwistOrig);
		qTwistOrig.normalize(qTwistOrig);

		// 5) 约束 twist 角度到 [zmin, zmax]
		let angle = 2 * Math.atan2(qTwistOrig.z, qTwistOrig.w);
		while (angle > Math.PI) angle -= 2 * Math.PI;
		while (angle < -Math.PI) angle += 2 * Math.PI;
		angle = Math.max(this.zmin, Math.min(this.zmax, angle));
		//let qTwistClamped = new Quaternion();
		Quaternion.createFromAxisAngle(z, angle, qTwistClamped);

		// 6) 合成最终旋转：swing_clamped * twist_clamped
		let constrainedRotation = outQ || new Quaternion();
		Quaternion.multiply(qSwingClamped, qTwistClamped, constrainedRotation);
		return constrainedRotation;
	}

    constraintQ(q: Quaternion): Quaternion {
        return null;
    }

    visualize(liner:ILinerender,mat:Matrix4x4):void{
        let max=80*Math.PI/180;
        //超过一定范围的就不显示了，否则太大
        if(this.xmax>max || this.ymax>max)
            return;

        let height=this.visual_height; //在这个高度画出circle
        let r1 = Math.tan(this.xmax)*height;
        let r2 = Math.tan(this.ymax)*height;
        let zlen=this.visual_zheight;
        let mate = mat.elements;
        let pos = new Vector3(mate[12],mate[13],mate[14]);
        let z = new Vector3(mate[8],mate[9],mate[10]);
        let y = new Vector3(mate[4],mate[5],mate[6]);
        y.normalize();
        z.normalize();
        let pos1 = new Vector3(pos.x+z.x*height,pos.y+z.y*height,pos.z+z.z*height);
        //drawCircle(liner,pos1,z,r,Color.CYAN);
        drawEllipse(liner,pos1,z,r1,r2,Color.CYAN,y);
        //liner.addLine(pos,z.scale(zlen,z).vadd(pos,z),Color.YELLOW,Color.YELLOW);
    }

}
