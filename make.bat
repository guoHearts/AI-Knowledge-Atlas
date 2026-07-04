@echo off
REM ============================================================================
REM AI Developer Training Platform — Windows make wrapper
REM Ensures GNU Make is on PATH before executing Makefile
REM ============================================================================
set "PATH=C:\Program Files (x86)\GnuWin32\bin;%PATH%"
make %*
