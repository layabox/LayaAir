import { FloatKeyframe } from "../d3/core/FloatKeyframe";
import { Gradient } from "../d3/core/Gradient";
import { TrailFilter } from "../d3/core/trail/TrailFilter";
import { TrailRenderer } from "../d3/core/trail/TrailRenderer";
import { Color } from "../maths/Color";
import { Loader } from "../net/Loader";
import { Material } from "../resource/Material";

TrailRenderer && (function () {
    TrailRenderer.prototype._parse = function (this: TrailRenderer, data: any, spriteMap: any): void {
        var filter: TrailFilter = this._trailFilter;
        var i: number, j: number;
        var materials: any[] = data.materials;
        if (materials) {
            var sharedMaterials: Material[] = this.sharedMaterials;
            var materialCount: number = materials.length;
            sharedMaterials.length = materialCount;
            for (i = 0; i < materialCount; i++)
                sharedMaterials[i] = Loader.getRes(materials[i].path);
            this.sharedMaterials = sharedMaterials;
        }
        //时间
        filter.time = data.time;
        //最小顶点距离
        filter.minVertexDistance = data.minVertexDistance;
        filter.widthMultiplier = data.widthMultiplier;
        filter.textureMode = data.textureMode;
        (data.alignment != null) && (filter.alignment = data.alignment);
        //widthCurve
        var widthCurve: FloatKeyframe[] = [];
        var widthCurveData: any[] = data.widthCurve;
        for (i = 0, j = widthCurveData.length; i < j; i++) {
            var trailkeyframe: FloatKeyframe = new FloatKeyframe();
            trailkeyframe.time = widthCurveData[i].time;
            trailkeyframe.inTangent = widthCurveData[i].inTangent;
            trailkeyframe.outTangent = widthCurveData[i].outTangent;
            trailkeyframe.value = widthCurveData[i].value;
            widthCurve.push(trailkeyframe);
        }
        filter.widthCurve = widthCurve;
        //colorGradient
        var colorGradientData: any = data.colorGradient;
        var colorKeys: any[] = colorGradientData.colorKeys;
        var alphaKeys: any[] = colorGradientData.alphaKeys;
        var colorGradient: Gradient = new Gradient();
        colorGradient.mode = colorGradientData.mode;

        for (i = 0, j = colorKeys.length; i < j; i++) {
            var colorKey: any = colorKeys[i];
            colorGradient.addColorRGB(colorKey.time, new Color(colorKey.value[0], colorKey.value[1], colorKey.value[2], 1.0));
        }

        for (i = 0, j = alphaKeys.length; i < j; i++) {
            var alphaKey: any = alphaKeys[i];
            colorGradient.addColorAlpha(alphaKey.time, alphaKey.value);
        }
        filter.colorGradient = colorGradient;
    };
})();

