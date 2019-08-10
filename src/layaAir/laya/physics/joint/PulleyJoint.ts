import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Point } from "../../maths/Point"
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * 滑轮关节：它将两个物体接地(ground)并彼此连接，当一个物体上升，另一个物体就会下降
 */
export class PulleyJoint extends JointBase {
    /**@private */
    private static _temp: any;
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

            var box2d: any = (<any>window).box2d;
            var def: any = PulleyJoint._temp || (PulleyJoint._temp = new box2d.b2PulleyJointDef());
            var posA: Point = ((<Sprite>this.otherBody.owner)).localToGlobal(Point.TEMP.setTo(this.otherAnchor[0], this.otherAnchor[1]), false, Physics.I.worldRoot);
            var anchorVecA: any = new box2d.b2Vec2(posA.x / Physics.PIXEL_RATIO, posA.y / Physics.PIXEL_RATIO);
            var posB: Point = ((<Sprite>this.selfBody.owner)).localToGlobal(Point.TEMP.setTo(this.selfAnchor[0], this.selfAnchor[1]), false, Physics.I.worldRoot);
            var anchorVecB: any = new box2d.b2Vec2(posB.x / Physics.PIXEL_RATIO, posB.y / Physics.PIXEL_RATIO);
            var groundA: Point = ((<Sprite>this.otherBody.owner)).localToGlobal(Point.TEMP.setTo(this.otherGroundPoint[0], this.otherGroundPoint[1]), false, Physics.I.worldRoot);
            var groundVecA: any = new box2d.b2Vec2(groundA.x / Physics.PIXEL_RATIO, groundA.y / Physics.PIXEL_RATIO);
            var groundB: Point = ((<Sprite>this.selfBody.owner)).localToGlobal(Point.TEMP.setTo(this.selfGroundPoint[0], this.selfGroundPoint[1]), false, Physics.I.worldRoot);
            var groundVecB: any = new box2d.b2Vec2(groundB.x / Physics.PIXEL_RATIO, groundB.y / Physics.PIXEL_RATIO);

            def.Initialize(this.otherBody.getBody(), this.selfBody.getBody(), groundVecA, groundVecB, anchorVecA, anchorVecB, this.ratio);
            def.collideConnected = this.collideConnected;
            this._joint = Physics.I._createJoint(def);
        }
    }
}

ClassUtils.regClass("laya.physics.joint.PulleyJoint", PulleyJoint);
ClassUtils.regClass("Laya.PulleyJoint", PulleyJoint);