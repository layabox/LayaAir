import type { IMmdAnimation } from "./IMmdAnimation";
import { MmdAnimationBase } from "./mmdAnimationBase";
import type { MmdBoneAnimationTrack, MmdCameraAnimationTrack, MmdMorphAnimationTrack, MmdMovableBoneAnimationTrack, MmdPropertyAnimationTrack } from "./mmdAnimationTrack";

/**
 * Represents mmd animation data
 *
 * Internally, it uses typed arrays to store animation data for better performance
 *
 * Therefore, it is not compatible with existing Babylon.js animation systems.
 *
 * You can save one mesh animation and one camera animation in one `MmdAnimation` instance
 */
export class MmdAnimation extends MmdAnimationBase<
    MmdBoneAnimationTrack,
    MmdMovableBoneAnimationTrack,
    MmdMorphAnimationTrack,
    MmdPropertyAnimationTrack
> implements IMmdAnimation {

    /**
     * Create a new `MmdAnimation` instance
     * @param name animation name for identification
     * @param boneTracks bone animation tracks
     * @param movableBoneTracks movable bone animation tracks
     * @param morphTracks morph animation tracks
     * @param propertyTrack property animation track
     * @param cameraTrack camera animation track
     */
    public constructor(
        name: string,
        boneTracks: readonly MmdBoneAnimationTrack[],
        movableBoneTracks: readonly MmdMovableBoneAnimationTrack[],
        morphTracks: readonly MmdMorphAnimationTrack[],
        propertyTrack: MmdPropertyAnimationTrack,
        cameraTrack: MmdCameraAnimationTrack
    ) {
        super(
            name,
            boneTracks,
            movableBoneTracks,
            morphTracks,
            propertyTrack,
            cameraTrack
        );
    }

    /**
     * Check if all animation tracks are valid(sorted)
     * @returns true if all animation tracks are valid
     */
    public validate(): boolean {
        const boneTracks = this.boneTracks;
        for (let i = 0; i < boneTracks.length; ++i) {
            if (!boneTracks[i].validate()) return false;
        }

        const movableBoneTracks = this.movableBoneTracks;
        for (let i = 0; i < movableBoneTracks.length; ++i) {
            if (!movableBoneTracks[i].validate()) return false;
        }

        const morphTracks = this.morphTracks;
        for (let i = 0; i < morphTracks.length; ++i) {
            if (!morphTracks[i].validate()) return false;
        }

        return this.propertyTrack.validate() && this.cameraTrack.validate();
    }
}
