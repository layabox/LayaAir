import { PhysicsCollider } from "../d3/physics/PhysicsCollider";
import { PhysicsColliderComponent } from "../d3/physics/PhysicsColliderComponent";
import { Rigidbody3D } from "../d3/physics/Rigidbody3D";
import { BoxColliderShape } from "../d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "../d3/physics/shape/CapsuleColliderShape";
import { ConeColliderShape } from "../d3/physics/shape/ConeColliderShape";
import { CylinderColliderShape } from "../d3/physics/shape/CylinderColliderShape";
import { MeshColliderShape } from "../d3/physics/shape/MeshColliderShape";
import { Physics3DColliderShape } from "../d3/physics/shape/Physics3DColliderShape";
import { SphereColliderShape } from "../d3/physics/shape/SphereColliderShape";

PhysicsColliderComponent && (function () {
    PhysicsColliderComponent.prototype._parse = function (this: PhysicsColliderComponent, data: any, spriteMap: any): void {
        (data.collisionGroup != null) && (this._collider.setCollisionGroup(data.collisionGroup));
        (data.canCollideWith != null) && (this._collider.setCanCollideWith(data.canCollideWith));
    }

    let PhysicsCollider_old_parse = PhysicsCollider.prototype._parse;
    PhysicsCollider.prototype._parse = function (this: PhysicsCollider, data: any, spriteMap: any): void {
        (data.friction != null) && (this.friction = data.friction);
        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
        (data.restitution != null) && (this.restitution = data.restitution);
        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);

        PhysicsCollider_old_parse.call(this, data, spriteMap);

        parseShape(this, data.shapes);
    }

    let Rigidbody3D_old_parse = Rigidbody3D.prototype._parse;
    Rigidbody3D.prototype._parse = function (this: Rigidbody3D, data: any, spriteMap: any): void {
        (data.friction != null) && (this.friction = data.friction);
        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
        (data.restitution != null) && (this.restitution = data.restitution);
        (data.mass != null) && (this.mass = data.mass);
        (data.linearDamping != null) && (this.linearDamping = data.linearDamping);
        (data.angularDamping != null) && (this.angularDamping = data.angularDamping);

        if (data.linearFactor != null) {
            var linFac = this.linearFactor;
            linFac.fromArray(data.linearFactor);
            this.linearFactor = linFac;
        }
        if (data.angularFactor != null) {
            var angFac = this.angularFactor;
            angFac.fromArray(data.angularFactor);
            this.angularFactor = angFac;
        }

        if (data.gravity) {
            this.gravity.fromArray(data.gravity);
            this.gravity = this.gravity;
        }
        Rigidbody3D_old_parse.call(this, data, spriteMap);

        parseShape(this, data.shapes);

        (data.isKinematic != null) && (this.isKinematic = data.isKinematic);
    }
})();

function parseShape(comp: PhysicsColliderComponent, shapesData: any[]): void {
    var shapeCount = shapesData.length;
    if (shapeCount === 1) {
        var shape: Physics3DColliderShape = createShape(shapesData[0]);
        comp.colliderShape = shape;
    }
}

function createShape(shapeData: any): Physics3DColliderShape {
    var colliderShape: Physics3DColliderShape;
    switch (shapeData.type) {
        case "BoxColliderShape":
            var sizeData: any[] = shapeData.size;
            colliderShape = sizeData ? new BoxColliderShape(sizeData[0], sizeData[1], sizeData[2]) : new BoxColliderShape();
            break;
        case "SphereColliderShape":
            colliderShape = new SphereColliderShape(shapeData.radius);
            break;
        case "CapsuleColliderShape":
            colliderShape = new CapsuleColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
            break;
        case "MeshColliderShape":
            colliderShape = new MeshColliderShape();
            break;
        case "ConeColliderShape":
            colliderShape = new ConeColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
            break;
        case "CylinderColliderShape":
            colliderShape = new CylinderColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
            break;
        default:
            console.error("unknown shape type.");
    }
    return colliderShape;
};