
import { Laya } from "../layaAir/Laya";
//import test from "./simple1"
import { usewebgl } from "./utils"

let testfile = window.location.search.substring(1);
async function testf(){
    usewebgl();
    (window as any).Laya=Laya;
    //@ts-ignore
    await import('./cases/2d/'+testfile);

}

testf();