@echo off
if exist .\doc (
    rmdir /s/q .\doc
)

node typedoc.js
gulp buildAPI
@pause