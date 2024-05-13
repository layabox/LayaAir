import { RenderSpriteData, Value2D } from "./Value2D";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector4 } from "../../../../maths/Vector4";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { ShaderDefines2D } from "../ShaderDefines2D";

export class TextureSV extends Value2D {
    private _blurInfo: Vector2;//TODO  shader中没有用
    private _u_blurInfo1: Vector4;
    private _u_blurInfo2: Vector4;
    private _u_TexRange: Vector4;
    private _colorMat: Matrix4x4;
    private _colorAlpha: Vector4;
    private _strength_sig2_2sig2_gauss1: Vector4;

    constructor() {
        super(RenderSpriteData.Texture2D);
        TextureSV.prototype.initialize.call(this);
    }

    protected initialize(): void {
        this._blurInfo = new Vector2();//TODO  shader中没有用
        this._u_blurInfo1 = new Vector4();
        this._u_blurInfo2 = new Vector4();
        this._u_TexRange = new Vector4();
        this._colorMat = new Matrix4x4();
        this._colorAlpha = new Vector4();
        this._strength_sig2_2sig2_gauss1 = new Vector4();
    
        this._defaultShader = Shader3D.find("Sprite2DTexture");
        this.blurInfo = this._blurInfo;
        this.u_blurInfo1 = this._u_blurInfo1;
        this.u_blurInfo2 = this._u_blurInfo2;
        this.u_TexRange = this._u_TexRange;
        this.colorMat = this._colorMat;
        this.colorAlpha = this._colorAlpha;
        this.strength_sig2_2sig2_gauss1 = this._strength_sig2_2sig2_gauss1;
    }

    reinit(){
        super.initialize();
        this.initialize();
    }

    public get blurInfo(): Vector2 {
        return this.shaderData.getVector2(ShaderDefines2D.UNIFORM_BLURINFO);
    }
    public set blurInfo(value: Vector2) {
        this.shaderData.setVector2(ShaderDefines2D.UNIFORM_BLURINFO, value);
    }

    public get u_blurInfo1(): Vector4 {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_BLURINFO1);
    }
    public set u_blurInfo1(value: Vector4) {
        this.shaderData.setVector(ShaderDefines2D.UNIFORM_BLURINFO1, value);
    }

    public get u_blurInfo2(): Vector4 {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_BLURINFO2);
    }
    public set u_blurInfo2(value: Vector4) {
        this.shaderData.setVector(ShaderDefines2D.UNIFORM_BLURINFO2, value);
    }

    public get u_TexRange(): Vector4 {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE)
    }
    public set u_TexRange(value: Vector4) {
        this.shaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, value);
    }

    public get colorMat(): Matrix4x4 {
        return this.shaderData.getMatrix4x4(ShaderDefines2D.UNIFORM_COLORMAT);
    }
    public set colorMat(value: Matrix4x4) {
        this.shaderData.setMatrix4x4(ShaderDefines2D.UNIFORM_COLORMAT, value);
    }

    public get colorAlpha(): Vector4 {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_COLORALPHA);
    }
    public set colorAlpha(value: Vector4) {
        this.shaderData.setVector(ShaderDefines2D.UNIFORM_COLORALPHA, value);
    }

    public get strength_sig2_2sig2_gauss1(): Vector4 {
        return this.shaderData.getVector(ShaderDefines2D.UNIFORM_STRENGTH_SIG2_2SIG2_GAUSS1);
    }
    public set strength_sig2_2sig2_gauss1(value: Vector4) {
        this.shaderData.setVector(ShaderDefines2D.UNIFORM_STRENGTH_SIG2_2SIG2_GAUSS1, value);
    }


    /**
     * @override
     */
    clear(): void {
        this.shaderData.getDefineData().clear();
        this.shaderData.destroy();
    }
}
