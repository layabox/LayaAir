export class BPArray<T>{
    length: number;

    static getItem<T>(arr: Array<T>, index: number): T {
        [].push
        return arr[index];
    }

    push(item: T): number {
        return 0;
    }

    pop(): T {
        return null;
    }
}
BPArray.prototype.push = Array.prototype.push;
BPArray.prototype.pop = Array.prototype.pop;