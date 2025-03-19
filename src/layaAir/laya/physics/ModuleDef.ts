import { ClassUtils } from "../utils/ClassUtils";
import { BoxCollider } from "./Collider2D/BoxCollider";
import { ChainCollider } from "./Collider2D/ChainCollider";
import { CircleCollider } from "./Collider2D/CircleCollider";
import { ColliderBase } from "./Collider2D/ColliderBase";
import { EdgeCollider } from "./Collider2D/EdgeCollider";
import { DistanceJoint } from "./Joint/DistanceJoint";
import { GearJoint } from "./Joint/GearJoint";
import { JointBase } from "./Joint/JointBase";
import { MotorJoint } from "./Joint/MotorJoint";
import { MouseJoint } from "./Joint/MouseJoint";
import { PrismaticJoint } from "./Joint/PrismaticJoint";
import { PulleyJoint } from "./Joint/PulleyJoint";
import { RevoluteJoint } from "./Joint/RevoluteJoint";
import { WeldJoint } from "./Joint/WeldJoint";
import { WheelJoint } from "./Joint/WheelJoint";
import { Physics2D } from "./Physics2D";
import { Physics2DDebugDraw } from "./Physics2DDebugDraw";
import { PolygonCollider } from "./Collider2D/PolygonCollider";
import { RigidBody } from "./RigidBody";
import { StaticCollider } from "./StaticCollider";
import { Physics2DShapeBase } from "./Shape/Physics2DShapeBase";
import { BoxShape } from "./Shape/BoxShape";
import { ChainShape } from "./Shape/ChainShape";
import { EdgeShape } from "./Shape/EdgeShape";
import { PolygonShape } from "./Shape/PolygonShape";
import { Physics2DWorldManager } from "./Physics2DWorldManager";

let c = ClassUtils.regClass;
c("Physics2D", Physics2D);
c("Physics2DDebugDraw", Physics2DDebugDraw);
c("Physics2DWorldManager", Physics2DWorldManager);

c("ColliderBase", ColliderBase);
c("RigidBody", RigidBody);
c("StaticCollider", StaticCollider);

c("JointBase", JointBase);
c("DistanceJoint", DistanceJoint);
c("GearJoint", GearJoint);
c("MotorJoint", MotorJoint);
c("MouseJoint", MouseJoint);
c("PrismaticJoint", PrismaticJoint);
c("PulleyJoint", PulleyJoint);
c("RevoluteJoint", RevoluteJoint);
c("WeldJoint", WeldJoint);
c("WheelJoint", WheelJoint);

c("BoxCollider", BoxCollider);
c("ChainCollider", ChainCollider);
c("CircleCollider", CircleCollider);
c("EdgeCollider", EdgeCollider);
c("PolygonCollider", PolygonCollider);


c("Physics2DShapeBase", Physics2DShapeBase);
c("BoxShape", BoxShape);
c("ChainShape", ChainShape);
c("EdgeShape", EdgeShape);
c("PolygonShape", PolygonShape);