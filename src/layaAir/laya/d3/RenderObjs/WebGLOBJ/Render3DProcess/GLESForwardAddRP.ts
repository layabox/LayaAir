import { IForwardAddRP } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddRP";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { GLESDirectLightShadowCastRP } from "./GLESDirectLightShadowRP";
import { GLESForwardAddClusterRP } from "./GLESForwardAddClusterRP";
import { GLESSpotLightShadowRP } from "./GLESSpotLightShadowRP";

export class GLESForwardAddRP implements IForwardAddRP {
    setAfterEventCmd(value: CommandBuffer[]): void {
       this.afterEventCmd = value;
    }
    /**是否开启阴影 */
    shadowCastPass: boolean;

    /**directlight shadow */
    directLightShadowPass: GLESDirectLightShadowCastRP;

    /**enable directlight */
    enableDirectLightShadow: boolean;

    /**spot shadow */
    spotLightShadowPass: GLESSpotLightShadowRP;

    /**enable spot */
    enableSpotLightShadowPass: boolean;

    /**Render end commanbuffer */
    afterEventCmd: Array<CommandBuffer>;

    /**postProcess pass */
    //postProcess TODO

    /**main pass */
    renderpass: GLESForwardAddClusterRP;
}