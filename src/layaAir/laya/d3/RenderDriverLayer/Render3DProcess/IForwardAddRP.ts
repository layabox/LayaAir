import { CommandBuffer } from "../../core/render/command/CommandBuffer";
import { IDirectLightShadowRP } from "./IDirectLightShadowRP";
import { IForwardAddClusterRP } from "./IForwardAddClusterRP";
import { ISpotLightShadowRP } from "./ISpotLightShadowRP";
export interface IForwardAddRP {

    /**是否开启阴影 */
    shadowCastPass: boolean;

    /**directlight shadow */
    directLightShadowPass: IDirectLightShadowRP;

    /**enable directlight */
    enableDirectLightShadow: boolean;

    /**spot shadow */
    spotLightShadowPass: ISpotLightShadowRP;

    /**enable spot */
    enableSpotLightShadowPass: boolean;

    /**postProcess pass */
    //postProcess TODO

    /**main pass */
    renderpass: IForwardAddClusterRP;

    /**Render end commanbuffer */
    setAfterEventCmd(value: Array<CommandBuffer>): void;
}