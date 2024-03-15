export class BPObject<T>{
    
    static getItem<T>(obj:Record<string,T>, key: string): T {
        return obj[key];
    }

    static setItem<T>(obj:Record<string,T>, key: string, value: T): void {
        obj[key] = value;
    }
}