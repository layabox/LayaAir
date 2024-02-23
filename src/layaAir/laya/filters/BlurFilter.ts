import { Filter } from "./Filter";
import { BlurFilterGLRender } from "./BlurFilterGLRender";
import { RenderTexture2D } from "../resource/RenderTexture2D";

/**
 * 模糊滤镜
 */
export class BlurFilter extends Filter {

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
        this._glRender = new BlurFilterGLRender();
    }

    render(texture: RenderTexture2D, width: number, height: number): void {
        let marginLeft=50;
        let marginTop=50;
        this.left=-marginLeft;
        this.top=-marginTop;
        if(!this.texture){
            this.texture = new RenderTexture2D(width+2*marginLeft,height+2*marginTop);
        }

        let render2d = this._render2D;
        render2d.out = this.texture;
        render2d.renderStart();
        render2d.drawRect(texture,width*2*marginLeft,height+2*marginTop,null);//TODO
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

