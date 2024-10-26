import { Plane } from "./Plane";
import { BoundBox } from "./BoundBox";
import { BoundSphere } from "./BoundSphere";
import { Ray } from "./Ray";
import { ContainmentType } from "./ContainmentType";
import { MathUtils3D } from "../../maths/MathUtils3D";
import { Vector3 } from "../../maths/Vector3";

/**
 * @en Collision class is used to detect collisions
 * @zh Collision 类用于检测碰撞。
 */
export class CollisionUtils {
    /**
     * @en constructor
     * @zh 构造方法
     */
    constructor() {

    }

    /**
     * @en Calculates the distance from a point to a plane in space.
     * @param plane The plane.
     * @param point The point.
     * @returns The distance from the point to the plane.
     * @zh 计算空间中点到平面的距离。
     * @param plane 平面。
     * @param point 点。
     * @returns 点到平面的距离。
     */
    static distancePlaneToPoint(plane: Plane, point: Vector3): number {

        var dot: number = Vector3.dot(plane.normal, point);
        return dot + plane.distance;
    }

    /**
     * @en Calculates the distance from a point to a bounding box in space.
     * @param box The bounding box.
     * @param point The point.
     * @returns The distance from the point to the bounding box.
     * @zh 计算空间中点到包围盒的距离。
     * @param box 包围盒。
     * @param point 点。
     * @returns 点到包围盒的距离。
     */
    static distanceBoxToPoint(box: BoundBox, point: Vector3): number {

        var boxMin: Vector3 = box.min;
        var boxMineX: number = boxMin.x;
        var boxMineY: number = boxMin.y;
        var boxMineZ: number = boxMin.z;

        var boxMax: Vector3 = box.max;
        var boxMaxeX: number = boxMax.x;
        var boxMaxeY: number = boxMax.y;
        var boxMaxeZ: number = boxMax.z;

        var pointeX: number = point.x;
        var pointeY: number = point.y;
        var pointeZ: number = point.z;

        var distance: number = 0;

        if (pointeX < boxMineX)
            distance += (boxMineX - pointeX) * (boxMineX - pointeX);
        if (pointeX > boxMaxeX)
            distance += (boxMaxeX - pointeX) * (boxMaxeX - pointeX);

        if (pointeY < boxMineY)
            distance += (boxMineY - pointeY) * (boxMineY - pointeY);
        if (pointeY > boxMaxeY)
            distance += (boxMaxeY - pointeY) * (boxMaxeY - pointeY);

        if (pointeZ < boxMineZ)
            distance += (boxMineZ - pointeZ) * (boxMineZ - pointeZ);
        if (pointeZ > boxMaxeZ)
            distance += (boxMaxeZ - pointeZ) * (boxMaxeZ - pointeZ);

        return Math.sqrt(distance);
    }

    /**
     * @en Calculates the distance between two bounding boxes in space.
     * @param box1 The first bounding box.
     * @param box2 The second bounding box.
     * @returns The distance between the two bounding boxes.
     * @zh 计算空间中两个包围盒之间的距离。
     * @param box1 第一个包围盒。
     * @param box2 第二个包围盒。
     * @returns 两个包围盒之间的距离。
     */
    static distanceBoxToBox(box1: BoundBox, box2: BoundBox): number {

        var box1Mine: Vector3 = box1.min;
        var box1MineX: number = box1Mine.x;
        var box1MineY: number = box1Mine.y;
        var box1MineZ: number = box1Mine.z;

        var box1Maxe: Vector3 = box1.max;
        var box1MaxeX: number = box1Maxe.x;
        var box1MaxeY: number = box1Maxe.y;
        var box1MaxeZ: number = box1Maxe.z;

        var box2Mine: Vector3 = box2.min;
        var box2MineX: number = box2Mine.x;
        var box2MineY: number = box2Mine.y;
        var box2MineZ: number = box2Mine.z;

        var box2Maxe: Vector3 = box2.max;
        var box2MaxeX: number = box2Maxe.x;
        var box2MaxeY: number = box2Maxe.y;
        var box2MaxeZ: number = box2Maxe.z;

        var distance: number = 0;
        var delta: number;

        if (box1MineX > box2MaxeX) {

            delta = box1MineX - box2MaxeX;
            distance += delta * delta;
        } else if (box2MineX > box1MaxeX) {

            delta = box2MineX - box1MaxeX;
            distance += delta * delta;
        }

        if (box1MineY > box2MaxeY) {

            delta = box1MineY - box2MaxeY;
            distance += delta * delta;
        } else if (box2MineY > box1MaxeY) {

            delta = box2MineY - box1MaxeY;
            distance += delta * delta;
        }

        if (box1MineZ > box2MaxeZ) {

            delta = box1MineZ - box2MaxeZ;
            distance += delta * delta;
        } else if (box2MineZ > box1MaxeZ) {

            delta = box2MineZ - box1MaxeZ;
            distance += delta * delta;
        }

        return Math.sqrt(distance);
    }

    /**
     * @en Calculates the distance from a point to a bounding sphere in space.
     * @param sphere The bounding sphere.
     * @param point The point in space.
     * @returns The distance from the point to the bounding sphere.
     * @zh 计算空间中点到包围球的距离。
     * @param sphere 包围球。
     * @param point 空间中的点。
     * @returns 点到包围球的距离
     */
    static distanceSphereToPoint(sphere: BoundSphere, point: Vector3): number {

        var distance: number = Math.sqrt(Vector3.distanceSquared(sphere.center, point));
        distance -= sphere.radius;

        return Math.max(distance, 0);
    }

    /**
     * @en Calculates the distance between two bounding spheres in space.
     * @param sphere1 The first bounding sphere.
     * @param sphere2 The second bounding sphere.
     * @returns The distance between the two bounding spheres.
     * @zh 计算空间中两个包围球之间的距离。
     * @param sphere1 第一个包围球。
     * @param sphere2 第二个包围球。
     * @returns 两个包围球之间的距离。
     */
    static distanceSphereToSphere(sphere1: BoundSphere, sphere2: BoundSphere): number {

        var distance: number = Math.sqrt(Vector3.distanceSquared(sphere1.center, sphere2.center));
        distance -= sphere1.radius + sphere2.radius;

        return Math.max(distance, 0);
    }

    /**
     * @en Determines whether a ray intersects with a triangle and outputs the distance to the intersection.
     * @param ray The ray.
     * @param vertex1 The first vertex of the triangle.
     * @param vertex2 The second vertex of the triangle.
     * @param vertex3 The third vertex of the triangle.
     * @param out The distance to the intersection point.
     * @returns True if there is an intersection, otherwise false.
     * @zh 判断射线是否与三角形相交，并输出到交点的距离。
     * @param ray 射线。
     * @param vertex1 三角形的第一个顶点。
     * @param vertex2 三角形的第二个顶点。
     * @param vertex3 三角形的第三个顶点。
     * @param out 点和三角面间距离。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsRayAndTriangleRD(ray: Ray, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3, out: number): boolean {

        var rayO: Vector3 = ray.origin;
        var rayOeX: number = rayO.x;
        var rayOeY: number = rayO.y;
        var rayOeZ: number = rayO.z;

        var rayD: Vector3 = ray.direction;
        var rayDeX: number = rayD.x;
        var rayDeY: number = rayD.y;
        var rayDeZ: number = rayD.z;

        var v1eX: number = vertex1.x;
        var v1eY: number = vertex1.y;
        var v1eZ: number = vertex1.z;

        var v2eX: number = vertex2.x;
        var v2eY: number = vertex2.y;
        var v2eZ: number = vertex2.z;

        var v3eX: number = vertex3.x;
        var v3eY: number = vertex3.y;
        var v3eZ: number = vertex3.z;

        var _tempV30eX: number = _tempV30.x;
        var _tempV30eY: number = _tempV30.y;
        var _tempV30eZ: number = _tempV30.z;

        _tempV30eX = v2eX - v1eX;
        _tempV30eY = v2eY - v1eY;
        _tempV30eZ = v2eZ - v1eZ;

        var _tempV31eX: number = _tempV31.x;
        var _tempV31eY: number = _tempV31.y;
        var _tempV31eZ: number = _tempV31.z;

        _tempV31eX = v3eX - v1eX;
        _tempV31eY = v3eY - v1eY;
        _tempV31eZ = v3eZ - v1eZ;

        var _tempV32eX: number = _tempV32.x;
        var _tempV32eY: number = _tempV32.y;
        var _tempV32eZ: number = _tempV32.z;

        _tempV32eX = (rayDeY * _tempV31eZ) - (rayDeZ * _tempV31eY);
        _tempV32eY = (rayDeZ * _tempV31eX) - (rayDeX * _tempV31eZ);
        _tempV32eZ = (rayDeX * _tempV31eY) - (rayDeY * _tempV31eX);

        var determinant: number = (_tempV30eX * _tempV32eX) + (_tempV30eY * _tempV32eY) + (_tempV30eZ * _tempV32eZ);

        if (MathUtils3D.isZero(determinant)) {

            out = 0;
            return false;
        }

        var inversedeterminant: number = 1 / determinant;

        var _tempV33eX: number = _tempV33.x;
        var _tempV33eY: number = _tempV33.y;
        var _tempV33eZ: number = _tempV33.z;

        _tempV33eX = rayOeX - v1eX;
        _tempV33eY = rayOeY - v1eY;
        _tempV33eZ = rayOeZ - v1eZ;

        var triangleU: number = (_tempV33eX * _tempV32eX) + (_tempV33eY * _tempV32eY) + (_tempV33eZ * _tempV32eZ);
        triangleU *= inversedeterminant;

        if (triangleU < 0 || triangleU > 1) {

            out = 0;
            return false;
        }

        var _tempV34eX: number = _tempV34.x;
        var _tempV34eY: number = _tempV34.y;
        var _tempV34eZ: number = _tempV34.z;

        _tempV34eX = (_tempV33eY * _tempV30eZ) - (_tempV33eZ * _tempV30eY);
        _tempV34eY = (_tempV33eZ * _tempV30eX) - (_tempV33eX * _tempV30eZ);
        _tempV34eZ = (_tempV33eX * _tempV30eY) - (_tempV33eY * _tempV30eX);

        var triangleV: number = ((rayDeX * _tempV34eX) + (rayDeY * _tempV34eY)) + (rayDeZ * _tempV34eZ);
        triangleV *= inversedeterminant;

        if (triangleV < 0 || triangleU + triangleV > 1) {

            out = 0;
            return false;
        }

        var raydistance: number = (_tempV31eX * _tempV34eX) + (_tempV31eY * _tempV34eY) + (_tempV31eZ * _tempV34eZ);
        raydistance *= inversedeterminant;

        if (raydistance < 0) {

            out = 0;
            return false;
        }

        out = raydistance;
        return true;
    }

    /**
     * @en Determines whether a ray intersects with a triangle and outputs the intersection point.
     * @param ray The ray.
     * @param vertex1 The first vertex of the triangle.
     * @param vertex2 The second vertex of the triangle.
     * @param vertex3 The third vertex of the triangle.
     * @param out The intersection point.
     * @returns True if there is an intersection, otherwise false.
     * @zh 判断射线是否与三角形相交，并输出交点。
     * @param ray 射线。
     * @param vertex1 三角形的第一个顶点。
     * @param vertex2 三角形的第二个顶点。
     * @param vertex3 三角形的第三个顶点。
     * @param out 交点。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsRayAndTriangleRP(ray: Ray, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3, out: Vector3): boolean {

        var distance: number;
        if (!CollisionUtils.intersectsRayAndTriangleRD(ray, vertex1, vertex2, vertex3, distance)) {

            Vector3.ZERO.cloneTo(out);
            return false;
        }

        Vector3.scale(ray.direction, distance, _tempV30);
        Vector3.add(ray.origin, _tempV30, out);
        return true;
    }

    /**
     * @en Determines whether a ray intersects with a point.
     * @param ray The ray.
     * @param point The point.
     * @returns True if there is an intersection, otherwise false.
     * @zh 判断射线是否与点相交。
     * @param ray 射线。
     * @param point 点。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsRayAndPoint(ray: Ray, point: Vector3): boolean {

        Vector3.subtract(ray.origin, point, _tempV30);

        var b: number = Vector3.dot(_tempV30, ray.direction);
        var c: number = Vector3.dot(_tempV30, _tempV30) - MathUtils3D.zeroTolerance;

        if (c > 0 && b > 0)
            return false;
        var discriminant: number = b * b - c;
        if (discriminant < 0)
            return false;
        return true;
    }

    /**
     * @en Determines whether two rays intersect and outputs the intersection point.
     * @param ray1 The first ray.
     * @param ray2 The second ray.
     * @param out The intersection point.
     * @returns True if there is an intersection, otherwise false.
     * @zh 判断两条射线是否相交，并输出交点。
     * @param ray1 第一个射线。
     * @param ray2 第二个射线。
     * @param out 交点。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsRayAndRay(ray1: Ray, ray2: Ray, out: Vector3): boolean {

        var ray1o: Vector3 = ray1.origin;
        var ray1oeX: number = ray1o.x;
        var ray1oeY: number = ray1o.y;
        var ray1oeZ: number = ray1o.z;

        var ray1d: Vector3 = ray1.direction;
        var ray1deX: number = ray1d.x;
        var ray1deY: number = ray1d.y;
        var ray1deZ: number = ray1d.z;

        var ray2o: Vector3 = ray2.origin;
        var ray2oeX: number = ray2o.x;
        var ray2oeY: number = ray2o.y;
        var ray2oeZ: number = ray2o.z;

        var ray2d: Vector3 = ray2.direction;
        var ray2deX: number = ray2d.x;
        var ray2deY: number = ray2d.y;
        var ray2deZ: number = ray2d.z;

        Vector3.cross(ray1d, ray2d, _tempV30);
        var tempV3: Vector3 = _tempV30;
        var denominator: number = Vector3.scalarLength(_tempV30);

        if (MathUtils3D.isZero(denominator)) {

            if (MathUtils3D.nearEqual(ray2oeX, ray1oeX) && MathUtils3D.nearEqual(ray2oeY, ray1oeY) && MathUtils3D.nearEqual(ray2oeZ, ray1oeZ)) {
                Vector3.ZERO.cloneTo(out);
                return true;
            }
        }

        denominator = denominator * denominator;

        var m11: number = ray2oeX - ray1oeX;
        var m12: number = ray2oeY - ray1oeY;
        var m13: number = ray2oeZ - ray1oeZ;
        var m21: number = ray2deX;
        var m22: number = ray2deY;
        var m23: number = ray2deZ;
        var m31: number = tempV3.x;
        var m32: number = tempV3.y;
        var m33: number = tempV3.z;

        var dets: number = m11 * m22 * m33 + m12 * m23 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 - m13 * m22 * m31;

        m21 = ray1deX;
        m22 = ray1deY;
        m23 = ray1deZ;


        var s: number = dets / denominator;

        Vector3.scale(ray1d, s, _tempV30);
        Vector3.scale(ray2d, s, _tempV31);

        Vector3.add(ray1o, _tempV30, _tempV32);
        Vector3.add(ray2o, _tempV31, _tempV33);

        var point1e: Vector3 = _tempV32;
        var point2e: Vector3 = _tempV33;

        if (!MathUtils3D.nearEqual(point2e.x, point1e.x) || !MathUtils3D.nearEqual(point2e.y, point1e.y) || !MathUtils3D.nearEqual(point2e.z, point1e.z)) {
            Vector3.ZERO.cloneTo(out);
            return false;
        }

        out = _tempV32;
        return true;
    }

    /**
     * @en Determines whether a plane intersects with a triangle in space and returns the spatial relationship.
     * @param plane The plane.
     * @param vertex1 The first vertex of the triangle.
     * @param vertex2 The second vertex of the triangle.
     * @param vertex3 The third vertex of the triangle.
     * @returns The spatial relationship between the plane and the triangle： 
     * - 0(PlaneIntersectionType_Back): back, 
     * - 1(PlaneIntersectionType_Front): front, 
     * - 2(PlaneIntersectionType_Intersecting): intersecting.
     * @zh 判断空间中的平面是否与三角形相交，并返回空间位置关系。
     * @param plane 平面。
     * @param vertex1 三角形的第一个顶点。
     * @param vertex2 三角形的第二个顶点。
     * @param vertex3 三角形的第三个顶点。
     * @returns 平面与三角面的相交类型： 
     * - 0(PlaneIntersectionType_Back): 背面，
     * - 1(PlaneIntersectionType_Front): 正面，
     * - 2(PlaneIntersectionType_Intersecting): 相交。
     */
    static intersectsPlaneAndTriangle(plane: Plane, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3): number {

        var test1: number = CollisionUtils.intersectsPlaneAndPoint(plane, vertex1);
        var test2: number = CollisionUtils.intersectsPlaneAndPoint(plane, vertex2);
        var test3: number = CollisionUtils.intersectsPlaneAndPoint(plane, vertex3);

        if (test1 == Plane.PlaneIntersectionType_Front && test2 == Plane.PlaneIntersectionType_Front && test3 == Plane.PlaneIntersectionType_Front)
            return Plane.PlaneIntersectionType_Front;

        if (test1 == Plane.PlaneIntersectionType_Back && test2 == Plane.PlaneIntersectionType_Back && test3 == Plane.PlaneIntersectionType_Back)
            return Plane.PlaneIntersectionType_Back;

        return Plane.PlaneIntersectionType_Intersecting;
    }

    /**
     * @en Determines whether a ray intersects with a plane and returns the distance to the intersection.
     * @param ray The ray.
     * @param plane The plane.
     * @returns The distance to the intersection point, or -1 if there is no intersection.
     * @zh 判断射线是否与平面相交，并返回到交点的距离。
     * @param ray 射线。    
     * @param plane 平面。
     * @returns 到交点的距离，如果没有交点则为 -1。
     */
    static intersectsRayAndPlaneRD(ray: Ray, plane: Plane): number {
        //Source: Real-Time Collision Detection by Christer Ericson
        //Reference: Page 175
        var planeNor: Vector3 = plane.normal;
        var direction: number = Vector3.dot(planeNor, ray.direction);

        if (Math.abs(direction) < MathUtils3D.zeroTolerance)
            return -1;

        var position: number = Vector3.dot(planeNor, ray.origin);
        var distance: number = (-plane.distance - position) / direction;

        if (distance < 0) {
            if (distance < -MathUtils3D.zeroTolerance)
                return -1;
            distance = 0;
        }
        return distance;
    }

    /**
     * @en Determines whether a ray intersects with a plane and outputs the intersection point.
     * @param ray The ray.
     * @param plane The plane.
     * @param out The intersection point.
     * @returns True if there is an intersection, otherwise false.
     * @zh 判断射线是否与平面相交，并输出交点。
     * @param ray 射线。
     * @param plane 平面。
     * @param out 交点。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsRayAndPlaneRP(ray: Ray, plane: Plane, out: Vector3): boolean {
        //Source: Real-Time Collision Detection by Christer Ericson
        //Reference: Page 175
        var distance: number = CollisionUtils.intersectsRayAndPlaneRD(ray, plane);
        if (distance == -1) {
            out.setValue(0, 0, 0);
            return false;
        }

        var scaDis: Vector3 = _tempV30;
        Vector3.scale(ray.direction, distance, scaDis);
        Vector3.add(ray.origin, scaDis, out);
        return true;
    }

    /**
     * @en Determines whether a ray intersects with a bounding box and outputs the distance to the intersection.
     * @param ray The ray.
     * @param box The bounding box.
     * @returns The distance to the intersection point, or -1 if there is no intersection.
     * @zh 判断射线是否与包围盒相交，并输出到交点的距离。
     * @param ray 射线。
     * @param box 包围盒。
     * @returns 到交点的距离，如果没有交点则为 -1。
     */
    static intersectsRayAndBoxRD(ray: Ray, box: BoundBox): number {

        var rayoe: Vector3 = ray.origin;
        var rayoeX: number = rayoe.x;
        var rayoeY: number = rayoe.y;
        var rayoeZ: number = rayoe.z;

        var rayde: Vector3 = ray.direction;
        var raydeX: number = rayde.x;
        var raydeY: number = rayde.y;
        var raydeZ: number = rayde.z;

        var boxMine: Vector3 = box.min;
        var boxMineX: number = boxMine.x;
        var boxMineY: number = boxMine.y;
        var boxMineZ: number = boxMine.z;

        var boxMaxe: Vector3 = box.max;
        var boxMaxeX: number = boxMaxe.x;
        var boxMaxeY: number = boxMaxe.y;
        var boxMaxeZ: number = boxMaxe.z;

        var out: number = 0;

        var tmax: number = MathUtils3D.MaxValue;

        if (MathUtils3D.isZero(raydeX)) {

            if (rayoeX < boxMineX || rayoeX > boxMaxeX) {

                //out = 0;
                return -1;
            }
        } else {

            var inverse: number = 1 / raydeX;
            var t1: number = (boxMineX - rayoeX) * inverse;
            var t2: number = (boxMaxeX - rayoeX) * inverse;

            if (t1 > t2) {

                var temp: number = t1;
                t1 = t2;
                t2 = temp;
            }

            out = Math.max(t1, out);
            tmax = Math.min(t2, tmax);

            if (out > tmax) {

                //out = 0;
                return -1;
            }
        }

        if (MathUtils3D.isZero(raydeY)) {

            if (rayoeY < boxMineY || rayoeY > boxMaxeY) {

                //out = 0;
                return -1;
            }
        } else {

            var inverse1: number = 1 / raydeY;
            var t3: number = (boxMineY - rayoeY) * inverse1;
            var t4: number = (boxMaxeY - rayoeY) * inverse1;

            if (t3 > t4) {

                var temp1: number = t3;
                t3 = t4;
                t4 = temp1;
            }

            out = Math.max(t3, out);
            tmax = Math.min(t4, tmax);

            if (out > tmax) {

                //out = 0;
                return -1;
            }
        }

        if (MathUtils3D.isZero(raydeZ)) {

            if (rayoeZ < boxMineZ || rayoeZ > boxMaxeZ) {

                //out = 0;
                return -1;
            }
        } else {

            var inverse2: number = 1 / raydeZ;
            var t5: number = (boxMineZ - rayoeZ) * inverse2;
            var t6: number = (boxMaxeZ - rayoeZ) * inverse2;

            if (t5 > t6) {

                var temp2: number = t5;
                t5 = t6;
                t6 = temp2;
            }

            out = Math.max(t5, out);
            tmax = Math.min(t6, tmax);

            if (out > tmax) {

                //out = 0;
                return -1;
            }
        }

        return out;
    }

    /**
     * @en Determines whether a ray intersects with a bounding box and returns the intersection point.
     * @param ray The ray.
     * @param box The bounding box.
     * @param out The intersection point.
     * @returns The distance to the intersection, or -1 if there is no intersection.
     * @zh 判断射线是否与包围盒相交，并返回交点。
     * @param ray 射线。
     * @param box 包围盒。
     * @param out 交点。
     * @returns 到交点的距离，如果没有交点则为 -1。
     */
    static intersectsRayAndBoxRP(ray: Ray, box: BoundBox, out: Vector3): number {

        var distance: number = CollisionUtils.intersectsRayAndBoxRD(ray, box);
        if (distance === -1) {

            Vector3.ZERO.cloneTo(out);
            return distance;
        }
        Vector3.scale(ray.direction, distance, _tempV30);
        Vector3.add(ray.origin, _tempV30, _tempV31);

        _tempV31.cloneTo(out);

        return distance;
    }

    /**
     * @en Determines whether a ray intersects with a bounding sphere and returns the distance to the intersection.
     * @param ray The ray.
     * @param sphere The bounding sphere.
     * @returns The distance to the intersection point, or -1 if there is no intersection.
     * @zh 判断射线是否与包围球相交，并返回到交点的距离。
     * @param ray 射线。
     * @param sphere 包围球。
     * @returns 到交点的距离，如果没有交点则为 -1。
     */
    static intersectsRayAndSphereRD(ray: Ray, sphere: BoundSphere): number {

        var sphereR: number = sphere.radius;
        Vector3.subtract(ray.origin, sphere.center, _tempV30);

        var b: number = Vector3.dot(_tempV30, ray.direction);
        var c: number = Vector3.dot(_tempV30, _tempV30) - (sphereR * sphereR);

        if (c > 0 && b > 0) {
            return -1;
        }

        var discriminant: number = b * b - c;

        if (discriminant < 0) {
            return -1;
        }

        var distance: number = -b - Math.sqrt(discriminant);

        if (distance < 0)
            distance = 0;

        return distance;

    }

    /**
     * @en Determines whether a ray intersects with a bounding sphere and returns the distance to the intersection.
     * @param ray The ray.
     * @param sphere The bounding sphere.
     * @param out The intersection point.
     * @returns The distance to the intersection, or -1 if there is no intersection.
     * @zh 判断射线是否与包围球相交并返回到交点的距离。
     * @param ray 射线。
     * @param sphere 包围球。
     * @param out 交点。
     * @returns 到交点的距离，如果没有交点则为 -1。
     */
    static intersectsRayAndSphereRP(ray: Ray, sphere: BoundSphere, out: Vector3): number {
        var distance: number = CollisionUtils.intersectsRayAndSphereRD(ray, sphere);
        if (distance === -1) {
            Vector3.ZERO.cloneTo(out);
            return distance;
        }

        Vector3.scale(ray.direction, distance, _tempV30);
        Vector3.add(ray.origin, _tempV30, _tempV31);

        _tempV31.cloneTo(out);
        return distance;
    }

    /**
     * @en Determines whether a bounding sphere intersects with a triangle.
     * @param sphere The bounding sphere.
     * @param vertex1 The first vertex of the triangle.
     * @param vertex2 The second vertex of the triangle.
     * @param vertex3 The third vertex of the triangle.
     * @returns True if they intersect, otherwise false.
     * @zh 判断包围球是否与三角形相交。
     * @param sphere 包围球。
     * @param vertex1 三角形的第一个顶点。
     * @param vertex2 三角形的第二个顶点。
     * @param vertex3 三角形的第三个顶点。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsSphereAndTriangle(sphere: BoundSphere, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3): boolean {

        var sphereC: Vector3 = sphere.center;
        var sphereR: number = sphere.radius;

        CollisionUtils.closestPointPointTriangle(sphereC, vertex1, vertex2, vertex3, _tempV30);
        Vector3.subtract(_tempV30, sphereC, _tempV31);

        var dot: number = Vector3.dot(_tempV31, _tempV31);

        return dot <= sphereR * sphereR;
    }

    /**
     * @en Determines the intersection status between a point and a plane.
     * @param plane The plane.
     * @param point The point.
     * @returns The type of intersection between a point and a plane: 
     * - 0(PlaneIntersectionType_Back): back, 
     * - 1(PlaneIntersectionType_Front): front, 
     * - 2(PlaneIntersectionType_Intersecting): intersecting.
     * @zh 判断点与平面之间的相交状态。
     * @param plane 平面。
     * @param point 点。
     * @returns 点与平面的相交类型：
     * - 0(PlaneIntersectionType_Back): 背面，
     * - 1(PlaneIntersectionType_Front): 正面，
     * - 2(PlaneIntersectionType_Intersecting): 相交。
     */
    static intersectsPlaneAndPoint(plane: Plane, point: Vector3): number {
        var distance: number = Vector3.dot(plane.normal, point) + plane.distance;
        if (distance > 0)
            return Plane.PlaneIntersectionType_Front;
        if (distance < 0)
            return Plane.PlaneIntersectionType_Back;
        return Plane.PlaneIntersectionType_Intersecting;
    }

    /**
     * @en Determines whether two planes intersect.
     * @param plane1 The first plane.
     * @param plane2 The second plane.
     * @returns True if they intersect, otherwise false.
     * @zh 判断两个平面是否相交。
     * @param plane1 第一个平面。
     * @param plane2 第二个平面。
     * @returns 如果相交返回真，否则返回假。
     */

    static intersectsPlaneAndPlane(plane1: Plane, plane2: Plane): boolean {

        Vector3.cross(plane1.normal, plane2.normal, _tempV30);

        var denominator: number = Vector3.dot(_tempV30, _tempV30);

        if (MathUtils3D.isZero(denominator))
            return false;

        return true;
    }

    /**
     * @en Determines whether two planes intersect and outputs the line of intersection.
     * @param plane1 The first plane.
     * @param plane2 The second plane.
     * @param line The line representing the intersection.
     * @returns True if they intersect, otherwise false.
     * @zh 判断两个平面是否相交并输出相交线。
     * @param plane1 第一个平面。
     * @param plane2 第二个平面。
     * @param line 相交线。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsPlaneAndPlaneRL(plane1: Plane, plane2: Plane, line: Ray): boolean {

        var plane1nor: Vector3 = plane1.normal;
        var plane2nor: Vector3 = plane2.normal;

        Vector3.cross(plane1nor, plane2nor, _tempV34);
        var denominator: number = Vector3.dot(_tempV34, _tempV34);

        if (MathUtils3D.isZero(denominator))
            return false;

        Vector3.scale(plane2nor, plane1.distance, _tempV30);
        Vector3.scale(plane1nor, plane2.distance, _tempV31);
        Vector3.subtract(_tempV30, _tempV31, _tempV32);
        Vector3.cross(_tempV32, _tempV34, _tempV33);

        Vector3.normalize(_tempV34, _tempV34);
        line = new Ray(_tempV33, _tempV34);

        return true;
    }

    /**
     * @en Determines the intersection status between a plane and a bounding box.
     * @param plane The plane.
     * @param box The bounding box.
     * @returns The intersection type of the plane and the bounding box: 
     * - 0(PlaneIntersectionType_Back): back, 
     * - 1(PlaneIntersectionType_Front): front, 
     * - 2(PlaneIntersectionType_Intersecting): intersecting.
     * @zh 判断平面与包围盒之间的相交状态。
     * @param plane 平面。
     * @param box 包围盒。
     * @returns 平面与包围盒的相交类型: 
     * - 0(PlaneIntersectionType_Back): 背面，
     * - 1(PlaneIntersectionType_Front): 正面，
     * - 2(PlaneIntersectionType_Intersecting): 相交。
     */
    static intersectsPlaneAndBox(plane: Plane, box: BoundBox): number {

        var planeD: number = plane.distance;

        var planeNor: Vector3 = plane.normal;
        var planeNoreX: number = planeNor.x;
        var planeNoreY: number = planeNor.y;
        var planeNoreZ: number = planeNor.z;

        var boxMine: Vector3 = box.min;
        var boxMineX: number = boxMine.x;
        var boxMineY: number = boxMine.y;
        var boxMineZ: number = boxMine.z;

        var boxMaxe: Vector3 = box.max;
        var boxMaxeX: number = boxMaxe.x;
        var boxMaxeY: number = boxMaxe.y;
        var boxMaxeZ: number = boxMaxe.z;

        _tempV30.x = (planeNoreX > 0) ? boxMineX : boxMaxeX;
        _tempV30.y = (planeNoreY > 0) ? boxMineY : boxMaxeY;
        _tempV30.z = (planeNoreZ > 0) ? boxMineZ : boxMaxeZ;

        _tempV31.x = (planeNoreX > 0) ? boxMaxeX : boxMineX;
        _tempV31.y = (planeNoreY > 0) ? boxMaxeY : boxMineY;
        _tempV31.z = (planeNoreZ > 0) ? boxMaxeZ : boxMineZ;

        var distance: number = Vector3.dot(planeNor, _tempV30);
        if (distance + planeD > 0)
            return Plane.PlaneIntersectionType_Front;

        distance = Vector3.dot(planeNor, _tempV31);
        if (distance + planeD < 0)
            return Plane.PlaneIntersectionType_Back;

        return Plane.PlaneIntersectionType_Intersecting;
    }

    /**
     * @en Determines the intersection status between a plane and a bounding sphere.
     * @param plane The plane.
     * @param sphere The bounding sphere.
     * @returns The intersection type of the plane and the bounding sphere: 0-back, 1-front, 2-intersecting.
     * @zh 判断平面与包围球之间的相交状态。
     * @param plane 平面。
     * @param sphere 包围球。
     * @returns 平面与包围球的相交类型:  0-背面，1-正面，2-相交。
     */
    static intersectsPlaneAndSphere(plane: Plane, sphere: BoundSphere): number {

        var sphereR: number = sphere.radius;
        var distance: number = Vector3.dot(plane.normal, sphere.center) + plane.distance;

        if (distance > sphereR)
            return Plane.PlaneIntersectionType_Front;
        if (distance < -sphereR)
            return Plane.PlaneIntersectionType_Back;
        return Plane.PlaneIntersectionType_Intersecting;
    }

    /**
     * @en Determines whether two bounding boxes intersect.
     * @param box1 The first bounding box.
     * @param box2 The second bounding box.
     * @returns True if they intersect, otherwise false.
     * @zh 判断两个包围盒是否相交。
     * @param box1 第一个包围盒。
     * @param box2 第二个包围盒。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsBoxAndBox(box1: BoundBox, box2: BoundBox): boolean {

        var box1Mine: Vector3 = box1.min;
        var box1Maxe: Vector3 = box1.max;
        var box2Mine: Vector3 = box2.min;
        var box2Maxe: Vector3 = box2.max;

        if (box1Mine.x > box2Maxe.x || box2Mine.x > box1Maxe.x)
            return false;
        if (box1Mine.y > box2Maxe.y || box2Mine.y > box1Maxe.y)
            return false;
        if (box1Mine.z > box2Maxe.z || box2Mine.z > box1Maxe.z)
            return false;
        return true;
    }

    /**
     * @en Determines whether a bounding box intersects with a bounding sphere.
     * @param box The bounding box.
     * @param sphere The bounding sphere.
     * @returns True if they intersect, otherwise false.
     * @zh 判断包围盒是否与包围球是否相交。
     * @param box 包围盒。
     * @param sphere 包围球。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsBoxAndSphere(box: BoundBox, sphere: BoundSphere): boolean {
        var center: Vector3 = sphere.center;
        var radius: number = sphere.radius;
        var nearest: Vector3 = _tempV30;
        Vector3.Clamp(center, box.min, box.max, nearest);
        var distance: number = Vector3.distanceSquared(center, nearest);
        return distance <= radius * radius;
    }

    /**
     * @en Determines whether one bounding sphere intersects with another bounding sphere.
     * @param sphere1 The first bounding sphere.
     * @param sphere2 The second bounding sphere.
     * @returns True if they intersect, otherwise false.
     * @zh 判断一个包围球是否与另一个包围球相交。
     * @param sphere1 第一个包围球。
     * @param sphere2 第二个包围球。
     * @returns 如果相交返回真，否则返回假。
     */
    static intersectsSphereAndSphere(sphere1: BoundSphere, sphere2: BoundSphere): boolean {

        var radiisum: number = sphere1.radius + sphere2.radius;
        return Vector3.distanceSquared(sphere1.center, sphere2.center) <= radiisum * radiisum;
    }

    /**
     * @en Determines the spatial relationship between a bounding box and a point.
     * @param box The bounding box.
     * @param point The point.
     * @returns The relationship type: 0 for disjoint, 1 for contains, 2 for intersecting.
     * @zh 确定包围盒和点之间的空间关系。
     * @param box 包围盒。
     * @param point 点。
     * @returns 位置关系：0 表示不相交，1 表示包含，2 表示相交。
     */
    static boxContainsPoint(box: BoundBox, point: Vector3): number {
        var boxMine: Vector3 = box.min;
        var boxMaxe: Vector3 = box.max;
        if (boxMine.x <= point.x && boxMaxe.x >= point.x && boxMine.y <= point.y && boxMaxe.y >= point.y && boxMine.z <= point.z && boxMaxe.z >= point.z)
            return ContainmentType.Contains;
        return ContainmentType.Disjoint;
    }

    /**
     * @en Determines the spatial relationship between two bounding boxes.
     * @param box1 The first bounding box.
     * @param box2 The second bounding box.
     * @returns The relationship type: 0 for disjoint, 1 for contains, 2 for intersecting.
     * @zh 确定两个包围盒之间的空间关系。
     * @param box1 第一个包围盒。
     * @param box2 第二个包围盒。
     * @returns 位置关系：0 表示不相交，1 表示包含，2 表示相交。
     */
    static boxContainsBox(box1: BoundBox, box2: BoundBox): number {

        var box1Mine: Vector3 = box1.min;
        var box1MineX: number = box1Mine.x;
        var box1MineY: number = box1Mine.y;
        var box1MineZ: number = box1Mine.z;

        var box1Maxe: Vector3 = box1.max;
        var box1MaxeX: number = box1Maxe.x;
        var box1MaxeY: number = box1Maxe.y;
        var box1MaxeZ: number = box1Maxe.z;

        var box2Mine: Vector3 = box2.min;
        var box2MineX: number = box2Mine.x;
        var box2MineY: number = box2Mine.y;
        var box2MineZ: number = box2Mine.z;

        var box2Maxe: Vector3 = box2.max;
        var box2MaxeX: number = box2Maxe.x;
        var box2MaxeY: number = box2Maxe.y;
        var box2MaxeZ: number = box2Maxe.z;

        if (box1MaxeX < box2MineX || box1MineX > box2MaxeX)
            return ContainmentType.Disjoint;

        if (box1MaxeY < box2MineY || box1MineY > box2MaxeY)
            return ContainmentType.Disjoint;

        if (box1MaxeZ < box2MineZ || box1MineZ > box2MaxeZ)
            return ContainmentType.Disjoint;

        if (box1MineX <= box2MineX && box2MaxeX <= box1MaxeX && box1MineY <= box2MineY && box2MaxeY <= box1MaxeY && box1MineZ <= box2MineZ && box2MaxeZ <= box1MaxeZ) {
            return ContainmentType.Contains;
        }

        return ContainmentType.Intersects;
    }


    /**
     * @en Determines the spatial relationship between a bounding box and a bounding sphere.
     * @param box The bounding box.
     * @param sphere The bounding sphere.
     * @returns The relationship type:  0 for disjoint, 1 for contains, 2 for intersecting.
     * @zh 确定包围盒和包围球之间的空间关系。
     * @param box 包围盒。
     * @param sphere 包围球。
     * @returns 位置关系: 0 表示不相交，1 表示包含，2 表示相交。
     */
    static boxContainsSphere(box: BoundBox, sphere: BoundSphere): number {

        var boxMin: Vector3 = box.min;
        var boxMineX: number = boxMin.x;
        var boxMineY: number = boxMin.y;
        var boxMineZ: number = boxMin.z;

        var boxMax: Vector3 = box.max;
        var boxMaxeX: number = boxMax.x;
        var boxMaxeY: number = boxMax.y;
        var boxMaxeZ: number = boxMax.z;

        var sphereC: Vector3 = sphere.center;
        var sphereCeX: number = sphereC.x;
        var sphereCeY: number = sphereC.y;
        var sphereCeZ: number = sphereC.z;

        var sphereR: number = sphere.radius;

        Vector3.Clamp(sphereC, boxMin, boxMax, _tempV30);
        var distance: number = Vector3.distanceSquared(sphereC, _tempV30);

        if (distance > sphereR * sphereR)
            return ContainmentType.Disjoint;

        if ((((boxMineX + sphereR <= sphereCeX) && (sphereCeX <= boxMaxeX - sphereR)) && ((boxMaxeX - boxMineX > sphereR) &&
            (boxMineY + sphereR <= sphereCeY))) && (((sphereCeY <= boxMaxeY - sphereR) && (boxMaxeY - boxMineY > sphereR)) &&
                (((boxMineZ + sphereR <= sphereCeZ) && (sphereCeZ <= boxMaxeZ - sphereR)) && (boxMaxeZ - boxMineZ > sphereR))))
            return ContainmentType.Contains;

        return ContainmentType.Intersects;
    }

    /**
     * @en Determines the spatial relationship between a bounding sphere and a point.
     * @param sphere The bounding sphere.
     * @param point The point.
     * @returns The relationship type: 0 for disjoint, 1 for contains, 2 for intersecting.
     * @zh 确定包围球和点之间的空间关系。
     * @param sphere 包围球。
     * @param point 点。
     * @returns 位置关系：0 表示不相交，1 表示包含，2 表示相交。
     */
    static sphereContainsPoint(sphere: BoundSphere, point: Vector3): number {

        if (Vector3.distanceSquared(point, sphere.center) <= sphere.radius * sphere.radius)
            return ContainmentType.Contains;

        return ContainmentType.Disjoint;
    }

    /**
     * @en Determines the spatial relationship between a bounding sphere and a triangle.
     * @param sphere The bounding sphere.
     * @param vertex1 The first vertex of the triangle.
     * @param vertex2 The second vertex of the triangle.
     * @param vertex3 The third vertex of the triangle.
     * @returns The relationship type:  0 for disjoint, 1 for contains, 2 for intersecting.
     * @zh 确定包围球和三角形之间的空间关系。
     * @param sphere 包围球。
     * @param vertex1 第一个顶点。
     * @param vertex2 第二个顶点。
     * @param vertex3 第三个顶点。
     * @returns 位置关系：0 表示不相交，1 表示包含，2 表示相交。
     */
    static sphereContainsTriangle(sphere: BoundSphere, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3): number {
        var test1: number = CollisionUtils.sphereContainsPoint(sphere, vertex1);
        var test2: number = CollisionUtils.sphereContainsPoint(sphere, vertex2);
        var test3: number = CollisionUtils.sphereContainsPoint(sphere, vertex3);

        if (test1 == ContainmentType.Contains && test2 == ContainmentType.Contains && test3 == ContainmentType.Contains)
            return ContainmentType.Contains;

        if (CollisionUtils.intersectsSphereAndTriangle(sphere, vertex1, vertex2, vertex3))
            return ContainmentType.Intersects;

        return ContainmentType.Disjoint;
    }

    /**
     * @en Determines whether a bounding sphere contains a bounding box.
     * @param sphere The bounding sphere.
     * @param box The bounding box.
     * @returns The spatial relationship: 0 for disjoint, 1 for contains, 2 for intersecting.
     * @zh 判断包围球是否包含包围盒。
     * @param sphere 包围球。
     * @param box 包围盒。
     * @returns 位置关系：0 表示不相交，1 表示包含，2 表示相交。
     */
    static sphereContainsBox(sphere: BoundSphere, box: BoundBox): number {

        var sphereC: Vector3 = sphere.center;
        var sphereCeX: number = sphereC.x;
        var sphereCeY: number = sphereC.y;
        var sphereCeZ: number = sphereC.z;

        var sphereR: number = sphere.radius;

        var boxMin: Vector3 = box.min;
        var boxMineX: number = boxMin.x;
        var boxMineY: number = boxMin.y;
        var boxMineZ: number = boxMin.z;

        var boxMax: Vector3 = box.max;
        var boxMaxeX: number = boxMax.x;
        var boxMaxeY: number = boxMax.y;
        var boxMaxeZ: number = boxMax.z;

        var _tempV30e: Vector3 = _tempV30;
        var _tempV30eX: number = _tempV30e.x;
        var _tempV30eY: number = _tempV30e.y;
        var _tempV30eZ: number = _tempV30e.z;

        if (!CollisionUtils.intersectsBoxAndSphere(box, sphere))
            return ContainmentType.Disjoint;

        var radiusSquared: number = sphereR * sphereR;

        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(_tempV30) > radiusSquared)
            return ContainmentType.Intersects;

        return ContainmentType.Contains;

    }

    /**
     * @en Determines whether one bounding sphere contains another bounding sphere.
     * @param sphere1 The first bounding sphere.
     * @param sphere2 The second bounding sphere.
     * @returns The spatial relationship: 0 for disjoint, 1 for contains, 2 for intersecting.
     * @zh 判断一个包围球是否包含另一个包围球。
     * @param sphere1 第一个包围球。
     * @param sphere2 第二个包围球。
     * @returns 位置关系：0 表示不相交，1 表示包含，2 表示相交。
     */
    static sphereContainsSphere(sphere1: BoundSphere, sphere2: BoundSphere): number {

        var sphere1R: number = sphere1.radius;
        var sphere2R: number = sphere2.radius;

        var distance: number = Vector3.distance(sphere1.center, sphere2.center);

        if (sphere1R + sphere2R < distance)
            return ContainmentType.Disjoint;

        if (sphere1R - sphere2R < distance)
            return ContainmentType.Intersects;

        return ContainmentType.Contains;
    }


    /**
     * @en Finds the closest point on a triangle to a given point in space.
     * @param point The point in space.
     * @param vertex1 The first vertex of the triangle.
     * @param vertex2 The second vertex of the triangle.
     * @param vertex3 The third vertex of the triangle.
     * @param out The closest point on the triangle.
     * @zh 找到空间中点到三角形的最近点。
     * @param point 空间中的点。
     * @param vertex1 三角形的第一个顶点。
     * @param vertex2 三角形的第二个顶点。
     * @param vertex3 三角形的第三个顶点。
     * @param out 三角形上的最近点。
     */
    static closestPointPointTriangle(point: Vector3, vertex1: Vector3, vertex2: Vector3, vertex3: Vector3, out: Vector3): void {

        Vector3.subtract(vertex2, vertex1, _tempV30);
        Vector3.subtract(vertex3, vertex1, _tempV31);

        Vector3.subtract(point, vertex1, _tempV32);
        Vector3.subtract(point, vertex2, _tempV33);
        Vector3.subtract(point, vertex3, _tempV34);

        var d1: number = Vector3.dot(_tempV30, _tempV32);
        var d2: number = Vector3.dot(_tempV31, _tempV32);
        var d3: number = Vector3.dot(_tempV30, _tempV33);
        var d4: number = Vector3.dot(_tempV31, _tempV33);
        var d5: number = Vector3.dot(_tempV30, _tempV34);
        var d6: number = Vector3.dot(_tempV31, _tempV34);

        if (d1 <= 0 && d2 <= 0) {
            vertex1.cloneTo(out);
            return;
        }

        if (d3 >= 0 && d4 <= d3) {
            vertex2.cloneTo(out);
            return;
        }

        var vc: number = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
            var v: number = d1 / (d1 - d3);
            Vector3.scale(_tempV30, v, out);
            Vector3.add(vertex1, out, out);
            return;
        }

        if (d6 >= 0 && d5 <= d6) {
            vertex3.cloneTo(out);
            return;
        }

        var vb: number = d5 * d2 - d1 * d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            var w: number = d2 / (d2 - d6);
            Vector3.scale(_tempV31, w, out);
            Vector3.add(vertex1, out, out);
            return;
        }

        var va: number = d3 * d6 - d5 * d4;
        if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
            var w3: number = (d4 - d3) / ((d4 - d3) + (d5 - d6));
            Vector3.subtract(vertex3, vertex2, out);
            Vector3.scale(out, w3, out);
            Vector3.add(vertex2, out, out);
            return;
        }

        var denom: number = 1 / (va + vb + vc);
        var v2: number = vb * denom;
        var w2: number = vc * denom;
        Vector3.scale(_tempV30, v2, _tempV35);
        Vector3.scale(_tempV31, w2, _tempV36);
        Vector3.add(_tempV35, _tempV36, out);
        Vector3.add(vertex1, out, out);
    }

    /**
     * @en Finds the closest point on a plane to a given point in space.
     * @param plane The plane.
     * @param point The point in space.
     * @param out The closest point on the plane.
     * @zh 找到空间中点到平面的最近点。
     * @param plane 平面。
     * @param point 空间中的点。
     * @param out 平面上的最近点。
     */
    static closestPointPlanePoint(plane: Plane, point: Vector3, out: Vector3): void {

        var planeN: Vector3 = plane.normal;
        var t: number = Vector3.dot(planeN, point) - plane.distance;

        Vector3.scale(planeN, t, _tempV30);
        Vector3.subtract(point, _tempV30, out);
    }

    /**
     * @en Finds the closest point on a bounding box to a given point in space.
     * @param box The bounding box.
     * @param point The point in space.
     * @param out The closest point on the bounding box.
     * @zh 找到空间中点到包围盒的最近点。
     * @param box 包围盒。
     * @param point 空间中的点。
     * @param out 包围盒上的最近点。
     */
    static closestPointBoxPoint(box: BoundBox, point: Vector3, out: Vector3): void {
        Vector3.max(point, box.min, _tempV30);
        Vector3.min(_tempV30, box.max, out);
    }

    /**
     * @en Finds the closest point on a bounding sphere to a given point in space.
     * @param sphere The bounding sphere.
     * @param point The point in space.
     * @param out The closest point on the bounding sphere.
     * @zh 找到空间中点到包围球的最近点。
     * @param sphere 包围球。
     * @param point 空间中的点。
     * @param out 包围球上的最近点。
     */
    static closestPointSpherePoint(sphere: BoundSphere, point: Vector3, out: Vector3): void {
        var sphereC: Vector3 = sphere.center;

        Vector3.subtract(point, sphereC, out);
        Vector3.normalize(out, out);

        Vector3.scale(out, sphere.radius, out);
        Vector3.add(out, sphereC, out);
    }

    /**
     * @en Finds the closest points between two bounding spheres.
     * @param sphere1 The first bounding sphere.
     * @param sphere2 The second bounding sphere.
     * @param out The closest point on the first bounding sphere to the second.
     * @zh 找到两个包围球之间的最近点。
     * @param sphere1 第一个包围球。
     * @param sphere2 第二个包围球。
     * @param out 第一个包围球上到第二个包围球的最近点。
     */
    static closestPointSphereSphere(sphere1: BoundSphere, sphere2: BoundSphere, out: Vector3): void {
        var sphere1C: Vector3 = sphere1.center;

        Vector3.subtract(sphere2.center, sphere1C, out);
        Vector3.normalize(out, out);

        Vector3.scale(out, sphere1.radius, out);
        Vector3.add(out, sphere1C, out);
    }

}

const _tempV30: Vector3 = new Vector3();
const _tempV31: Vector3 = new Vector3();
const _tempV32: Vector3 = new Vector3();
const _tempV33: Vector3 = new Vector3();
const _tempV34: Vector3 = new Vector3();
const _tempV35: Vector3 = new Vector3();
const _tempV36: Vector3 = new Vector3();