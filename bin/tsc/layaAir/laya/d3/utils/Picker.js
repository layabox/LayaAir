import { Vector3 } from "../math/Vector3";
/**
 * <code>Picker</code> 类用于创建拾取。
 */
export class Picker {
    /**
     * 创建一个 <code>Picker</code> 实例。
     */
    constructor() {
    }
    /**
     * 计算鼠标生成的射线。
     * @param	point 鼠标位置。
     * @param	viewPort 视口。
     * @param	projectionMatrix 透视投影矩阵。
     * @param	viewMatrix 视图矩阵。
     * @param	world 世界偏移矩阵。
     * @return  out  输出射线。
     */
    static calculateCursorRay(point, viewPort, projectionMatrix, viewMatrix, world, out) {
        var x = point.x;
        var y = point.y;
        var nearSource = Picker._tempVector30;
        var nerSourceE = nearSource;
        nerSourceE.x = x;
        nerSourceE.y = y;
        nerSourceE.z = viewPort.minDepth;
        var farSource = Picker._tempVector31;
        var farSourceE = farSource;
        farSourceE.x = x;
        farSourceE.y = y;
        farSourceE.z = viewPort.maxDepth;
        var nearPoint = out.origin;
        var farPoint = Picker._tempVector32;
        viewPort.unprojectFromWVP(nearSource, projectionMatrix, viewMatrix, world, nearPoint);
        viewPort.unprojectFromWVP(farSource, projectionMatrix, viewMatrix, world, farPoint);
        var outDire = out.direction;
        outDire.x = farPoint.x - nearPoint.x;
        outDire.y = farPoint.y - nearPoint.y;
        outDire.z = farPoint.z - nearPoint.z;
        Vector3.normalize(out.direction, out.direction);
    }
    /**
     * 计算射线和三角形碰撞并返回碰撞距离。
     * @param	ray 射线。
     * @param	vertex1 顶点1。
     * @param	vertex2 顶点2。
     * @param	vertex3 顶点3。
     * @return   射线距离三角形的距离，返回Number.NaN则不相交。
     */
    static rayIntersectsTriangle(ray, vertex1, vertex2, vertex3) {
        var result;
        // Compute vectors along two edges of the triangle.
        var edge1 = Picker._tempVector30, edge2 = Picker._tempVector31;
        Vector3.subtract(vertex2, vertex1, edge1);
        Vector3.subtract(vertex3, vertex1, edge2);
        // Compute the determinant.
        var directionCrossEdge2 = Picker._tempVector32;
        Vector3.cross(ray.direction, edge2, directionCrossEdge2);
        var determinant;
        determinant = Vector3.dot(edge1, directionCrossEdge2);
        // If the ray is parallel to the triangle plane, there is no collision.
        if (determinant > -Number.MIN_VALUE && determinant < Number.MIN_VALUE) {
            result = Number.NaN;
            return result;
        }
        var inverseDeterminant = 1.0 / determinant;
        // Calculate the U parameter of the intersection point.
        var distanceVector = Picker._tempVector33;
        Vector3.subtract(ray.origin, vertex1, distanceVector);
        var triangleU;
        triangleU = Vector3.dot(distanceVector, directionCrossEdge2);
        triangleU *= inverseDeterminant;
        // Make sure it is inside the triangle.
        if (triangleU < 0 || triangleU > 1) {
            result = Number.NaN;
            return result;
        }
        // Calculate the V parameter of the intersection point.
        var distanceCrossEdge1 = Picker._tempVector34;
        Vector3.cross(distanceVector, edge1, distanceCrossEdge1);
        var triangleV;
        triangleV = Vector3.dot(ray.direction, distanceCrossEdge1);
        triangleV *= inverseDeterminant;
        // Make sure it is inside the triangle.
        if (triangleV < 0 || triangleU + triangleV > 1) {
            result = Number.NaN;
            return result;
        }
        // Compute the distance along the ray to the triangle.
        var rayDistance;
        rayDistance = Vector3.dot(edge2, distanceCrossEdge1);
        rayDistance *= inverseDeterminant;
        // Is the triangle behind the ray origin?
        if (rayDistance < 0) {
            result = Number.NaN;
            return result;
        }
        result = rayDistance;
        return result;
    }
}
Picker._tempVector30 = new Vector3();
Picker._tempVector31 = new Vector3();
Picker._tempVector32 = new Vector3();
Picker._tempVector33 = new Vector3();
Picker._tempVector34 = new Vector3();
