import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { IK_Joint } from "./IK_Joint";
import { IK_Pose1 } from "./IK_Pose1";

/**
 * EndEffetor:
 * 描述任务目标，是一个虚拟节点
 * 与上一个关节保持固定关系
 * 可以用任务空间来描述位置和朝向
 * 可以用任务空间来描述约束
 */
export class IK_EndEffector {
    //对应的joint
    private _joint:IK_Joint = null;
    private _target: IK_Pose1;

    //TODO 约束
    constructor(joint:IK_Joint) {
        this._joint=joint;
    }

    /**
     * 注意target是世界空间的
     * @param target 
     */
    setTarget(target: IK_Pose1) {
        this._target = target;
    }

    //前向计算，TODO 放到链的整体计算中
    getPose() {

    }
    //计算与target的误差
    getError() {

    }

    //世界空间位置
    get position(): Vector3 {
        //TODO 
        return this._joint.position
    }

    get rotation(): Quaternion {
        //TODO
        return null;
    }
}