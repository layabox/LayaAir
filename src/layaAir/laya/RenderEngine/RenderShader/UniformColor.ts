import { Color } from "../../d3/math/Color";

/**
 * @internal
 */
export class UniformColor extends Color{
    /*@internal*/
    x: number;
    /*@internal*/
    y: number;
    /*@internal*/
    z: number;
    /*@internal*/
    w: number;

    set r(value:number){
        this._r = value;
        this.x = this.gammaToLinearSpace(value);
    }

    set g(value:number){
        this._g = value;
        this.y = this.gammaToLinearSpace(value);
    }

    set b(value:number){
        this._b = value;
        this.z = this.gammaToLinearSpace(value);
    }

    set a(value:number){
        this._a = value;
        this.w = value;
    }

    


    constructor(r: number, g: number, b: number, a: number) {
        super(r,g,b,a);
    }

    /**
	 * Gamma空间值转换到线性空间。
	 * @param value gamma空间值。
	 */
    gammaToLinearSpace(value: number): number {
        // http://www.opengl.org/registry/specs/EXT/framebuffer_sRGB.txt
        // http://www.opengl.org/registry/specs/EXT/texture_sRGB_decode.txt
        // {  cs / 12.92,                 cs <= 0.04045 }
        // {  ((cs + 0.055)/1.055)^2.4,   cs >  0.04045 }
        if (value <= 0.04045)
            return value / 12.92;
        else if (value < 1.0)
            return Math.pow((value + 0.055) / 1.055, 2.4);
        else
            return Math.pow(value, 2.4);
    }

}