---
entrypoint: true
title: "GitLab Issue Analysis Workflow"
description: "Comprehensive workflow for analyzing GitLab issues and determining appropriate action paths"
version: "1.0.0"
tags: ["gitlab", "issue-analysis", "project-management"]
---

# GitLab Issue Analysis Workflow

Systematically analyze GitLab issues to determine the most appropriate course of action using KISS principles (Keep It Simple, Smart).

## Workflow Overview

### Key Scenarios This Workflow Handles

**Happy Path**: Issues are well-defined, properly categorized, and development infrastructure created efficiently
- Clear problem statements with defined acceptance criteria
- Straightforward categorization into single implementation approach
- Smooth development infrastructure creation with proper documentation
- Successful stakeholder communication and project tracking

**Error Paths**: Issues are unclear, stakeholders unavailable, or technical blockers exist
- Vague or conflicting requirements requiring clarification
- GitLab API access issues or permission problems
- Missing stakeholder input for critical decisions
- Technical dependencies that block progress

**Alternative Paths**: Different analysis outcomes requiring different approaches
- Discussion-only resolution without code changes
- Complex issues requiring breakdown into work packages
- Investigation needed before implementation can begin
- Priority changes affecting analysis recommendations

**Edge Cases**: Unusual scenarios requiring special handling
- Legacy issues with incomplete historical context
- Cross-project dependencies requiring coordination
- Emergency issues requiring expedited process
- Invalid or duplicate issues requiring careful closure

### Analysis Outcomes

This analysis can lead to different outcomes:
- **No Action Needed**: Issue resolved through discussion or closing as invalid
- **Ready for Single Implementation**: Well-defined issue addressable in one focused approach (PREFERRED)
- **Needs Breakdown**: Large issue requiring split into smaller work packages
- **Further Investigation**: Issue needs more research or stakeholder input

**Default Approach**: Recommend single implementation when possible. Only suggest breakdown if absolutely necessary.

## Prerequisites

- Access to GitLab project with appropriate permissions
- Understanding of project context and requirements
- Git repository properly configured

## Step-by-Step Process

### 1. Project Context Discovery

**Purpose**: Establish your current GitLab project context and authentication.

**Actions**:
- Get git remote URL from your repository
- Use `gitlab_get_project_id` with the remote URL to get project_id
- Verify GitLab API access and permissions
- Check current branch context if applicable

**Success Criteria**:
- Project ID obtained and validated
- GitLab API connectivity confirmed
- Current git context understood

**Next Steps**:
**If project context established successfully** → Continue to @issue-discovery@

**If authentication or access issues** → Follow GitLab API troubleshooting procedure:
1. Verify GitLab personal access token is valid and has appropriate scopes
2. Check network connectivity to GitLab instance
3. Confirm user has at least Reporter access to target project
4. Test API access with simple call like `gitlab_get_current_user`
5. If issues persist, escalate to GitLab administrator
6. Once resolved, return to this step

**If project not found** → Follow project discovery procedure:
1. Verify git remote URL format and accessibility
2. Check if repository has been moved, renamed, or archived
3. Confirm user has access to the specific project
4. Try accessing project through GitLab web interface to verify existence
5. If project exists but not accessible, request appropriate permissions
6. Once access confirmed, return to this step

**If project ID extraction fails** → Manual project identification:
1. Navigate to project in GitLab web interface
2. Extract project ID from project settings or URL
3. Verify project ID works with `gitlab_get_project` call
4. Document correct project ID for future reference
5. Continue to @issue-discovery@

### 2. Issue Discovery & Selection

**Purpose**: Identify and select 1-3 promising issues for deeper analysis.

**Actions**:
- Use `gitlab_list_issues` with project_id and state="opened"
- Review issue titles, labels, and basic descriptions
- Filter by priority, assignee, or labels if needed
- Select 1-3 issues that appear suitable for analysis
- Consider business impact and complexity indicators

**Success Criteria**:
- Specific issues identified for analysis
- Issues appear well-suited for development work
- Selection covers different complexity levels if multiple chosen

**Next Steps**:
**If suitable issues identified** → Continue to @deep-issue-analysis@

**If no suitable issues found** → Check issue filters, labels, or expand search criteria

**If too many issues available** → Apply more specific filters or focus on highest priority items

### 3. Deep Issue Analysis

**Purpose**: Conduct thorough analysis of each selected issue to understand requirements and complexity.

**Actions**:
For each selected issue:
- Use `gitlab_get_issue` to get complete issue details
- Use `gitlab_list_issue_links` to check existing relationships
- Analyze problem statement and acceptance criteria
- Assess technical complexity and scope
- Evaluate business impact and priority
- Check for existing comments and discussion threads
- Identify any blockers or dependencies

**Success Criteria**:
- Complete understanding of each issue's requirements
- Complexity and scope assessed for each issue
- Dependencies and relationships identified
- Business impact evaluated

**Next Steps**:
**If all issues analyzed thoroughly** → Continue to @action-categorization@

**If issues need clarification** → Add comments requesting clarification, then continue analysis

**If critical dependencies found** → Document dependencies and factor into categorization

### 4. Action Categorization

**Purpose**: Categorize each analyzed issue into appropriate action types.

**Decision Criteria**:

**🗣️ Discussion/Advice Only**:
- Issue needs clarification or guidance
- Problem solvable without code changes
- Invalid, duplicate, or out-of-scope issues

**🎯 Ready for Single Implementation**:
- Well-defined, focused issue
- Clear scope and acceptance criteria
- Addressable in one cohesive solution
- Estimated effort ≤ 2 weeks

**📦 Needs Breakdown**:
- Large, complex issue (>2 weeks effort)
- Multiple independent components
- High-risk changes needing isolation
- Multiple developers required simultaneously

**🔍 Further Investigation**:
- Requirements unclear or incomplete
- Technical approach uncertain
- Stakeholder input required

**Next Steps**:
**If all issues categorized** → Continue to @implementation-planning@

**If categorization unclear** → Gather more information or seek stakeholder input

### 5. Implementation Planning

**Purpose**: Create detailed action plans based on issue categorization.

**Actions**:

**For Discussion/Advice Issues**:
- Draft clarifying comments or guidance
- Prepare resolution recommendations
- Identify stakeholders to involve

**For Single Implementation Issues**:
- Outline technical approach
- Define acceptance criteria clearly
- Plan development infrastructure needs

**For Breakdown-Needed Issues**:
- Design logical breakdown strategy
- Define work package boundaries
- Plan integration approach

**For Investigation Issues**:
- Define specific research questions
- Identify information sources
- Plan stakeholder engagement

**Success Criteria**:
- Detailed action plan created for each issue
- Technical approaches outlined where applicable
- Resource requirements identified

**Next Steps**:
**If all implementation plans complete** → Continue to @execution-and-documentation@

**If plans need validation** → Review with team or stakeholders before execution

### 6. Execution and Documentation

**Purpose**: Execute the planned actions and document results in GitLab.

**Actions**:

**For Discussion/Advice Issues**:
- Add comprehensive comments with guidance
- Use `gitlab_update_issue` to document resolution
- Tag relevant stakeholders for input
- Close invalid issues with explanations
- Create follow-up issues if needed

**For Single Implementation Issues**:
- Add analysis summary to issue comments
- Document recommended technical approach
- Use `gitlab_create_branch` for feature branch
- Use `gitlab_create_merge_request` with detailed description
- Link MR to original issue
- Add appropriate labels and assignments

**For Breakdown Issues**:
- Add breakdown explanation to original issue
- Use `gitlab_create_issue` for each work package
- Use `gitlab_create_issue_link` to establish relationships
- Create branches and MRs for each package
- Document integration approach

**For Investigation Issues**:
- Document research questions and next steps
- Tag domain experts or stakeholders
- Set appropriate labels for follow-up
- Request specific information needed

**Success Criteria**:
- All issues have updated status and documentation
- Development infrastructure created where needed
- Clear next steps documented
- Stakeholders appropriately involved

**Next Steps**:
**If all executions completed successfully** → Continue to @results-documentation@

**If any actions failed** → Review failures, adjust approach, and retry

### 7. Results Documentation

**Purpose**: Document analysis decisions, rationale, and strategic guidance.

**Actions**:
- Create summary of analysis approach and findings
- Document decision rationale for each issue
- Provide strategic guidance for development teams
- Update issue tracking and project management tools
- Communicate results to relevant stakeholders
- Plan follow-up actions and monitoring

**Success Criteria**:
- Complete documentation of analysis results
- Clear rationale provided for all decisions
- Stakeholders informed of outcomes
- Follow-up plans established

**Next Steps**:
**Analysis workflow complete** - Issues are now properly categorized and prepared for appropriate action

## Quality Guidelines

### Issue Evaluation Criteria (KISS First)
- **Clarity**: Is the problem well-defined?
- **Simplicity**: Can this be solved with a direct approach?
- **Scope**: How large is the change? (Prefer smaller, focused changes)
- **Priority**: What's the business impact?
- **Dependencies**: Are there related issues or blockers?
- **Feasibility**: Is the change practical with minimal complexity?

### When to Break Down Issues (Use Sparingly)
- **Size**: Issue genuinely requires >2 weeks of work
- **Risk**: High-risk changes needing isolation
- **Dependencies**: Blocking relationships preventing single implementation
- **Team**: Multiple developers must work simultaneously

### Quality Standards (Lean Approach)
- Favor single, focused solutions over multiple work packages
- Minimal viable implementation solving core problem
- Clear acceptance criteria without over-specification
- Use issue links only when genuine dependencies exist
- Strategic focus on "what" and "why", avoid over-architecting

## Success Criteria

✅ **Workflow Complete When**:
- All selected issues thoroughly analyzed
- Each issue categorized appropriately
- Implementation plans created and executed
- Development infrastructure prepared where needed
- Clear documentation and communication completed
- Strategic guidance provided to development teams

## Best Practices

- **Start Simple**: Always consider the simplest solution first
- **Focus on Value**: Prioritize issues with clear business impact
- **Communicate Clearly**: Provide detailed rationale for all decisions
- **Plan for Success**: Create infrastructure that enables smooth development
- **Monitor Progress**: Track outcomes and learn from results