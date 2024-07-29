import { ILaya } from "../../ILaya";
import { Loader } from "../net/Loader";
import { ExternalSkinItem } from "./ExternalSkinItem";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTemplet } from "./SpineTemplet";
import { ISpineSkeleton } from "./interface/ISpineSkeleton";

export class ExternalSkin {
    /**@internal @protected */
    protected _source: string;
    /**@internal @protected */
    protected _templet: SpineTemplet;
    /**@internal @protected */
    protected _items: ExternalSkinItem[];
    /**目标spine */
    target: ISpineSkeleton;

    /**
     * 外部皮肤spine的源
     */
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

    /**
     * 要设置的外部皮肤的内容
     */
    set items(value: ExternalSkinItem[]) {
        this._items = value;
    }
    get items() {
        return this._items;
    }


    /**
    * 得到动画模板的引用
    * @return templet
    */
    get templet(): SpineTemplet {
        return this._templet;
    }
    set templet(value: SpineTemplet) {
        this.init(value);
    }

    /**
     * @internal
     * 初始化
     * @param templet 动画模板引用 
     * @returns 
     */
    protected init(templet: SpineTemplet): void {
        this._templet = templet;
        if (!this._templet) {
            return;
        }
        this.flush();
    }

    /**
     * 替换外部i皮肤spine
     * @internal
     * @returns 
     */
    flush() {
        if (this.target && this.target.templet && this._items && this._templet && this._templet.skeletonData) {
            if (null == (this.target.templet as any)._textures) return;
            for (let i = this._items.length - 1; i >= 0; i--) {
                let o = this._items[i];
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
                                attachment = attachments[j]?.[attachmentStr];
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
                        let slotObj = this.target.getSkeleton().findSlot(slot);
                        if (slotObj) {
                            slotObj.setAttachment(attachment);
                        }
                        this.target.changeNormal();
                    }
                }

            }
        }

    }
}