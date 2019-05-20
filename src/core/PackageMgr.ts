
export function regClassToEngine(name:string, cls:any){
    var laya:any = (window as any).Laya ||((window as any).Laya={});
    laya[name]=cls;
}