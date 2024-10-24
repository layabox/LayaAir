import { BaseCamera } from "../d3/core/BaseCamera";
import { Color } from "../maths/Color";

BaseCamera && (function () {
    let old_parse = BaseCamera.prototype._parse;
    BaseCamera.prototype._parse = function (this: BaseCamera, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        this.orthographic = data.orthographic;
        (data.orthographicVerticalSize !== undefined) && (this.orthographicVerticalSize = data.orthographicVerticalSize);
        (data.fieldOfView !== undefined) && (this.fieldOfView = data.fieldOfView);
        this.nearPlane = data.nearPlane;
        this.farPlane = data.farPlane;

        var color: any[] = data.clearColor;
        this.clearColor = new Color(color[0], color[1], color[2], color[3]);
    };
})();