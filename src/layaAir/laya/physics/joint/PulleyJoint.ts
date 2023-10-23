import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Point } from "../../maths/Point"
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { physics2D_PulleyJointDef } from "./JointDefStructInfo";

/**
 * 滑轮关节：它将两个物体接地(ground)并彼此连接，当一个物体上升，另一个物体就会下降
 */
export class PulleyJoint extends JointBase {
    /**@private */
    private static _temp: physics2D_PulleyJointDef;
    /**[首次设置有效]关节的自身刚体*/
    selfBody: RigidBody;
    /**[首次设置有效]关节的连接刚体*/
    otherBody: RigidBody;
    /**[首次设置有效]自身刚体链接点，是相对于自身刚体的左上角位置偏移*/
    selfAnchor: any[] = [0, 0];
    /**[首次设置有效]链接刚体链接点，是相对于otherBody的左上角位置偏移*/
    otherAnchor: any[] = [0, 0];

    /**[首次设置有效]滑轮上与节点selfAnchor相连接的节点，是相对于自身刚体的左上角位置偏移*/
    selfGroundPoint: any[] = [0, 0];
    /**[首次设置有效]滑轮上与节点otherAnchor相连接的节点，是相对于otherBody的左上角位置偏移*/
    otherGroundPoint: any[] = [0, 0];
    /**[首次设置有效]两刚体移动距离比率*/
    ratio: number = 1.5;
    /**[首次设置有效]两个刚体是否可以发生碰撞，默认为false*/
    collideConnected: boolean = false;
    /**
     * @override
     */
    protected _createJoint(): void {
        if (!this._joint) {
            if (!this.otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var def: physics2D_PulleyJointDef = PulleyJoint._temp || (PulleyJoint._temp = new physics2D_PulleyJointDef);
            def.bodyA = this.otherBody.getBody();
            def.bodyB = this.selfBody.getBody();
            var posA: Point = this._factory.getLayaPosition(<Sprite>this.otherBody.owner, this.otherAnchor[0], this.otherAnchor[1], false);
            def.localAnchorA.setValue(posA.x, posA.y);
            var posB: Point = this._factory.getLayaPosition(<Sprite>this.selfBody.owner, this.selfAnchor[0], this.selfAnchor[1], false);
            def.localAnchorB.setValue(posB.x, posB.y);
            var groundA: Point = this._factory.getLayaPosition(<Sprite>this.otherBody.owner, this.otherGroundPoint[0], this.otherGroundPoint[1]);
            def.groundAnchorA.setValue(groundA.x, groundA.y);
            var groundB: Point = this._factory.getLayaPosition(<Sprite>this.selfBody.owner, this.selfGroundPoint[0], this.selfGroundPoint[1]);
            def.groundAnchorB.setValue(groundB.x, groundB.y);
            def.ratio = this.ratio;
            def.collideConnected = this.collideConnected;
            this._joint = Physics2D.I._factory.createJoint(def);
        }
    }
}