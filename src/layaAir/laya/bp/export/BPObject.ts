export class BPObject<T>{
    
    static getItem<T>(arr:Record<string,T>, key: string): T {
        return arr[key];
    }

    static setItem<T>(arr:Record<string,T>, key: string, value: T): void {
        arr[key] = value;
    }
}