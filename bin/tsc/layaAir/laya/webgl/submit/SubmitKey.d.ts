/**
     * ...
     * @author xie
     */
export declare class SubmitKey {
    blendShader: number;
    submitType: number;
    other: number;
    constructor();
    clear(): void;
    copyFrom(src: SubmitKey): void;
    copyFrom2(src: SubmitKey, submitType: number, other: number): void;
    equal3_2(next: SubmitKey, submitType: number, other: number): boolean;
    equal4_2(next: SubmitKey, submitType: number, other: number): boolean;
    equal_3(next: SubmitKey): boolean;
    equal(next: SubmitKey): boolean;
}
