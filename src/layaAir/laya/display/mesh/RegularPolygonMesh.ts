import { Color } from "../../maths/Color";
import { MathUtils3D } from "../../maths/MathUtils3D";
import { ClassUtils } from "../../utils/ClassUtils";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export class RegularPolygonMesh implements IMeshFactory {
    /**
     * @en The number of sides of the regular polygon.
     * @zh 正多边形的边数。
     */
    sides: number = 6;

    /**
     * @en An array of distances from the center to each vertex, expressed as a fraction of the radius. If null, all vertices are at the radius distance.
     * @zh 从中心到每个顶点的距离数组，以半径的分数表示。如果为null，则所有顶点都在半径距离处。
     */
    distances: number[] = [];

    /**
     * @en The rotation angle of the polygon in degrees.
     * @zh 多边形的旋转角度，单位为度。
     */
    rotation: number = 0;

    /**
     * @en The width of the outline line.
     * @zh 轮廓线的宽度。
     */
    lineWidth: number = 0;

    /**
     * @en The color of the outline line.
     * @zh 轮廓线的颜色。
     */
    lineColor: Color = null;

    /**
     * @en The color of the center vertex.
     * @zh 中心顶点的颜色。
     */
    centerColor: Color = null;

    /**
     * @en The fill color of the polygon.
     * @zh 多边形的填充颜色。
     */
    fillColor: Color = null;

    onPopulateMesh(vb: VertexStream) {
        let color = this.fillColor || vb.color;
        let lineColor = this.lineColor || vb.color;

        const angleDelta = 2 * Math.PI / this.sides;
        let angle = this.rotation * MathUtils3D.Deg2Rad;
        const radius = Math.min(vb.contentRect.width / 2, vb.contentRect.height / 2);
        const lineWidth = this.lineWidth;

        const centerX = radius + vb.contentRect.x;
        const centerY = radius + vb.contentRect.y;
        vb.addVert(centerX, centerY, this.centerColor || color);
        for (let i = 0; i < this.sides; i++) {
            let r = radius;
            if (this.distances != null)
                r *= this.distances[i] ?? 1;
            let xv = centerX + Math.cos(angle) * (r - lineWidth);
            let yv = centerY + Math.sin(angle) * (r - lineWidth);
            vb.addVert(xv, yv, color);
            if (lineWidth > 0) {
                vb.addVert(xv, yv, lineColor);
                vb.addVert(Math.cos(angle) * r + centerX, Math.sin(angle) * r + centerY, lineColor);
            }
            angle += angleDelta;
        }

        if (lineWidth > 0) {
            let tmp = this.sides * 3;
            for (let i = 0; i < tmp; i += 3) {
                if (i != tmp - 3) {
                    vb.addTriangle(0, i + 1, i + 4);
                    vb.addTriangle(i + 5, i + 2, i + 3);
                    vb.addTriangle(i + 3, i + 6, i + 5);
                }
                else {
                    vb.addTriangle(0, i + 1, 1);
                    vb.addTriangle(2, i + 2, i + 3);
                    vb.addTriangle(i + 3, 3, 2);
                }
            }
        }
        else {
            for (let i = 0; i < this.sides; i++)
                vb.addTriangle(0, i + 1, (i === this.sides - 1) ? 1 : i + 2);
        }
    }
}

ClassUtils.regClass("RegularPolygonMesh", RegularPolygonMesh);