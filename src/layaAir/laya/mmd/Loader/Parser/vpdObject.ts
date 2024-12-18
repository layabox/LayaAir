import type { Vec3, Vec4 } from "./mmdTypes";

/**
 * Vpd object is a type that represents a vpd file
 */
export type VpdObject = {
    /**
     * bone transforms
     *
     * key: bone name
     *
     * value: bone transform
     */
    bones: {
        [boneName: string]: {
            /**
             * bone position
             *
             * when this is undefined, the bone position is (0, 0, 0)
             */
            position?: Vec3;
            /**
             * bone rotation in quaternion
             */
            rotation: Vec4;
        };
    };

    /**
     * morph weights
     *
     * key: morph name
     *
     * value: morph weight
     */
    morphs: {
        [morphName: string]: number;
    };
};
