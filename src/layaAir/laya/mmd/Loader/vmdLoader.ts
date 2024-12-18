
import { MmdAnimation } from "./Animation/mmdAnimation";
import { MmdBoneAnimationTrack, MmdCameraAnimationTrack, MmdMorphAnimationTrack, MmdMovableBoneAnimationTrack, MmdPropertyAnimationTrack } from "./Animation/mmdAnimationTrack";
import { VmdData, VmdObject } from "./Parser/vmdObject";

/**
 * VmdLoader is a loader that loads MMD animation data in VMD format
 *
 * VMD format is a binary format for MMD animation data
 */
function delay(time:number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

export class VmdLoader {
    /**
     * Remove empty tracks for optimization when loading data
     */
    public optimizeEmptyTracks: boolean;

    /** @internal */
    public log: (message: string) => void;
    /** @internal */
    public warn: (message: string) => void;
    /** @internal */
    public error: (message: string) => void;

    /**
     * Create a new VmdLoader
     * @param scene Scene for loading file
     */
    public constructor() {
        this.optimizeEmptyTracks = true;
    }

    /**
     * Load MMD animation from VMD object
     *
     * If you put multiple motions, they are merged into one animation
     *
     * If two keyframes track and frame numbers are the same, the motion keyframe positioned later in the array is used
     * @param name Animation name
     * @param vmdObject VMD object or VMD object array
     * @param onLoad Callback function that is called when loading is complete
     * @param onProgress Callback function that is called while loading
     */
    public loadFromVmdObject(
        name: string,
        vmdObject: VmdObject | VmdObject[],
        onLoad: (animation: MmdAnimation) => void,
        onProgress?: (event: any) => void
    ): void {
        this.loadFromVmdObjectAsync(name, vmdObject, onProgress).then(onLoad);
    }

    /**
     * Load MMD animation from VMD object asynchronously
     *
     * If you put multiple motions, they are merged into one animation
     *
     * If two keyframes track and frame numbers are the same, the motion keyframe positioned later in the array is used
     * @param name Animation name
     * @param vmdObject VMD object or VMD object array
     * @param onProgress Callback function that is called while loading
     * @returns Animation data
     */
    public async loadFromVmdObjectAsync(
        name: string,
        vmdObject: VmdObject | VmdObject[],
        onProgress?: (event: any) => void
    ): Promise<MmdAnimation> {
        const optimizeEmptyTracks = this.optimizeEmptyTracks;

        if (!Array.isArray(vmdObject)) {
            vmdObject = [vmdObject];
        }

        let boneLoadCost = 0;
        let morphLoadCost = 0;
        let propertyLoadCost = 0;
        let cameraLoadCost = 0;
        for (let i = 0; i < vmdObject.length; ++i) {
            const vmdObjectItem = vmdObject[i];
            boneLoadCost += vmdObjectItem.boneKeyFrames.length;
            morphLoadCost += vmdObjectItem.morphKeyFrames.length;
            propertyLoadCost += vmdObjectItem.propertyKeyFrames.length;
            cameraLoadCost += vmdObjectItem.cameraKeyFrames.length;
        }

        const progressEvent = {
            lengthComputable: true,
            loaded: 0,
            total: boneLoadCost + morphLoadCost + propertyLoadCost + cameraLoadCost
        };

        let lastStageLoaded = 0;

        let time = performance.now();

        const boneTracks: MmdMovableBoneAnimationTrack[] = [];
        {
            const boneTrackIndexMap = new Map<string, number>();
            const boneTrackFrameCounts: number[] = [];
            const boneNames: string[] = [];

            const margedBoneKeyFrames: VmdObject.BoneKeyFrame[] = [];

            for (let i = 0; i < vmdObject.length; ++i) {
                const vmdObjectItem = vmdObject[i];
                const boneKeyFrames = vmdObjectItem.boneKeyFrames;

                const boneKeyFrameCount = boneKeyFrames.length;
                for (let i = 0; i < boneKeyFrameCount; ++i) {
                    margedBoneKeyFrames.push(boneKeyFrames.get(i));
                }
            }

            if (100 < performance.now() - time) {
                await delay(0);
                time = performance.now();
            }

            const margedBoneKeyFrameCount = margedBoneKeyFrames.length;
            for (let i = 0; i < margedBoneKeyFrameCount; ++i) {
                const boneKeyFrame = margedBoneKeyFrames[i];

                const boneName = boneKeyFrame.boneName;
                let boneTrackIndex = boneTrackIndexMap.get(boneName);
                if (boneTrackIndex === undefined) {
                    boneTrackIndex = boneTrackIndexMap.size;
                    boneTrackIndexMap.set(boneName, boneTrackIndex);

                    boneTrackFrameCounts.push(0);
                    boneNames.push(boneName);
                }

                boneTrackFrameCounts[boneTrackIndex] += 1;
            }

            margedBoneKeyFrames.sort((a, b) => a.frameNumber - b.frameNumber);

            for (let i = 0; i < boneTrackIndexMap.size; ++i) {
                boneTracks.push(new MmdMovableBoneAnimationTrack(boneNames[i], boneTrackFrameCounts[i]));
            }

            if (100 < performance.now() - time) {
                await delay(0);
                time = performance.now();
            }

            const trackLengths = new Uint32Array(boneTrackIndexMap.size);
            for (let i = 0; i < margedBoneKeyFrameCount; ++i) {
                const boneKeyFrame = margedBoneKeyFrames[i];
                const trackIndex = boneTrackIndexMap.get(boneKeyFrame.boneName)!;
                const boneTrack = boneTracks[trackIndex];
                const insertIndex = trackLengths[trackIndex];

                const boneKeyFrameInterpolation = boneKeyFrame.interpolation;


                boneTrack.frameNumbers[insertIndex] = boneKeyFrame.frameNumber;


                const boneTrackPositions = boneTrack.positions;
                const boneKeyFramePosition = boneKeyFrame.position;
                boneTrackPositions[insertIndex * 3 + 0] = boneKeyFramePosition[0];
                boneTrackPositions[insertIndex * 3 + 1] = boneKeyFramePosition[1];
                boneTrackPositions[insertIndex * 3 + 2] = boneKeyFramePosition[2];

                //interpolation import references: https://github.com/AiMiDi/C4D_MMD_Tool/blob/main/source/Utility.h#L302-L318
                const boneTrackPositionInterpolations = boneTrack.positionInterpolations;
                boneTrackPositionInterpolations[insertIndex * 12 + 0] = boneKeyFrameInterpolation[0 * 16 + 0];// x_x1
                boneTrackPositionInterpolations[insertIndex * 12 + 1] = boneKeyFrameInterpolation[0 * 16 + 8];// x_x2
                boneTrackPositionInterpolations[insertIndex * 12 + 2] = boneKeyFrameInterpolation[0 * 16 + 4];// x_y1
                boneTrackPositionInterpolations[insertIndex * 12 + 3] = boneKeyFrameInterpolation[0 * 16 + 12];// x_y2

                boneTrackPositionInterpolations[insertIndex * 12 + 4] = boneKeyFrameInterpolation[1 * 16 + 0];// y_x1
                boneTrackPositionInterpolations[insertIndex * 12 + 5] = boneKeyFrameInterpolation[1 * 16 + 8];// y_x2
                boneTrackPositionInterpolations[insertIndex * 12 + 6] = boneKeyFrameInterpolation[1 * 16 + 4];// y_y1
                boneTrackPositionInterpolations[insertIndex * 12 + 7] = boneKeyFrameInterpolation[1 * 16 + 12];// y_y2

                boneTrackPositionInterpolations[insertIndex * 12 + 8] = boneKeyFrameInterpolation[2 * 16 + 0];// z_x1
                boneTrackPositionInterpolations[insertIndex * 12 + 9] = boneKeyFrameInterpolation[2 * 16 + 8];// z_x2
                boneTrackPositionInterpolations[insertIndex * 12 + 10] = boneKeyFrameInterpolation[2 * 16 + 4];// z_y1
                boneTrackPositionInterpolations[insertIndex * 12 + 11] = boneKeyFrameInterpolation[2 * 16 + 12];// z_y2


                const boneTrackRotations = boneTrack.rotations;
                const boneKeyFrameRotation = boneKeyFrame.rotation;
                boneTrackRotations[insertIndex * 4 + 0] = boneKeyFrameRotation[0];
                boneTrackRotations[insertIndex * 4 + 1] = boneKeyFrameRotation[1];
                boneTrackRotations[insertIndex * 4 + 2] = boneKeyFrameRotation[2];
                boneTrackRotations[insertIndex * 4 + 3] = boneKeyFrameRotation[3];

                const boneTrackRotationInterpolations = boneTrack.rotationInterpolations;
                boneTrackRotationInterpolations[insertIndex * 4 + 0] = boneKeyFrameInterpolation[3 * 16 + 0];// x1
                boneTrackRotationInterpolations[insertIndex * 4 + 1] = boneKeyFrameInterpolation[3 * 16 + 8];// x2
                boneTrackRotationInterpolations[insertIndex * 4 + 2] = boneKeyFrameInterpolation[3 * 16 + 4];// y1
                boneTrackRotationInterpolations[insertIndex * 4 + 3] = boneKeyFrameInterpolation[3 * 16 + 12];// y2


                trackLengths[trackIndex] += 1;


                if (i % 1000 === 0 && 100 < performance.now() - time) {
                    progressEvent.loaded = lastStageLoaded + i;
                    onProgress?.({ ...progressEvent });

                    await delay(0);
                    time = performance.now();
                }
            }
        }
        const filteredBoneTracks: MmdBoneAnimationTrack[] = [];
        const filteredMovableBoneTracks: MmdMovableBoneAnimationTrack[] = [];
        if (optimizeEmptyTracks) {
            for (let i = 0; i < boneTracks.length; ++i) {
                const boneTrack = boneTracks[i];

                let isEmptyTrack = true;
                for (let j = 0; j < boneTrack.frameNumbers.length; ++j) {
                    const positions = boneTrack.positions;
                    if (!(positions[j * 3 + 0] === 0 && positions[j * 3 + 1] === 0 && positions[j * 3 + 2] === 0)) {
                        isEmptyTrack = false;
                        break;
                    }

                    const rotations = boneTrack.rotations;
                    if (!(rotations[j * 4 + 0] === 0 && rotations[j * 4 + 1] === 0 && rotations[j * 4 + 2] === 0 && rotations[j * 4 + 3] === 1)) {
                        isEmptyTrack = false;
                        break;
                    }
                }
                if (isEmptyTrack) continue;

                let isMovableBone = false;
                for (let j = 0; j < boneTrack.positions.length; ++j) {
                    if (boneTrack.positions[j] !== 0) {
                        isMovableBone = true;
                        break;
                    }
                }
                if (isMovableBone) {
                    filteredMovableBoneTracks.push(boneTrack);
                } else {
                    const boneAnimationTrack = new MmdBoneAnimationTrack(boneTrack.name, boneTrack.frameNumbers.length);
                    boneAnimationTrack.frameNumbers.set(boneTrack.frameNumbers);
                    boneAnimationTrack.rotations.set(boneTrack.rotations);
                    boneAnimationTrack.rotationInterpolations.set(boneTrack.rotationInterpolations);
                    filteredBoneTracks.push(boneAnimationTrack);
                }
            }
        } else {
            filteredMovableBoneTracks.push(...boneTracks);
        }
        boneTracks.length = 0;
        if (1 < vmdObject.length) {
            const boneTrackDuplicateResolvedLengths = new Int32Array(filteredBoneTracks.length).fill(-1);
            for (let i = 0; i < filteredBoneTracks.length; ++i) {
                const frameNumbers = filteredBoneTracks[i].frameNumbers;

                let duplicateResolvedLength = 0;
                let currentFrameNumber = frameNumbers[0];
                for (let j = 1; j <= frameNumbers.length; ++j) {
                    const nextFrameNumber = frameNumbers[j];
                    if (currentFrameNumber !== nextFrameNumber) {
                        duplicateResolvedLength += 1;
                        currentFrameNumber = nextFrameNumber;
                    }
                }

                if (frameNumbers.length !== duplicateResolvedLength) {
                    boneTrackDuplicateResolvedLengths[i] = duplicateResolvedLength;
                }
            }

            for (let i = 0; i < filteredBoneTracks.length; ++i) {
                const duplicateResolvedLength = boneTrackDuplicateResolvedLengths[i];
                if (duplicateResolvedLength === -1) continue;

                const boneTrack = filteredBoneTracks[i];
                const frameNumbers = boneTrack.frameNumbers;
                const rotations = boneTrack.rotations;
                const rotationInterpolations = boneTrack.rotationInterpolations;

                const newTrack = new MmdBoneAnimationTrack(boneTrack.name, duplicateResolvedLength);

                let insertIndex = 0;
                let currentFrameNumber = frameNumbers[0];
                for (let j = 1; j <= frameNumbers.length; ++j) {
                    const nextFrameNumber = frameNumbers[j];
                    if (currentFrameNumber !== nextFrameNumber) {
                        const currentIndex = j - 1;

                        newTrack.frameNumbers[insertIndex] = currentFrameNumber;

                        const newRotations = newTrack.rotations;
                        newRotations[insertIndex * 4 + 0] = rotations[currentIndex * 4 + 0];
                        newRotations[insertIndex * 4 + 1] = rotations[currentIndex * 4 + 1];
                        newRotations[insertIndex * 4 + 2] = rotations[currentIndex * 4 + 2];
                        newRotations[insertIndex * 4 + 3] = rotations[currentIndex * 4 + 3];

                        const newRotationInterpolations = newTrack.rotationInterpolations;
                        newRotationInterpolations[insertIndex * 4 + 0] = rotationInterpolations[currentIndex * 4 + 0];
                        newRotationInterpolations[insertIndex * 4 + 1] = rotationInterpolations[currentIndex * 4 + 1];
                        newRotationInterpolations[insertIndex * 4 + 2] = rotationInterpolations[currentIndex * 4 + 2];
                        newRotationInterpolations[insertIndex * 4 + 3] = rotationInterpolations[currentIndex * 4 + 3];

                        insertIndex += 1;
                        currentFrameNumber = nextFrameNumber;
                    }
                }

                filteredBoneTracks[i] = newTrack;
            }

            const movableBoneTrackDuplicateResolvedLengths = new Int32Array(filteredMovableBoneTracks.length).fill(-1);
            for (let i = 0; i < filteredMovableBoneTracks.length; ++i) {
                const frameNumbers = filteredMovableBoneTracks[i].frameNumbers;

                let duplicateResolvedLength = 0;
                let currentFrameNumber = frameNumbers[0];
                for (let j = 1; j <= frameNumbers.length; ++j) {
                    const nextFrameNumber = frameNumbers[j];
                    if (currentFrameNumber !== nextFrameNumber) {
                        duplicateResolvedLength += 1;
                        currentFrameNumber = nextFrameNumber;
                    }
                }

                if (frameNumbers.length !== duplicateResolvedLength) {
                    movableBoneTrackDuplicateResolvedLengths[i] = duplicateResolvedLength;
                }
            }

            for (let i = 0; i < filteredMovableBoneTracks.length; ++i) {
                const duplicateResolvedLength = movableBoneTrackDuplicateResolvedLengths[i];
                if (duplicateResolvedLength === -1) continue;

                const boneTrack = filteredMovableBoneTracks[i];
                const frameNumbers = boneTrack.frameNumbers;
                const positions = boneTrack.positions;
                const positionInterpolations = boneTrack.positionInterpolations;
                const rotations = boneTrack.rotations;
                const rotationInterpolations = boneTrack.rotationInterpolations;

                const newTrack = new MmdMovableBoneAnimationTrack(boneTrack.name, duplicateResolvedLength);

                let insertIndex = 0;
                let currentFrameNumber = frameNumbers[0];
                for (let j = 1; j <= frameNumbers.length; ++j) {
                    const nextFrameNumber = frameNumbers[j];
                    if (currentFrameNumber !== nextFrameNumber) {
                        const currentIndex = j - 1;

                        newTrack.frameNumbers[insertIndex] = currentFrameNumber;

                        const newPositions = newTrack.positions;
                        newPositions[insertIndex * 3 + 0] = positions[currentIndex * 3 + 0];
                        newPositions[insertIndex * 3 + 1] = positions[currentIndex * 3 + 1];
                        newPositions[insertIndex * 3 + 2] = positions[currentIndex * 3 + 2];

                        const newPositionInterpolations = newTrack.positionInterpolations;
                        newPositionInterpolations[insertIndex * 12 + 0] = positionInterpolations[currentIndex * 12 + 0];
                        newPositionInterpolations[insertIndex * 12 + 1] = positionInterpolations[currentIndex * 12 + 1];
                        newPositionInterpolations[insertIndex * 12 + 2] = positionInterpolations[currentIndex * 12 + 2];
                        newPositionInterpolations[insertIndex * 12 + 3] = positionInterpolations[currentIndex * 12 + 3];

                        newPositionInterpolations[insertIndex * 12 + 4] = positionInterpolations[currentIndex * 12 + 4];
                        newPositionInterpolations[insertIndex * 12 + 5] = positionInterpolations[currentIndex * 12 + 5];
                        newPositionInterpolations[insertIndex * 12 + 6] = positionInterpolations[currentIndex * 12 + 6];
                        newPositionInterpolations[insertIndex * 12 + 7] = positionInterpolations[currentIndex * 12 + 7];

                        newPositionInterpolations[insertIndex * 12 + 8] = positionInterpolations[currentIndex * 12 + 8];
                        newPositionInterpolations[insertIndex * 12 + 9] = positionInterpolations[currentIndex * 12 + 9];
                        newPositionInterpolations[insertIndex * 12 + 10] = positionInterpolations[currentIndex * 12 + 10];
                        newPositionInterpolations[insertIndex * 12 + 11] = positionInterpolations[currentIndex * 12 + 11];

                        const newRotations = newTrack.rotations;
                        newRotations[insertIndex * 4 + 0] = rotations[currentIndex * 4 + 0];
                        newRotations[insertIndex * 4 + 1] = rotations[currentIndex * 4 + 1];
                        newRotations[insertIndex * 4 + 2] = rotations[currentIndex * 4 + 2];
                        newRotations[insertIndex * 4 + 3] = rotations[currentIndex * 4 + 3];

                        const newRotationInterpolations = newTrack.rotationInterpolations;
                        newRotationInterpolations[insertIndex * 4 + 0] = rotationInterpolations[currentIndex * 4 + 0];
                        newRotationInterpolations[insertIndex * 4 + 1] = rotationInterpolations[currentIndex * 4 + 1];
                        newRotationInterpolations[insertIndex * 4 + 2] = rotationInterpolations[currentIndex * 4 + 2];
                        newRotationInterpolations[insertIndex * 4 + 3] = rotationInterpolations[currentIndex * 4 + 3];

                        insertIndex += 1;
                        currentFrameNumber = nextFrameNumber;
                    }
                }

                filteredMovableBoneTracks[i] = newTrack;
            }
        }

        progressEvent.loaded = lastStageLoaded + boneLoadCost;
        onProgress?.({ ...progressEvent });
        lastStageLoaded += boneLoadCost;

        const morphTracks: MmdMorphAnimationTrack[] = [];
        {
            const morphTrackIndexMap = new Map<string, number>();
            const morphTrackFrameCounts: number[] = [];
            const morphNames: string[] = [];

            const margedMorphKeyFrames: VmdObject.MorphKeyFrame[] = [];
            for (let i = 0; i < vmdObject.length; ++i) {
                const vmdObjectItem = vmdObject[i];
                const morphKeyFrames = vmdObjectItem.morphKeyFrames;

                const morphKeyFrameCount = morphKeyFrames.length;
                for (let i = 0; i < morphKeyFrameCount; ++i) {
                    margedMorphKeyFrames.push(morphKeyFrames.get(i));
                }
            }

            if (100 < performance.now() - time) {
                await delay(0);
                time = performance.now();
            }

            const margedMorphKeyFrameCount = margedMorphKeyFrames.length;
            for (let i = 0; i < margedMorphKeyFrameCount; ++i) {
                const morphKeyFrame = margedMorphKeyFrames[i];

                const morphName = morphKeyFrame.morphName;
                let morphTrackIndex = morphTrackIndexMap.get(morphName);
                if (morphTrackIndex === undefined) {
                    morphTrackIndex = morphTrackIndexMap.size;
                    morphTrackIndexMap.set(morphName, morphTrackIndex);

                    morphTrackFrameCounts.push(0);
                    morphNames.push(morphName);
                }

                morphTrackFrameCounts[morphTrackIndex] += 1;
            }

            margedMorphKeyFrames.sort((a, b) => a.frameNumber - b.frameNumber);

            for (let i = 0; i < morphTrackIndexMap.size; ++i) {
                morphTracks.push(new MmdMorphAnimationTrack(morphNames[i], morphTrackFrameCounts[i]));
            }

            if (100 < performance.now() - time) {
                await delay(0);
                time = performance.now();
            }

            const trackLengths = new Uint32Array(morphTrackIndexMap.size);
            for (let i = 0; i < margedMorphKeyFrameCount; ++i) {
                const morphKeyFrame = margedMorphKeyFrames[i];
                const trackIndex = morphTrackIndexMap.get(morphKeyFrame.morphName)!;
                const morphTrack = morphTracks[trackIndex];
                const insertIndex = trackLengths[trackIndex];

                morphTrack.frameNumbers[insertIndex] = morphKeyFrame.frameNumber;
                morphTrack.weights[insertIndex] = morphKeyFrame.weight;

                trackLengths[trackIndex] += 1;

                if (i % 1000 === 0 && 100 < performance.now() - time) {
                    progressEvent.loaded = lastStageLoaded + i;
                    onProgress?.({ ...progressEvent });

                    await delay(0);
                    time = performance.now();
                }
            }
        }
        const filteredMorphTracks: MmdMorphAnimationTrack[] = [];
        if (optimizeEmptyTracks) {
            for (let i = 0; i < morphTracks.length; ++i) {
                const morphTrack = morphTracks[i];
                let isZeroValues = true;
                for (let j = 0; j < morphTrack.weights.length; ++j) {
                    if (morphTrack.weights[j] !== 0) {
                        isZeroValues = false;
                        break;
                    }
                }
                if (isZeroValues) continue;
                filteredMorphTracks.push(morphTrack);
            }
        } else {
            filteredMorphTracks.push(...morphTracks);
        }
        morphTracks.length = 0;
        if (1 < vmdObject.length) {
            const morphTrackDuplicateResolvedLengths = new Int32Array(filteredMorphTracks.length).fill(-1);
            for (let i = 0; i < filteredMorphTracks.length; ++i) {
                const frameNumbers = filteredMorphTracks[i].frameNumbers;

                let duplicateResolvedLength = 0;
                let currentFrameNumber = frameNumbers[0];
                for (let j = 1; j <= frameNumbers.length; ++j) {
                    const nextFrameNumber = frameNumbers[j];
                    if (currentFrameNumber !== nextFrameNumber) {
                        duplicateResolvedLength += 1;
                        currentFrameNumber = nextFrameNumber;
                    }
                }

                if (frameNumbers.length !== duplicateResolvedLength) {
                    morphTrackDuplicateResolvedLengths[i] = duplicateResolvedLength;
                }
            }

            for (let i = 0; i < filteredMorphTracks.length; ++i) {
                const duplicateResolvedLength = morphTrackDuplicateResolvedLengths[i];
                if (duplicateResolvedLength === -1) continue;

                const morphTrack = filteredMorphTracks[i];
                const frameNumbers = morphTrack.frameNumbers;
                const weights = morphTrack.weights;

                const newTrack = new MmdMorphAnimationTrack(morphTrack.name, duplicateResolvedLength);

                let insertIndex = 0;
                let currentFrameNumber = frameNumbers[0];
                for (let j = 1; j <= frameNumbers.length; ++j) {
                    const nextFrameNumber = frameNumbers[j];
                    if (currentFrameNumber !== nextFrameNumber) {
                        newTrack.frameNumbers[insertIndex] = currentFrameNumber;
                        newTrack.weights[insertIndex] = weights[j - 1];

                        insertIndex += 1;
                        currentFrameNumber = nextFrameNumber;
                    }
                }

                filteredMorphTracks[i] = newTrack;
            }
        }

        progressEvent.loaded = lastStageLoaded + morphLoadCost;
        onProgress?.({ ...progressEvent });
        lastStageLoaded += morphLoadCost;

        const margedPropertyKeyFrames: VmdObject.PropertyKeyFrame[] = [];
        for (let i = 0; i < vmdObject.length; ++i) {
            const vmdObjectItem = vmdObject[i];
            const propertyKeyFrames = vmdObjectItem.propertyKeyFrames;
            for (let i = 0; i < propertyKeyFrames.length; ++i) {
                margedPropertyKeyFrames.push(propertyKeyFrames[i]);
            }
        }
        margedPropertyKeyFrames.sort((a, b) => a.frameNumber - b.frameNumber);

        let duplicateResolvedPropertyKeyFrames: VmdObject.PropertyKeyFrame[];
        {
            if (1 < vmdObject.length) duplicateResolvedPropertyKeyFrames = margedPropertyKeyFrames;
            else {
                duplicateResolvedPropertyKeyFrames = [];

                let currentFrameNumber = margedPropertyKeyFrames[0]?.frameNumber;
                for (let i = 1; i <= margedPropertyKeyFrames.length; ++i) {
                    const nextFrameNumber = margedPropertyKeyFrames[i]?.frameNumber;
                    if (currentFrameNumber !== nextFrameNumber) {
                        duplicateResolvedPropertyKeyFrames.push(margedPropertyKeyFrames[i - 1]);
                        currentFrameNumber = nextFrameNumber;
                    }
                }
            }
        }

        const ikStates = new Set<string>();
        for (let i = 0; i < vmdObject.length; ++i) {
            const vmdObjectItem = vmdObject[i];
            const propertyKeyFrames = vmdObjectItem.propertyKeyFrames;
            for (let i = 0; i < propertyKeyFrames.length; ++i) {
                const propertyKeyFrame = propertyKeyFrames[i];
                for (let j = 0; j < propertyKeyFrame.ikStates.length; ++j) {
                    ikStates.add(propertyKeyFrame.ikStates[j][0]);
                }
            }
        }

        const ikBoneNames: string[] = new Array(ikStates.size);
        const ikboneIndexMap: Map<string, number> = new Map();
        {
            let ikStateIndex = 0;
            for (const ikState of ikStates) {
                ikboneIndexMap.set(ikState, ikStateIndex);

                ikBoneNames[ikStateIndex] = ikState;
                ikStateIndex += 1;
            }
        }

        const propertyTrack = new MmdPropertyAnimationTrack(duplicateResolvedPropertyKeyFrames.length, ikBoneNames);
        {
            const keyExistsCheckArray = new Uint8Array(ikStates.size);

            for (let i = 0; i < duplicateResolvedPropertyKeyFrames.length; ++i) {
                const propertyKeyFrame = duplicateResolvedPropertyKeyFrames[i];

                propertyTrack.frameNumbers[i] = propertyKeyFrame.frameNumber;
                propertyTrack.visibles[i] = propertyKeyFrame.visible ? 1 : 0;

                const propertyKeyFrameIkStates = propertyKeyFrame.ikStates;

                keyExistsCheckArray.fill(0);
                for (let j = 0; j < propertyKeyFrameIkStates.length; ++j) {
                    const ikState = propertyKeyFrameIkStates[j];
                    const boneIndex = ikboneIndexMap.get(ikState[0])!;
                    propertyTrack.getIkState(boneIndex)[i] = ikState[1] ? 1 : 0;

                    keyExistsCheckArray[boneIndex] = 1;
                }

                for (let j = 0; j < keyExistsCheckArray.length; ++j) {
                    if (keyExistsCheckArray[j] === 0) {
                        const previousValue = propertyTrack.getIkState(j)[i - 1];
                        propertyTrack.getIkState(j)[i] = previousValue === undefined ? 0 : previousValue;
                    }
                }
            }
        }

        progressEvent.loaded = lastStageLoaded + propertyLoadCost;
        onProgress?.({ ...progressEvent });
        lastStageLoaded += propertyLoadCost;

        const margedCameraKeyFrames: VmdObject.CameraKeyFrame[] = [];
        for (let i = 0; i < vmdObject.length; ++i) {
            const vmdObjectItem = vmdObject[i];
            const cameraKeyFrames = vmdObjectItem.cameraKeyFrames;
            for (let i = 0; i < cameraKeyFrames.length; ++i) {
                margedCameraKeyFrames.push(cameraKeyFrames.get(i));
            }
        }
        margedCameraKeyFrames.sort((a, b) => a.frameNumber - b.frameNumber);

        let duplicateResolvedCameraKeyFrames: VmdObject.CameraKeyFrame[];
        {
            if (1 < vmdObject.length) duplicateResolvedCameraKeyFrames = margedCameraKeyFrames;
            else {
                duplicateResolvedCameraKeyFrames = [];

                let currentFrameNumber = margedCameraKeyFrames[0]?.frameNumber;
                for (let i = 1; i <= margedCameraKeyFrames.length; ++i) {
                    const nextFrameNumber = margedCameraKeyFrames[i]?.frameNumber;
                    if (currentFrameNumber !== nextFrameNumber) {
                        duplicateResolvedCameraKeyFrames.push(margedCameraKeyFrames[i - 1]);
                        currentFrameNumber = nextFrameNumber;
                    }
                }
            }
        }

        const cameraTrack = new MmdCameraAnimationTrack(duplicateResolvedCameraKeyFrames.length);
        for (let i = 0; i < duplicateResolvedCameraKeyFrames.length; ++i) {
            const cameraKeyFrame = duplicateResolvedCameraKeyFrames[i];
            const cameraKeyFrameInterpolation = cameraKeyFrame.interpolation;


            cameraTrack.frameNumbers[i] = cameraKeyFrame.frameNumber;


            const cameraTrackPositions = cameraTrack.positions;
            const cameraKeyFramePosition = cameraKeyFrame.position;
            cameraTrackPositions[i * 3 + 0] = cameraKeyFramePosition[0];
            cameraTrackPositions[i * 3 + 1] = cameraKeyFramePosition[1];
            cameraTrackPositions[i * 3 + 2] = cameraKeyFramePosition[2];

            const cameraTrackPositionInterpolations = cameraTrack.positionInterpolations;
            cameraTrackPositionInterpolations[i * 12 + 0] = cameraKeyFrameInterpolation[0];// x_x1
            cameraTrackPositionInterpolations[i * 12 + 1] = cameraKeyFrameInterpolation[1];// x_x2
            cameraTrackPositionInterpolations[i * 12 + 2] = cameraKeyFrameInterpolation[2];// x_y1
            cameraTrackPositionInterpolations[i * 12 + 3] = cameraKeyFrameInterpolation[3];// x_y2

            cameraTrackPositionInterpolations[i * 12 + 4] = cameraKeyFrameInterpolation[4];// y_x1
            cameraTrackPositionInterpolations[i * 12 + 5] = cameraKeyFrameInterpolation[5];// y_x2
            cameraTrackPositionInterpolations[i * 12 + 6] = cameraKeyFrameInterpolation[6];// y_y1
            cameraTrackPositionInterpolations[i * 12 + 7] = cameraKeyFrameInterpolation[7];// y_y2

            cameraTrackPositionInterpolations[i * 12 + 8] = cameraKeyFrameInterpolation[8];// z_x1
            cameraTrackPositionInterpolations[i * 12 + 9] = cameraKeyFrameInterpolation[9];// z_x2
            cameraTrackPositionInterpolations[i * 12 + 10] = cameraKeyFrameInterpolation[10];// z_y1
            cameraTrackPositionInterpolations[i * 12 + 11] = cameraKeyFrameInterpolation[11];// z_y2


            const cameraTrackRotations = cameraTrack.rotations;
            const cameraKeyFrameRotation = cameraKeyFrame.rotation;
            cameraTrackRotations[i * 3 + 0] = cameraKeyFrameRotation[0];
            cameraTrackRotations[i * 3 + 1] = cameraKeyFrameRotation[1];
            cameraTrackRotations[i * 3 + 2] = cameraKeyFrameRotation[2];

            const cameraTrackRotationInterpolations = cameraTrack.rotationInterpolations;
            cameraTrackRotationInterpolations[i * 4 + 0] = cameraKeyFrameInterpolation[12];// x1
            cameraTrackRotationInterpolations[i * 4 + 1] = cameraKeyFrameInterpolation[13];// x2
            cameraTrackRotationInterpolations[i * 4 + 2] = cameraKeyFrameInterpolation[14];// y1
            cameraTrackRotationInterpolations[i * 4 + 3] = cameraKeyFrameInterpolation[15];// y2


            cameraTrack.distances[i] = cameraKeyFrame.distance;

            const cameraTrackDistancesInterpolations = cameraTrack.distanceInterpolations;
            cameraTrackDistancesInterpolations[i * 4 + 0] = cameraKeyFrameInterpolation[16];// x1
            cameraTrackDistancesInterpolations[i * 4 + 1] = cameraKeyFrameInterpolation[17];// x2
            cameraTrackDistancesInterpolations[i * 4 + 2] = cameraKeyFrameInterpolation[18];// y1
            cameraTrackDistancesInterpolations[i * 4 + 3] = cameraKeyFrameInterpolation[19];// y2


            cameraTrack.fovs[i] = cameraKeyFrame.fov;

            const cameraTrackFovInterpolations = cameraTrack.fovInterpolations;
            cameraTrackFovInterpolations[i * 4 + 0] = cameraKeyFrameInterpolation[20];// x1
            cameraTrackFovInterpolations[i * 4 + 1] = cameraKeyFrameInterpolation[21];// x2
            cameraTrackFovInterpolations[i * 4 + 2] = cameraKeyFrameInterpolation[22];// y1
            cameraTrackFovInterpolations[i * 4 + 3] = cameraKeyFrameInterpolation[23];// y2


            if (i % 1000 === 0 && 100 < performance.now() - time) {
                progressEvent.loaded = lastStageLoaded + i;
                onProgress?.({ ...progressEvent });

                await delay(0);
                time = performance.now();
            }
        }

        progressEvent.loaded = lastStageLoaded + cameraLoadCost;
        onProgress?.({ ...progressEvent });
        lastStageLoaded += cameraLoadCost;

        return new MmdAnimation(name, filteredBoneTracks, filteredMovableBoneTracks, filteredMorphTracks, propertyTrack, cameraTrack);
    }

    /**
     * Load MMD animation data from VMD data
     *
     * If you put multiple motions, they are merged into one animation
     *
     * If two keyframes track and frame numbers are the same, the motion keyframe positioned later in the array is used
     * @param name Animation name
     * @param vmdData VMD data or array of VMD data
     * @param onLoad Callback function that is called when load is complete
     * @param onProgress Callback function that is called while loading
     */
    public loadFromVmdData(
        name: string,
        vmdData: VmdData | VmdData[],
        onLoad: (animation: MmdAnimation) => void,
        onProgress?: (event: any) => void
    ): void {
        if (!Array.isArray(vmdData)) {
            vmdData = [vmdData];
        }

        const vmdObjects: VmdObject[] = [];
        for (let i = 0; i < vmdData.length; ++i) {
            vmdObjects.push(VmdObject.Parse(vmdData[i]));
        }
        this.loadFromVmdObject(name, vmdObjects, onLoad, onProgress);
    }

    /**
     * Load MMD animation data from VMD data asynchronously
     *
     * If you put multiple motions, they are merged into one animation
     *
     * If two keyframes track and frame numbers are the same, the motion keyframe positioned later in the array is used
     * @param name Animation name
     * @param vmdData VMD data or array of VMD data
     * @param onProgress Callback function that is called while loading
     * @returns Animation data
     */
    public loadFromVmdDataAsync(
        name: string,
        vmdData: VmdData | VmdData[],
        onProgress?: (event: any) => void
    ): Promise<MmdAnimation> {
        return new Promise<MmdAnimation>((resolve) => {
            this.loadFromVmdData(name, vmdData, resolve, onProgress);
        });
    }

    /**
     * Load MMD animation data from VMD array buffer
     *
     * If you put multiple motions, they are merged into one animation
     *
     * If two keyframes track and frame numbers are the same, the motion keyframe positioned later in the array is used
     * @param name Animation name
     * @param buffer VMD array buffer or array of VMD array buffer
     * @param onLoad Callback function that is called when load is complete
     * @param onProgress Callback function that is called while loading
     * @param onError Callback function that is called when loading is failed
     */
    public loadFromBuffer(
        name: string,
        buffer: ArrayBufferLike | ArrayBufferLike[],
        onLoad: (animation: MmdAnimation) => void,
        onProgress?: (event: any) => void,
        onError?: (event: Error) => void
    ): void {
        if (!Array.isArray(buffer)) {
            buffer = [buffer];
        }

        const vmdData: VmdData[] = [];
        for (let i = 0; i < buffer.length; ++i) {
            const vmdDatum = VmdData.CheckedCreate(buffer[i]);
            if (vmdDatum === null) {
                onError?.(new Error("VMD data validation failed."));
                return;
            }
            vmdData.push(vmdDatum);
        }
        this.loadFromVmdData(name, vmdData, onLoad, onProgress);
    }

    /**
     * Load MMD animation data from VMD array buffer asynchronously
     *
     * If you put multiple motions, they are merged into one animation
     *
     * If two keyframes track and frame numbers are the same, the motion keyframe positioned later in the array is used
     * @param name Animation name
     * @param buffer VMD array buffer or array of VMD array buffer
     * @param onProgress Callback function that is called while loading
     * @returns Animation data
     */
    public loadFromBufferAsync(
        name: string,
        buffer: ArrayBufferLike | ArrayBufferLike[],
        onProgress?: (event: any) => void
    ): Promise<MmdAnimation> {
        return new Promise<MmdAnimation>((resolve, reject) => {
            this.loadFromBuffer(name, buffer, resolve, onProgress, reject);
        });
    }

}
