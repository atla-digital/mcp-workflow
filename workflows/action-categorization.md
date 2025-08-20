---
title: "Issue Action Categorization"
description: "Categorize analyzed issues into appropriate action types based on complexity and requirements"
---

# Issue Action Categorization

Systematically categorize analyzed issues into appropriate action types to determine the most effective approach for each issue.

## Purpose

This step ensures each issue receives the most appropriate treatment based on its characteristics, complexity, and requirements, optimizing development effort and outcomes.

## Prerequisites

- Issues thoroughly analyzed with documented requirements and complexity
- Understanding of team capacity and capabilities
- Clear knowledge of project priorities and constraints
- Decision framework for categorization criteria

## Categorization Framework

### 🗣️ Discussion/Advice Only

**Characteristics**:
- Issue needs clarification or guidance rather than code changes
- Problem can be resolved through documentation or process changes
- Invalid, duplicate, or out-of-scope requests
- Questions that require expert knowledge sharing
- Issues that need stakeholder alignment or decision-making

**Decision Criteria**:
- No code changes required for resolution
- Resolution requires clarification, documentation, or process change
- Issue is invalid, duplicate, or outside project scope
- Requires expert guidance or knowledge transfer
- Needs stakeholder input or business decision

**Indicators**:
- Vague or unclear requirements that need definition
- Process or documentation questions
- Requests for guidance on existing functionality
- Issues marked as invalid or duplicate
- Questions about project direction or priorities

### 🎯 Ready for Single Implementation

**Characteristics**:
- Well-defined problem with clear solution approach
- Focused scope that can be addressed cohesively
- Clear acceptance criteria and success measures
- Manageable complexity within resource constraints
- Independent work that doesn't require complex coordination

**Decision Criteria**:
- Requirements are clear and well-documented
- Scope is focused and manageable (≤ 2 weeks estimated effort)
- Solution approach is straightforward and well-understood
- Minimal dependencies on other issues or systems
- Clear acceptance criteria and definition of done

**Indicators**:
- Specific problem statement with clear user impact
- Well-defined acceptance criteria
- Single developer can complete within reasonable timeframe
- Minimal external dependencies or coordination required
- Clear testing and validation approach

### 📦 Needs Breakdown

**Characteristics**:
- Large, complex issue requiring significant effort
- Multiple independent components or subsystems involved
- High-risk changes that benefit from incremental delivery
- Work requiring multiple developers or specialized skills
- Issues with natural breaking points for phased delivery

**Decision Criteria**:
- Estimated effort exceeds 2 weeks for single developer
- Multiple independent components can be delivered separately
- High-risk changes that benefit from isolation and validation
- Requires coordination across multiple team members
- Natural breakdown into logical, deliverable components

**Indicators**:
- Large scope affecting multiple system areas
- Complex requirements with multiple user scenarios
- High technical risk requiring careful validation
- Multiple stakeholders with different concerns
- Opportunity for incremental value delivery

### 🔍 Further Investigation

**Characteristics**:
- Requirements are unclear or incomplete
- Technical approach is uncertain or requires research
- Stakeholder alignment needed before proceeding
- External dependencies that need resolution
- Issues requiring design or architectural decisions

**Decision Criteria**:
- Requirements need significant clarification
- Technical feasibility is uncertain
- Stakeholder input required for direction
- External dependencies block progress
- Research or prototyping needed for approach validation

**Indicators**:
- Vague or conflicting requirements
- Uncertain technical feasibility
- Missing stakeholder input or approval
- Blocked by external systems or teams
- Requires architectural or design decisions

## Categorization Process

### Systematic Evaluation

**For each analyzed issue, evaluate against criteria**:

1. **Clarity Assessment**: Are requirements and success criteria clear?
2. **Scope Assessment**: Is the scope focused and manageable?
3. **Complexity Assessment**: Can this be implemented as single cohesive solution?
4. **Dependency Assessment**: Are there blocking dependencies or coordination needs?
5. **Risk Assessment**: What are the technical and business risks?
6. **Resource Assessment**: Does this fit within available capacity and timeline?

### Decision Matrix Application

**Apply consistent decision logic**:
- Start with assumption of single implementation (preferred approach)
- Only categorize as breakdown if genuinely too large or high-risk
- Choose discussion/advice for issues that don't require code changes
- Select investigation for issues with unclear path forward

### Documentation Requirements

**For each categorized issue, document**:
- **Category Assignment**: Clear categorization with rationale
- **Decision Rationale**: Why this category was chosen
- **Key Considerations**: Factors influencing the decision
- **Next Steps**: Specific actions required for this category
- **Success Criteria**: How to measure appropriate handling

## Quality Validation

### Categorization Quality Check

**Verify categorization decisions meet standards**:
- Consistent application of criteria across all issues
- Clear rationale documented for each decision
- Appropriate balance favoring single implementation when possible
- Realistic assessment of complexity and resource requirements
- Proper consideration of project priorities and constraints

### Decision Review

**Validate decisions against project context**:
- Alignment with team capacity and capabilities
- Consistency with project priorities and timeline
- Appropriate risk management for high-impact changes
- Realistic resource allocation and timeline expectations

## Success Criteria

✅ **Complete when you have**:
- Applied consistent categorization criteria to all analyzed issues
- Documented clear rationale for each categorization decision
- Validated decisions against project context and constraints
- Prepared appropriate next steps for each category
- Ensured balanced approach favoring simplicity when appropriate

## Next Steps

**If all issues categorized with clear rationale** → Return to main workflow for implementation planning

**If categorization decisions need validation** → Review with team leads or stakeholders before proceeding

**If some issues remain unclear** → Mark for investigation and proceed with clear categories