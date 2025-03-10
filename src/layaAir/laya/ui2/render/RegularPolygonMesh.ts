import { MathUtils3D } from "../../maths/MathUtils3D";
import { VertexStream } from "../../utils/VertexStream";
import { IMeshFactory } from "./MeshFactory";

export class RegularPolygonMesh implements IMeshFactory {
    sides: number = 6;
    distances: number[] = [];
    rotation: number = 0;

    onPopulateMesh(vb: VertexStream) {
        const angleDelta = 2 * Math.PI / this.sides;
        let angle = this.rotation * MathUtils3D.Deg2Rad;
        const radius = Math.min(vb.contentRect.width / 2, vb.contentRect.height / 2);

        const centerX = radius + vb.contentRect.x;
        const centerY = radius + vb.contentRect.y;
        vb.addVert(centerX, centerY, 0);
        for (let i = 0; i < this.sides; i++) {
            let r = radius;
            if (this.distances != null)
                r *= this.distances[i] ?? 1;
            let xv = Math.cos(angle) * r;
            let yv = Math.sin(angle) * r;
            vb.addVert(xv + centerX, yv + centerY, 0);
            angle += angleDelta;
        }

        for (let i = 0; i < this.sides; i++)
            vb.addTriangle(0, i + 1, (i == this.sides - 1) ? 1 : i + 2);
    }
}