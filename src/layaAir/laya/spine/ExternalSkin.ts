import { ILaya } from "../../ILaya";
import { Loader } from "../net/Loader";
import { ExternalskinItem } from "./ExternalSkinItem";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTemplet } from "./SpineTemplet";

export class ExternalSkin {
    protected _source: string;
    protected _templet: SpineTemplet;
    protected _externalSkinItem: ExternalskinItem[];
    target: SpineSkeleton;

    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
        if (value) {
            ILaya.loader.load(value, Loader.SPINE).then((templet: SpineTemplet) => {
                if (!this._source || templet && !templet.isCreateFromURL(this._source))
                    return;

                this.templet = templet;
            });
        }
        else
            this.templet = null;
    }

    set externalSkinItem(value: ExternalskinItem[]) {
        this._externalSkinItem = value;
        this.flush();
    }
    get externalSkinItem() {
        return this._externalSkinItem;
    }


    /**
    * 得到动画模板的引用
    * @return templet
    */
    get templet(): SpineTemplet {
        return this._templet;
    }

    /**
     * 
     */
    set templet(value: SpineTemplet) {
        this.init(value);
    }
    protected init(templet: SpineTemplet): void {
        this._templet = templet;
        if (!this._templet)
            return;
        this.flush();
    }
    flush() {
        if (this._externalSkinItem && this._templet) {
            for (let i = this._externalSkinItem.length - 1; i >= 0; i--) {
                let o = this._externalSkinItem[i];
                let attachmentStr = o.attachment;
                let slot = o.slot;
                let skinStr = o.skin;

                if (attachmentStr && slot && skinStr) {
                    let attachment: spine.Attachment = null;
                    let skins = this._templet.skeletonData.skins;
                    for (let j = skins.length - 1; j >= 0; j--) {
                        if (skins[j].name == skinStr) {
                            let skin = skins[j];
                            let attachments = skin.attachments;
                            for (let j = attachments.length - 1; j >= 0; j--) {
                                attachment = attachments[j][attachmentStr];
                                if (attachment) {
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    if (attachment) {
                        let regionPage = (attachment as any).region.page;
                        (this.target.templet as any)._textures[regionPage.name] = regionPage.texture;
                        this.target.getSkeleton().findSlot(slot).setAttachment(attachment);
                    }
                }

            }
        }

    }
}