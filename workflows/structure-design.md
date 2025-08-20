---
title: "Structure Design"
description: "Breaking down your workflow into logical, manageable steps"
---

# Structure Design Phase

Now that you have clear requirements, design the overall structure of your workflow by breaking it down into logical, manageable steps.

## Step Identification Strategy

**1. Start with the Happy Path**
- Map out the ideal sequence from start to finish
- Focus on the core value-delivering activities
- Keep steps at a consistent level of granularity

**2. Apply the Single Responsibility Principle**
Each step should have:
- **One clear purpose** - accomplishes one main objective
- **Defined inputs** - what information/resources it needs
- **Defined outputs** - what it produces or accomplishes
- **Clear boundaries** - where it starts and ends

**3. Optimal Step Size Guidelines**
- **Too Small**: Micro-steps that could be combined (e.g., "Open file", "Read first line")
- **Too Large**: Complex multi-part activities (e.g., "Implement entire feature")
- **Just Right**: Focused activities that can be completed in one session with clear success criteria

## Structure Design Techniques

**Sequential Flow**
```
Step 1 → Step 2 → Step 3 → End
```
Use when steps must happen in order and each depends on the previous.

**Parallel Branches**
```
Step 1 → [Step 2A, Step 2B] → Step 3 → End
```
Use when multiple independent activities can happen simultaneously.

**Conditional Branches**
```
Step 1 → Decision Point
    ├─ Condition A → Step 2A → Step 4
    └─ Condition B → Step 2B → Step 4
```
Use when different paths are needed based on conditions.

**Loop Structures**
```
Step 1 → Step 2 → Decision
    ├─ Continue → back to Step 2
    └─ Complete → Step 3
```
Use for iterative processes or when steps repeat until criteria are met.

**Error Handling Patterns**
```
Step 1 → Step 2
    ├─ Success → Step 3
    └─ Failure → Error Handler → [Retry Step 2 | Alternative Path | End]
```
Always plan for failure scenarios and recovery paths.

## Design Your Step Map

Create a visual or written representation of your workflow:

**1. List All Major Steps**
- Write each step as a clear action statement
- Use consistent naming conventions
- Number or name steps logically

**2. Identify Decision Points**
- Where do conditions determine the next step?
- What are the specific criteria for each branch?
- Are conditions mutually exclusive or can multiple apply?

**3. Map Dependencies**
- Which steps require outputs from previous steps?
- Which steps can run in parallel?
- What are the critical path dependencies?

**4. Plan Error Scenarios**
- What can go wrong at each step?
- How should errors be handled?
- Should the workflow retry, skip, or terminate?

## Success Criteria for This Step

✅ **Complete when you have:**
- A complete step map from start to finish
- Clear decision criteria for all branching points
- Identified all major error scenarios and their handling
- Confirmed each step has a single, clear responsibility
- Validated that step granularity is consistent

## Next Steps

**If structure is logical and complete** → Continue to @step-content-creation@

**If structure seems too complex** → Consider simplifying or breaking into sub-workflows, then return to this step

**If dependencies are unclear** → Map out data/resource flows between steps, then revise structure

**If error handling is incomplete** → Add error handling paths for each failure point, then continue

## Design Best Practices

- **Start simple**: Begin with the core happy path, add complexity later
- **Use consistent naming**: Step names should follow a pattern (verb-noun format)
- **Avoid deep nesting**: More than 3-4 levels of conditions becomes hard to follow
- **Plan for reuse**: Common patterns can become reusable sub-workflows
- **Consider user experience**: How will someone navigate and understand this flow?
- **Validate with scenarios**: Walk through your identified scenarios against the structure