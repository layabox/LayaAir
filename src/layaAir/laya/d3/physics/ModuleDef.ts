import { ClassUtils } from "../../utils/ClassUtils";
import { CharacterController } from "./CharacterController";
import { ConfigurableConstraint } from "./constraints/ConfigurableConstraint";
import { FixedConstraint } from "./constraints/FixedConstraint";
import { PhysicsCollider } from "./PhysicsCollider";
import { Rigidbody3D } from "./Rigidbody3D";

let c = ClassUtils.regClass;
c("CharacterController", CharacterController);
c("Rigidbody3D", Rigidbody3D);
c("PhysicsCollider", PhysicsCollider);
c("ConfigurableConstraint", ConfigurableConstraint);
c("FixedConstraint", FixedConstraint);