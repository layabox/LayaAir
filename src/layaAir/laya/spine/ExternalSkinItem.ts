export class ExternalSkinItem {
    /**@internal */
    protected _skin: string;
    /**@internal */
    protected _slot: string;
    /**@internal */
    protected _attachment: string;

    /**
     * @en The skin.
     * @zh 皮肤。
     */
    get skin() {
        return this._skin;
    }
    set skin(value: string) {
        this._skin = value;
    }

    /**
     * @en The slot.
     * @zh 槽位。
     */
    get slot() {
        return this._slot;
    }
    set slot(value: string) {
        this._slot = value;
    }

    /**
     * @en The attachment.
     * @zh 附件。
     */
    get attachment() {
        return this._attachment;
    }
    set attachment(value: string) {
        this._attachment = value;
    }
}