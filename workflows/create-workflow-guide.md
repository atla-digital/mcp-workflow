---
entrypoint: true
title: "Workflow Creation Guide"
description: "Comprehensive guide for creating effective workflows with proper task chaining and branching"
---

# Planning & Requirements Phase

The first step in creating an effective workflow is thorough planning. A well-planned workflow prevents confusion, reduces errors, and ensures all necessary scenarios are covered.

## Define Your Workflow Purpose

Before writing any steps, clearly articulate:

**1. Primary Objective**
- What specific problem does this workflow solve?
- What is the end goal or desired outcome?
- Who will be using this workflow (humans, AI agents, mixed)?

**2. Scope Boundaries**
- What is included in this workflow?
- What is explicitly excluded?
- Where does this workflow hand off to other processes?

**3. Success Definition**
- How do you know the workflow completed successfully?
- What are the measurable outcomes?
- What deliverables should exist at the end?

## Identify Key Scenarios

Think through all the major paths your workflow might take:

**Happy Path**: The ideal scenario where everything works as expected
**Error Paths**: What happens when steps fail or conditions aren't met
**Alternative Paths**: Different valid ways to achieve the same goal
**Edge Cases**: Unusual but possible scenarios that need handling

## Gather Requirements

**Input Requirements**
- What information, files, or conditions are needed to start?
- What permissions or access is required?
- What tools or systems must be available?

**Output Requirements**
- What should be produced or accomplished?
- What format should outputs take?
- Where should results be delivered or stored?

**Process Requirements**
- Are there specific methodologies to follow?
- Are there compliance or quality standards?
- Are there time constraints or dependencies?

## Success Criteria for This Step

✅ **Complete when you have:**
- Written a clear, one-sentence purpose statement
- Identified at least 3-5 major scenarios the workflow must handle
- Listed all required inputs and expected outputs
- Defined measurable success criteria

## Next Steps

**If requirements are clear and comprehensive** → Continue to @structure-design@

**If requirements need stakeholder input** → Create a requirements gathering plan and return to this step when complete

**If the scope seems too large** → Consider breaking into multiple smaller workflows and focus on one core flow first

## Critical Guidelines

- Spend adequate time on planning - it saves significant rework later
- Document assumptions clearly
- Consider both immediate and future needs
- Keep the human/AI audience in mind when defining detail levels
- Be specific about branching criteria - vague conditions lead to workflow confusion

## ⚠️ VALIDATION REQUIREMENT

**MANDATORY**: Before deploying any workflow, you MUST use the workflow management tools to check for dead links:

- Use `workflow_find_invalid_links` to identify broken step references
- Use `workflow_find_orphans` to find unreachable steps
- **Zero invalid links is required** - workflows with dead links will fail during navigation

This validation step is covered in detail in the @testing-validation@ phase.