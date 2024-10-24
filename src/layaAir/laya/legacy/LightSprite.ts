import { LightSprite } from "../d3/core/light/LightSprite";

LightSprite && (function () {
    let old_parse = LightSprite.prototype._parse;
    LightSprite.prototype._parse = function (this: LightSprite, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        var colorData: any[] = data.color;
        this.color.r = colorData[0];
        this.color.g = colorData[1];
        this.color.b = colorData[2];
        this.intensity = data.intensity;
        this.lightmapBakedType = data.lightmapBakedType;
    };
})();