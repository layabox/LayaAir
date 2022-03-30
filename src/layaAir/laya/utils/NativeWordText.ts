export class NativeWordText {
    _nativeObj: any;
    constructor()
    {
        this._nativeObj = new (window as any)._conchWordText();
    }
    setText(txt: string): void {
        //this.changed = true;
        this._nativeObj._text = txt;
        //this.width = -1;
        this.cleanCache();
    }
    cleanCache(): void {
        this._nativeObj.cleanCache();
    }
    set splitRender(value: boolean) {
        this._nativeObj.splitRender = value;
    }
}