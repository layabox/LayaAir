@echo off
set curr_dir=%cd%
chdir /D "%~dp0"

node .\typedoc --mode modules --excludePrivate --excludeProtected --hideGenerator --module commonjs --target ES6 --tsconfig ../layaAir/tsconfig.json --includes ../layaAir --name zqx --theme default --out doc\ --ignoreCompilerErrors

chdir /D "%curr_dir%"
@pause