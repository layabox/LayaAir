export class WebGPUStatis {
    private static _start: number = Date.now();
    private static _totalStatis: { memory: number } = { memory: 0 };
    private static _frameStatis: { renderElement?: number, uploadNum?: number, submit?: number } = {};
    private static _dataTiming: { action: string, name: string, id: number, time: number, memory: number, object: any }[] = [];
    private static _dataCreate: { [key: string]: { id: number[], count: number, time: number[], memory: number, object: any[] } } = {};
    private static _dataRelease: { [key: string]: { id: number[], count: number, time: number[], memory: number, object: any[] } } = {};
    private static _textureStatis: any[] = [];

    static startFrame() {
        this._frameStatis.submit = 0;
        this._frameStatis.uploadNum = 0;
        this._frameStatis.renderElement = 0;
    }

    static addUploadNum(n: number = 1) {
        this._frameStatis.uploadNum += n;
    }

    static addRenderElement(n: number = 1) {
        this._frameStatis.renderElement += n;
    }

    static addSubmit(n: number = 1) {
        this._frameStatis.submit += n;
    }

    static addTexture(texture: any) {
        this._textureStatis.push(texture);
    }

    static trackObjectCreation(name: string, id: number, object?: any, memory?: number) {
        const time = Date.now() - this._start;
        this._dataTiming.push({ action: 'create', name, id, time, memory, object });
        if (!this._dataCreate[name])
            this._dataCreate[name] = { id: [], count: 0, time: [], memory: 0, object: [] };
        this._dataCreate[name].id.push(id);
        this._dataCreate[name].count++;
        this._dataCreate[name].time.push(time);
        this._dataCreate[name].memory += memory;
        this._dataCreate[name].object.push(object);
        this._totalStatis.memory += memory;
    }

    static trackObjectRelease(name: string, id: number, object?: any, memory?: number) {
        const time = Date.now() - this._start;
        this._dataTiming.push({ action: 'release', name, id, time, memory, object });
        if (!this._dataRelease[name])
            this._dataRelease[name] = { id: [], count: 0, time: [], memory: 0, object: [] };
        this._dataRelease[name].id.push(id);
        this._dataRelease[name].count++;
        this._dataRelease[name].time.push(time);
        this._dataRelease[name].memory += memory;
        this._dataRelease[name].object.push(object);
        this._totalStatis.memory -= memory;
    }

    static trackObjectAction(name: string, id: number, action: string, object?: any, memory?: number) {
        const time = Date.now() - this._start;
        this._dataTiming.push({ action, name, id, time, memory, object });
        this._totalStatis.memory += memory;
    }

    static printStatisticsAsTable() {
        if (this._dataTiming.length > 0) {
            console.log('timing statistics: ');
            console.table(this._dataTiming);
        }
        if (Object.keys(this._dataCreate).length > 0) {
            console.log('object creation statistics: ');
            console.table(this._dataCreate);
        }
        if (Object.keys(this._dataRelease).length > 0) {
            console.log('object release statistics: ');
            console.table(this._dataRelease);
        }
    }

    static printTotalStatis() {
        console.table(this._totalStatis);
    }

    static printFrameStatis() {
        console.table(this._frameStatis);
    }

    static printTextureStatis() {
        console.log('texture statistics: ');
        console.table(this._textureStatis);
    }
}