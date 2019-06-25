/**
 * @private
 */
export class DeformSlotDisplayData {
    //TODO:coverage
    constructor() {
        this.slotIndex = -1;
        this.timeList = [];
        this.vectices = [];
        this.tweenKeyList = [];
        this.frameIndex = 0;
    }
    binarySearch1(values, target) {
        var low = 0;
        var high = values.length - 2;
        if (high == 0)
            return 1;
        var current = high >>> 1;
        while (true) {
            if (values[Math.floor(current + 1)] <= target)
                low = current + 1;
            else
                high = current;
            if (low == high)
                return low + 1;
            current = (low + high) >>> 1;
        }
        return 0; // Can't happen.
    }
    //TODO:coverage
    apply(time, boneSlot, alpha = 1) {
        time += 0.05;
        if (this.timeList.length <= 0) {
            return;
        }
        var i = 0;
        var n = 0;
        var tTime = this.timeList[0];
        if (time < tTime) {
            return;
        }
        var tVertexCount = this.vectices[0].length;
        var tVertices = [];
        var tFrameIndex = this.binarySearch1(this.timeList, time);
        this.frameIndex = tFrameIndex;
        if (time >= this.timeList[this.timeList.length - 1]) {
            var lastVertices = this.vectices[this.vectices.length - 1];
            if (alpha < 1) {
                for (i = 0; i < tVertexCount; i++) {
                    tVertices[i] += (lastVertices[i] - tVertices[i]) * alpha;
                }
            }
            else {
                for (i = 0; i < tVertexCount; i++) {
                    tVertices[i] = lastVertices[i];
                }
            }
            this.deformData = tVertices;
            return;
        }
        var tTweenKey = this.tweenKeyList[this.frameIndex];
        var tPrevVertices = this.vectices[this.frameIndex - 1];
        var tNextVertices = this.vectices[this.frameIndex];
        var tPreFrameTime = this.timeList[this.frameIndex - 1];
        var tFrameTime = this.timeList[this.frameIndex];
        if (this.tweenKeyList[tFrameIndex - 1]) {
            alpha = (time - tPreFrameTime) / (tFrameTime - tPreFrameTime);
        }
        else {
            alpha = 0;
        }
        var tPrev;
        for (i = 0; i < tVertexCount; i++) {
            tPrev = tPrevVertices[i];
            tVertices[i] = tPrev + (tNextVertices[i] - tPrev) * alpha;
        }
        this.deformData = tVertices;
    }
}
