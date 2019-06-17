import { ParticleShader } from "../ParticleShader";
import { Value2D } from "../../../webgl/shader/d2/value/Value2D";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
/**
 *  @private
 */
export class ParticleShaderValue extends Value2D {
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
    /*override*/ upload() {
        var size = this.size;
        size[0] = RenderState2D.width;
        size[1] = RenderState2D.height;
        this.alpha = this.ALPHA * RenderState2D.worldAlpha;
        ParticleShaderValue.pShader.upload(this);
    }
}
ParticleShaderValue.pShader = null; //new ParticleShader();
