/**
     * @private
     */
export declare class WordText {
    id: number;
    save: any[];
    toUpperCase: string;
    changed: boolean;
    _text: string;
    width: number;
    pageChars: any[];
    startID: number;
    startIDStroke: number;
    lastGCCnt: number;
    splitRender: boolean;
    setText(txt: string): void;
    toString(): string;
    readonly length: number;
    charCodeAt(i: number): number;
    charAt(i: number): string;
    /**
     * 自己主动清理缓存，需要把关联的贴图删掉
     * 不做也可以，textrender会自动清理不用的
     * TODO 重用
     */
    cleanCache(): void;
}
