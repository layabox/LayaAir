import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { ColorUtils } from "../utils/ColorUtils";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { Filter } from "./Filter";
import { GlowFilterGLRender } from "./GlowFilterGLRender";

/**
 *  发光滤镜(也可以当成阴影滤使用）
 */
export class GlowFilter extends Filter {

    /**数据的存储，顺序R,G,B,A,blurWidth,offX,offY;*/
    private _elements = new Float32Array(9);
    /**@internal */
    _sv_blurInfo1: number[] = new Array(4);	//给shader用
    /**@internal */
    _sv_blurInfo2 = [0, 0, 1, 0];
    /**滤镜的颜色*/
    private _color: ColorUtils;
    /**@internal */
    _color_native: Float32Array;
    /**@internal */
    _blurInof1_native: Float32Array;
    /**@internal */
    _blurInof2_native: Float32Array;

    private shaderDataBlur:TextureSV;
    private shaderDataCopy:TextureSV;

    /**
     * 创建发光滤镜
     * @param	color	滤镜的颜色
     * @param	blur	边缘模糊的大小
     * @param	offX	X轴方向的偏移
     * @param	offY	Y轴方向的偏移
     */
    constructor(color: string, blur = 4, offX = 6, offY = 6) {
        super();
        this._color = new ColorUtils(color || "#000");
        //限制最大效果为20
        this.blur = Math.min(blur, 20);
        this.offX = offX;
        this.offY = offY;
        this._sv_blurInfo1[0] = this._sv_blurInfo1[1] = this.blur; this._sv_blurInfo1[2] = offX; this._sv_blurInfo1[3] = -offY;
        //this._glRender = new GlowFilterGLRender();
        this.shaderDataBlur = new TextureSV();
        this.shaderDataCopy = new TextureSV();
    }

    private _fillQuad(x:number, y:number, w:number, h:number){
        let rectVB = this._rectMeshVB;
        let stridef32 = this._rectMesh.vertexDeclarition.vertexStride/4;
        rectVB[0          ]= x;   rectVB[1            ]= y; 
        rectVB[stridef32  ]= x+w; rectVB[stridef32+1  ]= y;
        rectVB[stridef32*2]= x+w; rectVB[stridef32*2+1]= y+h;
        rectVB[stridef32*3]= y;   rectVB[stridef32*3+1]= y+h;
    }

    render(srctexture: RenderTexture2D, width: number, height: number): void {
        let marginLeft=50;
        let marginTop=50;
        this.left=-marginLeft;
        this.top=-marginTop;
        let outTexWidth = width+2*marginLeft;
        let outTexHeight = height+2*marginTop;
        this.width=outTexWidth;
        this.height=outTexHeight;
        if(!this.texture || this.texture.destroyed || this.texture.width!=outTexWidth || this.texture.height!=outTexHeight){
            if(this.texture)
                this.texture.destroy();
            this.texture = new RenderTexture2D(outTexWidth,outTexHeight,RenderTargetFormat.R8G8B8A8);
        }

        let render2d = this._render2D;
        render2d.out = this.texture;
        render2d.renderStart();
        //修改mesh
        this._fillQuad(marginLeft, marginTop, width,height);    //注意这个是原始大小，实际要扩展margin

        //shaderdata
        let shadersv = this.shaderDataBlur;
        shadersv.shaderData.addDefine(ShaderDefines2D.FILTERGLOW);
        shadersv.size = new Vector2(outTexWidth,outTexHeight);
        shadersv.textureHost = srctexture;
        shadersv.blurInfo = new Vector2(outTexWidth,outTexHeight);
        shadersv.u_blurInfo1 = new Vector4(this._sv_blurInfo1[0], this._sv_blurInfo1[1], this._sv_blurInfo1[2], this._sv_blurInfo1[3])
        shadersv.u_blurInfo2 = new Vector4(srctexture.width,srctexture.height,this._sv_blurInfo2[2],this._sv_blurInfo2[3]);
        let color = this.getColor();
        shadersv.color = new Vector4(color[0],color[1],color[2],color[3]);
        //模糊的底
        render2d.draw(
            this._rectMesh,
            0,4*this._rectMesh.vertexDeclarition.vertexStride,
            0,12,
            shadersv);
        //覆盖一下原始图片
        shadersv = this.shaderDataCopy;
        shadersv.size = new Vector2(outTexWidth,outTexHeight);
        shadersv.textureHost = srctexture;
        this._fillQuad(marginLeft,marginTop,srctexture.width,srctexture.height);
        render2d.draw(
            this._rectMesh,
            0,4*this._rectMesh.vertexDeclarition.vertexStride,
            0,12,
            shadersv);

        render2d.renderEnd();        
    }

    /**@internal */
    get typeDefine(): ShaderDefine {
        return ShaderDefines2D.FILTERGLOW;
    }

    /**@private */
    get offY(): number {
        return this._elements[6];
    }

    /**@private */
    set offY(value: number) {
        this._elements[6] = value;
        this._sv_blurInfo1[3] = -value;
    }

    /**@private */
    get offX(): number {
        return this._elements[5];
    }

    /**@private */
    set offX(value: number) {
        this._elements[5] = value;
        this._sv_blurInfo1[2] = value;
    }

    /**@private */
    get color(): string {
        return this._color.strColor;
    }

    /**@private */
    set color(value: string) {
        this._color = new ColorUtils(value);
    }

    /**@private */
    getColor(): any[] {
        return this._color.arrColor;
    }

    /**@private */
    get blur(): number {
        return this._elements[4];
    }

    /**@private */
    set blur(value: number) {
        this._elements[4] = value;
        this._sv_blurInfo1[0] = this._sv_blurInfo1[1] = value;
    }

    getColorNative(): Float32Array {
        if (!this._color_native) {
            this._color_native = new Float32Array(4);
        }
        //TODO James 不用每次赋值
        var color: any[] = this.getColor();
        this._color_native[0] = color[0];
        this._color_native[1] = color[1];
        this._color_native[2] = color[2];
        this._color_native[3] = color[3];
        return this._color_native;
    }
    getBlurInfo1Native(): Float32Array {
        if (!this._blurInof1_native) {
            this._blurInof1_native = new Float32Array(4);
        }
        //TODO James 不用每次赋值
        this._blurInof1_native[0] = this._blurInof1_native[1] = this.blur;
        this._blurInof1_native[2] = this.offX;
        this._blurInof1_native[3] = this.offY;
        return this._blurInof1_native;
    }
    getBlurInfo2Native(): Float32Array {
        if (!this._blurInof2_native) {
            this._blurInof2_native = new Float32Array(4);
        }
        //TODO James 不用每次赋值
        this._blurInof2_native[2] = 1;
        return this._blurInof2_native;
    }
}

