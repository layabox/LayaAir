export class BPArray<T>{
    length: number;

    static getItem<T>(arr: Array<T>, index: number): T {
        return arr[index];
    }

    static setItem<T>(arr: Array<T>, index: number, value: T): void {
        arr[index] = value;
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