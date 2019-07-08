
import { Handler } from "laya/utils/Handler";
import { Laya } from 'Laya';

export function delay(duration:number) {
    return new Promise(resolve=>{
        setTimeout(function(){
            resolve();
        }, duration)
    });
};


export function loadRes(url:string){
    return new Promise(resolve=>{
        Laya.loader.load(url, Handler.create(this,()=>{
            resolve();}));
    });
}