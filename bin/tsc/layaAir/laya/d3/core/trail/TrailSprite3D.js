import { TrailFilter } from "./TrailFilter";
import { TrailRenderer } from "./TrailRenderer";
import { FloatKeyframe } from "../FloatKeyframe";
import { Gradient } from "../Gradient";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { Color } from "../../math/Color";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Loader } from "../../../net/Loader";
/**
 * <code>TrailSprite3D</code> 类用于创建拖尾渲染精灵。
 */
export class TrailSprite3D extends RenderableSprite3D {
    /**
     * @internal
     */
    static __init__() {
        TrailSprite3D.shaderDefines = new ShaderDefines(RenderableSprite3D.shaderDefines);
    }
    /**
     * 获取Trail过滤器。
     * @return  Trail过滤器。
     */
    get trailFilter() {
        return this._geometryFilter;
    }
    /**
     * 获取Trail渲染器。
     * @return  Trail渲染器。
     */
    get trailRenderer() {
        return this._render;
    }
    constructor(name = null) {
        super(name);
        this._render = new TrailRenderer(this);
        this._geometryFilter = new TrailFilter(this);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        var render = this._render;
        var filter = this._geometryFilter;
        var i, j;
        var materials = data.materials;
        if (materials) {
            var sharedMaterials = render.sharedMaterials;
            var materialCount = materials.length;
            sharedMaterials.length = materialCount;
            for (i = 0; i < materialCount; i++)
                sharedMaterials[i] = Loader.getRes(materials[i].path);
            render.sharedMaterials = sharedMaterials;
        }
        filter.time = data.time;
        filter.minVertexDistance = data.minVertexDistance;
        filter.widthMultiplier = data.widthMultiplier;
        filter.textureMode = data.textureMode;
        (data.alignment != null) && (filter.alignment = data.alignment);
        //widthCurve
        var widthCurve = [];
        var widthCurveData = data.widthCurve;
        for (i = 0, j = widthCurveData.length; i < j; i++) {
            var trailkeyframe = new FloatKeyframe();
            trailkeyframe.time = widthCurveData[i].time;
            trailkeyframe.inTangent = widthCurveData[i].inTangent;
            trailkeyframe.outTangent = widthCurveData[i].outTangent;
            trailkeyframe.value = widthCurveData[i].value;
            widthCurve.push(trailkeyframe);
        }
        filter.widthCurve = widthCurve;
        //colorGradient
        var colorGradientData = data.colorGradient;
        var colorKeys = colorGradientData.colorKeys;
        var alphaKeys = colorGradientData.alphaKeys;
        var colorGradient = new Gradient(colorKeys.length, alphaKeys.length);
        colorGradient.mode = colorGradientData.mode;
        for (i = 0, j = colorKeys.length; i < j; i++) {
            var colorKey = colorKeys[i];
            colorGradient.addColorRGB(colorKey.time, new Color(colorKey.value[0], colorKey.value[1], colorKey.value[2], 1.0));
        }
        for (i = 0, j = alphaKeys.length; i < j; i++) {
            var alphaKey = alphaKeys[i];
            colorGradient.addColorAlpha(alphaKey.time, alphaKey.value);
        }
        filter.colorGradient = colorGradient;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onActive() {
        super._onActive();
        this._transform.position.cloneTo(this._geometryFilter._lastPosition); //激活时需要重置上次位置
    }
    /**
     * @inheritDoc
     */
    /*override*/ _cloneTo(destObject, srcSprite, dstSprite) {
        super._cloneTo(destObject, srcSprite, dstSprite);
        var i, j;
        var destTrailSprite3D = destObject;
        var destTrailFilter = destTrailSprite3D.trailFilter;
        destTrailFilter.time = this.trailFilter.time;
        destTrailFilter.minVertexDistance = this.trailFilter.minVertexDistance;
        destTrailFilter.widthMultiplier = this.trailFilter.widthMultiplier;
        destTrailFilter.textureMode = this.trailFilter.textureMode;
        var widthCurveData = this.trailFilter.widthCurve;
        var widthCurve = [];
        for (i = 0, j = widthCurveData.length; i < j; i++) {
            var keyFrame = new FloatKeyframe();
            widthCurveData[i].cloneTo(keyFrame);
            widthCurve.push(keyFrame);
        }
        destTrailFilter.widthCurve = widthCurve;
        var destColorGradient = new Gradient(this.trailFilter.colorGradient.maxColorRGBKeysCount, this.trailFilter.colorGradient.maxColorAlphaKeysCount);
        this.trailFilter.colorGradient.cloneTo(destColorGradient);
        destTrailFilter.colorGradient = destColorGradient;
        var destTrailRender = destTrailSprite3D.trailRenderer;
        destTrailRender.sharedMaterial = this.trailRenderer.sharedMaterial;
    }
    /**
     * <p>销毁此对象。</p>
     * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    /*override*/ destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._geometryFilter.destroy();
        this._geometryFilter = null;
    }
    /**
     * @internal
     */
    _create() {
        return new TrailSprite3D();
    }
}
