import type { IMmdAnimation } from "./IMmdAnimation";
import type { IMmdBoneAnimationTrack, IMmdMorphAnimationTrack, IMmdMovableBoneAnimationTrack, IMmdPropertyAnimationTrack } from "./IMmdAnimationTrack";
import type { MmdCameraAnimationTrack } from "./mmdAnimationTrack";

/**
 * Mmd Animation Base class for runtime injection
 */
export abstract class MmdAnimationBase<
    TBoneTrack extends IMmdBoneAnimationTrack = IMmdBoneAnimationTrack,
    TMovableBoneTrack extends IMmdMovableBoneAnimationTrack = IMmdMovableBoneAnimationTrack,
    TMorphTrack extends IMmdMorphAnimationTrack = IMmdMorphAnimationTrack,
    TPropertyTrack extends IMmdPropertyAnimationTrack = IMmdPropertyAnimationTrack
> implements IMmdAnimation {
    /**
     * Animation name for identification
     */
    public readonly name: string;

    /**
     * Bone animation tracks for one `mesh.skeleton`
     *
     * it contains rotation and rotation cubic interpolation data
     */
    public readonly boneTracks: readonly TBoneTrack[];

    /**
     * Movable bone animation tracks for one `mesh.skeleton`
     *
     * it contains position, rotation and their cubic interpolation data
     */
    public readonly movableBoneTracks: readonly TMovableBoneTrack[];

    /**
     * Morph animation tracks for one `mesh.morphTargetManager`
     *
     * it contains weight and weight linear interpolation data
     */
    public readonly morphTracks: readonly TMorphTrack[];

    /**
     * Property animation track for one `mmdModel`
     *
     * it contains visibility and ik toggle keyframe data
     */
    public readonly propertyTrack: TPropertyTrack;

    /**
     * Camera animation track for one `mmdCamera`
     *
     * it contains position, rotation, distance and fov cubic interpolation data
     */
    public readonly cameraTrack: MmdCameraAnimationTrack;

    /**
     * The start frame of this animation
     */
    public readonly startFrame: number;

    /**
     * The end frame of this animation
     */
    public readonly endFrame: number;

    /**
     * Create a new `MmdAnimationBase` instance
     * @param name animation name for identification
     * @param boneTracks bone animation tracks
     * @param movableBoneTracks movable bone animation tracks
     * @param morphTracks morph animation tracks
     * @param propertyTrack property animation track
     * @param cameraTrack camera animation track
     */
    public constructor(
        name: string,
        boneTracks: readonly TBoneTrack[],
        movableBoneTracks: readonly TMovableBoneTrack[],
        morphTracks: readonly TMorphTrack[],
        propertyTrack: TPropertyTrack,
        cameraTrack: MmdCameraAnimationTrack
    ) {
        this.name = name;

        this.boneTracks = boneTracks;
        this.movableBoneTracks = movableBoneTracks;
        this.morphTracks = morphTracks;
        this.propertyTrack = propertyTrack;
        this.cameraTrack = cameraTrack;

        let minStartFrame = Number.MAX_SAFE_INTEGER;
        let maxEndFrame = Number.MIN_SAFE_INTEGER;
        for (let i = 0; i < boneTracks.length; ++i) {
            const boneTrack = boneTracks[i];
            minStartFrame = Math.min(minStartFrame, boneTrack.startFrame);
            maxEndFrame = Math.max(maxEndFrame, boneTrack.endFrame);
        }
        for (let i = 0; i < movableBoneTracks.length; ++i) {
            const movableBoneTrack = movableBoneTracks[i];
            minStartFrame = Math.min(minStartFrame, movableBoneTrack.startFrame);
            maxEndFrame = Math.max(maxEndFrame, movableBoneTrack.endFrame);
        }
        for (let i = 0; i < morphTracks.length; ++i) {
            const morphTrack = morphTracks[i];
            minStartFrame = Math.min(minStartFrame, morphTrack.startFrame);
            maxEndFrame = Math.max(maxEndFrame, morphTrack.endFrame);
        }
        minStartFrame = Math.min(minStartFrame, propertyTrack.startFrame);
        maxEndFrame = Math.max(maxEndFrame, propertyTrack.endFrame);
        minStartFrame = Math.min(minStartFrame, cameraTrack.startFrame);
        maxEndFrame = Math.max(maxEndFrame, cameraTrack.endFrame);

        this.startFrame = minStartFrame;
        this.endFrame = maxEndFrame;
    }
}
