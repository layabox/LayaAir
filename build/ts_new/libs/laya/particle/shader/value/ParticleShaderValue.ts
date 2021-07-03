import { ParticleShader } from "../ParticleShader"
import { Value2D } from "../../../webgl/shader/d2/value/Value2D";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
import { ShaderValue } from "../../../webgl/shader/ShaderValue";


/**
 *  @internal 
 */
export class ParticleShaderValue extends Value2D {
    private static pShader: ParticleShader = null; //new ParticleShader();
    /*
    public var a_CornerTextureCoordinate:Array=[4, WebGLContext.FLOAT, false, 116, 0];
    public var a_Position:Array=[3, WebGLContext.FLOAT, false, 116, 16];
    public var a_Velocity:Array=[3, WebGLContext.FLOAT, false, 116, 28];
    public var a_StartColor:Array=[4, WebGLContext.FLOAT, false, 116, 40];
    public var a_EndColor:Array=[4, WebGLContext.FLOAT, false, 116, 56];
    public var a_SizeRotation:Array=[3, WebGLContext.FLOAT, false, 116, 72];
    public var a_Radius:Array = [2, WebGLContext.FLOAT, false, 116, 84];
    public var a_Radian:Array=[4, WebGLContext.FLOAT, false, 116, 92];
    public var a_AgeAddScale:Array=[1, WebGLContext.FLOAT, false, 116, 108];
    public var a_Time:Array=[1, WebGLContext.FLOAT, false, 116, 112];
    */
    u_CurrentTime: number;
    u_Duration: number;
    u_Gravity: Float32Array; //v3
    u_EndVelocity: number;
    u_texture: any;

    constructor() {
        super(0, 0);
        if (!ParticleShaderValue.pShader) {
            ParticleShaderValue.pShader = new ParticleShader();
        }
        /* �ŵ� ParticleShader ����
        this._attribLocation = ['a_CornerTextureCoordinate', 0, 'a_Position', 1, 'a_Velocity', 2, 'a_StartColor', 3,
                                'a_EndColor',4,'a_SizeRotation',5,'a_Radius',6,'a_Radian',7,'a_AgeAddScale',8,'a_Time',9];
        */
    }
    /**
     * @override
     */
    upload(): void {
        var size: any[] = this.size;
        size[0] = RenderState2D.width;
        size[1] = RenderState2D.height;
        this.alpha = this.ALPHA * RenderState2D.worldAlpha;
        ParticleShaderValue.pShader.upload((<ShaderValue>this));
    }
}

