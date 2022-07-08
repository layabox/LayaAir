import { Color } from "../../d3/math/Color";

/**
 * @internal
 */
export class UniformColor extends Color {
    /*@internal*/
    x: number;
    /*@internal*/
    y: number;
    /*@internal*/
    z: number;
    /*@internal*/
    w: number;

    set r(value: number) {
        this._r = value;
        this.x = Color.gammaToLinearSpace(value);
    }

    get r() {
        return this._r;
    }

    set g(value: number) {
        this._g = value;
        this.y = Color.gammaToLinearSpace(value);
    }

    get g() {
        return this._g;
    }

    set b(value: number) {
        this._b = value;
        this.z = Color.gammaToLinearSpace(value);
    }

    get b() {
        return this._b;
    }

    set a(value: number) {
        this._a = value;
        this.w = value;
    }

    get a() {
        return this._a;
    }

    constructor(r: number = 1, g: number = 1, b: number = 1, a: number = 1) {
        super(r, g, b, a);
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: UniformColor = new UniformColor();
        this.cloneTo(dest);
        return dest;
    }
}