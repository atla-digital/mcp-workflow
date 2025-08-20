---
title: "Step Content Creation"
description: "Writing effective, actionable content for each workflow step"
---

# Step Content Creation Phase

With your workflow structure defined, now write detailed, actionable content for each step. Well-written steps are the difference between a workflow that guides effectively and one that confuses users.

## Content Structure Template

Each workflow step should follow this proven structure:

### 1. Purpose Statement
- **What**: One sentence describing what this step accomplishes
- **Why**: Brief context on why this step is necessary
- **When**: Any preconditions or timing considerations

### 2. Prerequisites Check
- Required inputs from previous steps
- Tools, access, or permissions needed
- Conditions that must be met before starting

### 3. Action Instructions
- Specific, actionable steps to perform
- Use imperative language ("Do X", "Check Y", "Verify Z")
- Include examples when helpful
- Break complex actions into sub-steps

### 4. Success Validation
- How to verify the step completed correctly
- What outputs or changes should be visible
- Common signs of successful completion

### 5. Next Step Guidance
- Clear branching criteria with specific conditions
- Step references using `@step-id@` format
- Error handling and alternative paths

## Writing Effective Instructions

**Use Clear, Specific Language**
```
❌ Bad: "Check if the system is working"
✅ Good: "Run the test suite and verify all tests pass with exit code 0"

❌ Bad: "Fix any issues you find"
✅ Good: "If tests fail, examine the error logs and either fix failing tests or update code to make tests pass"
```

**Provide Context and Rationale**
```
✅ Good: "Run linting before committing to maintain code quality standards and prevent CI pipeline failures"
```

**Include Decision Criteria**
```
✅ Good: "If more than 5 tests fail → Continue to `@debug-tests@`
If 1-5 tests fail → Continue to `@fix-individual-tests@`  
If all tests pass → Continue to `@commit-changes@`"
```

**Add Examples When Helpful**
```
✅ Good: "Create a commit message following the format: 
'type(scope): description'
Examples: 'feat(auth): add OAuth login', 'fix(ui): resolve button alignment'"
```

## Content Quality Guidelines

**Be Appropriately Specific**
- **For AI agents**: Include exact commands, file paths, expected outputs
- **For humans**: Provide clear guidance while allowing professional judgment
- **For mixed use**: Include both prescriptive steps and contextual guidance

**Handle Ambiguity**
- If multiple approaches are valid, specify when to use each
- If judgment calls are needed, provide decision criteria
- If external factors matter, document the key considerations

**Plan for Errors**
- Anticipate common failure points
- Provide troubleshooting guidance
- Include recovery or alternative paths
- Specify when to escalate or seek help

**Maintain Consistency**
- Use consistent terminology throughout
- Follow the same format for similar types of instructions
- Apply the same level of detail across comparable steps

## Step Content Checklist

For each step you write, verify:

**Clarity**
- [ ] Purpose is clear in the first paragraph
- [ ] Instructions are specific and actionable
- [ ] Technical terms are defined or clarified
- [ ] Examples are provided for complex concepts

**Completeness**
- [ ] All necessary inputs are identified
- [ ] Success criteria are explicitly defined
- [ ] Error scenarios are addressed
- [ ] Next steps are clearly specified

**Usability**
- [ ] Instructions can be followed without guessing
- [ ] Branching conditions are unambiguous
- [ ] Step references use correct `@step-id@` format
- [ ] Content matches the intended audience skill level

**Quality**
- [ ] Grammar and spelling are correct
- [ ] Formatting enhances readability
- [ ] Information is logically organized
- [ ] Content is concise but complete

## Success Criteria for This Step

✅ **Complete when you have:**
- Written complete content for all steps in your structure
- Verified each step follows the content template
- Ensured all branching conditions are clearly defined
- Validated that instructions are actionable and specific
- Reviewed content for consistency across all steps

## Next Steps

**If all step content is complete and clear** → Continue to @navigation-branching-design@

**If some steps need more detail** → Focus on the incomplete steps, then return to review the full set

**If instructions seem too complex** → Consider breaking complex steps into smaller ones, update your structure, then revise content

**If branching criteria are unclear** → Refine the decision conditions and update affected steps

## Writing Best Practices

- **Start with the outcome**: Lead with what the step accomplishes
- **Use active voice**: "Create the file" not "The file should be created"
- **Number sequential actions**: Makes instructions easier to follow
- **Bold key terms**: Helps with scanning and comprehension
- **Test your instructions**: Walk through them to ensure they work
- **Consider edge cases**: What happens in unusual but possible scenarios?
- **Link related concepts**: Reference other steps or external resources when helpful