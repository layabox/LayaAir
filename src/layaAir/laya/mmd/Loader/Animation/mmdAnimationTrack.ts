import type { IMmdAnimationTrack, IMmdBoneAnimationTrack, IMmdMorphAnimationTrack, IMmdMovableBoneAnimationTrack, IMmdPropertyAnimationTrack } from "./IMmdAnimationTrack";

/**
 * MMD animation track base class
 */
export abstract class MmdAnimationTrack implements IMmdAnimationTrack {
    /**
     * Track type
     */
    public readonly trackType: string;

    /**
     * Track name for bind to model's bone/morph
     */
    public readonly name: string;

    /**
     * Frame numbers of this track
     *
     * The frame numbers must be sorted in ascending order
     *
     * Repr: [..., frameNumber, ...]
     */
    public readonly frameNumbers: Uint32Array;

    /**
     * Create a new `MmdAnimationTrack` instance
     * @param trackType Track type
     * @param trackName Track name for bind to model
     * @param frameCount Frame count of this track
     * @param arrayBuffer ArrayBuffer for zero-copy initialization
     * @param byteOffset Byte offset of frame numbers in arrayBuffer
     */
    public constructor(
        trackType: string,
        trackName: string,
        frameCount: number,
        arrayBuffer?: ArrayBufferLike,
        byteOffset?: number
    ) {
        this.trackType = trackType;

        this.name = trackName;

        if (arrayBuffer === undefined) {
            this.frameNumbers = new Uint32Array(frameCount);
        } else {
            this.frameNumbers = new Uint32Array(arrayBuffer, byteOffset, frameCount);
        }
    }

    /**
     * Check if all frame numbers are valid(sorted)
     * @returns true if all frame numbers are valid
     */
    public validate(): boolean {
        for (let i = 1; i < this.frameNumbers.length; ++i) {
            if (this.frameNumbers[i - 1] >= this.frameNumbers[i]) return false;
        }

        return true;
    }

    /**
     * The start frame of this animation
     */
    public get startFrame(): number {
        if (this.frameNumbers.length === 0) return 0;
        return this.frameNumbers[0];
    }

    /**
     * The end frame of this animation
     *
     * If mmdAnimationTrack.validate() is false, the return value is not valid
     */
    public get endFrame(): number {
        if (this.frameNumbers.length === 0) return 0;
        return this.frameNumbers[this.frameNumbers.length - 1];
    }
}

/**
 * MMD bone animation track
 *
 * Contains bone rotation and rotation cubic interpolation data
 */
export class MmdBoneAnimationTrack extends MmdAnimationTrack implements IMmdBoneAnimationTrack {
    /**
     * Bone rotation data in quaternion
     *
     * The rotation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x, y, z, w, ...]
     */
    public readonly rotations: Float32Array;

    /**
     * Rotation cubic interpolation data
     *
     * The rotation interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x1, x2, y1, y2, ...]
     */
    public readonly rotationInterpolations: Uint8Array;

    /**
     * Create a new `MmdBoneAnimationTrack` instance
     * @param trackName track name for bind to model's bone
     * @param frameCount frame count of this track
     * @param arrayBuffer ArrayBuffer for zero-copy initialization
     * @param frameNumberByteOffset Byte offset of frame numbers in arrayBuffer
     * @param rotationByteOffset Byte offset of rotations in arrayBuffer
     * @param rotationInterpolationByteOffset Byte offset of rotation interpolations in arrayBuffer
     */
    public constructor(
        trackName: string,
        frameCount: number,
        arrayBuffer?: ArrayBufferLike,
        frameNumberByteOffset?: number,
        rotationByteOffset?: number,
        rotationInterpolationByteOffset?: number
    ) {
        super("bone", trackName, frameCount, arrayBuffer, frameNumberByteOffset);

        if (arrayBuffer === undefined) {
            this.rotations = new Float32Array(frameCount * 4);
            this.rotationInterpolations = new Uint8Array(frameCount * 4);
        } else {
            this.rotations = new Float32Array(arrayBuffer, rotationByteOffset, frameCount * 4);
            this.rotationInterpolations = new Uint8Array(arrayBuffer, rotationInterpolationByteOffset, frameCount * 4);
        }
    }
}

/**
 * MMD movable bone animation track
 *
 * Contains bone position, rotation and position/rotation cubic interpolation data
 */
export class MmdMovableBoneAnimationTrack extends MmdAnimationTrack implements IMmdMovableBoneAnimationTrack {
    /**
     * Bone position data in vector3
     *
     * The position data must be sorted by frame number in ascending order
     *
     * Repr: [..., x, y, z, ...]
     */
    public readonly positions: Float32Array;
    /**
     * Position cubic interpolation data
     *
     * The position interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x_x1, x_x2, x_y1, x_y2, y_x1, y_x2, y_y1, y_y2, z_x1, z_x2, z_y1, z_y2, ...]
     */
    public readonly positionInterpolations: Uint8Array;

    /**
     * Bone rotation data in quaternion
     *
     * The rotation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x, y, z, w, ...]
     */
    public readonly rotations: Float32Array;

    /**
     * Rotation cubic interpolation data
     *
     * The rotation interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x1, x2, y1, y2, ...]
     */
    public readonly rotationInterpolations: Uint8Array;

    /**
     * Create a new `MmdMovableBoneAnimationTrack` instance
     * @param trackName Track name for bind to model's bone
     * @param frameCount Frame count of this track
     * @param arrayBuffer ArrayBuffer for zero-copy initialization
     * @param frameNumberByteOffset Byte offset of frame numbers in arrayBuffer
     * @param positionByteOffset Byte offset of positions in arrayBuffer
     * @param positionInterpolationByteOffset Byte offset of position interpolations in arrayBuffer
     * @param rotationByteOffset Byte offset of rotations in arrayBuffer
     * @param rotationInterpolationByteOffset Byte offset of rotation interpolations in arrayBuffer
     */
    public constructor(
        trackName: string,
        frameCount: number,
        arrayBuffer?: ArrayBufferLike,
        frameNumberByteOffset?: number,
        positionByteOffset?: number,
        positionInterpolationByteOffset?: number,
        rotationByteOffset?: number,
        rotationInterpolationByteOffset?: number
    ) {
        super("movableBone", trackName, frameCount, arrayBuffer, frameNumberByteOffset);

        if (arrayBuffer === undefined) {
            this.positions = new Float32Array(frameCount * 3);
            this.positionInterpolations = new Uint8Array(frameCount * 12);

            this.rotations = new Float32Array(frameCount * 4);
            this.rotationInterpolations = new Uint8Array(frameCount * 4);
        } else {
            this.positions = new Float32Array(arrayBuffer, positionByteOffset, frameCount * 3);
            this.positionInterpolations = new Uint8Array(arrayBuffer, positionInterpolationByteOffset, frameCount * 12);

            this.rotations = new Float32Array(arrayBuffer, rotationByteOffset, frameCount * 4);
            this.rotationInterpolations = new Uint8Array(arrayBuffer, rotationInterpolationByteOffset, frameCount * 4);
        }
    }
}

/**
 * MMD morph animation track
 *
 * Contains morph weight data
 *
 * Weight data will be linear interpolated so there is no interpolation data
 */
export class MmdMorphAnimationTrack extends MmdAnimationTrack implements IMmdMorphAnimationTrack {
    /**
     * Morph weight data
     *
     * The weight data must be sorted by frame number in ascending order
     *
     * Repr: [..., weight, ...]
     */
    public readonly weights: Float32Array;

    /**
     * Create a new `MmdMorphAnimationTrack` instance
     * @param trackName Track name for bind to model's morph
     * @param frameCount Frame count of this track
     * @param arrayBuffer ArrayBuffer for zero-copy initialization
     * @param frameNumberByteOffset Byte offset of frame numbers in arrayBuffer
     * @param weightByteOffset Byte offset of weights in arrayBuffer
     */
    public constructor(
        trackName: string,
        frameCount: number,
        arrayBuffer?: ArrayBufferLike,
        frameNumberByteOffset?: number,
        weightByteOffset?: number
    ) {
        super("morph", trackName, frameCount, arrayBuffer, frameNumberByteOffset);

        if (arrayBuffer === undefined) {
            this.weights = new Float32Array(frameCount);
        } else {
            this.weights = new Float32Array(arrayBuffer, weightByteOffset, frameCount);
        }
    }
}

/**
 * MMD camera animation track
 *
 * Contains camera position, rotation, distance, fov and their cubic interpolation data
 */
export class MmdCameraAnimationTrack extends MmdAnimationTrack {
    /**
     * Camera position data in vector3
     *
     * The position data must be sorted by frame number in ascending order
     *
     * Repr: [..., x, y, z, ...]
     */
    public readonly positions: Float32Array;

    /**
     * Position cubic interpolation data
     *
     * The position interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x_x1, x_x2, x_y1, x_y2, y_x1, y_x2, y_y1, y_y2, z_x1, z_x2, z_y1, z_y2, ...]
     */
    public readonly positionInterpolations: Uint8Array;

    /**
     * Camera rotation data in yaw/pitch/roll
     *
     * The rotation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x, y, z, ...]
     */
    public readonly rotations: Float32Array;

    /**
     * Rotation cubic interpolation data
     *
     * The rotation interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x1, x2, y1, y2, ...]
     */
    public readonly rotationInterpolations: Uint8Array;

    /**
     * Camera distance data
     *
     * The distance data must be sorted by frame number in ascending order
     *
     * Repr: [..., distance, ...]
     */
    public readonly distances: Float32Array;

    /**
     * Distance cubic interpolation data
     *
     * The distance interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x1, x2, y1, y2, ...]
     */
    public readonly distanceInterpolations: Uint8Array;

    /**
     * Camera fov data in degrees
     *
     * The fov data must be sorted by frame number in ascending order
     *
     * Repr: [..., fov, ...]
     */
    public readonly fovs: Float32Array;

    /**
     * Fov cubic interpolation data
     *
     * The fov interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x1, x2, y1, y2, ...]
     */
    public readonly fovInterpolations: Uint8Array;

    /**
     * Create a new `MmdCameraAnimationTrack` instance
     * @param frameCount Frame count of this track
     * @param arrayBuffer ArrayBuffer for zero-copy initialization
     * @param frameNumberByteOffset Byte offset of frame numbers in arrayBuffer
     * @param positionByteOffset Byte offset of positions in arrayBuffer
     * @param positionInterpolationByteOffset Byte offset of position interpolations in arrayBuffer
     * @param rotationByteOffset Byte offset of rotations in arrayBuffer
     * @param rotationInterpolationByteOffset Byte offset of rotation interpolations in arrayBuffer
     * @param distanceByteOffset Byte offset of distances in arrayBuffer
     * @param distanceInterpolationByteOffset Byte offset of distance interpolations in arrayBuffer
     * @param fovByteOffset Byte offset of fovs in arrayBuffer
     * @param fovInterpolationByteOffset Byte offset of fov interpolations in arrayBuffer
     */
    public constructor(
        frameCount: number,
        arrayBuffer?: ArrayBufferLike,
        frameNumberByteOffset?: number,
        positionByteOffset?: number,
        positionInterpolationByteOffset?: number,
        rotationByteOffset?: number,
        rotationInterpolationByteOffset?: number,
        distanceByteOffset?: number,
        distanceInterpolationByteOffset?: number,
        fovByteOffset?: number,
        fovInterpolationByteOffset?: number
    ) {
        super("camera", "cameraTrack", frameCount, arrayBuffer, frameNumberByteOffset);

        if (arrayBuffer === undefined) {
            this.positions = new Float32Array(frameCount * 3);
            this.positionInterpolations = new Uint8Array(frameCount * 12);

            this.rotations = new Float32Array(frameCount * 3);
            this.rotationInterpolations = new Uint8Array(frameCount * 4);

            this.distances = new Float32Array(frameCount);
            this.distanceInterpolations = new Uint8Array(frameCount * 4);

            this.fovs = new Float32Array(frameCount);
            this.fovInterpolations = new Uint8Array(frameCount * 4);
        } else {
            this.positions = new Float32Array(arrayBuffer, positionByteOffset, frameCount * 3);
            this.positionInterpolations = new Uint8Array(
                arrayBuffer,
                positionInterpolationByteOffset,
                frameCount * 12
            );

            this.rotations = new Float32Array(arrayBuffer, rotationByteOffset, frameCount * 3);
            this.rotationInterpolations = new Uint8Array(
                arrayBuffer,
                rotationInterpolationByteOffset,
                frameCount * 4
            );

            this.distances = new Float32Array(arrayBuffer, distanceByteOffset, frameCount);
            this.distanceInterpolations = new Uint8Array(
                arrayBuffer,
                distanceInterpolationByteOffset,
                frameCount * 4
            );

            this.fovs = new Float32Array(arrayBuffer, fovByteOffset, frameCount);
            this.fovInterpolations = new Uint8Array(
                arrayBuffer,
                fovInterpolationByteOffset,
                frameCount * 4
            );
        }
    }
}

/**
 * MMD property animation track
 *
 * Contains visibility and ik state data
 *
 * Visibility and ik state will be step interpolated
 */
export class MmdPropertyAnimationTrack extends MmdAnimationTrack implements IMmdPropertyAnimationTrack {
    /**
     * Visibility data
     *
     * The visibility data must be sorted by frame number in ascending order
     *
     * Repr: [..., visible, ...]
     */
    public readonly visibles: Uint8Array;

    /**
     * IK bone names
     *
     * Repr: [..., ikBoneName, ...]
     */
    public readonly ikBoneNames: readonly string[];

    private readonly _ikStates: Uint8Array[];

    /**
     * Create a new `MmdPropertyAnimationTrack` instance
     * @param frameCount Frame count of this track
     * @param ikBoneCount IK bone count of this track
     * @param arrayBuffer ArrayBuffer for zero-copy initialization
     * @param frameNumberByteOffset Byte offset of frame numbers in arrayBuffer
     * @param visibleByteOffset Byte offset of visibilities in arrayBuffer
     * @param ikStateByteOffsets Byte offsets of IK states in arrayBuffer
     */
    public constructor(
        frameCount: number,
        ikBoneNames: readonly string[],
        arrayBuffer?: ArrayBufferLike,
        frameNumberByteOffset?: number,
        visibleByteOffset?: number,
        ikStateByteOffsets?: number[]
    ) {
        super("property", "propertyTrack", frameCount, arrayBuffer, frameNumberByteOffset);

        if (arrayBuffer === undefined) {
            this.visibles = new Uint8Array(frameCount);

            this.ikBoneNames = ikBoneNames;
            this._ikStates = new Array(ikBoneNames.length);
            for (let i = 0; i < ikBoneNames.length; ++i) {
                this._ikStates[i] = new Uint8Array(frameCount);
            }
        } else {
            this.visibles = new Uint8Array(arrayBuffer, visibleByteOffset, frameCount);

            this.ikBoneNames = ikBoneNames;
            this._ikStates = new Array(ikBoneNames.length);
            if (ikStateByteOffsets === undefined) ikStateByteOffsets = new Array(ikBoneNames.length);
            for (let i = 0; i < ikBoneNames.length; ++i) {
                this._ikStates[i] = new Uint8Array(arrayBuffer, ikStateByteOffsets[i], frameCount);
            }
        }
    }

    /**
     * Get nth bone IK state data
     *
     * The IK state data must be sorted by frame number in ascending order
     *
     * Repr: [..., ikState, ...]
     * @param n Ik bone index
     * @returns IK state key frame values
     */
    public getIkState(n: number): Uint8Array {
        return this._ikStates[n];
    }
}
