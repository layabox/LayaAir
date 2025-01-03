import { Vector2 } from "../maths/Vector2";

/**
 * 2D线段
 * （可用于对象池）
 */
export class LightLine2D {
    a: Vector2; //端点a
    b: Vector2; //端点b
    n: Vector2; //法线
    useNormal: boolean = false;

    /**
     * @en Create 2D line
     * @param ax Point A x coordinate
     * @param ay Point A y coordinate
     * @param bx Point B x coordinate
     * @param by Point B y coordinate
     * @param useNormal Is create and use normal
     * @zh 创建2D线段
     * @param ax 端点A的x坐标
     * @param ay 端点A的y坐标
     * @param bx 端点B的x坐标
     * @param by 端点B的y坐标
     * @param useNormal 是否创建和使用法线
     */
    create(ax: number, ay: number, bx: number, by: number, useNormal: boolean = false) {
        this.a ? this.a.setValue(ax, ay) : this.a = new Vector2(ax, ay);
        this.b ? this.b.setValue(bx, by) : this.b = new Vector2(bx, by);
        if (useNormal) {
            let n = this.n;
            n ? n.setValue(by - ay, ax - bx)
                : n = this.n = new Vector2(by - ay, ax - bx);
            Vector2.normalize(n, n);
        }
        this.useNormal = useNormal;
        return this;
    }
}