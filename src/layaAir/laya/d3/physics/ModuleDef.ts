import { ClassUtils } from "../../utils/ClassUtils";
import { CharacterController } from "./CharacterController";
import { ConfigurableConstraint } from "./constraints/ConfigurableConstraint";
import { FixedConstraint } from "./constraints/FixedConstraint";
import { PhysicsCollider } from "./PhysicsCollider";
import { Rigidbody3D } from "./Rigidbody3D";

let c = ClassUtils.regClass;
c("Laya.CharacterController", CharacterController);
c("Laya.Rigidbody3D", Rigidbody3D);
c("Laya.PhysicsCollider", PhysicsCollider);
c("Laya.ConfigurableConstraint", ConfigurableConstraint);
c("Laya.FixedConstraint", FixedConstraint);