import { Filter } from "./Filter";
import { BlurFilterGLRender } from "./BlurFilterGLRender";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { Vector2 } from "../maths/Vector2";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Vector4 } from "../maths/Vector4";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";

/**
 * 模糊滤镜
 */
export class BlurFilter extends Filter {

    shaderData = new TextureSV();
    /**模糊滤镜的强度(值越大，越不清晰 */
    strength: number;
    strength_sig2_2sig2_gauss1: number[] = [];//给shader用的。避免创建对象
    strength_sig2_native: Float32Array;//给native用的

    /**
     * 模糊滤镜
     * @param	strength	模糊滤镜的强度值
     */
    constructor(strength = 4) {
        super();
        this.strength = strength;
        //this._glRender = new BlurFilterGLRender();
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

        let render2d = this._render2D;
        render2d.out = this.texture;
        render2d.renderStart();
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
        var sigma = this.strength / 3.0;//3σ以外影响很小。即当σ=1的时候，半径为3;
        var sigma2 = sigma * sigma;
        shadersv.strength_sig2_2sig2_gauss1 = new Vector4(this.strength,sigma2,2.0 * sigma2,1.0 / (2.0 * Math.PI * sigma2))

        render2d.setVertexDecl(this._rectMesh.vertexDeclarition);
        render2d.draw(
            this._rectMesh.vbBuffer,
            this._rectMesh.ibBuffer,
            0,4*this._rectMesh.vertexDeclarition.vertexStride,
            0,12,
            shadersv);
        render2d.renderEnd();
    }

    getStrenth_sig2_2sig2_native(): Float32Array {
        if (!this.strength_sig2_native) {
            this.strength_sig2_native = new Float32Array(4);
        }
        //TODO James 不要每次进行计算
        var sigma = this.strength / 3.0;
        var sigma2 = sigma * sigma;
        this.strength_sig2_native[0] = this.strength;
        this.strength_sig2_native[1] = sigma2;
        this.strength_sig2_native[2] = 2.0 * sigma2;
        this.strength_sig2_native[3] = 1.0 / (2.0 * Math.PI * sigma2);
        return this.strength_sig2_native;
    }
}

