import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { Vector4 } from "../../../maths/Vector4";
import { WebGLDirectLightShadowRP } from "./WebGLDirectLightShadowRP";
import { WebGLForwardAddClusterRP } from "./WebGLForwardAddClusterRP";
import { WebGLSpotLightShadowRP } from "./WebGLSpotLightShadowRP";


export class WebGLForwardAddRP {
    constructor() {
        this.directLightShadowPass = new WebGLDirectLightShadowRP();
        this.spotLightShadowPass = new WebGLSpotLightShadowRP();
        this.shadowParams = new Vector4();
        this.renderpass = new WebGLForwardAddClusterRP();
    }

    setBeforeImageEffect(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._beforeImageEffectCMDS = value;
            value.forEach(element => {
                element._apply(false);
            });
        }
    }

    setAfterEventCmd(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._afterAllRenderCMDS = value;
            value.forEach(element => {
                element._apply(false);
            });
        }
    }
    /**是否开启阴影 */
    shadowCastPass: boolean = false;

    /**directlight shadow */
    directLightShadowPass: WebGLDirectLightShadowRP;

    /**enable directlight */
    enableDirectLightShadow: boolean = false;

    /**spot shadow */
    spotLightShadowPass: WebGLSpotLightShadowRP;

    /**enable spot */
    enableSpotLightShadowPass: boolean = false;

    shadowParams: Vector4;

    /**Render end commanbuffer */
    /**@internal */
    _afterAllRenderCMDS: Array<CommandBuffer>;
    /**@internal */
    _beforeImageEffectCMDS: Array<CommandBuffer>;
    
    enablePostProcess: boolean = true;
    /**@internal */
    postProcess: CommandBuffer;
    /**main pass */
    renderpass: WebGLForwardAddClusterRP;
}