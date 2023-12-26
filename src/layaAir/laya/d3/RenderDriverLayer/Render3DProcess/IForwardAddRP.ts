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
    
    /**Render end commanbuffer */
    afterEventCmd: Array<CommandBuffer>;
    
    /**postProcess pass */
    //postProcess TODO
    
    /**main pass */
    renderpass: IForwardAddClusterRP
}