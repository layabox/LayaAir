import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { ColorUtils } from "../utils/ColorUtils";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { Filter } from "./Filter";

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
    private textureExtend:RenderTexture2D;    //扩展边界用
    private shaderDataCopy1:TextureSV;

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
        this.shaderDataCopy1 = new TextureSV();
    }

    private _fillQuad(x:number, y:number, w:number, h:number,uvrect=[0,0,1,1]){
        let rectVB = this._rectMeshVB;
        let stridef32 = this._rectMesh.vertexDeclarition.vertexStride/4;
        rectVB[0          ]= x;   rectVB[1            ]= y;   rectVB[2          ]= uvrect[0];   rectVB[3            ]= uvrect[1]; 
        rectVB[stridef32  ]= x+w; rectVB[stridef32+1  ]= y;   rectVB[stridef32+2]= uvrect[2];   rectVB[stridef32+3  ]= uvrect[1];
        rectVB[stridef32*2]= x+w; rectVB[stridef32*2+1]= y+h; rectVB[stridef32*2+2]= uvrect[2];   rectVB[stridef32*2+3]= uvrect[3];
        rectVB[stridef32*3]= y;   rectVB[stridef32*3+1]= y+h; rectVB[stridef32*3+2]= uvrect[0];   rectVB[stridef32*3+3]= uvrect[3];
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

        
        //先把贴图画到扩展后的贴图上，这样可以避免处理边界问题。后面直接拿着扩展后的贴图处理就行了
        if(!this.textureExtend || this.textureExtend.destroyed || this.textureExtend.width!=outTexWidth || 
            this.textureExtend.height!=outTexHeight){
                if(this.textureExtend)
                this.textureExtend.destroy();
            this.textureExtend = new RenderTexture2D(outTexWidth,outTexHeight,RenderTargetFormat.R8G8B8A8);
        }

        let render2d = this._render2D.clone(this.textureExtend);
        //render2d.out = this.textureExtend;
        render2d.renderStart(true, new Color(0,0,0,0));
        this.shaderDataCopy1.size = new Vector2(outTexWidth,outTexHeight);
        this.shaderDataCopy1.textureHost = srctexture;
        this._fillQuad(marginLeft,marginTop,srctexture.width,srctexture.height);
        render2d.draw(
            this._rectMesh,
            0,4*this._rectMesh.vertexDeclarition.vertexStride,
            0,12,
            this.shaderDataCopy1);
        render2d.renderEnd();

        if(!this.texture || this.texture.destroyed || this.texture.width!=outTexWidth || this.texture.height!=outTexHeight){
            if(this.texture)
                this.texture.destroy();
            this.texture = new RenderTexture2D(outTexWidth,outTexHeight,RenderTargetFormat.R8G8B8A8);
        }

        render2d = render2d.clone(this.texture)
        //render2d.out = this.texture;
        render2d.renderStart(true,new Color(0,0,0,0));
        //修改mesh
        this._fillQuad(0, 0, outTexWidth,outTexHeight,[0,1,1,0]);    //翻转y

        //srctexture.wrapModeU = WrapMode.Clamp;
        //srctexture.wrapModeV = WrapMode.Clamp;

        //shaderdata
        let shadersv = this.shaderDataBlur;
        shadersv.shaderData.addDefine(ShaderDefines2D.FILTERGLOW);
        shadersv.size = new Vector2(outTexWidth,outTexHeight);
        shadersv.textureHost = this.textureExtend;
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
        let shadercpy = this.shaderDataCopy;
        shadercpy.size = new Vector2(outTexWidth,outTexHeight);
        shadercpy.textureHost = srctexture;
        this._fillQuad(marginLeft,marginTop,srctexture.width,srctexture.height);
        render2d.draw(
            this._rectMesh,
            0,4*this._rectMesh.vertexDeclarition.vertexStride,
            0,12,
            shadercpy);

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

