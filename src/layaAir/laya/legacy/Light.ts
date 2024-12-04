import { Light } from "../d3/core/light/Light";

Light && (function () {
    let old_parse = Light.prototype._parse;
    Light.prototype._parse = function (this: Light, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        var colorData: any[] = data.color;
        this.color.r = colorData[0];
        this.color.g = colorData[1];
        this.color.b = colorData[2];
        this.intensity = data.intensity;
        this.lightmapBakedType = data.lightmapBakedType;
    };
})();