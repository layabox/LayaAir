import { Vector3 } from "././Vector3";
import { Plane } from "././Plane";
import { Ray } from "././Ray";
import { MathUtils3D } from "././MathUtils3D";
import { ContainmentType } from "././ContainmentType";
/**
     * <code>Collision</code> 类用于检测碰撞。
     */
export class CollisionUtils {
    /**
     * 创建一个 <code>Collision</code> 实例。
     */
    constructor() {
    }
    /**
     * 空间中点到平面的距离
     * @param	plane 平面
     * @param	point 点
     */
    static distancePlaneToPoint(plane, point) {
        var dot = Vector3.dot(plane.normal, point);
        return dot - plane.distance;
    }
    /**
     * 空间中点到包围盒的距离
     * @param	box 包围盒
     * @param	point 点
     */
    static distanceBoxToPoint(box, point) {
        var boxMin = box.min;
        var boxMineX = boxMin.x;
        var boxMineY = boxMin.y;
        var boxMineZ = boxMin.z;
        var boxMax = box.max;
        var boxMaxeX = boxMax.x;
        var boxMaxeY = boxMax.y;
        var boxMaxeZ = boxMax.z;
        var pointeX = point.x;
        var pointeY = point.y;
        var pointeZ = point.z;
        var distance = 0;
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
     * 空间中包围盒到包围盒的距离
     * @param	box1 包围盒1
     * @param	box2 包围盒2
     */
    static distanceBoxToBox(box1, box2) {
        var box1Mine = box1.min;
        var box1MineX = box1Mine.x;
        var box1MineY = box1Mine.y;
        var box1MineZ = box1Mine.z;
        var box1Maxe = box1.max;
        var box1MaxeX = box1Maxe.x;
        var box1MaxeY = box1Maxe.y;
        var box1MaxeZ = box1Maxe.z;
        var box2Mine = box2.min;
        var box2MineX = box2Mine.x;
        var box2MineY = box2Mine.y;
        var box2MineZ = box2Mine.z;
        var box2Maxe = box2.max;
        var box2MaxeX = box2Maxe.x;
        var box2MaxeY = box2Maxe.y;
        var box2MaxeZ = box2Maxe.z;
        var distance = 0;
        var delta;
        if (box1MineX > box2MaxeX) {
            delta = box1MineX - box2MaxeX;
            distance += delta * delta;
        }
        else if (box2MineX > box1MaxeX) {
            delta = box2MineX - box1MaxeX;
            distance += delta * delta;
        }
        if (box1MineY > box2MaxeY) {
            delta = box1MineY - box2MaxeY;
            distance += delta * delta;
        }
        else if (box2MineY > box1MaxeY) {
            delta = box2MineY - box1MaxeY;
            distance += delta * delta;
        }
        if (box1MineZ > box2MaxeZ) {
            delta = box1MineZ - box2MaxeZ;
            distance += delta * delta;
        }
        else if (box2MineZ > box1MaxeZ) {
            delta = box2MineZ - box1MaxeZ;
            distance += delta * delta;
        }
        return Math.sqrt(distance);
    }
    /**
     * 空间中点到包围球的距离
     * @param	sphere 包围球
     * @param	point  点
     */
    static distanceSphereToPoint(sphere, point) {
        var distance = Math.sqrt(Vector3.distanceSquared(sphere.center, point));
        distance -= sphere.radius;
        return Math.max(distance, 0);
    }
    /**
     * 空间中包围球到包围球的距离
     * @param	sphere1 包围球1
     * @param	sphere2 包围球2
     */
    static distanceSphereToSphere(sphere1, sphere2) {
        var distance = Math.sqrt(Vector3.distanceSquared(sphere1.center, sphere2.center));
        distance -= sphere1.radius + sphere2.radius;
        return Math.max(distance, 0);
    }
    /**
     * 空间中射线和三角面是否相交,输出距离
     * @param	ray 射线
     * @param	vertex1 三角面顶点1
     * @param	vertex2	三角面顶点2
     * @param	vertex3 三角面顶点3
     * @param	out 点和三角面的距离
     * @return  是否相交
     */
    static intersectsRayAndTriangleRD(ray, vertex1, vertex2, vertex3, out) {
        var rayO = ray.origin;
        var rayOeX = rayO.x;
        var rayOeY = rayO.y;
        var rayOeZ = rayO.z;
        var rayD = ray.direction;
        var rayDeX = rayD.x;
        var rayDeY = rayD.y;
        var rayDeZ = rayD.z;
        var v1eX = vertex1.x;
        var v1eY = vertex1.y;
        var v1eZ = vertex1.z;
        var v2eX = vertex2.x;
        var v2eY = vertex2.y;
        var v2eZ = vertex2.z;
        var v3eX = vertex3.x;
        var v3eY = vertex3.y;
        var v3eZ = vertex3.z;
        var _tempV30eX = CollisionUtils._tempV30.x;
        var _tempV30eY = CollisionUtils._tempV30.y;
        var _tempV30eZ = CollisionUtils._tempV30.z;
        _tempV30eX = v2eX - v1eX;
        _tempV30eY = v2eY - v1eY;
        _tempV30eZ = v2eZ - v1eZ;
        var _tempV31eX = CollisionUtils._tempV31.x;
        var _tempV31eY = CollisionUtils._tempV31.y;
        var _tempV31eZ = CollisionUtils._tempV31.z;
        _tempV31eX = v3eX - v1eX;
        _tempV31eY = v3eY - v1eY;
        _tempV31eZ = v3eZ - v1eZ;
        var _tempV32eX = CollisionUtils._tempV32.x;
        var _tempV32eY = CollisionUtils._tempV32.y;
        var _tempV32eZ = CollisionUtils._tempV32.z;
        _tempV32eX = (rayDeY * _tempV31eZ) - (rayDeZ * _tempV31eY);
        _tempV32eY = (rayDeZ * _tempV31eX) - (rayDeX * _tempV31eZ);
        _tempV32eZ = (rayDeX * _tempV31eY) - (rayDeY * _tempV31eX);
        var determinant = (_tempV30eX * _tempV32eX) + (_tempV30eY * _tempV32eY) + (_tempV30eZ * _tempV32eZ);
        if (MathUtils3D.isZero(determinant)) {
            out = 0;
            return false;
        }
        var inversedeterminant = 1 / determinant;
        var _tempV33eX = CollisionUtils._tempV33.x;
        var _tempV33eY = CollisionUtils._tempV33.y;
        var _tempV33eZ = CollisionUtils._tempV33.z;
        _tempV33eX = rayOeX - v1eX;
        _tempV33eY = rayOeY - v1eY;
        _tempV33eZ = rayOeZ - v1eZ;
        var triangleU = (_tempV33eX * _tempV32eX) + (_tempV33eY * _tempV32eY) + (_tempV33eZ * _tempV32eZ);
        triangleU *= inversedeterminant;
        if (triangleU < 0 || triangleU > 1) {
            out = 0;
            return false;
        }
        var _tempV34eX = CollisionUtils._tempV34.x;
        var _tempV34eY = CollisionUtils._tempV34.y;
        var _tempV34eZ = CollisionUtils._tempV34.z;
        _tempV34eX = (_tempV33eY * _tempV30eZ) - (_tempV33eZ * _tempV30eY);
        _tempV34eY = (_tempV33eZ * _tempV30eX) - (_tempV33eX * _tempV30eZ);
        _tempV34eZ = (_tempV33eX * _tempV30eY) - (_tempV33eY * _tempV30eX);
        var triangleV = ((rayDeX * _tempV34eX) + (rayDeY * _tempV34eY)) + (rayDeZ * _tempV34eZ);
        triangleV *= inversedeterminant;
        if (triangleV < 0 || triangleU + triangleV > 1) {
            out = 0;
            return false;
        }
        var raydistance = (_tempV31eX * _tempV34eX) + (_tempV31eY * _tempV34eY) + (_tempV31eZ * _tempV34eZ);
        raydistance *= inversedeterminant;
        if (raydistance < 0) {
            out = 0;
            return false;
        }
        out = raydistance;
        return true;
    }
    /**
     * 空间中射线和三角面是否相交,输出相交点
     * @param	ray 射线
     * @param	vertex1 三角面顶点1
     * @param	vertex2	三角面顶点2
     * @param	vertex3 三角面顶点3
     * @param	out 相交点
     * @return  是否相交
     */
    static intersectsRayAndTriangleRP(ray, vertex1, vertex2, vertex3, out) {
        var distance;
        if (!CollisionUtils.intersectsRayAndTriangleRD(ray, vertex1, vertex2, vertex3, distance)) {
            out = Vector3._ZERO;
            return false;
        }
        Vector3.scale(ray.direction, distance, CollisionUtils._tempV30);
        Vector3.add(ray.origin, CollisionUtils._tempV30, out);
        return true;
    }
    /**
     * 空间中射线和点是否相交
     * @param	sphere1 包围球1
     * @param	sphere2 包围球2
     */
    static intersectsRayAndPoint(ray, point) {
        Vector3.subtract(ray.origin, point, CollisionUtils._tempV30);
        var b = Vector3.dot(CollisionUtils._tempV30, ray.direction);
        var c = Vector3.dot(CollisionUtils._tempV30, CollisionUtils._tempV30) - MathUtils3D.zeroTolerance;
        if (c > 0 && b > 0)
            return false;
        var discriminant = b * b - c;
        if (discriminant < 0)
            return false;
        return true;
    }
    /**
     * 空间中射线和射线是否相交
     * @param	ray1 射线1
     * @param	ray2 射线2
     * @param	out 相交点
     */
    static intersectsRayAndRay(ray1, ray2, out) {
        var ray1o = ray1.origin;
        var ray1oeX = ray1o.x;
        var ray1oeY = ray1o.y;
        var ray1oeZ = ray1o.z;
        var ray1d = ray1.direction;
        var ray1deX = ray1d.x;
        var ray1deY = ray1d.y;
        var ray1deZ = ray1d.z;
        var ray2o = ray2.origin;
        var ray2oeX = ray2o.x;
        var ray2oeY = ray2o.y;
        var ray2oeZ = ray2o.z;
        var ray2d = ray2.direction;
        var ray2deX = ray2d.x;
        var ray2deY = ray2d.y;
        var ray2deZ = ray2d.z;
        Vector3.cross(ray1d, ray2d, CollisionUtils._tempV30);
        var tempV3 = CollisionUtils._tempV30;
        var denominator = Vector3.scalarLength(CollisionUtils._tempV30);
        if (MathUtils3D.isZero(denominator)) {
            if (MathUtils3D.nearEqual(ray2oeX, ray1oeX) && MathUtils3D.nearEqual(ray2oeY, ray1oeY) && MathUtils3D.nearEqual(ray2oeZ, ray1oeZ)) {
                out = Vector3._ZERO;
                return true;
            }
        }
        denominator = denominator * denominator;
        var m11 = ray2oeX - ray1oeX;
        var m12 = ray2oeY - ray1oeY;
        var m13 = ray2oeZ - ray1oeZ;
        var m21 = ray2deX;
        var m22 = ray2deY;
        var m23 = ray2deZ;
        var m31 = tempV3.x;
        var m32 = tempV3.y;
        var m33 = tempV3.z;
        var dets = m11 * m22 * m33 + m12 * m23 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 - m13 * m22 * m31;
        m21 = ray1deX;
        m22 = ray1deY;
        m23 = ray1deZ;
        var dett = m11 * m22 * m33 + m12 * m23 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 - m13 * m22 * m31;
        var s = dets / denominator;
        var t = dett / denominator;
        Vector3.scale(ray1d, s, CollisionUtils._tempV30);
        Vector3.scale(ray2d, s, CollisionUtils._tempV31);
        Vector3.add(ray1o, CollisionUtils._tempV30, CollisionUtils._tempV32);
        Vector3.add(ray2o, CollisionUtils._tempV31, CollisionUtils._tempV33);
        var point1e = CollisionUtils._tempV32;
        var point2e = CollisionUtils._tempV33;
        if (!MathUtils3D.nearEqual(point2e.x, point1e.x) || !MathUtils3D.nearEqual(point2e.y, point1e.y) || !MathUtils3D.nearEqual(point2e.z, point1e.z)) {
            out = Vector3._ZERO;
            return false;
        }
        out = CollisionUtils._tempV32;
        return true;
    }
    /**
     * 空间中平面和三角面是否相交
     * @param	plane 平面
     * @param	vertex1 三角面顶点1
     * @param	vertex2 三角面顶点2
     * @param	vertex3 三角面顶点3
     * @return  返回空间位置关系
     */
    static intersectsPlaneAndTriangle(plane, vertex1, vertex2, vertex3) {
        var test1 = CollisionUtils.intersectsPlaneAndPoint(plane, vertex1);
        var test2 = CollisionUtils.intersectsPlaneAndPoint(plane, vertex2);
        var test3 = CollisionUtils.intersectsPlaneAndPoint(plane, vertex3);
        if (test1 == Plane.PlaneIntersectionType_Front && test2 == Plane.PlaneIntersectionType_Front && test3 == Plane.PlaneIntersectionType_Front)
            return Plane.PlaneIntersectionType_Front;
        if (test1 == Plane.PlaneIntersectionType_Back && test2 == Plane.PlaneIntersectionType_Back && test3 == Plane.PlaneIntersectionType_Back)
            return Plane.PlaneIntersectionType_Back;
        return Plane.PlaneIntersectionType_Intersecting;
    }
    /**
     * 空间中射线和平面是否相交
     * @param	ray   射线
     * @param	plane 平面
     * @param	out 相交距离,如果为0,不相交
     */
    static intersectsRayAndPlaneRD(ray, plane, out) {
        var planeNor = plane.normal;
        var direction = Vector3.dot(planeNor, ray.direction);
        if (MathUtils3D.isZero(direction)) {
            out = 0;
            return false;
        }
        var position = Vector3.dot(planeNor, ray.origin);
        out = (-plane.distance - position) / direction;
        if (out < 0) {
            out = 0;
            return false;
        }
        return true;
    }
    /**
     * 空间中射线和平面是否相交
     * @param	ray   射线
     * @param	plane 平面
     * @param	out 相交点
     */
    static intersectsRayAndPlaneRP(ray, plane, out) {
        var distance;
        if (!CollisionUtils.intersectsRayAndPlaneRD(ray, plane, distance)) {
            out = Vector3._ZERO;
            return false;
        }
        Vector3.scale(ray.direction, distance, CollisionUtils._tempV30);
        Vector3.add(ray.origin, CollisionUtils._tempV30, CollisionUtils._tempV31);
        out = CollisionUtils._tempV31;
        return true;
    }
    /**
     * 空间中射线和包围盒是否相交
     * @param	ray 射线
     * @param	box	包围盒
     * @param	out 相交距离,如果为0,不相交
     */
    static intersectsRayAndBoxRD(ray, box) {
        var rayoe = ray.origin;
        var rayoeX = rayoe.x;
        var rayoeY = rayoe.y;
        var rayoeZ = rayoe.z;
        var rayde = ray.direction;
        var raydeX = rayde.x;
        var raydeY = rayde.y;
        var raydeZ = rayde.z;
        var boxMine = box.min;
        var boxMineX = boxMine.x;
        var boxMineY = boxMine.y;
        var boxMineZ = boxMine.z;
        var boxMaxe = box.max;
        var boxMaxeX = boxMaxe.x;
        var boxMaxeY = boxMaxe.y;
        var boxMaxeZ = boxMaxe.z;
        var out = 0;
        var tmax = MathUtils3D.MaxValue;
        if (MathUtils3D.isZero(raydeX)) {
            if (rayoeX < boxMineX || rayoeX > boxMaxeX) {
                //out = 0;
                return -1;
            }
        }
        else {
            var inverse = 1 / raydeX;
            var t1 = (boxMineX - rayoeX) * inverse;
            var t2 = (boxMaxeX - rayoeX) * inverse;
            if (t1 > t2) {
                var temp = t1;
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
        }
        else {
            var inverse1 = 1 / raydeY;
            var t3 = (boxMineY - rayoeY) * inverse1;
            var t4 = (boxMaxeY - rayoeY) * inverse1;
            if (t3 > t4) {
                var temp1 = t3;
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
        }
        else {
            var inverse2 = 1 / raydeZ;
            var t5 = (boxMineZ - rayoeZ) * inverse2;
            var t6 = (boxMaxeZ - rayoeZ) * inverse2;
            if (t5 > t6) {
                var temp2 = t5;
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
     * 空间中射线和包围盒是否相交
     * @param	ray 射线
     * @param	box	包围盒
     * @param	out 相交点
     */
    static intersectsRayAndBoxRP(ray, box, out) {
        var distance = CollisionUtils.intersectsRayAndBoxRD(ray, box);
        if (distance === -1) {
            Vector3._ZERO.cloneTo(out);
            return distance;
        }
        Vector3.scale(ray.direction, distance, CollisionUtils._tempV30);
        Vector3.add(ray.origin, CollisionUtils._tempV30, CollisionUtils._tempV31);
        CollisionUtils._tempV31.cloneTo(out);
        return distance;
    }
    /**
     * 空间中射线和包围球是否相交
     * @param	ray    射线
     * @param	sphere 包围球
     * @return	相交距离,-1表示不相交
     */
    static intersectsRayAndSphereRD(ray, sphere) {
        var sphereR = sphere.radius;
        Vector3.subtract(ray.origin, sphere.center, CollisionUtils._tempV30);
        var b = Vector3.dot(CollisionUtils._tempV30, ray.direction);
        var c = Vector3.dot(CollisionUtils._tempV30, CollisionUtils._tempV30) - (sphereR * sphereR);
        if (c > 0 && b > 0) {
            return -1;
        }
        var discriminant = b * b - c;
        if (discriminant < 0) {
            return -1;
        }
        var distance = -b - Math.sqrt(discriminant);
        if (distance < 0)
            distance = 0;
        return distance;
    }
    /**
     * 空间中射线和包围球是否相交
     * @param	ray    射线
     * @param	sphere 包围球
     * @param	out    相交点
     * @return  相交距离,-1表示不相交
     */
    static intersectsRayAndSphereRP(ray, sphere, out) {
        var distance = CollisionUtils.intersectsRayAndSphereRD(ray, sphere);
        if (distance === -1) {
            Vector3._ZERO.cloneTo(out);
            return distance;
        }
        Vector3.scale(ray.direction, distance, CollisionUtils._tempV30);
        Vector3.add(ray.origin, CollisionUtils._tempV30, CollisionUtils._tempV31);
        CollisionUtils._tempV31.cloneTo(out);
        return distance;
    }
    /**
     * 空间中包围球和三角面是否相交
     * @param	sphere 包围球
     * @param	vertex1 三角面顶点1
     * @param	vertex2 三角面顶点2
     * @param	vertex3 三角面顶点3
     * @return  返回是否相交
     */
    static intersectsSphereAndTriangle(sphere, vertex1, vertex2, vertex3) {
        var sphereC = sphere.center;
        var sphereR = sphere.radius;
        CollisionUtils.closestPointPointTriangle(sphereC, vertex1, vertex2, vertex3, CollisionUtils._tempV30);
        Vector3.subtract(CollisionUtils._tempV30, sphereC, CollisionUtils._tempV31);
        var dot = Vector3.dot(CollisionUtils._tempV31, CollisionUtils._tempV31);
        return dot <= sphereR * sphereR;
    }
    /**
     * 空间中点和平面是否相交
     * @param	plane  平面
     * @param	point  点
     * @return  碰撞状态
     */
    static intersectsPlaneAndPoint(plane, point) {
        var distance = Vector3.dot(plane.normal, point) + plane.distance;
        if (distance > 0)
            return Plane.PlaneIntersectionType_Front;
        if (distance < 0)
            return Plane.PlaneIntersectionType_Back;
        return Plane.PlaneIntersectionType_Intersecting;
    }
    /**
     * 空间中平面和平面是否相交
     * @param	plane1 平面1
     * @param	plane2 平面2
     * @return  是否相交
     */
    static intersectsPlaneAndPlane(plane1, plane2) {
        Vector3.cross(plane1.normal, plane2.normal, CollisionUtils._tempV30);
        var denominator = Vector3.dot(CollisionUtils._tempV30, CollisionUtils._tempV30);
        if (MathUtils3D.isZero(denominator))
            return false;
        return true;
    }
    /**
     * 空间中平面和平面是否相交
     * @param	plane1 平面1
     * @param	plane2 平面2
     * @param	line   相交线
     * @return  是否相交
     */
    static intersectsPlaneAndPlaneRL(plane1, plane2, line) {
        var plane1nor = plane1.normal;
        var plane2nor = plane2.normal;
        Vector3.cross(plane1nor, plane2nor, CollisionUtils._tempV34);
        var denominator = Vector3.dot(CollisionUtils._tempV34, CollisionUtils._tempV34);
        if (MathUtils3D.isZero(denominator))
            return false;
        Vector3.scale(plane2nor, plane1.distance, CollisionUtils._tempV30);
        Vector3.scale(plane1nor, plane2.distance, CollisionUtils._tempV31);
        Vector3.subtract(CollisionUtils._tempV30, CollisionUtils._tempV31, CollisionUtils._tempV32);
        Vector3.cross(CollisionUtils._tempV32, CollisionUtils._tempV34, CollisionUtils._tempV33);
        Vector3.normalize(CollisionUtils._tempV34, CollisionUtils._tempV34);
        line = new Ray(CollisionUtils._tempV33, CollisionUtils._tempV34);
        return true;
    }
    /**
     * 空间中平面和包围盒是否相交
     * @param	plane 平面
     * @param   box  包围盒
     * @return  碰撞状态
     */
    static intersectsPlaneAndBox(plane, box) {
        var planeD = plane.distance;
        var planeNor = plane.normal;
        var planeNoreX = planeNor.x;
        var planeNoreY = planeNor.y;
        var planeNoreZ = planeNor.z;
        var boxMine = box.min;
        var boxMineX = boxMine.x;
        var boxMineY = boxMine.y;
        var boxMineZ = boxMine.z;
        var boxMaxe = box.max;
        var boxMaxeX = boxMaxe.x;
        var boxMaxeY = boxMaxe.y;
        var boxMaxeZ = boxMaxe.z;
        CollisionUtils._tempV30.x = (planeNoreX > 0) ? boxMineX : boxMaxeX;
        CollisionUtils._tempV30.y = (planeNoreY > 0) ? boxMineY : boxMaxeY;
        CollisionUtils._tempV30.z = (planeNoreZ > 0) ? boxMineZ : boxMaxeZ;
        CollisionUtils._tempV31.x = (planeNoreX > 0) ? boxMaxeX : boxMineX;
        CollisionUtils._tempV31.y = (planeNoreY > 0) ? boxMaxeY : boxMineY;
        CollisionUtils._tempV31.z = (planeNoreZ > 0) ? boxMaxeZ : boxMineZ;
        var distance = Vector3.dot(planeNor, CollisionUtils._tempV30);
        if (distance + planeD > 0)
            return Plane.PlaneIntersectionType_Front;
        distance = Vector3.dot(planeNor, CollisionUtils._tempV31);
        if (distance + planeD < 0)
            return Plane.PlaneIntersectionType_Back;
        return Plane.PlaneIntersectionType_Intersecting;
    }
    /**
     * 空间中平面和包围球是否相交
     * @param	plane 平面
     * @param   sphere 包围球
     * @return  碰撞状态
     */
    static intersectsPlaneAndSphere(plane, sphere) {
        var sphereR = sphere.radius;
        var distance = Vector3.dot(plane.normal, sphere.center) + plane.distance;
        if (distance > sphereR)
            return Plane.PlaneIntersectionType_Front;
        if (distance < -sphereR)
            return Plane.PlaneIntersectionType_Back;
        return Plane.PlaneIntersectionType_Intersecting;
    }
    /**
     * 空间中包围盒和包围盒是否相交
     * @param	box1 包围盒1
     * @param   box2 包围盒2
     * @return  是否相交
     */
    static intersectsBoxAndBox(box1, box2) {
        var box1Mine = box1.min;
        var box1Maxe = box1.max;
        var box2Mine = box2.min;
        var box2Maxe = box2.max;
        if (box1Mine.x > box2Maxe.x || box2Mine.x > box1Maxe.x)
            return false;
        if (box1Mine.y > box2Maxe.y || box2Mine.y > box1Maxe.y)
            return false;
        if (box1Mine.z > box2Maxe.z || box2Mine.z > box1Maxe.z)
            return false;
        return true;
    }
    /**
     * 空间中包围盒和包围球是否相交
     * @param	box 包围盒
     * @param   sphere 包围球
     * @return  是否相交
     */
    static intersectsBoxAndSphere(box, sphere) {
        var sphereC = sphere.center;
        var sphereR = sphere.radius;
        Vector3.Clamp(sphereC, box.min, box.max, CollisionUtils._tempV30);
        var distance = Vector3.distanceSquared(sphereC, CollisionUtils._tempV30);
        return distance <= sphereR * sphereR;
    }
    /**
     * 空间中包围球和包围球是否相交
     * @param	sphere1 包围球1
     * @param   sphere2 包围球2
     * @return  是否相交
     */
    static intersectsSphereAndSphere(sphere1, sphere2) {
        var radiisum = sphere1.radius + sphere2.radius;
        return Vector3.distanceSquared(sphere1.center, sphere2.center) <= radiisum * radiisum;
    }
    /**
     * 空间中包围盒是否包含另一个点
     * @param	box 包围盒
     * @param   point 点
     * @return  位置关系:0 不想交,1 包含, 2 相交
     */
    static boxContainsPoint(box, point) {
        var boxMine = box.min;
        var boxMaxe = box.max;
        if (boxMine.x <= point.x && boxMaxe.x >= point.x && boxMine.y <= point.y && boxMaxe.y >= point.y && boxMine.z <= point.z && boxMaxe.z >= point.z)
            return ContainmentType.Contains;
        return ContainmentType.Disjoint;
    }
    /**
     * 空间中包围盒是否包含另一个包围盒
     * @param	box1 包围盒1
     * @param   box2 包围盒2
     * @return  位置关系:0 不想交,1 包含, 2 相交
     */
    static boxContainsBox(box1, box2) {
        var box1Mine = box1.min;
        var box1MineX = box1Mine.x;
        var box1MineY = box1Mine.y;
        var box1MineZ = box1Mine.z;
        var box1Maxe = box1.max;
        var box1MaxeX = box1Maxe.x;
        var box1MaxeY = box1Maxe.y;
        var box1MaxeZ = box1Maxe.z;
        var box2Mine = box2.min;
        var box2MineX = box2Mine.x;
        var box2MineY = box2Mine.y;
        var box2MineZ = box2Mine.z;
        var box2Maxe = box2.max;
        var box2MaxeX = box2Maxe.x;
        var box2MaxeY = box2Maxe.y;
        var box2MaxeZ = box2Maxe.z;
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
     * 空间中包围盒是否包含另一个包围球
     * @param	box 包围盒
     * @param   sphere 包围球
     * @return  位置关系:0 不想交,1 包含, 2 相交
     */
    static boxContainsSphere(box, sphere) {
        var boxMin = box.min;
        var boxMineX = boxMin.x;
        var boxMineY = boxMin.y;
        var boxMineZ = boxMin.z;
        var boxMax = box.max;
        var boxMaxeX = boxMax.x;
        var boxMaxeY = boxMax.y;
        var boxMaxeZ = boxMax.z;
        var sphereC = sphere.center;
        var sphereCeX = sphereC.x;
        var sphereCeY = sphereC.y;
        var sphereCeZ = sphereC.z;
        var sphereR = sphere.radius;
        Vector3.Clamp(sphereC, boxMin, boxMax, CollisionUtils._tempV30);
        var distance = Vector3.distanceSquared(sphereC, CollisionUtils._tempV30);
        if (distance > sphereR * sphereR)
            return ContainmentType.Disjoint;
        if ((((boxMineX + sphereR <= sphereCeX) && (sphereCeX <= boxMaxeX - sphereR)) && ((boxMaxeX - boxMineX > sphereR) &&
            (boxMineY + sphereR <= sphereCeY))) && (((sphereCeY <= boxMaxeY - sphereR) && (boxMaxeY - boxMineY > sphereR)) &&
            (((boxMineZ + sphereR <= sphereCeZ) && (sphereCeZ <= boxMaxeZ - sphereR)) && (boxMaxeZ - boxMineZ > sphereR))))
            return ContainmentType.Contains;
        return ContainmentType.Intersects;
    }
    /**
     * 空间中包围球是否包含另一个点
     * @param	sphere 包围球
     * @param   point 点
     * @return  位置关系:0 不想交,1 包含, 2 相交
     */
    static sphereContainsPoint(sphere, point) {
        if (Vector3.distanceSquared(point, sphere.center) <= sphere.radius * sphere.radius)
            return ContainmentType.Contains;
        return ContainmentType.Disjoint;
    }
    /**
     * 空间中包围球是否包含另一个三角面
     * @param	sphere
     * @param	vertex1 三角面顶点1
     * @param	vertex2 三角面顶点2
     * @param	vertex3 三角面顶点3
     * @return  返回空间位置关系
     */
    static sphereContainsTriangle(sphere, vertex1, vertex2, vertex3) {
        var test1 = CollisionUtils.sphereContainsPoint(sphere, vertex1);
        var test2 = CollisionUtils.sphereContainsPoint(sphere, vertex2);
        var test3 = CollisionUtils.sphereContainsPoint(sphere, vertex3);
        if (test1 == ContainmentType.Contains && test2 == ContainmentType.Contains && test3 == ContainmentType.Contains)
            return ContainmentType.Contains;
        if (CollisionUtils.intersectsSphereAndTriangle(sphere, vertex1, vertex2, vertex3))
            return ContainmentType.Intersects;
        return ContainmentType.Disjoint;
    }
    /**
     * 空间中包围球是否包含另一包围盒
     * @param	sphere 包围球
     * @param   box 包围盒
     * @return  位置关系:0 不想交,1 包含, 2 相交
     */
    static sphereContainsBox(sphere, box) {
        var sphereC = sphere.center;
        var sphereCeX = sphereC.x;
        var sphereCeY = sphereC.y;
        var sphereCeZ = sphereC.z;
        var sphereR = sphere.radius;
        var boxMin = box.min;
        var boxMineX = boxMin.x;
        var boxMineY = boxMin.y;
        var boxMineZ = boxMin.z;
        var boxMax = box.max;
        var boxMaxeX = boxMax.x;
        var boxMaxeY = boxMax.y;
        var boxMaxeZ = boxMax.z;
        var _tempV30e = CollisionUtils._tempV30;
        var _tempV30eX = _tempV30e.x;
        var _tempV30eY = _tempV30e.y;
        var _tempV30eZ = _tempV30e.z;
        if (!CollisionUtils.intersectsBoxAndSphere(box, sphere))
            return ContainmentType.Disjoint;
        var radiusSquared = sphereR * sphereR;
        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMaxeZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMaxeY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        _tempV30eX = sphereCeX - boxMaxeX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        _tempV30eX = sphereCeX - boxMineX;
        _tempV30eY = sphereCeY - boxMineY;
        _tempV30eZ = sphereCeZ - boxMineZ;
        if (Vector3.scalarLengthSquared(CollisionUtils._tempV30) > radiusSquared)
            return ContainmentType.Intersects;
        return ContainmentType.Contains;
    }
    /**
     * 空间中包围球是否包含另一包围球
     * @param	sphere1 包围球
     * @param   sphere2 包围球
     * @return  位置关系:0 不想交,1 包含, 2 相交
     */
    static sphereContainsSphere(sphere1, sphere2) {
        var sphere1R = sphere1.radius;
        var sphere2R = sphere2.radius;
        var distance = Vector3.distance(sphere1.center, sphere2.center);
        if (sphere1R + sphere2R < distance)
            return ContainmentType.Disjoint;
        if (sphere1R - sphere2R < distance)
            return ContainmentType.Intersects;
        return ContainmentType.Contains;
    }
    /**
     * 空间中点与三角面的最近点
     * @param	point 点
     * @param	vertex1 三角面顶点1
     * @param	vertex2	三角面顶点2
     * @param	vertex3 三角面顶点3
     * @param	out 最近点
     */
    static closestPointPointTriangle(point, vertex1, vertex2, vertex3, out) {
        Vector3.subtract(vertex2, vertex1, CollisionUtils._tempV30);
        Vector3.subtract(vertex3, vertex1, CollisionUtils._tempV31);
        Vector3.subtract(point, vertex1, CollisionUtils._tempV32);
        Vector3.subtract(point, vertex2, CollisionUtils._tempV33);
        Vector3.subtract(point, vertex3, CollisionUtils._tempV34);
        var d1 = Vector3.dot(CollisionUtils._tempV30, CollisionUtils._tempV32);
        var d2 = Vector3.dot(CollisionUtils._tempV31, CollisionUtils._tempV32);
        var d3 = Vector3.dot(CollisionUtils._tempV30, CollisionUtils._tempV33);
        var d4 = Vector3.dot(CollisionUtils._tempV31, CollisionUtils._tempV33);
        var d5 = Vector3.dot(CollisionUtils._tempV30, CollisionUtils._tempV34);
        var d6 = Vector3.dot(CollisionUtils._tempV31, CollisionUtils._tempV34);
        if (d1 <= 0 && d2 <= 0) {
            vertex1.cloneTo(out);
            return;
        }
        if (d3 >= 0 && d4 <= d3) {
            vertex2.cloneTo(out);
            return;
        }
        var vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
            var v = d1 / (d1 - d3);
            Vector3.scale(CollisionUtils._tempV30, v, out);
            Vector3.add(vertex1, out, out);
            return;
        }
        if (d6 >= 0 && d5 <= d6) {
            vertex3.cloneTo(out);
            return;
        }
        var vb = d5 * d2 - d1 * d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            var w = d2 / (d2 - d6);
            Vector3.scale(CollisionUtils._tempV31, w, out);
            Vector3.add(vertex1, out, out);
            return;
        }
        var va = d3 * d6 - d5 * d4;
        if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
            var w3 = (d4 - d3) / ((d4 - d3) + (d5 - d6));
            Vector3.subtract(vertex3, vertex2, out);
            Vector3.scale(out, w3, out);
            Vector3.add(vertex2, out, out);
            return;
        }
        var denom = 1 / (va + vb + vc);
        var v2 = vb * denom;
        var w2 = vc * denom;
        Vector3.scale(CollisionUtils._tempV30, v2, CollisionUtils._tempV35);
        Vector3.scale(CollisionUtils._tempV31, w2, CollisionUtils._tempV36);
        Vector3.add(CollisionUtils._tempV35, CollisionUtils._tempV36, out);
        Vector3.add(vertex1, out, out);
    }
    /**
     * 空间中平面与一点的最近点
     * @param	plane 平面
     * @param	point 点
     * @param	out 最近点
     */
    static closestPointPlanePoint(plane, point, out) {
        var planeN = plane.normal;
        var t = Vector3.dot(planeN, point) - plane.distance;
        Vector3.scale(planeN, t, CollisionUtils._tempV30);
        Vector3.subtract(point, CollisionUtils._tempV30, out);
    }
    /**
     * 空间中包围盒与一点的最近点
     * @param	box 包围盒
     * @param	point 点
     * @param	out 最近点
     */
    static closestPointBoxPoint(box, point, out) {
        Vector3.max(point, box.min, CollisionUtils._tempV30);
        Vector3.min(CollisionUtils._tempV30, box.max, out);
    }
    /**
     * 空间中包围球与一点的最近点
     * @param	sphere 包围球
     * @param	point 点
     * @param	out 最近点
     */
    static closestPointSpherePoint(sphere, point, out) {
        var sphereC = sphere.center;
        Vector3.subtract(point, sphereC, out);
        Vector3.normalize(out, out);
        Vector3.scale(out, sphere.radius, out);
        Vector3.add(out, sphereC, out);
    }
    /**
     * 空间中包围球与包围球的最近点
     * @param	sphere1 包围球1
     * @param	sphere2 包围球2
     * @param	out 最近点
     */
    static closestPointSphereSphere(sphere1, sphere2, out) {
        var sphere1C = sphere1.center;
        Vector3.subtract(sphere2.center, sphere1C, out);
        Vector3.normalize(out, out);
        Vector3.scale(out, sphere1.radius, out);
        Vector3.add(out, sphere1C, out);
    }
}
/** @private */
CollisionUtils._tempV30 = new Vector3();
/** @private */
CollisionUtils._tempV31 = new Vector3();
/** @private */
CollisionUtils._tempV32 = new Vector3();
/** @private */
CollisionUtils._tempV33 = new Vector3();
/** @private */
CollisionUtils._tempV34 = new Vector3();
/** @private */
CollisionUtils._tempV35 = new Vector3();
/** @private */
CollisionUtils._tempV36 = new Vector3();
