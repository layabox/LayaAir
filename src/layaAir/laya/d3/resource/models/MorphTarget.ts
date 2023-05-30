
export class MorphTarget {

    /** @internal */
    _index: number;

    name: string;

    fullWeight: number;

    data: Float32Array;

    constructor() {
        this.fullWeight = 1;
    }

}

// todo class name
export class MorphTargetChannel {

    /** @internal */
    _index: number;

    name: string;

    /**
     * @internal
     */
    targets: Array<MorphTarget>;

    targetCount: number = 0;

    constructor() {
        this.targets = new Array<MorphTarget>();
    }

    getTargetByIndex(index: number) {
        return this.targets[index];
    }

    addTarget(target: MorphTarget) {
        this.targetCount++;
        this.targets.push(target);
        this.targets.sort((a, b) => {
            return a.fullWeight - b.fullWeight;
        })
    }

}