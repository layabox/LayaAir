import { Vector2 } from "../../../maths/Vector2";

/**
 * 2D线段
 */
export class LightLine2D {
    a: Vector2; //端点a
    b: Vector2; //端点b
    n: Vector2; //法线
    useNormal: boolean = true;

    constructor(ax: number, ay: number, bx: number, by: number, useNormal: boolean = false) {
        this.a = new Vector2(ax, ay);
        this.b = new Vector2(bx, by);
        if (useNormal) {
            this.n = new Vector2(by - ay, ax - bx);
            Vector2.normalize(this.n, this.n);
        }
        this.useNormal = useNormal;
    }
}