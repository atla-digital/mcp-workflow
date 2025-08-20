---
title: "Testing & Validation"
description: "Validating workflow functionality, logic, and user experience"
---

# Testing & Validation Phase

Before deploying your workflow, thoroughly test and validate it to ensure it works correctly, handles edge cases, and provides a good user experience.

## Technical Validation

### 1. Reference Integrity Check
**CRITICAL**: Always use workflow analysis tools to validate technical correctness before considering your workflow complete. Dead links and broken references will cause workflow navigation failures.

**Use `workflow_find_invalid_links` first - this is mandatory:**
```
workflow_find_invalid_links
```
- Identifies ALL broken `@step-id@` references across the entire workflow system
- Reports exact line numbers where invalid references occur
- Shows source workflow and target reference for each broken link
- **Must return zero invalid links** before workflow is ready for use

**Example of what this tool catches:**
```
Invalid reference "@non-existent-step@" in workflow "my-workflow" at line 45
Invalid reference "@typo-step@" in workflow "my-workflow" at line 67
```

**Use `workflow_find_orphans` to optimize structure:**
```  
workflow_find_orphans
```
- Finds steps that can't be reached from any entrypoint
- Identifies potentially unused or disconnected workflow files
- Helps identify structural issues in workflow navigation
- **Note**: Some orphaned steps may be intentional (utility steps, templates, etc.)

**⚠️ Important**: These tools scan the ENTIRE workflow system and may report issues in other workflows. **Focus only on issues related to your current workflow** - do not attempt to fix problems in other workflows unless specifically asked to do so.

**Mandatory Validation Process:**
1. Run `workflow_find_invalid_links` and fix ALL reported issues **related to your workflow**
2. Run `workflow_find_orphans` and verify orphans are intentional **for your workflow only**
3. Re-run `workflow_find_invalid_links` after every fix to ensure no new issues
4. Repeat until both tools report clean results **for your workflow**
5. **Important**: These tools will also report issues in other workflows - ignore those unless specifically asked to fix them

### 2. File Structure Validation
- **Filename conventions**: All .md files use valid step IDs
- **Frontmatter completeness**: Required metadata is present
- **Content structure**: Steps follow the established template
- **Reference syntax**: All `@step-id@` references use correct format

### 3. Logic Flow Testing
**Trace through each path manually:**
- Start from each entrypoint
- Follow every branching condition
- Verify you can reach logical endpoints
- Confirm no infinite loops exist

**Check decision coverage:**
- Every possible condition has a defined path
- Mutually exclusive conditions don't overlap
- Default/fallback cases exist where needed

## Functional Testing

### 1. Happy Path Validation
Execute the ideal scenario end-to-end:
- Start with a typical use case
- Follow the primary path through completion
- Verify each step produces expected outcomes
- Confirm final results meet workflow objectives

### 2. Alternative Path Testing
Test major branching scenarios:
- Deliberately trigger different conditions
- Follow alternative paths to completion
- Verify outcomes match expectations for each path
- Ensure alternative paths provide equivalent value

### 3. Error Path Validation
Test failure scenarios:
- Simulate common failure points
- Verify error handling paths work correctly
- Confirm recovery or escalation procedures
- Test edge cases and boundary conditions

### 4. Integration Testing
If workflow integrates with other systems:
- Test with actual external dependencies
- Verify data handoffs work correctly
- Confirm permissions and access requirements
- Test timeout and retry scenarios

## User Experience Testing

### 1. Clarity Assessment
- Are instructions unambiguous?
- Can steps be followed without additional context?
- Are technical terms appropriately defined?
- Is the level of detail appropriate for the audience?

### 2. Navigation Experience
- Is it easy to determine the current step?
- Are next steps clearly identified?
- Can users understand why they're on a particular path?
- Is it clear when the workflow is complete?

### 3. Error Experience
- Are error messages helpful and actionable?
- Is it clear how to recover from failures?
- Are escalation paths obvious when needed?
- Does error handling maintain workflow continuity?

## Performance Validation

### 1. Step Execution Time
- Are steps appropriately sized (not too long/short)?
- Do steps have realistic time expectations?
- Are there bottlenecks or overly complex steps?

### 2. Workflow Efficiency  
- Does the workflow minimize unnecessary work?
- Are parallel paths utilized where possible?
- Is the critical path optimized?
- Are there redundant or duplicate steps?

## Testing Methodology

### 1. Systematic Path Testing
Create a test matrix:
```
Test Case | Entry Point | Conditions | Expected Path | Result
TC001    | main-entry  | all pass   | A→B→C→end    | ✓
TC002    | main-entry  | B fails    | A→B→error→fix| ✓  
TC003    | alt-entry   | condition X| A→D→end      | ✓
```

### 2. Role-Based Testing
Test with different user perspectives:
- **Novice users**: Can they follow instructions without expertise?
- **Expert users**: Is there unnecessary verbosity or obvious information?
- **AI agents**: Are instructions precise enough for automation?

### 3. Scenario-Based Testing
Test with realistic scenarios:
- Use actual data and conditions from your domain
- Test with both simple and complex cases
- Include scenarios that stress-test the branching logic

## Common Issues to Check

### Logic Problems
- **Dead ends**: Steps with no next step and no completion indication
- **Unreachable code**: Steps that can never be accessed
- **Circular references**: Infinite loops in the workflow
- **Missing conditions**: Scenarios not covered by branching logic

### Content Issues
- **Ambiguous instructions**: Steps that could be interpreted multiple ways
- **Missing context**: Instructions that assume knowledge not provided
- **Inconsistent terminology**: Same concepts described differently
- **Outdated information**: References to changed systems or processes

### Structure Problems
- **Granularity mismatch**: Steps at inconsistent levels of detail
- **Poor separation of concerns**: Steps trying to do too much
- **Tight coupling**: Steps that are too dependent on specific implementations
- **Missing error handling**: No plan for common failure scenarios

## Success Criteria for This Step

✅ **Complete when you have:**
- All technical validation checks pass
- Happy path executes successfully end-to-end
- All major alternative paths tested and working
- Error scenarios handled appropriately
- User experience validated with target audience
- Performance meets expectations
- All identified issues resolved

## Next Steps

**If all tests pass and validation is successful** → Continue to @documentation-finalization@

**If technical validation fails** → Fix broken references and logic issues, then retest

**If functional testing reveals problems** → Update workflow content and structure, then retest

**If user experience testing shows issues** → Revise step content for clarity, then revalidate

**If performance is inadequate** → Optimize workflow structure and step content, then retest

## Testing Best Practices

- **Test early and often**: Don't wait until the workflow is complete
- **Use real scenarios**: Test with actual use cases, not just theoretical ones
- **Get feedback**: Have others review and test your workflow
- **Document test cases**: Keep track of what you've tested and results
- **Automate where possible**: Use the workflow tools for systematic checks
- **Plan for maintenance**: Consider how the workflow will be updated and retested
- **Think like your users**: Test from the perspective of actual workflow users