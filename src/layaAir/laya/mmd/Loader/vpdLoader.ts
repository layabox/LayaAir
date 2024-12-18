
import { MmdAnimation } from "./Animation/mmdAnimation";
import { MmdBoneAnimationTrack, MmdCameraAnimationTrack, MmdMorphAnimationTrack, MmdMovableBoneAnimationTrack, MmdPropertyAnimationTrack } from "./Animation/mmdAnimationTrack";
import type { VpdObject } from "./Parser/vpdObject";
import { VpdReader } from "./Parser/vpdReader";

/**
 * VpdLoader is a loader that loads MMD pose data in VPD format
 *
 * VPD format is a binary format for MMD animation data
 */
export class VpdLoader {
    private readonly _textDecoder: TextDecoder;

    /** @internal */
    public log: (message: string) => void;
    /** @internal */
    public warn: (message: string) => void;
    /** @internal */
    public error: (message: string) => void;

    /**
     * Create a new VpdLoader
     * @param scene Scene for loading file
     */
    public constructor() {
        this._textDecoder = new TextDecoder("shift_jis");
    }

    /**
     * Load MMD animation data from VPD object
     * @param name Animation name
     * @param vpdObject VPD object
     * @returns MMD animation data
     */
    public loadFromVpdObject(
        name: string,
        vpdObject: VpdObject
    ): MmdAnimation {
        const bones = vpdObject.bones;
        const boneNames = Object.keys(bones);
        let movableBoneCount = 0;
        for (let i = 0; i < boneNames.length; i++) {
            if (bones[boneNames[i]].position !== undefined) {
                movableBoneCount += 1;
            }
        }
        const boneTracks: MmdBoneAnimationTrack[] = new Array(boneNames.length - movableBoneCount);
        const movableBoneTracks: MmdMovableBoneAnimationTrack[] = new Array(movableBoneCount);
        let boneTrackIndex = 0;
        let movableBoneTrackIndex = 0;
        for (let i = 0; i < boneNames.length; i++) {
            const boneName = boneNames[i];
            const bone = bones[boneName];
            if (bone.position === undefined) {
                const boneTrack = boneTracks[boneTrackIndex] = new MmdBoneAnimationTrack(boneName, 1);
                boneTrack.rotations[0] = bone.rotation[0];
                boneTrack.rotations[1] = bone.rotation[1];
                boneTrack.rotations[2] = bone.rotation[2];
                boneTrack.rotations[3] = bone.rotation[3];
                boneTrackIndex += 1;
            } else {
                const movableBoneTrack = movableBoneTracks[movableBoneTrackIndex] = new MmdMovableBoneAnimationTrack(boneName, 1);

                movableBoneTrack.positions[0] = bone.position[0];
                movableBoneTrack.positions[1] = bone.position[1];
                movableBoneTrack.positions[2] = bone.position[2];

                movableBoneTrack.rotations[0] = bone.rotation[0];
                movableBoneTrack.rotations[1] = bone.rotation[1];
                movableBoneTrack.rotations[2] = bone.rotation[2];
                movableBoneTrack.rotations[3] = bone.rotation[3];
                movableBoneTrackIndex += 1;
            }
        }

        const morphs = vpdObject.morphs;
        const morphNames = Object.keys(morphs);
        const morphTracks: MmdMorphAnimationTrack[] = new Array(morphNames.length);
        for (let i = 0; i < morphNames.length; i++) {
            const morphName = morphNames[i];
            const morphTrack = morphTracks[i] = new MmdMorphAnimationTrack(morphName, 1);
            morphTrack.weights[0] = morphs[morphName];
        }

        return new MmdAnimation(name, boneTracks, movableBoneTracks, morphTracks, new MmdPropertyAnimationTrack(0, []), new MmdCameraAnimationTrack(0));
    }

    /**
     * Load MMD animation data from VPD array buffer
     * @param name Animation name
     * @param buffer VPD array buffer
     * @returns Animation data
     * @throws {LoadFileError} when validation fails
     */
    public loadFromBuffer(
        name: string,
        buffer: ArrayBuffer
    ): MmdAnimation {
        const text = this._textDecoder.decode(buffer);
        const vpdObject = VpdReader.Parse(text, this);
        return this.loadFromVpdObject(name, vpdObject);
    }

}
