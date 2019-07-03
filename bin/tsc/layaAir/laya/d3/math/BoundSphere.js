import { Vector3 } from "./Vector3";
import { CollisionUtils } from "./CollisionUtils";
/**
 * <code>BoundSphere</code> 类用于创建包围球。
 */
export class BoundSphere {
    /**
     * 创建一个 <code>BoundSphere</code> 实例。
     * @param	center 包围球的中心。
     * @param	radius 包围球的半径。
     */
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }
    toDefault() {
        this.center.toDefault();
        this.radius = 0;
    }
    /**
     * 从顶点的子队列生成包围球。
     * @param	points 顶点的队列。
     * @param	start 顶点子队列的起始偏移。
     * @param	count 顶点子队列的顶点数。
     * @param	result 生成的包围球。
     */
    static createFromSubPoints(points, start, count, out) {
        if (points == null) {
            throw new Error("points");
        }
        // Check that start is in the correct range 
        if (start < 0 || start >= points.length) {
            throw new Error("start" + start + "Must be in the range [0, " + (points.length - 1) + "]");
        }
        // Check that count is in the correct range 
        if (count < 0 || (start + count) > points.length) {
            throw new Error("count" + count + "Must be in the range <= " + points.length + "}");
        }
        var upperEnd = start + count;
        //Find the center of all points. 
        var center = BoundSphere._tempVector3;
        center.x = 0;
        center.y = 0;
        center.z = 0;
        for (var i = start; i < upperEnd; ++i) {
            Vector3.add(points[i], center, center);
        }
        var outCenter = out.center;
        //This is the center of our sphere. 
        Vector3.scale(center, 1 / count, outCenter);
        //Find the radius of the sphere 
        var radius = 0.0;
        for (i = start; i < upperEnd; ++i) {
            //We are doing a relative distance comparison to find the maximum distance 
            //from the center of our sphere. 
            var distance = Vector3.distanceSquared(outCenter, points[i]);
            if (distance > radius)
                radius = distance;
        }
        //Find the real distance from the DistanceSquared. 
        out.radius = Math.sqrt(radius);
    }
    /**
     * 从顶点队列生成包围球。
     * @param	points 顶点的队列。
     * @param	result 生成的包围球。
     */
    static createfromPoints(points, out) {
        if (points == null) {
            throw new Error("points");
        }
        BoundSphere.createFromSubPoints(points, 0, points.length, out);
    }
    /**
     * 判断射线是否与碰撞球交叉，并返回交叉距离。
     * @param	ray 射线。
     * @return 距离交叉点的距离，-1表示不交叉。
     */
    intersectsRayDistance(ray) {
        return CollisionUtils.intersectsRayAndSphereRD(ray, this);
    }
    /**
     * 判断射线是否与碰撞球交叉，并返回交叉点。
     * @param	ray  射线。
     * @param	outPoint 交叉点。
     * @return  距离交叉点的距离，-1表示不交叉。
     */
    intersectsRayPoint(ray, outPoint) {
        return CollisionUtils.intersectsRayAndSphereRP(ray, this, outPoint);
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var dest = destObject;
        this.center.cloneTo(dest.center);
        dest.radius = this.radius;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new BoundSphere(new Vector3(), 0);
        this.cloneTo(dest);
        return dest;
    }
}
BoundSphere._tempVector3 = new Vector3();
