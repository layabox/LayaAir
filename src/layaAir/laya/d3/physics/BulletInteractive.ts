import { Rigidbody3D } from "./Rigidbody3D";
import { PhysicsComponent } from "./PhysicsComponent";

/**
 * @internal
 */
export class BulletInteractive {
    /**@internal */
    static _interactive: object = {
        //Dynamic刚体,初始化时调用一次,Kinematic刚体,每次物理tick时调用(如果未进入睡眠状态),让物理引擎知道刚体位置。
        "getWorldTransform": (rigidBodyID: number, worldTransPointer: number) => {
            //已调整机制,引擎会统一处理通过Transform修改坐标更新包围盒队列
            //var rigidBody:Rigidbody3D = __JS__("this._rigidbody");
            //if (!rigidBody._colliderShape)//Dynamic刚体初始化时没有colliderShape需要跳过
            //return;
            //
            //rigidBody._simulation._updatedRigidbodies++;
            //var physics3D:* = Laya3D._physics3D;
            //var worldTrans:* = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
            //rigidBody._innerDerivePhysicsTransformation(worldTrans, true);
        },
        //Dynamic刚体,物理引擎每帧调用一次,用于更新渲染矩阵。
        "setWorldTransform": (rigidBodyID: number, worldTransPointer: number) => {
            var rigidBody: Rigidbody3D = PhysicsComponent._physicObjectsMap[rigidBodyID];
            rigidBody._simulation._updatedRigidbodies++;
            rigidBody._updateTransformComponent(worldTransPointer);
        }
    };
}