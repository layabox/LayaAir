import { SpotLightCom } from "../d3/core/light/SpotLightCom";

SpotLightCom && (function () {
    let old_parse = SpotLightCom.prototype._parse;
    SpotLightCom.prototype._parse = function (this: SpotLightCom, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        this.range = data.range;
        this.spotAngle = data.spotAngle;
    };
})();