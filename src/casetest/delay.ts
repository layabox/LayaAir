import { Laya } from 'Laya';

export function delay(duration: number) {
    return new Promise<void>(resolve => {
        setTimeout(function () {
            resolve();
        }, duration)
    });
};


export function loadRes(url: string) {
    return Laya.loader.load(url);
}