import type { Vec3 } from "./mmdTypes";

/**
 * Pmd object for temporal use in pmd parser
 * @internal
 */
export namespace PmdObject {
    /**
     * Pmd bone object
     */
    export type Bone = {
        /**
         * Bone name
         */
        name: string;

        /**
         * Bone name in english
         */
        englishName: string;

        /**
         * Parent bone index
         */
        parentBoneIndex: number;

        /**
         * Tail bone index
         */
        tailIndex: number;

        /**
         * Bone type
         */
        type: PmdObject.Bone.Type;

        /**
         * Ik index
         */
        ikIndex: number;

        /**
         * Bone position
         */
        position: Vec3;
    };

    export namespace Bone {
        /**
         * Bone type
         */
        export enum Type {
            Rotate = 0,
            RotateMove = 1,
            Ik = 2,
            Unknown = 3,
            IkLink = 4,
            RotateEffect = 5,
            IkTo = 6,
            Invisible = 7,
            Twist = 8,
            RotateRatio = 9
        }
    }

    /**
     * Ik object
     */
    export type Ik = {
        /**
         * Ik bone index
         */
        boneIndex: number;

        /**
         * Ik target bone index
         */
        targetIndex: number;

        /**
         * Ik iteration
         */
        iteration: number;

        /**
         * Ik rotation limit
         */
        rotationConstraint: number;

        /**
         * Ik link indices
         */
        links: number[];
    };
}
