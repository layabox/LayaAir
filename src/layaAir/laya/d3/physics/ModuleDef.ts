import { ClassUtils } from "../../utils/ClassUtils";
import { CharacterController } from "./CharacterController";
import { ConfigurableConstraint } from "./constraints/ConfigurableConstraint";
import { ConstraintComponent } from "./constraints/ConstraintComponent";
import { FixedConstraint } from "./constraints/FixedConstraint";
import { HingeConstraint } from "./constraints/HingeConstraint";
import { SpringConstraint } from "./constraints/SpringConstraint";
import { PhysicsCollider } from "./PhysicsCollider";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";
import { PhysicsUpdateList } from "./PhysicsUpdateList";
import { Rigidbody3D } from "./Rigidbody3D";
import { BoxColliderShape } from "./shape/BoxColliderShape";
import { CapsuleColliderShape } from "./shape/CapsuleColliderShape";
import { CompoundColliderShape } from "./shape/CompoundColliderShape";
import { ConeColliderShape } from "./shape/ConeColliderShape";
import { CylinderColliderShape } from "./shape/CylinderColliderShape";
import { MeshColliderShape } from "./shape/MeshColliderShape";
import { Physics3DColliderShape } from "./shape/Physics3DColliderShape";
import { SphereColliderShape } from "./shape/SphereColliderShape";
import { Physics3DStatInfo } from "../../Physics3D/interface/Physics3DStatInfo";

let c = ClassUtils.regClass;

c("ConfigurableConstraint", ConfigurableConstraint);
c("FixedConstraint", FixedConstraint);
c("ConstraintComponent", ConstraintComponent);
c("HingeConstraint", HingeConstraint);
c("SpringConstraint", SpringConstraint);

c("Physics3DColliderShape", Physics3DColliderShape);
c("BoxColliderShape", BoxColliderShape);
c("CapsuleColliderShape", CapsuleColliderShape);
c("CompoundColliderShape", CompoundColliderShape);
c("ConeColliderShape", ConeColliderShape);
c("CylinderColliderShape", CylinderColliderShape);
c("MeshColliderShape", MeshColliderShape);
c("SphereColliderShape", SphereColliderShape);


c("CharacterController", CharacterController);
c("Rigidbody3D", Rigidbody3D);
c("PhysicsColliderComponent", PhysicsColliderComponent);
c("PhysicsCollider", PhysicsCollider);
c("PhysicsUpdateList", PhysicsUpdateList);
c("Physics3DStatInfo", Physics3DStatInfo);