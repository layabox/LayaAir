import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { Filter } from "./Filter";

//积分结果缓存
var _definiteIntegralMap:{[key:number]:number}={};
/**
 * 模糊滤镜
 */
export class BlurFilter extends Filter {
    /**@internal */
    shaderData = new TextureSV();
    /**模糊滤镜的强度(值越大，越不清晰 */
    private _strength: number;

    private _shaderV1=new Vector4();


    /**
     * 模糊滤镜
     * @param	strength	模糊滤镜的强度值
     */
    constructor(strength = 4) {
        super();
        this.strength = strength;
        //this._glRender = new BlurFilterGLRender();
    }

    get strength(){
        return this._strength;
    }

    set strength(v: number) {
        this._strength = v;
        var sigma = this.strength / 3.0;//3σ以外影响很小。即当σ=1的时候，半径为3;
        var sigma2 = sigma * sigma;
        let v1 = this._shaderV1 = new Vector4(this.strength, sigma2,
            2.0 * sigma2,
            1.0 / (2.0 * Math.PI * sigma2))

        //由于目前shader中写死了blur宽度是9，相当于希望3σ是4，可是实际使用的时候经常会strength超过4，
        //这时候blur范围内的积分<1会导致变暗变透明，所以需要计算实际积分值进行放大
        //使用公式计算误差较大，直接累加把
        if (this.strength > 4) {
            let s = 0;
            let key = Math.floor(this.strength * 10);
            if (_definiteIntegralMap[key] != undefined) {
                s = _definiteIntegralMap[key];
            }else{
                for (let y = -4; y <= 4; ++y) {
                    for (let x = -4; x <= 4; ++x) {
                        s += v1.w * Math.exp(-(x * x + y * y) / v1.z);
                    }
                }
                _definiteIntegralMap[key] = s;
            }
            v1.w /= s;
        }
    }

    render(srctexture: RenderTexture2D, width: number, height: number): void {
        let marginLeft=50;
        let marginTop=50;
        this.left=-marginLeft;
        this.top=-marginTop;
        let texwidth = width+2*marginLeft;
        let texheight = height+2*marginTop;
        this.width=texwidth;
        this.height=texheight;
        if(!this.texture || this.texture.destroyed || this.texture.width!=texwidth || this.texture.height!=texheight){
            if(this.texture)
                this.texture.destroy();
            this.texture = new RenderTexture2D(texwidth,texheight,RenderTargetFormat.R8G8B8A8);
        }

        let render2d = this._render2D.clone(this.texture);
        //render2d.out = this.texture;
        render2d.renderStart(true,new Color(0,0,0,0));
        //修改mesh
        let rectVB = this._rectMeshVB;
        let stridef32 = this._rectMesh.vertexDeclarition.vertexStride/4;
        rectVB[0]=marginLeft; rectVB[1]=marginTop;  //v0.xy
        rectVB[stridef32]=marginLeft+width;  rectVB[stridef32+1] = marginTop; //v1.xy
        rectVB[stridef32*2]=marginLeft+width;     rectVB[stridef32*2+1]=marginTop+height; //v2.xy
        rectVB[stridef32*3]=marginTop; rectVB[stridef32*3+1]=marginTop+height;   //v3.xy
        //shaderdata
        let shadersv = this.shaderData;
        shadersv.shaderData.addDefine(ShaderDefines2D.FILTERBLUR);
        shadersv.size = new Vector2(texwidth,texheight);
        shadersv.textureHost = srctexture;
        shadersv.blurInfo = new Vector2(texwidth,texheight);

        shadersv.strength_sig2_2sig2_gauss1 = this._shaderV1;
        render2d.draw(
            this._rectMesh,
            0,4*this._rectMesh.vertexDeclarition.vertexStride,
            0,12,
            shadersv,null);
        render2d.renderEnd();
    }
}

