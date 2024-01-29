import { CommandBuffer } from "../../../d3/core/render/command/CommandBuffer";
import { IForwardAddRP } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebGLDirectLightShadowRP } from "./WebGLDirectLightShadowRP";
import { WebGLForwardAddClusterRP } from "./WebGLForwardAddClusterRP";
import { WebGLSpotLightShadowRP } from "./WebGLSpotLightShadowRP";


export class WebGLForwardAddRP implements IForwardAddRP {
    constructor() {
        this.directLightShadowPass = new WebGLDirectLightShadowRP();
        this.spotLightShadowPass = new WebGLSpotLightShadowRP();
        this.renderpass = new WebGLForwardAddClusterRP();
    }

    setAfterEventCmd(value: CommandBuffer[]): void {
        this.afterEventCmd = value;
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

    /**Render end commanbuffer */
    afterEventCmd: Array<CommandBuffer>;
    //postProcess TODO

    /**main pass */
    renderpass: WebGLForwardAddClusterRP;
}