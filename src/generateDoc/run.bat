@echo off
if exist .\out (
    rmdir /s/q .\out
)


if exist .\doc (
    rmdir /s/q .\doc
)

node typedoc.js
gulp buildAPI
@pause