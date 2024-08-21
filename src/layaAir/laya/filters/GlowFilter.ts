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
 * @en Luminous filter (can also be used as shadow filter)
 * @zh 发光滤镜(也可以当成阴影滤使用）
 */
export class GlowFilter extends Filter {

    /**@internal */
    _sv_blurInfo1: number[] = new Array(4);	//x,blurWidth,offx,offy
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

    private shaderDataBlur: TextureSV;
    private shaderDataCopy: TextureSV;
    private textureExtend: RenderTexture2D;    //扩展边界用
    private shaderDataCopy1: TextureSV;
    private _flipY = false;

    /**
     * @en Creates an instance of a glow filter.
     * @param color The color of the glow filter. 
     * @param blur The size of blurred edges
     * @param offX The horizontal offset for the glow effect.
     * @param offY The vertical offset for the glow effect.
     * @zh 创建一个发光滤镜实例。
     * @param color 发光滤镜的颜色。
     * @param blur 边缘模糊的大小。
     * @param offX 发光效果的水平偏移。
     * @param offY 发光效果的垂直偏移。
     */
    constructor(color: string, blur = 4, offX = 6, offY = 6) {
        super();
        this._color = new ColorUtils(color || "#000");
        //限制最大效果为20
        this.blur = Math.min(blur, 20);
        this.offX = offX;
        this.offY = offY;
        this._sv_blurInfo1[1] = this.blur;
        this.shaderDataBlur = new TextureSV();
        this.shaderDataBlur.u_blurInfo1 = new Vector4();
        this.shaderDataBlur.u_blurInfo2 = new Vector4();
        this.shaderDataBlur.color = new Vector4();
        this.shaderDataBlur.size = new Vector2();
        this.shaderDataBlur.blurInfo = new Vector2();
        this.shaderDataCopy = new TextureSV();
        this.shaderDataCopy.size = new Vector2();
        this.shaderDataCopy1 = new TextureSV();
    }

    private _fillQuad(x: number, y: number, w: number, h: number, flipY = false) {
        let uvrect: number[];
        if (flipY) {
            uvrect = [0, 1, 1, 0];
        } else {
            uvrect = [0, 0, 1, 1];
        }
        let rectVB = this._rectMeshVB;
        let stridef32 = this._rectMesh.vertexDeclarition.vertexStride / 4;
        rectVB[0] = x; rectVB[1] = y; rectVB[2] = uvrect[0]; rectVB[3] = uvrect[1];
        rectVB[stridef32] = x + w; rectVB[stridef32 + 1] = y; rectVB[stridef32 + 2] = uvrect[2]; rectVB[stridef32 + 3] = uvrect[1];
        rectVB[stridef32 * 2] = x + w; rectVB[stridef32 * 2 + 1] = y + h; rectVB[stridef32 * 2 + 2] = uvrect[2]; rectVB[stridef32 * 2 + 3] = uvrect[3];
        rectVB[stridef32 * 3] = y; rectVB[stridef32 * 3 + 1] = y + h; rectVB[stridef32 * 3 + 2] = uvrect[0]; rectVB[stridef32 * 3 + 3] = uvrect[3];
    }

    override useFlipY(b: boolean) {
        super.useFlipY(b);
        this._flipY = b;
    }

    /**
     * @en Renders the glow effect based on the source texture.
     * @param srctexture The source RenderTexture2D to apply the glow effect on.
     * @param width The width of the rendering area.
     * @param height The height of the rendering area.
     * @zh 根据源纹理渲染发光效果。
     * @param srctexture 应用发光效果的源 RenderTexture2D。
     * @param width 渲染区域的宽度。
     * @param height 渲染区域的高度。
     */
    render(srctexture: RenderTexture2D, width: number, height: number): void {
        let marginLeft = 50;
        let marginTop = 50;
        this.left = -marginLeft;
        this.top = -marginTop;
        let outTexWidth = width + 2 * marginLeft;
        let outTexHeight = height + 2 * marginTop;
        this.width = outTexWidth;
        this.height = outTexHeight;

        //先把贴图画到扩展后的贴图上，这样可以避免处理边界问题。后面直接拿着扩展后的贴图处理就行了
        if (!this.textureExtend || this.textureExtend.destroyed || this.textureExtend.width != outTexWidth ||
            this.textureExtend.height != outTexHeight) {
            if (this.textureExtend)
                this.textureExtend.destroy();
            this.textureExtend = new RenderTexture2D(outTexWidth, outTexHeight, RenderTargetFormat.R8G8B8A8);
        }

        let render2d = this._render2D.clone(this.textureExtend);
        //render2d.out = this.textureExtend;
        render2d.renderStart(true, new Color(0, 0, 0, 0));
        this.shaderDataCopy1.size = new Vector2(outTexWidth, outTexHeight);
        this.shaderDataCopy1.textureHost = srctexture;
        this._fillQuad(marginLeft, marginTop, srctexture.width, srctexture.height, this._flipY);
        render2d.draw(
            this._rectMesh,
            0, 4 * this._rectMesh.vertexDeclarition.vertexStride,
            0, 12,
            this.shaderDataCopy1, null);
        render2d.renderEnd();

        //下面要画模糊的部分
        if (!this.texture || this.texture.destroyed || this.texture.width != outTexWidth || this.texture.height != outTexHeight) {
            if (this.texture)
                this.texture.destroy();
            this.texture = new RenderTexture2D(outTexWidth, outTexHeight, RenderTargetFormat.R8G8B8A8);
        }

        render2d = render2d.clone(this.texture)
        render2d.renderStart(true, new Color(0, 0, 0, 0));
        //翻转的解释：不管上面的this._flipY的值，这里都要翻转，this._flipY表示源rt是否要翻转，跟这里没有关系
        //这里是指是否要翻转 this.textureExtend，所以必须是true
        this._fillQuad(0, 0, outTexWidth, outTexHeight, true);    //翻转y

        //srctexture.wrapModeU = WrapMode.Clamp;
        //srctexture.wrapModeV = WrapMode.Clamp;

        let shadersv = this.shaderDataBlur;
        shadersv.shaderData.addDefine(ShaderDefines2D.FILTERGLOW);
        let size = shadersv.size;
        size.setValue(outTexWidth, outTexHeight); shadersv.size = size;
        shadersv.textureHost = this.textureExtend;
        let blurInfo = shadersv.blurInfo;
        blurInfo.setValue(outTexWidth, outTexHeight); shadersv.blurInfo = blurInfo;
        let u_blurInfo1 = shadersv.u_blurInfo1;
        u_blurInfo1.setValue(this._sv_blurInfo1[0], this._sv_blurInfo1[1], this._sv_blurInfo1[2], this._sv_blurInfo1[3])
        shadersv.u_blurInfo1 = u_blurInfo1;
        let u_blurInfo2 = shadersv.u_blurInfo2;
        u_blurInfo2.setValue(srctexture.width, srctexture.height, this._sv_blurInfo2[2], this._sv_blurInfo2[3]);
        shadersv.u_blurInfo2 = u_blurInfo2;
        let color = this.getColor();
        let svColor = shadersv.color;
        svColor.setValue(color[0], color[1], color[2], color[3]); shadersv.color = svColor;
        //模糊的底
        render2d.draw(
            this._rectMesh,
            0, 4 * this._rectMesh.vertexDeclarition.vertexStride,
            0, 12,
            shadersv, null);
        //最后覆盖一下原始图片
        let shadercpy = this.shaderDataCopy;
        size = shadercpy.size;
        size.setValue(outTexWidth, outTexHeight);
        shadercpy.size = size;
        shadercpy.textureHost = srctexture;
        this._fillQuad(marginLeft, marginTop, srctexture.width, srctexture.height, this._flipY);
        render2d.draw(
            this._rectMesh,
            0, 4 * this._rectMesh.vertexDeclarition.vertexStride,
            0, 12,
            shadercpy, null);

        render2d.renderEnd();
    }

    /**
     * @internal
     * @en Internal use only. Gets the shader define associated with this filter.
     * @zh 获取与此滤镜相关联的着色器定义。
     */
    get typeDefine(): ShaderDefine {
        return ShaderDefines2D.FILTERGLOW;
    }

    /**
     * @private
     * @en Gets Y offset value
     * @zh 获取Y偏移值
     */
    get offY(): number {
        return this._sv_blurInfo1[3];
    }

    /**
     * @private
     * @en Sets Y offset value
     * @zh 设置Y偏移值
     */
    set offY(value: number) {
        this._sv_blurInfo1[3] = value;
    }

    /**
     * @private
     * @en Gets X offset value
     * @zh 获取X偏移值
     */
    get offX(): number {
        return this._sv_blurInfo1[2];
    }

    /**
     * @private
     * @en Sets X offset value
     * @zh 设置X偏移值
     */
    set offX(value: number) {
        this._sv_blurInfo1[2] = value;
    }

    /**
     * @private
     * @en Gets X color value
     * @zh 获取颜色值
     */
    get color(): string {
        return this._color.strColor;
    }

    /**
     * @private
     * @en Sets X color value
     * @zh 设置颜色值
     */
    set color(value: string) {
        this._color = new ColorUtils(value);
    }

    /**
     * @private
     * @en Get the color array from the color utility.
     * @zh 从颜色工具获取颜色数组。
     */
    getColor(): any[] {
        return this._color.arrColor;
    }

    /**
     * @private
     * @en Gest fuzzy value
     * @zh 获取模糊值
     */
    get blur(): number {
        return this._sv_blurInfo1[1];
    }

    /**
     * @private
     * @en Sets fuzzy value
     * @zh 设置模糊值
     */
    set blur(value: number) {
        this._sv_blurInfo1[0] = this._sv_blurInfo1[1] = value;
    }

}

