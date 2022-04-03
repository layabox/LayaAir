export class NativeWebGLCacheAsNormalCanvas {
    _nativeObj: any;
    _context: any;
    constructor(ctx: any, sp: any)
    {
        this._context = ctx;
        this._nativeObj = new (window as any)._conchWebGLCacheAsNormalCanvas(ctx._nativeObj.id, 0);
    }
    startRec(): void {
        this._nativeObj.startRec();
    }
    endRec(): void {
        this._nativeObj.endRec();
    }
    isCacheValid(): boolean {
        return this._nativeObj.isCacheValid();
    }  
    isTextNeedRestore(): boolean {
        return this._nativeObj.isTextNeedRestore();
    }
    get context() {
        return this._context;
    }
}
