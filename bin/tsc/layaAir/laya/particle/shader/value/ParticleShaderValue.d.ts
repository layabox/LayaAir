import { Value2D } from "../../../webgl/shader/d2/value/Value2D";
/**
 *  @private
 */
export declare class ParticleShaderValue extends Value2D {
    private static pShader;
    u_CurrentTime: number;
    u_Duration: number;
    u_Gravity: Float32Array;
    u_EndVelocity: number;
    u_texture: any;
    constructor();
    upload(): void;
}
