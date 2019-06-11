export declare class InlcudeFile {
    script: string;
    codes: any;
    funs: any;
    curUseID: number;
    funnames: string;
    constructor(txt: string);
    getWith(name?: string): string;
    getFunsScript(funsdef: string): string;
}
