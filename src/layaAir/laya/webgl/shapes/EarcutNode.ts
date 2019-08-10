export class EarcutNode {
    i: any;
    x: any;
    y: any;
    prev: any;
    next: any;
    z: any;
    prevZ: any;
    nextZ: any;
    steiner: any;
    constructor(i: any, x: any, y: any) {
        // vertice index in coordinates array
        this.i = i;

        // vertex coordinates
        this.x = x;
        this.y = y;

        // previous and next vertice nodes in a polygon ring
        this.prev = null;
        this.next = null;

        // z-order curve value
        this.z = null;

        // previous and next nodes in z-order
        this.prevZ = null;
        this.nextZ = null;

        // indicates whether this is a steiner point
        this.steiner = false;
    }
}



