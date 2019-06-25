import { AnimationTemplet } from "././AnimationTemplet";
import { Byte } from "../utils/Byte";
/**
 * @private
 */
export declare class AnimationParser02 {
    /**@private */
    private static _templet;
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
    static parse(templet: AnimationTemplet, reader: Byte): void;
    static READ_ANIMATIONS(): void;
}
