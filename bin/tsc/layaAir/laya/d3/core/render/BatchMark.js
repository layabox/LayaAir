/**
 * @private
 */
export class BatchMark {
    constructor() {
        /**@private */
        this.updateMark = -1;
        /**@private */
        this.indexInList = -1;
        /**@private */
        this.batched = false;
    }
}
