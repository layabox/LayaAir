import { VertexStream } from "../../utils/VertexStream";

export interface IMeshFactory {
    onPopulateMesh(vb: VertexStream): void;
}