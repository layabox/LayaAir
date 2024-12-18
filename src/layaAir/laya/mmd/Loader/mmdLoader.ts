import { Loader } from "../../net/Loader";
import { PmdLoader } from "./pmdLoader";
import { PmxLoader } from "./pmxLoader";


Loader.registerLoader(["pmx"], PmxLoader, Loader.MESH);
Loader.registerLoader(["pmd"], PmdLoader, Loader.MESH);