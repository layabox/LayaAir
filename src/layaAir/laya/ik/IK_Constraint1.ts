import { Sprite3D } from "../d3/core/Sprite3D";
import { Color } from "../maths/Color";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_ConstraintData } from "./IK_ConstraintData";
import { IK_Joint } from "./IK_Joint";
import { IK_System, SHOW_DBG } from "./IK_System";
import { quaternionFromTo, ripMatScale } from "./IK_Utils";
import { ILinerender } from "./LineRender";
import { drawAxis } from "./skeleton/RenderUtils";


export interface IK_Constraint1 {
    constraintMat(mat:Matrix4x4):Quaternion;
    constraintQ(q:Quaternion):Quaternion;
    visualize(liner:ILinerender,mat:Matrix4x4):void;
    rotation:Quaternion;
}

var constraintMatW = new Matrix4x4();
var constraintMat1W = new Matrix4x4();
var constrainMatInv = new Matrix4x4();
var constraintMatLocal = new Matrix4x4();
var curAxis=new Vector3();
var vecInCS = new Vector3();
let matJointW=new Matrix4x4();

//var transformI = new Transform3D(null);
/**
 * 这个必须是ik链已经连好了再调用，因为需要用到父关节
 */
export class IK_ConstraintInstance{

    //相对于父的空间。注意：这个是用bone的transform计算出来的，所以使用inParent的地方都要用bone的transform，否则会有错误，例如
    //如果bone有缩放，如果使用joint的transform会由于没有缩放导致错误
    //    好像不是，当设置transform的parent的时候，会把parent的缩放传递过来，后续只是设置position,rotation不会修改缩放，所以inParent
    //    可以用joint的transform计算
    inParent = new Matrix4x4();
    inChild:Matrix4x4=null; 
    enable=true;
    data:IK_ConstraintData | null = null; //IDE中用，动态修改
    constructor(
        public constraint:IK_Constraint1,
        matInParent:Matrix4x4,//父bone空间,
        public constraintBone:boolean,
    ){
        matInParent.cloneTo(this.inParent);
    }

    /**
     * 
     * @param joint 
     */
    doConsraint(joint:IK_Joint){
        if(!this.enable)
            return;
        //let jparent = joint.parent?joint.parent.bone:joint.bone.parent;
        //let parentTrans:Transform3D=null; 
        if(joint.parent){    //不能用这个，这个没有考虑缩放，而inParent是考虑缩放的了
            Matrix4x4.multiply(joint.parent.transform.worldMatrix, this.inParent, constraintMatW);
        }else if(joint.bone.parent && joint.bone.parent instanceof Sprite3D){
            //根据parent计算世界空间
            Matrix4x4.multiply(joint.bone.parent.transform.worldMatrix,this.inParent, constraintMatW);
        }else{
            this.inParent.cloneTo(constraintMatW);
        }

        //转换约束坐标系
        constraintMatW.invert(constrainMatInv);
        //约束的移动部的世界空间转成约束的静态部分的本地空间
        let childMat = joint.worldMatrix;
        if(this.constraintBone && joint.childDirOff){
            childMat = childMat.clone();
            Matrix4x4.multiply(childMat,joint.childDirOff,childMat);
        }
        Matrix4x4.multiply(constrainMatInv,childMat,constraintMatLocal);//todo 左右
        //矩阵要限制到没有缩放，并严格保证element[9]<1 否则下面的函数包含decomposeYawPitchRoll会出NaN
        let q = this.constraint.constraintMat(ripMatScale(constraintMatLocal));
        //然后转到世界空间 
        let matQ = new Matrix4x4();
        Matrix4x4.createFromQuaternion(q,matQ);
        //再把骨骼对齐的矩阵去掉
        if(this.constraintBone && joint.childDirOff){
            let dirInv = joint.childDirOff.clone();
            dirInv.transpose();
            Matrix4x4.multiply(matQ,dirInv,matQ);
        }
        Matrix4x4.multiply(constraintMatW,matQ,matJointW);
        let ypr = new Vector3();
        //要去掉矩阵的缩放。否则会得到错误的值。另外带缩放的情况下，Quaternion.createFromMatrix4x4是不对的，所以不用了。
        ripMatScale(matJointW).decomposeYawPitchRoll(ypr);
        Quaternion.createFromYawPitchRoll(ypr.x,ypr.y,ypr.z,joint.rotationQuat);
        //应用到骨骼
        joint.rotationQuat = joint.rotationQuat;
    }

    visualize(joint:IK_Joint,line: ILinerender){
        if(!SHOW_DBG.has(SHOW_DBG.CONSTRAINT))
            return;
        if(!this.enable)
            return;
        let parentMat:Matrix4x4;
        // if(joint.parent){ 不能用这个，这个没有考虑缩放，但是inParent是考虑缩放的
        //     parentMat = joint.parent.worldMatrix
        // }else{
            if(joint.bone.parent && joint.bone.parent instanceof Sprite3D){
                parentMat = joint.bone.parent.transform.worldMatrix;
            }
        //}
        let cspace_ws = new Matrix4x4();
        if(parentMat){
            //let parentMat = parentSp?parentSp.transform.worldMatrix:new Matrix4x4();
            Matrix4x4.multiply(parentMat,this.inParent,cspace_ws);
        }
        //画出转轴
        let length =0.6;
        if(SHOW_DBG.has(SHOW_DBG.CONSTRAINT_AXIS)){
            drawAxis(line,cspace_ws,length,[new Color(1,0.3,0.3),new Color(0.3,1,0.3), new Color(0.3,0.3,1)]);
        }
        this.constraint.visualize(line,cspace_ws);
        //画出当前的动部的z？
        let jointc_ele = joint.bone.transform.worldMatrix.elements;// joint.worldMatrix.elements;
        let jointPos = new Vector3(jointc_ele[12],jointc_ele[13],jointc_ele[14]);
        let jointZ = new Vector3(jointc_ele[8],jointc_ele[9],jointc_ele[10]);
        jointZ.normalize();
        jointZ.scale(length+0.1,jointZ).vadd(jointPos,jointZ);
        line.addLine(jointPos,jointZ,Color.RED,Color.RED)
    }
}