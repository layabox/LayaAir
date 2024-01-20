import { BlueprintRuntimeBaseNode } from "./BlueprintRuntimeBaseNode";

export class BluePrintAsNode extends BlueprintRuntimeBaseNode {

    optimize() {
        let out = this.outPutParmPins[0];
        let insert = this.inPutParmPins[0];

        let pre = insert.linkTo[0];

        if (pre) {
            out.linkTo.forEach(value => {
                let index = value.linkTo.indexOf(out);
                value.linkTo[index] = pre;

                let indexnew = pre.linkTo.indexOf(value);
                if (indexnew != -1) {
                    pre.linkTo[indexnew] = value;
                }
                else {
                    pre.linkTo.push(value);
                }
            })
            let index = pre.linkTo.indexOf(insert);
            pre.linkTo.splice(index, 1);
        }
    }

}