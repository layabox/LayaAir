import { IHierarchy } from "./interface/IHierarchy";

/**
 * 
 * @ brief: MDHierarchy
 * @ author: zyh
 * @ data: 2024-09-12 20:20
 */
export class MDHierarchy implements IHierarchy {
    parent: string;
    className: string;
    extends: string[];

    toString(): string {
        let str = `#### Hierarchy\n\n`;
        str += `- ${this.parent}\n`;
        str += `  - ${this.className}\n`;
        if (this.extends.length === 0) {
            str += '\n';
        } else {
            this.extends.forEach((element) => {
                str += `    - ${element}\n`;
            });
        }
        return str + '\n';
    }
}