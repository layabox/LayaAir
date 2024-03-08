import test from "./simple1"
import { usewebgl } from "./utils";

let testfile = window.location.search.substring(1);
async function testf(){
    usewebgl();
    await import('./'+testfile);

}
export class LayaTest{
    static test(){
        testf()
    }
}