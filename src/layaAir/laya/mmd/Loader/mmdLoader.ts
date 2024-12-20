import { Loader } from "../../net/Loader";
import { PmdLoader } from "./pmdLoader";
import { PmxLoader } from "./pmxLoader";
import { VmdLoader } from "./vmdLoader";


Loader.registerLoader(["pmx"], PmxLoader, Loader.MESH);
Loader.registerLoader(["pmd"], PmdLoader, Loader.MESH);
Loader.registerLoader(["vmd"], VmdLoader, Loader.ANIMATIONCLIP);