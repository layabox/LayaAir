/**
 * @internal
 */
export class BatchMark {
    constructor() {
        /**@internal */
        this.updateMark = -1;
        /**@internal */
        this.indexInList = -1;
        /**@internal */
        this.batched = false;
    }
}
