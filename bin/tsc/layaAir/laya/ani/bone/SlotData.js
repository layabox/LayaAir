export class SlotData {
    constructor() {
        this.displayArr = [];
    }
    getDisplayByName(name) {
        var tDisplay;
        for (var i = 0, n = this.displayArr.length; i < n; i++) {
            tDisplay = this.displayArr[i];
            if (tDisplay.attachmentName == name) {
                return i;
            }
        }
        return -1;
    }
}
