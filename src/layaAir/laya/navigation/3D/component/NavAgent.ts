import { Sprite3D } from "../../../d3/core/Sprite3D";
import { MathUtils3D } from "../../../maths/MathUtils3D";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { BaseNavAgent } from "../../common/component/BaseNavAgent";
import { NavigationManager } from "../NavigationManager";

const TempQuaternion: Quaternion = new Quaternion();
const tempVector3: Vector3 = new Vector3();
export class NavAgent extends BaseNavAgent{
    /**@internal */
    protected _destination: Vector3 = new Vector3();

    /**
     * @en Offset of the pivot point.
     * @zh 轴心点的偏移。
     */
    set baseOffset(value: number) {
        this._baseOffset = value;
    }

    get baseOffset(): number {
        return this._baseOffset;
    }

    /**
     * @en Set the destination for the agent.
     * @param value The destination vector.
     * @zh 设置代理的目的地。
     * @param value 目的地位置向量。
     */
    set destination(value: Vector3) {
        value.cloneTo(this._destination);
        this._setTarget(this._destination);
    }

    get destination(): Vector3 {
        return this._destination;
    }

    /**
     * @overload
     * @internal
     */
    protected _getManager(): NavigationManager {
        return NavigationManager._getNavManager(this);
    }
    
    /**
     * @internal 
     */
    _getpos(vec:Vector3){
        let transform = (<Sprite3D>this.owner).transform;
        transform.position.cloneTo(vec);
        vec.y -= this._baseOffset;
    }

    
    /**
     * @internal 
     */
    _getheight(): number {
        let scale = (<Sprite3D>this.owner).transform.getWorldLossyScale();
        return this._height * scale.y;
    }

    /**
     * @internal 
     */
    _getradius(): number {
        let scale = (<Sprite3D>this.owner).transform.getWorldLossyScale();
        return this._radius * Math.max(scale.x, scale.y);
    }

    /**
     * @override 
     */
    protected  _updatePosition(pos:Vector3,dir:Vector3){
        let transform = (<Sprite3D>this.owner).transform;
        pos.y += this._baseOffset;
        transform.position = pos;
        if (MathUtils3D.isZero(dir.length()))   return;
        let up = tempVector3;
        transform.getUp(up);
        Vector3.normalize(dir, dir);
        Quaternion.rotationLookAt(dir, up, TempQuaternion);
        transform.rotation = TempQuaternion;
    }

    
}