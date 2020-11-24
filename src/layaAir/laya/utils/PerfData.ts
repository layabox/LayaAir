//import { PerfHUD } from "./PerfHUD";
let DATANUM = 300;
/**
 * @internal
 */
export class PerfData {
    id: number;
    name: string;
    color: number;
    scale: number = 1.0;
    datas: any[] = new Array(DATANUM);
    datapos: number = 0;
    constructor(id: number, color: number, name: string, scale: number) {
        this.id = id;
        this.color = color;
        this.name = name;
        this.scale = scale;
    }
    addData(v: number): void {
        this.datas[this.datapos] = v;
        this.datapos++;
        this.datapos %= DATANUM;
    }
}

