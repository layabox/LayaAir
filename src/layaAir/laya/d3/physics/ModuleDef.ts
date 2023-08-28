import { ClassUtils } from "../../utils/ClassUtils";
import { CharacterController } from "./CharacterController";
import { ConfigurableConstraint } from "./constraints/ConfigurableConstraint";
import { ConstraintComponent } from "./constraints/ConstraintComponent";
import { FixedConstraint } from "./constraints/FixedConstraint";
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
import { SphereColliderShape } from "./shape/SphereColliderShape";

let c = ClassUtils.regClass;

c("ConfigurableConstraint", ConfigurableConstraint);
c("FixedConstraint", FixedConstraint);
c("ConstraintComponent", ConstraintComponent);

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