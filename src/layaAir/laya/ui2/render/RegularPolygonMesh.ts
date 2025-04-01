import { Color } from "../../maths/Color";
import { MathUtils3D } from "../../maths/MathUtils3D";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export class RegularPolygonMesh implements IMeshFactory {
    sides: number = 6;
    distances: number[] = [];
    rotation: number = 0;
    lineWidth: number = 0;
    lineColor: Color = null;
    centerColor: Color = null;
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
        vb.addVert(centerX, centerY, 0, this.centerColor || color);
        for (let i = 0; i < this.sides; i++) {
            let r = radius;
            if (this.distances != null)
                r *= this.distances[i] ?? 1;
            let xv = centerX + Math.cos(angle) * (r - lineWidth);
            let yv = centerY + Math.sin(angle) * (r - lineWidth);
            vb.addVert(xv, yv, 0, color);
            if (lineWidth > 0) {
                vb.addVert(xv, yv, 0, lineColor);
                vb.addVert(Math.cos(angle) * r + centerX, Math.sin(angle) * r + centerY, 0, lineColor);
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
                vb.addTriangle(0, i + 1, (i == this.sides - 1) ? 1 : i + 2);
        }
    }
}