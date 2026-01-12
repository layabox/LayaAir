// import { Texture } from "../../resource/Texture";
// import { Texture2D } from "../../resource/Texture2D";
// import { ESpineRenderType } from "../SpineSkeleton";
// import { SpineTemplet } from "../SpineTemplet";
// import { SpineTexture } from "../SpineTexture";
// import { AttachmentParse } from "./AttachmentParse";
// import { ESpineRenderType } from "../../../SpineSkeleton";
// import { AttachmentParse } from "../optimize/AttachmentParse";

/**
 * @en Utility class for Spine slot operations.
 * @zh Spine 插槽操作的实用工具类。
 */
export class SlotUtils {

    // static setSlotTexture( slot:spine.Slot, texture:Texture , templet:SpineTemplet , createAttachment: boolean = false){
    //     let attachment = slot.getAttachment();
    //     if (!attachment) return;

    //     if (createAttachment) {
    //         attachment = attachment.copy();
    //         slot.setAttachment(attachment);
    //     }

    //     let newRegion = templet.registerTexture(texture);
        
    //     if (attachment instanceof spine.RegionAttachment) {
    //         attachment.region = newRegion;
    //         attachment.width = newRegion.width;
    //         attachment.height = newRegion.height;

    //         if (attachment.updateRegion) {
    //             attachment.updateRegion();
    //         }
    //         //@ts-ignore
    //         else if(attachment.updateOffset){
    //             //@ts-ignore
    //             attachment.updateOffset();
    //         }

    //     } else if (attachment instanceof spine.MeshAttachment) {
    //         attachment.region = newRegion;
    //         attachment.width = newRegion.width;
    //         attachment.height = newRegion.height;

    //         if (attachment.updateRegion) {
    //             attachment.updateRegion();
    //         }
    //         //@ts-ignore
    //         else if(attachment.updateUVs){
    //             //@ts-ignore
    //             attachment.updateUVs();
    //         }
    //     }
    // }
}