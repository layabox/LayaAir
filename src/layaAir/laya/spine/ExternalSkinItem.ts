export class ExternalSkinItem {
    protected _skin: string;
    protected _slot: string;
    protected _attachment: string;

    get skin() {
        return this._skin;
    }
    set skin(value: string) {
        this._skin = value;
    }
    set slot(value: string) {
        this._slot = value;
    }
    get slot() {
        return this._slot;
    }
    set attachment(value: string) {
        this._attachment = value;
    }
    get attachment() {
        return this._attachment;
    }

}