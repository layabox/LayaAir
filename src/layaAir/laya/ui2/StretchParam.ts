export class StretchParam {
    ratio: number = 0;
    priority: number = 0;
    min: number = 0;
    max: number = 0;
    fixed: boolean;

    setRatio(value: number) {
        this.ratio = value;
        return this;
    }

    setPriority(value: number) {
        this.priority = value;
        return this;
    }

    setLimit(min: number, max: number) {
        this.min = min;
        this.max = max;
        return this;
    }

    setFixed() {
        this.fixed = true;
        return this;
    }
}