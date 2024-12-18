/**
 * Interface for Any MMD animation container
 */
export interface IMmdAnimation {
    /**
     * Animation name for identification
     */
    readonly name: string;

    /**
     * The start frame of this animation
     */
    readonly startFrame: number;

    /**
     * The end frame of this animation
     */
    readonly endFrame: number;
}
