
import {ILaya} from "ILaya"
import { Handler } from "laya/utils/Handler";

export function delay(duration:number) {
    return new Promise(resolve=>{
        setTimeout(function(){
            resolve();
        }, duration)
    });
};


export function loadRes(url:string){
    return new Promise(resolve=>{
        ILaya.loader.load(url, Handler.create(this,()=>{
            console.log('kkkk')
            resolve();}));
    });
}