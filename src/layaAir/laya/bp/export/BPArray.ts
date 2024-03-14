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

    splice(start: number, deleteCount?: number):T {
        return null;
    }

    shift():T{
        return null;
    }


    unshift(item: T):T{
        return null;
    }

    join(separator?: string):string{
        return "";
    }

    concat(item: ConcatArray<T>):T{
        return null;
    }

}
BPArray.prototype.push = Array.prototype.push;
BPArray.prototype.pop = Array.prototype.pop;
BPArray.prototype.splice = Array.prototype.splice;
BPArray.prototype.shift = Array.prototype.shift;
BPArray.prototype.unshift = Array.prototype.unshift;
BPArray.prototype.join = Array.prototype.join;
BPArray.prototype.concat = Array.prototype.concat;