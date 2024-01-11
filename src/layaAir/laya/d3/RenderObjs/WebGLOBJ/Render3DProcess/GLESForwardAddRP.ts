import { IForwardAddRP } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddRP";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { GLESDirectLightShadowCastRP } from "./GLESDirectLightShadowRP";
import { GLESForwardAddClusterRP } from "./GLESForwardAddClusterRP";
import { GLESSpotLightShadowRP } from "./GLESSpotLightShadowRP";

export class GLESForwardAddRP implements IForwardAddRP {
    constructor() {
        this.directLightShadowPass = new GLESDirectLightShadowCastRP();
        this.spotLightShadowPass = new GLESSpotLightShadowRP();
        this.renderpass = new GLESForwardAddClusterRP();
    }

    setAfterEventCmd(value: CommandBuffer[]): void {
        this.afterEventCmd = value;
    }
    /**是否开启阴影 */
    shadowCastPass: boolean = false;

    /**directlight shadow */
    directLightShadowPass: GLESDirectLightShadowCastRP;

    /**enable directlight */
    enableDirectLightShadow: boolean = false;

    /**spot shadow */
    spotLightShadowPass: GLESSpotLightShadowRP;

    /**enable spot */
    enableSpotLightShadowPass: boolean = false;

    /**Render end commanbuffer */
    afterEventCmd: Array<CommandBuffer>;

    /**postProcess pass */
    //postProcess TODO

    /**main pass */
    renderpass: GLESForwardAddClusterRP;
}