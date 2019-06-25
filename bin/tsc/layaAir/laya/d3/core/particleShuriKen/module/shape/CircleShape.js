import { BaseShape } from "././BaseShape";
import { ShapeUtils } from "././ShapeUtils";
import { Vector2 } from "../../../../math/Vector2";
import { Vector3 } from "../../../../math/Vector3";
/**
 * <code>CircleShape</code> 类用于创建环形粒子形状。
 */
export class CircleShape extends BaseShape {
    /**
     * 创建一个 <code>CircleShape</code> 实例。
     */
    constructor() {
        super();
        this.radius = 1.0;
        this.arc = 360.0 / 180.0 * Math.PI;
        this.emitFromEdge = false;
        this.randomDirection = false;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _getShapeBoundBox(boundBox) {
        var min = boundBox.min;
        min.x = min.z = -this.radius;
        min.y = 0;
        var max = boundBox.max;
        max.x = max.z = this.radius;
        max.y = 0;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _getSpeedBoundBox(boundBox) {
        var min = boundBox.min;
        min.x = min.y = -1;
        min.z = 0;
        var max = boundBox.max;
        max.x = max.y = 1;
        max.z = 0;
    }
    /**
     *  用于生成粒子初始位置和方向。
     * @param	position 粒子位置。
     * @param	direction 粒子方向。
     */
    /*override*/ generatePositionAndDirection(position, direction, rand = null, randomSeeds = null) {
        var positionPoint = CircleShape._tempPositionPoint;
        if (rand) {
            rand.seed = randomSeeds[16];
            if (this.emitFromEdge)
                ShapeUtils._randomPointUnitArcCircle(this.arc, CircleShape._tempPositionPoint, rand);
            else
                ShapeUtils._randomPointInsideUnitArcCircle(this.arc, CircleShape._tempPositionPoint, rand);
            randomSeeds[16] = rand.seed;
        }
        else {
            if (this.emitFromEdge)
                ShapeUtils._randomPointUnitArcCircle(this.arc, CircleShape._tempPositionPoint);
            else
                ShapeUtils._randomPointInsideUnitArcCircle(this.arc, CircleShape._tempPositionPoint);
        }
        position.x = -positionPoint.x;
        position.y = positionPoint.y;
        position.z = 0;
        Vector3.scale(position, this.radius, position);
        if (this.randomDirection) {
            if (rand) {
                rand.seed = randomSeeds[17];
                ShapeUtils._randomPointUnitSphere(direction, rand);
                randomSeeds[17] = rand.seed;
            }
            else {
                ShapeUtils._randomPointUnitSphere(direction);
            }
        }
        else {
            position.cloneTo(direction);
        }
    }
    /*override*/ cloneTo(destObject) {
        super.cloneTo(destObject);
        var destShape = destObject;
        destShape.radius = this.radius;
        destShape.arc = this.arc;
        destShape.emitFromEdge = this.emitFromEdge;
        destShape.randomDirection = this.randomDirection;
    }
}
/** @private */
CircleShape._tempPositionPoint = new Vector2();
