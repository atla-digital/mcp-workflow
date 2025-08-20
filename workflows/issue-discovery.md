---
title: "GitLab Issue Discovery"
description: "Identify and select suitable issues for analysis and development work"
---

# GitLab Issue Discovery

Systematically identify and select issues that are well-suited for analysis and development work.

## Purpose

This step helps you efficiently discover and filter GitLab issues to find the most suitable candidates for development work, focusing on issues with clear business value and appropriate complexity levels.

## Prerequisites

- GitLab project access established with project_id available
- Understanding of project context and business priorities
- Clear criteria for issue selection

## Discovery Process

### Search and Filter Issues

**Use GitLab API effectively**:
- Use `gitlab_list_issues` with project_id and state="opened"
- Apply filters for labels, assignee, or milestone if relevant
- Consider priority indicators in titles, labels, or descriptions
- Look for issues with clear problem statements
- Identify issues with appropriate complexity for your timeline

### Evaluation Criteria

**Assess each issue for**:
- **Clarity**: Problem statement and requirements are well-defined
- **Scope**: Size appears manageable for available time and resources
- **Impact**: Business value and user benefit are apparent
- **Feasibility**: Technical approach seems straightforward
- **Priority**: Urgency and importance indicators present

### Selection Strategy

**Choose 1-3 issues that**:
- Represent different complexity levels if possible
- Have clear acceptance criteria or success measures
- Align with current project priorities
- Don't have blocking dependencies or unclear requirements
- Would benefit from immediate attention

## Quality Indicators

**Look for issues with**:
- Clear problem descriptions with specific scenarios
- Business impact or user benefit clearly stated
- Acceptance criteria or success measures defined
- Appropriate labels and categorization
- Recent activity or stakeholder interest

**Avoid issues that**:
- Have vague or unclear requirements
- Appear to be duplicates or already resolved
- Have complex dependency chains
- Lack clear success criteria
- Are stale with no recent activity

## Success Criteria

✅ **Complete when you have**:
- Successfully searched available issues using appropriate filters
- Applied consistent evaluation criteria to candidate issues
- Selected 1-3 issues suitable for detailed analysis
- Documented selection rationale and priorities
- Confirmed issues are actionable and well-scoped

## Next Steps

**If suitable issues identified** → Return to main workflow for deep analysis

**If no suitable issues found** → Adjust search criteria, expand filters, or consult with project stakeholders about priorities

**If too many candidate issues** → Apply stricter priority filters or focus on highest-impact items first