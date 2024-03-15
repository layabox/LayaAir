export class WebGPUStatis {
    private static _start: number = Date.now();
    private static _dataCreate: { [key: string]: { id: number[], count: number, time: number[], memory: number, object: any[] } } = {};
    private static _dataRelease: { [key: string]: { id: number[], count: number, time: number[], memory: number, object: any[] } } = {};

    static trackObjectCreation(name: string, id: number, object?: any, memory?: number) {
        if (!this._dataCreate[name])
            this._dataCreate[name] = { id: [], count: 0, time: [], memory: 0, object: [] };
        this._dataCreate[name].id.push(id);
        this._dataCreate[name].count++;
        this._dataCreate[name].time.push(Date.now() - this._start);
        this._dataCreate[name].memory += memory;
        this._dataCreate[name].object.push(object);
    }

    static trackObjectRelease(name: string, id: number, object?: any, memory?: number) {
        if (!this._dataRelease[name])
            this._dataRelease[name] = { id: [], count: 0, time: [], memory: 0, object: [] };
        this._dataRelease[name].id.push(id);
        this._dataRelease[name].count++;
        this._dataRelease[name].time.push(Date.now() - this._start);
        this._dataRelease[name].memory += memory;
        this._dataRelease[name].object.push(object);
    }

    // static saveStatisticsAsJson(filename: string) {
    //     const json = JSON.stringify(this._dataCreate);
    //     const blob = new Blob([json], { type: 'application/json' });
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = filename;
    //     a.click();
    //     URL.revokeObjectURL(url);
    // }

    static printStatisticsAsTable() {
        if (Object.keys(this._dataCreate).length > 0) {
            console.log('object creation statistics: ');
            console.table(this._dataCreate);
        }
        if (Object.keys(this._dataRelease).length > 0) {
            console.log('object release statistics: ');
            console.table(this._dataRelease);
        }
    }
}