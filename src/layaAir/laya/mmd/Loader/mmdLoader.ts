import { Loader } from "../../net/Loader";
import { PmdLoader } from "./pmdLoader";
import { PmxLoader } from "./pmxLoader";
import { VmdLoader } from "./vmdLoader";


Loader.registerLoader(["pmx"], PmxLoader, Loader.HIERARCHY);
Loader.registerLoader(["pmd"], PmdLoader, Loader.HIERARCHY);
Loader.registerLoader(["vmd"], VmdLoader, Loader.ANIMATIONCLIP);