import { Camera } from "../d3/core/Camera";
import { Viewport } from "../maths/Viewport";

Camera && (function () {
    let old_parse = Camera.prototype._parse;
    Camera.prototype._parse = function (this: Camera, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        var clearFlagData: any = data.clearFlag;
        (clearFlagData !== undefined) && (this.clearFlag = clearFlagData);
        var viewport: any[] = data.viewport;
        this.normalizedViewport = new Viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
        var enableHDR: boolean = data.enableHDR;
        (enableHDR !== undefined) && (this.enableHDR = enableHDR);
    };
})();