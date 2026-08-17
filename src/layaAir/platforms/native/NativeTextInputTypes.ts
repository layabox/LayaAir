/** @internal */
export enum NativeTextInputState {
    Inactive,
    Active,
    Composing,
    Suspended
}

/** @internal */
export interface NativeTextRange {
    start: number;
    end: number;
}

/** @internal */
export interface NativeTextInputSnapshot {
    sessionId: number;
    revision: number;
    state: NativeTextInputState;
    text: string;
    selectionStart: number;
    selectionEnd: number;
    compositionStart: number;
    compositionEnd: number;
}
