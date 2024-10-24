import { PointLightCom } from "../d3/core/light/PointLightCom";

PointLightCom && (function () {
    let old_parse = PointLightCom.prototype._parse;
    PointLightCom.prototype._parse = function (this: PointLightCom, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        this.range = data.range;
    };
})();