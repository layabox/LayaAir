export class ExternalSkinItem {
    /**@internal */
    protected _skin: string;
    /**@internal */
    protected _slot: string;
    /**@internal */
    protected _attachment: string;

    /**
     * 皮肤
     */
    get skin() {
        return this._skin;
    }
    set skin(value: string) {
        this._skin = value;
    }

    /**
     * 槽位
     */
    set slot(value: string) {
        this._slot = value;
    }
    get slot() {
        return this._slot;
    }

    /**
     * 附件
     */
    set attachment(value: string) {
        this._attachment = value;
    }
    get attachment() {
        return this._attachment;
    }

}