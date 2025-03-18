import { ILaya } from "../../ILaya";
import { Loader } from "../net/Loader";
import { ExternalSkinItem } from "./ExternalSkinItem";
import { Spine2DRenderNode } from "./Spine2DRenderNode";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTemplet } from "./SpineTemplet";

/**
 * @en Class representing an external skin for a Spine skeleton.
 * @zh 表示 Spine 骨骼的外部皮肤的类。
 */
export class ExternalSkin {
    /**@internal */
    protected _source: string;
    /**@internal */
    protected _templet: SpineTemplet;
    /**@internal */
    protected _items: ExternalSkinItem[];
    /**
     * @en The target Spine skeleton.
     * @zh 目标 Spine 骨骼。
     */
    target: Spine2DRenderNode;

    normal = false;

    /**
     * @en The source of the external skin Spine.
     * @zh 外部皮肤spine的源。
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
     * @en The content of the external skin.
     * @zh 要设置的外部皮肤的内容。
     */
    get items() {
        return this._items;
    }
    set items(value: ExternalSkinItem[]) {
        this._items = value;
    }

    /**
     * @en Get the reference of the animation template.
     * @zh 得到动画模板的引用。
     */
    get templet(): SpineTemplet {
        return this._templet;
    }
    set templet(value: SpineTemplet) {
        this.init(value);
    }

    /**
     * @en Initialize the external skin with a given template.
     * @param templet The animation template reference.
     * @zh 使用给定的模板初始化外部皮肤。
     * @param templet 动画模板的引用。
     */
    protected init(templet: SpineTemplet): void {
        this._templet = templet;
        if (!this._templet) {
            return;
        }
        this.flush();
    }

    /**
     * @en Replace the external skin Spine.
     * @zh 替换外部皮肤 Spine。
     */
    flush() {
        let targetTemplet = this.target?.templet;
        let skeletonData = this._templet?.skeletonData;
        if (
            this._items && skeletonData 
            && targetTemplet
            && (targetTemplet as any)._textures) 
        {
            for (let i = this._items.length - 1; i >= 0; i--) {
                let o = this._items[i];
                let attachmentStr = o.attachment;
                let slot = o.slot;
                let skinStr = o.skin;

                if (attachmentStr && slot && skinStr) {
                    let attachment: spine.Attachment = null;
                    let skins = skeletonData.skins;
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
                        targetTemplet.setTexture(regionPage.name , regionPage.texture.realTexture);
                        let slotObj = this.target.getSkeleton().findSlot(slot);
                        if (slotObj) {
                            slotObj.setAttachment(attachment);
                        }

                    }
                }

            }
            this.normal = this._templet !== targetTemplet;
        }else{
            this.normal = false;
        }

    }
}