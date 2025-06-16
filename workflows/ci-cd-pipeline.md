---
entrypoint: true
title: "CI/CD Pipeline"
description: "Main build and deployment workflow"
---

# CI/CD Pipeline

This workflow guides you through a complete CI/CD process with branching logic for different scenarios.

## Step 1: Check Prerequisites

First, check if you have a Makefile in your project:
- If Makefile exists → Continue to @compile-using-makefile@
- If no Makefile but package.json exists → Continue to @npm-build@
- Otherwise → Continue to @manual-build@

## Next Steps

Based on your project structure, follow one of these paths:
- @compile-using-makefile@
- @npm-build@  
- @manual-build@