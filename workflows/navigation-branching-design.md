---
title: "Navigation & Branching Design"
description: "Implementing step references and branching logic for workflow navigation"
---

# Navigation & Branching Design Phase

Transform your workflow structure and content into a navigable system with proper step references and branching logic. This is where your workflow becomes truly interactive and intelligent.

## Step Reference System

**Step ID Convention**
- Use descriptive, kebab-case identifiers: `analyze-requirements`, `fix-build-errors`
- Match filename without .md extension: `analyze-requirements.md` → `analyze-requirements`
- Keep IDs stable - changing them breaks references from other workflows

**Reference Format**
- Always use `@step-id@` format in content
- Example: "If tests pass → Continue to `@commit-changes@`"
- The workflow engine automatically extracts these references
- **Important**: References enclosed in backticks (like `@example@`) are treated as documentation examples and are NOT interpreted as navigation links
- Only use backticks around step references when showing examples - actual navigation must use @step-id@ without backticks

**Reference Types**
```
Direct Reference: @next-step@
Conditional Reference: "If X condition → Continue to `@step-a@`"
Alternative Reference: "Otherwise → Continue to `@step-b@`" 
Error Reference: "If this fails → Go to `@error-handler@`"
```

## Branching Logic Patterns

### 1. Binary Decision Points
```markdown
## Next Steps

**If condition is true** → Continue to `@success-path@`
**If condition is false** → Continue to `@alternative-path@`
```

### 2. Multi-Way Branching
```markdown
## Next Steps

**If score > 80** → Continue to `@excellent-outcome@`
**If score 60-80** → Continue to `@good-outcome@`
**If score 40-60** → Continue to `@needs-improvement@`
**If score < 40** → Continue to `@requires-rework@`
```

### 3. Conditional with Default
```markdown
## Next Steps

**If integration tests available** → Continue to `@run-integration-tests@`
**If performance issues detected** → Continue to `@optimize-performance@`
**Otherwise (standard case)** → Continue to `@deploy-to-staging@`
```

### 4. Error Handling Pattern
```markdown
## Next Steps

**If step completed successfully** → Continue to `@next-normal-step@`
**If recoverable error occurred** → Continue to `@retry-with-fixes@`
**If critical error occurred** → Continue to `@escalate-issue@`
```

### 5. Parallel Processing
```markdown
## Next Steps

Complete these steps in parallel:
- Code review → `@perform-code-review@`
- Automated testing → `@run-automated-tests@`
- Documentation update → `@update-documentation@`

When all parallel steps complete → Continue to `@merge-changes@`
```

## Decision Criteria Best Practices

**Make Conditions Mutually Exclusive**
```
❌ Bad:
- If tests pass → `@deploy@`
- If code is clean → `@deploy@`

✅ Good:
- If tests pass AND code quality checks pass → `@deploy@`
- If tests pass BUT code quality fails → `@fix-quality-issues@`
- If tests fail → `@debug-test-failures@`
```

**Use Objective, Measurable Criteria**
```
❌ Bad: "If the code looks good"
✅ Good: "If all linting rules pass and test coverage > 80%"

❌ Bad: "If there are too many errors"
✅ Good: "If error count > 10"
```

**Provide Exhaustive Coverage**
```
❌ Bad: Only covers success case
✅ Good: Covers success, partial success, failure, and edge cases
```

**Include Context for Complex Decisions**
```
✅ Good: "If deployment is to production (determined by branch name 'main' or 'release/*') → `@production-deployment@`"
```

## Advanced Branching Techniques

### State-Based Branching
Track workflow state across steps:
```markdown
**If this is first attempt** → Continue to `@initial-approach@`
**If this is retry after failure** → Continue to `@alternative-approach@`
**If maximum retries exceeded** → Continue to `@escalation@`
```

### Context-Aware Branching
Use external context for decisions:
```markdown
**If environment = development** → Continue to `@dev-specific-tests@`
**If environment = staging** → Continue to `@staging-validation@`
**If environment = production** → Continue to `@production-checks@`
```

### Aggregation Points
Collect results from multiple paths:
```markdown
# Results Aggregation Step
This step collects outcomes from parallel processing branches.

**If all branches succeeded** → Continue to `@final-integration@`
**If any branch failed** → Continue to `@handle-partial-failure@`
```

## Navigation Flow Validation

**Check Reference Integrity**
- Every `@step-id@` reference points to an existing step file
- Step IDs match their filename (without .md)
- No circular references that could cause infinite loops

**⚠️ Important**: Use the workflow management tools to validate references:
- `workflow_find_invalid_links` - catches broken step references before they cause problems
- `workflow_find_orphans` - identifies unreachable steps that may indicate structural issues

**Validate Decision Logic**
- All possible conditions are covered
- Conditions are mutually exclusive where appropriate
- Default/fallback paths exist for edge cases

**Test Path Coverage**
- Every step can be reached from an entrypoint
- No orphaned steps (unless intentionally designed)
- Error paths lead to resolution or proper termination

## Success Criteria for This Step

✅ **Complete when you have:**
- All step references use proper `@step-id@` format
- Every referenced step exists as a file
- All branching conditions are specific and measurable
- Decision logic covers all possible scenarios
- No circular references or infinite loops
- Error paths lead to resolution or proper escalation

## Next Steps

**If all references are valid and branching logic is complete** → Continue to @testing-validation@

**If some references are broken** → Fix missing step files or correct step IDs, then return to validation

**If branching logic has gaps** → Add missing conditions and paths, then revalidate

**If workflow has circular dependencies** → Redesign the problematic paths to avoid infinite loops

## Navigation Design Best Practices

- **Be explicit**: Don't rely on implied next steps
- **Plan for failure**: Every step should have an error path
- **Avoid deep nesting**: Complex branching can be split across multiple steps
- **Document assumptions**: Make decision criteria clear to future maintainers
- **Consider user experience**: How will someone understand the flow?
- **Test edge cases**: Unusual conditions should have defined behavior
- **Use consistent patterns**: Similar decision types should use similar formats
