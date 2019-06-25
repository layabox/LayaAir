import { AnimationClip } from "./AnimationClip";
import { Byte } from "../../utils/Byte";
/**
 * @private
 */
export declare class AnimationClipParser04 {
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
    /**@private */
    private static _version;
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
    static parse(clip: AnimationClip, reader: Byte, version: string): void;
    /**
     * @private
     */
    static READ_ANIMATIONS(): void;
}
