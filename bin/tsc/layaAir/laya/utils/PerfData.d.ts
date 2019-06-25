export declare class PerfData {
    id: number;
    name: string;
    color: number;
    scale: number;
    datas: any[];
    datapos: number;
    constructor(id: number, color: number, name: string, scale: number);
    addData(v: number): void;
}
