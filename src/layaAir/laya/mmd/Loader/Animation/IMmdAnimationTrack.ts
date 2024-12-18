/**
 * MMD animation track base interface
 */
export interface IMmdAnimationTrack {
    /**
     * Track type
     */
    readonly trackType: string;

    /**
     * Track name for bind to model's bone/morph
     */
    readonly name: string;

    /**
     * Frame numbers of this track
     *
     * The frame numbers must be sorted in ascending order
     *
     * Repr: [..., frameNumber, ...]
     */
    readonly frameNumbers: Uint32Array;

    /**
     * The start frame of this animation
     */
    readonly startFrame: number;

    /**
     * The end frame of this animation
     *
     * If mmdAnimationTrack.validate() is false, the return value is not valid
     */
    readonly endFrame: number;
}


/**
 * MMD bone animation track interface
 *
 * Contains bone rotation and rotation cubic interpolation data
 */
export interface IMmdBoneAnimationTrack extends IMmdAnimationTrack {
    /**
     * Bone rotation data in quaternion
     *
     * The rotation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x, y, z, w, ...]
     */
    readonly rotations: Float32Array;

    /**
     * Rotation cubic interpolation data
     *
     * The rotation interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x1, x2, y1, y2, ...]
     */
    readonly rotationInterpolations: Uint8Array;
}

/**
 * MMD movable bone animation track interface
 *
 * Contains bone position, rotation and position/rotation cubic interpolation data
 */
export interface IMmdMovableBoneAnimationTrack extends IMmdBoneAnimationTrack {
    /**
     * Bone position data in vector3
     *
     * The position data must be sorted by frame number in ascending order
     *
     * Repr: [..., x, y, z, ...]
     */
    readonly positions: Float32Array;
    /**
     * Position cubic interpolation data
     *
     * The position interpolation data must be sorted by frame number in ascending order
     *
     * Repr: [..., x_x1, x_x2, x_y1, x_y2, y_x1, y_x2, y_y1, y_y2, z_x1, z_x2, z_y1, z_y2, ...]
     */
    readonly positionInterpolations: Uint8Array;
}

/**
 * MMD morph animation track interface
 *
 * Contains morph weight data
 *
 * Weight data will be linear interpolated so there is no interpolation data
 */
export interface IMmdMorphAnimationTrack extends IMmdAnimationTrack {
    /**
     * Morph weight data
     *
     * The weight data must be sorted by frame number in ascending order
     *
     * Repr: [..., weight, ...]
     */
    readonly weights: Float32Array;
}

/**
 * MMD property animation track interface
 *
 * Contains visibility and ik state data
 *
 * Visibility and ik state will be step interpolated
 */
export interface IMmdPropertyAnimationTrack extends IMmdAnimationTrack {
    /**
     * Visibility data
     *
     * The visibility data must be sorted by frame number in ascending order
     *
     * Repr: [..., visible, ...]
     */
    readonly visibles: Uint8Array;

    /**
     * IK bone names
     *
     * Repr: [..., ikBoneName, ...]
     */
    readonly ikBoneNames: readonly string[];

    /**
     * Get nth bone IK state data
     *
     * The IK state data must be sorted by frame number in ascending order
     *
     * Repr: [..., ikState, ...]
     * @param n Ik bone index
     * @returns IK state key frame values
     */
    getIkState(index: number): Uint8Array;
}
