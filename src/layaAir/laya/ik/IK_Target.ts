import { Sprite3D } from "../d3/core/Sprite3D";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";

export class IK_Target {
    targetSprite:Sprite3D=null;
    _pos=new Vector3();
    _dir=new Vector3(0,1,0);
    constructor(pos?: Vector3 | Sprite3D| null, dir?: Vector3 | null) {
        if(pos instanceof Sprite3D){
            this.targetSprite = pos;
        }else{
            if(pos)pos.cloneTo(this._pos);
            if(dir)dir.cloneTo(this._dir);
        }
    }

    getPose(mat:Matrix4x4){
        if(this.targetSprite){
            this.targetSprite.transform.worldMatrix.cloneTo(mat);
            return mat;
        }
        return null;
    }

    get pos(){
        if(this.targetSprite){
            return this.targetSprite.transform.position;
        }
        return this._pos;
    }
    set pos(p:Vector3){
        if(this.targetSprite){
            this.targetSprite=null;
        }
        p.cloneTo(this._pos);
    }

    get dir(){
        if(this.targetSprite){
            let e = this.targetSprite.transform.worldMatrix.elements;
            this._dir.setValue(e[4],e[5],e[6]);
            this._dir.normalize();
        }
        return this._dir;
    }
    set dir(v:Vector3){
        if(this.targetSprite){
            this.targetSprite=null;
        }
        v.cloneTo(this._dir)
    }
}
