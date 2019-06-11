import { Byte } from "laya/utils/Byte";
import { AnimationClip } from "./AnimationClip";
/**
 * @private
 */
export declare class AnimationClipParser03 {
    /**@private */
    private static _animationClip;
    /**@private */
    private static _reader;
    /**@private */
    private static _strings;
    /**@private */
    private static _BLOCK;
    /**@private */
    private static _DATA;
    /**
     * @private
     */
    private static READ_DATA;
    /**
     * @private
     */
    private static READ_BLOCK;
    /**
     * @private
     */
    private static READ_STRINGS;
    /**
     * @private
     */
    static parse(clip: AnimationClip, reader: Byte): void;
    /**
     * @private
     */
    static READ_ANIMATIONS(): void;
}
