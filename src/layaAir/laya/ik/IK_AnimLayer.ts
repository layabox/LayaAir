import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_Joint } from "./IK_Joint";


var endPos = new Vector3();
export class IK_AnimLayer{
    roations:Quaternion[]=[];
    positions:Vector3[]=[];
    constructor(n=0){
        this.length=n;
    }

    set length(n:number){
        if(this.roations.length==n)
            return;
        this.roations.length=n;
        this.positions.length=n;
        for(let i=0; i<n; i++){
            this.roations[i]=new Quaternion();
            this.positions[i] = new Vector3();
        }
    }

    get length(){
        return this.roations.length;
    }

    captureBonePose(joints:IK_Joint[]){
        let n = joints.length;
        this.roations.length=n;
        for(let i=0;i<n; i++){
            let boneTrans = joints[i].bone.transform;
            let cRot = this.roations[i] || new Quaternion();
            let cPos = this.positions[i]|| new Vector3();
            this.roations[i] = cRot;
            this.positions[i] = cPos;
            boneTrans.rotation.cloneTo(cRot);
            boneTrans.position.cloneTo(cPos);
        }
        return this;
    }

    captureIKResult(joints:IK_Joint[]){
        let n = joints.length;
        this.roations.length=n;
        for(let i=0;i<n; i++){
            let joint = joints[i];
            let cRot = this.roations[i] || new Quaternion();
            joint.rotationQuat.cloneTo(cRot);
            this.roations[i] = cRot;
            let cPos = this.positions[i]|| new Vector3();
            joint.position.cloneTo(cPos);
            this.positions[i] = cPos;
        }
        return this;
    }    

    copy(layer:IK_AnimLayer){
        this.length = layer.length;
        for(let i=0,n=layer.length;i<n; i++){
            this.roations[i]||(this.roations[i]=new Quaternion());
            this.positions[i]||(this.positions[i]= new Vector3());
            layer.roations[i].cloneTo(this.roations[i]);
            layer.positions[i].cloneTo(this.positions[i]);
        }
    }

    /**
     * 
     * @param b 
     * @param weight b的权重
     * @param out 
     */
    blend(b:IK_AnimLayer,weight:number, joints:IK_Joint[], out:IK_AnimLayer=null){
        let n = this.roations.length;
        if(!out) out = new IK_AnimLayer(n);
        out.length=n;
        if(!b||b.roations.length==0){
            out.copy(this);
            return ;
        }
        if(this.roations.length==0){
            out.copy(b);
            return;
        }
        if(weight<0)weight=0;
        if(weight>1)weight=1;
        let outRots = out.roations;
        let outPos = out.positions;
        //curPos = this.pos[0]*(1-w)+b.pos[0]*w;
        let curPos = new Vector3();
        this.positions[0].scale(1-weight,curPos);
        let tmp = new Vector3();
        b.positions[0].scale(weight,tmp);
        curPos.vadd(tmp,curPos);
        curPos.cloneTo(outPos[0]);

        for(let i=0; i<n; i++){
            let orot = outRots[i];
            let srot = this.roations[i];
            let brot = b.roations[i];
            if(!brot){
                srot.cloneTo(orot);
            }else{
                Quaternion.slerp(srot,brot,weight,orot);
            }
            if(i<n-1){
                const next = joints[i + 1];
                Vector3.transformQuat(next.relPos, orot, endPos);
                outPos[i].vadd(endPos,next.position);
            }
        }
    }

    /**
     * 把当前的旋转给关节
     * 需要第一个关节的位置
     * @param joints 
     */
    applyToBone(joints:IK_Joint[]){
        let n = joints.length;
        for(let i=0;i<n-1;i++){
            let curJoint = joints[i];
            if(!curJoint.bone) 
                continue;
            if(curJoint.fixed)
                continue;
            if(!this.roations[i])
                return;
            let boneTrans = curJoint.bone.transform;
            let curQuat = this.roations[i]
            let curPos = curJoint.position;
            const next = joints[i + 1];
            Vector3.transformQuat(next.relPos, curQuat, endPos);
            curPos.vadd(endPos,next.position);
            next.position = next.position;
            boneTrans.position = curPos;
            boneTrans.rotation = curQuat;
        }
    }
}

export class IK_LayerMgr{
    private finalLayer = new IK_AnimLayer();
    //debug
    private lastSet = new IK_AnimLayer();
    //debug
    private fadeSrc:IK_AnimLayer=null;
    private fadeTarget:IK_AnimLayer=null;
    private fadeStart=0;
    private fadeTm=0;

    constructor(){

    }

    getCurrent(){
        return this.finalLayer;
    }

    set(layer:IK_AnimLayer){
        if(!layer)
            return;
        this.finalLayer.copy(layer);
        //
        this.lastSet.copy(layer);
    }

    /**
     * 从当前的结果过度到指定的结果
     * @param layer 
     * @param tm 
     */
    fadeTo(layer:IK_AnimLayer,tm:number){
        this.fadeStart = Date.now();
        this.fadeTm = tm;
        this.fadeSrc = new IK_AnimLayer();
        this.fadeSrc.copy(this.finalLayer);
        this.fadeTarget = new IK_AnimLayer();
        this.fadeTarget.copy(layer);
    }

    stopFade(){
        this.fadeStart =0;
    }

    isFading(){
        return this.fadeStart !== 0;
    }

    apply(joints:IK_Joint[]){
        if(this.fadeStart>0){
            let dt = Date.now()-this.fadeStart;
            if(dt>this.fadeTm){
                this.fadeStart=0;
                //this.fadeSrc = null;
                //this.fadeTarget = null;
            }else{
                let k = dt/this.fadeTm;
                k = Math.pow(k,0.5)
                this.fadeSrc.blend(this.fadeTarget,k,joints,this.finalLayer);
            }
        }
        this.finalLayer.applyToBone(joints);
    }
}