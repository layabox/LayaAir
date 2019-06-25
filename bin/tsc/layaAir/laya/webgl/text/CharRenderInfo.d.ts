/**
 * TODO如果占用内存较大,这个结构有很多成员可以临时计算
 */
export declare class CharRenderInfo {
    char: string;
    tex: any;
    deleted: boolean;
    uv: any[];
    pos: number;
    width: number;
    height: number;
    bmpWidth: number;
    bmpHeight: number;
    orix: number;
    oriy: number;
    touchTick: number;
    isSpace: boolean;
    touch(): void;
}
