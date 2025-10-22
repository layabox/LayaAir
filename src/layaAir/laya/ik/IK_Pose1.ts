import { Sprite3D } from "../d3/core/Sprite3D";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";


export class IK_Pose1 {
    protected _pos: Vector3;
    protected _dir: Quaternion;
    protected _targetSprite:Sprite3D;
    protected _poseChanged = true;
    constructor(pos?: Vector3 | Sprite3D| null, dir?: Quaternion | null) {
        if(pos instanceof Sprite3D){
            this._targetSprite = pos;
            this._pos = pos.transform.position.clone();
            this._dir = pos.transform.rotation.clone();
        }else{
            this._pos = pos ? pos.clone() : new Vector3();
            this._dir = dir ? dir.clone() : new Quaternion();
        }
        //ClsInst.addInst(this);
    }

    clone(t: IK_Pose1 | null) {
        let ret = t;
        if (t) {
            this._pos.cloneTo(t._pos);
            this._dir.cloneTo(t._dir);
        } else {
            ret = new IK_Pose1(this._pos, this._dir);
        }
        ret._targetSprite = this._targetSprite;
        return ret;
    }

    set pos(p: Vector3) {
        //TODO
        p.cloneTo(this._pos);
        this._poseChanged = true;
    }

    private _useSetPos=false;
    useSetPos(b:boolean){
        this._useSetPos=b;
    }

    get pos(){
        if(this._targetSprite&&!this._useSetPos){
            this._targetSprite.transform.position.cloneTo(this._pos);
        }
        return this._pos;
    }

    getPose(mat:Matrix4x4){
        if(this._targetSprite){
            this._targetSprite.transform.worldMatrix.cloneTo(mat);
            return mat;
        }
        return mat;
    }

    set dir(d: Quaternion) {
        //TODO
        this._poseChanged = true;
    }

    onPoseChange() {

    }
}

export { IK_Pose1 as IK_Target };