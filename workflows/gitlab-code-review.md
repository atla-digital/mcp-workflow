---
entrypoint: true
title: "GitLab Code Review Workflow"
description: "Systematic workflow for conducting thorough, constructive code reviews on GitLab merge requests"
version: "1.0.0"
tags: ["gitlab", "code-review", "quality-assurance", "collaboration"]
---

# GitLab Code Review Workflow

Conduct thorough, constructive code reviews with emphasis on simplicity, quality assurance, and line-specific feedback using KISS principles.

## Workflow Overview

### Key Scenarios This Workflow Handles

**Happy Path**: Code is well-written, meets standards, and requires only minor suggestions
- Clear, readable code following project conventions
- Comprehensive test coverage with passing tests
- No security vulnerabilities or performance issues
- Good documentation and appropriate complexity level
- Constructive review process with positive outcome

**Error Paths**: Code has significant issues requiring changes before merge
- Security vulnerabilities requiring immediate fixes
- Critical bugs or logic errors affecting functionality
- Inadequate test coverage for critical functionality
- Major performance regressions or inefficiencies
- Significant violations of coding standards or architecture

**Alternative Paths**: Different review outcomes based on code quality and context
- Emergency fixes requiring expedited but thorough review
- Complex architectural changes requiring team discussion
- Learning opportunities for junior developers requiring mentoring approach
- Experimental features requiring specialized validation

**Edge Cases**: Unusual review scenarios requiring special handling
- Legacy code integration with different standards
- Breaking changes requiring careful impact assessment
- Cross-team dependencies requiring coordination
- Compliance or regulatory requirements affecting review criteria

### Review Philosophy

Effective code review focuses on:
- **Quality Assurance**: Ensuring code meets standards and functions correctly
- **Simplicity Check**: Identifying over-engineered solutions and unnecessary complexity
- **Knowledge Sharing**: Helping team members learn and grow through collaboration
- **Risk Mitigation**: Identifying security, performance, and maintainability issues
- **Collaborative Improvement**: Building better software through clear, simple solutions

**KISS Focus**: Review for simplicity, clarity, and avoiding over-engineering.

## Prerequisites

- Access to GitLab project with appropriate review permissions
- Understanding of project standards, conventions, and quality requirements
- Sufficient time allocated for thorough analysis
- Knowledge of relevant technologies and security best practices

## Step-by-Step Process

### 1. Context Gathering & Setup

**Purpose**: Establish review context and understand project requirements for effective evaluation.

**Actions**:
- Get git remote URL and use `gitlab_get_project_id` to establish project context
- Identify specific merge request to review from available MRs
- Understand project standards, conventions, and quality requirements
- Review any special focus areas or security considerations
- Allocate appropriate time for thorough analysis
- Set up development environment if local testing needed

**Success Criteria**:
- Project context and standards understood
- Specific MR identified for review
- Review scope and complexity assessed
- Adequate time allocated for thorough evaluation

**Next Steps**:
**If context established and MR identified** → Continue to @merge-request-analysis@

**If multiple MRs need prioritization** → Assess urgency and impact to prioritize review order

**If project context unclear** → Research project documentation and coding standards

### 2. Merge Request Analysis

**Purpose**: Understand the MR's purpose, scope, and existing feedback before detailed code review.

**Actions**:
- Use `gitlab_get_merge_request` to understand purpose and scope
- Review MR description for completeness and clarity
- Check if requirements and acceptance criteria clearly addressed
- Use `gitlab_get_merge_request_changes` to get detailed file diffs
- Use `gitlab_list_merge_request_discussions` to review existing feedback
- Check CI/CD pipeline status and any automated check results
- Assess overall change complexity and potential impact

**Success Criteria**:
- MR purpose and scope fully understood
- All changed files and modifications identified
- Existing discussions and feedback reviewed
- Pipeline status and automated checks assessed
- Review strategy determined based on complexity

**Next Steps**:
**If MR analysis complete and strategy determined** → Continue to @systematic-file-review@

**If MR description inadequate** → Request clarification from author before detailed review

**If CI/CD failing** → Note pipeline issues for inclusion in review feedback

### 3. Systematic File Review

**Purpose**: Conduct thorough, file-by-file analysis focusing on code quality, simplicity, and correctness.

**Actions**:
For each changed file:
- Use `Read` tool to examine complete file contents and context
- Understand file's purpose and role in system architecture
- Identify integration points with other components
- Assess code quality with KISS focus:
  - Evaluate readability and maintainability
  - Check for over-engineering: unnecessary abstractions, complex patterns
  - Verify solution is as simple as possible while solving the problem
  - Validate adherence to project conventions and standards
  - Review error handling appropriateness (not excessive)
  - Assess algorithm efficiency and logic correctness
- Document specific issues found with line references
- Note positive aspects and good practices observed

**Success Criteria**:
- All changed files systematically reviewed
- Code quality assessed against project standards
- Over-engineering and complexity issues identified
- Logic correctness and efficiency evaluated
- Specific issues documented with precise locations

**Next Steps**:
**If all files reviewed systematically** → Continue to @security-performance-analysis@

**If complex changes need deeper analysis** → Schedule additional focused review time

**If questions arise about implementation** → Prepare specific questions for author discussion

### 4. Security & Performance Analysis

**Purpose**: Conduct specialized analysis of security vulnerabilities and performance implications.

**Security Review Focus**:
- Input validation and sanitization completeness
- Output encoding to prevent XSS vulnerabilities
- Authentication and authorization checks appropriateness
- Sensitive data handling and protection measures
- Dependency vulnerabilities and version issues
- Error message information leakage prevention

**Performance Analysis**:
- Algorithm time/space complexity assessment
- Database query efficiency and optimization
- Memory management and potential leak prevention
- Network call optimization and caching strategies
- Resource cleanup practices and lifecycle management

**Actions**:
- Systematically evaluate each security consideration
- Assess performance impact of changes
- Identify potential vulnerabilities or bottlenecks
- Document findings with severity assessment
- Prepare specific recommendations for improvements

**Success Criteria**:
- Comprehensive security review completed
- Performance implications thoroughly assessed
- Potential vulnerabilities identified and documented
- Performance bottlenecks or concerns noted
- Severity levels assigned to findings

**Next Steps**:
**If security and performance analysis complete** → Continue to @testing-quality-verification@

**If critical security issues found** → Prioritize these for immediate feedback

**If performance concerns identified** → Prepare detailed analysis and recommendations

### 5. Testing & Quality Verification

**Purpose**: Evaluate testing adequacy and overall code quality standards compliance.

**Actions**:
- Assess test coverage for new and modified code
- Verify test quality and edge case handling appropriateness
- Check integration test adequacy and coverage
- Evaluate error scenario testing completeness
- Review test maintainability and clarity
- Verify documentation updates match code changes
- Check for code style and convention compliance
- Assess overall maintainability and readability

**Success Criteria**:
- Test coverage adequately addresses new/changed functionality
- Test quality meets project standards
- Error scenarios properly covered
- Documentation updated appropriately
- Code style and conventions followed consistently

**Next Steps**:
**If testing and quality verification complete** → Continue to @feedback-preparation@

**If test coverage inadequate** → Prepare specific test improvement recommendations

**If quality issues found** → Document for inclusion in review feedback

### 6. Feedback Preparation & Line-Specific Comments

**Purpose**: Prepare constructive, specific feedback with line-specific comments for targeted improvements.

**Comment Categories and Templates**:

**Security Issues**:
```
🔒 **Security Concern**: [Brief description]

**Issue**: [Specific vulnerability or risk]
**Risk**: [Potential impact and severity]
**Suggestion**: [Specific remediation approach]
```

**Performance Issues**:
```
⚡ **Performance**: [Optimization opportunity]

**Issue**: [Specific performance concern]
**Impact**: [Performance impact description]
**Suggestion**: [Recommended optimization approach]
```

**Code Quality**:
```
📝 **Maintainability**: [Improvement area]

**Issue**: [Specific maintainability concern]
**Benefit**: [Improvement benefit description]
**Suggestion**: [Specific refactoring recommendation]
```

**Over-Engineering**:
```
🎯 **Simplicity**: [Complexity concern]

**Issue**: [Unnecessary complexity or abstraction]
**Impact**: [Maintenance burden and cognitive load]
**Suggestion**: [Simpler, more direct approach]
```

**Actions**:
- Create line-specific comments using `gitlab_create_merge_request_discussion`
- Provide specific, actionable guidance for each issue
- Include code examples and alternatives where helpful
- Maintain professional, collaborative tone throughout
- Balance critical feedback with recognition of positive aspects

**Success Criteria**:
- All significant issues addressed with line-specific comments
- Feedback is specific, actionable, and constructive
- Professional tone maintained throughout
- Positive aspects highlighted alongside improvements
- Clear severity levels communicated

**Next Steps**:
**If all line-specific feedback prepared** → Continue to @overall-assessment@

**If extensive feedback required** → Organize by priority and impact

### 7. Overall Assessment & Summary

**Purpose**: Provide comprehensive summary assessment with clear recommendation and rationale.

**Actions**:
- Create comprehensive summary covering:

**Strengths**:
- Positive aspects of implementation observed
- Good practices and quality improvements noted
- Effective solutions and approaches used

**Areas for Improvement**:
- Key issues requiring attention
- Enhancement suggestions with rationale
- Best practices recommendations

**Security & Performance**:
- Security assessment summary with risk levels
- Performance impact evaluation and concerns
- Critical issues requiring immediate attention

**Testing & Quality**:
- Test coverage assessment and recommendations
- Quality assurance feedback and standards compliance
- Documentation review and update requirements

**Final Recommendation**:
- **APPROVE**: Code meets quality standards, minor suggestions only
- **REQUEST CHANGES**: Critical issues need addressing before merge
- **NEEDS DISCUSSION**: Architectural concerns requiring team input
- **MERGE**: Code meets all criteria and can be merged immediately

**Success Criteria**:
- Comprehensive summary created covering all aspects
- Clear final recommendation with detailed rationale
- All critical issues clearly distinguished from suggestions
- Action items prioritized by importance and impact

**Next Steps**:
**If assessment complete and recommendation clear** → Continue to @review-execution@

### 8. Review Execution & Decision Implementation

**Purpose**: Execute the review decision and complete the review process appropriately.

**Actions Based on Final Recommendation**:

**For APPROVE Decision**:
- Use `gitlab_create_merge_request_note` for summary feedback
- Highlight positive aspects and minor suggestions
- Approve MR if platform supports approval workflow

**For REQUEST CHANGES Decision**:
- Provide detailed summary of required changes
- Ensure all critical issues clearly documented
- Request specific author responses to key concerns
- Set clear expectations for re-review

**For NEEDS DISCUSSION Decision**:
- Create summary highlighting discussion areas
- Tag relevant stakeholders and team members
- Propose follow-up meeting or design review
- Document architectural concerns clearly

**For MERGE Decision**:
- Verify CI/CD pipeline passes: Use `gitlab_list_pipelines`
- Confirm no blocking discussions remain
- Execute merge: Use `gitlab_merge_merge_request` with appropriate settings
- Add final comment confirming merge and thanking contributors

**Merge Execution (When Appropriate)**:
```
gitlab_merge_merge_request({
  project_id: "project_id",
  merge_request_iid: merge_request_iid,
  should_remove_source_branch: true,
  squash: true,
  merge_commit_message: "feat: [clear description of changes]"
})
```

**Success Criteria**:
- Appropriate action taken based on assessment
- Clear communication provided to author and stakeholders
- Merge executed successfully if appropriate
- Review process completed professionally

**Next Steps**:
**Review workflow complete** - Appropriate action taken and process concluded successfully

## Review Decision Framework

### Approval Criteria ✅
- Code meets established quality standards consistently
- No security vulnerabilities or critical performance issues
- Adequate testing coverage for new functionality
- Minor suggestions that don't block merge
- Implementation follows KISS principles appropriately

### Request Changes Criteria 🔄
- Security vulnerabilities present requiring fixes
- Critical bugs or logic errors identified
- Significant performance regressions detected
- Insufficient test coverage for critical paths
- Major convention violations affecting maintainability
- Over-engineered solutions adding unnecessary complexity

### Discussion Needed Criteria 💭
- Architectural concerns requiring team input and consensus
- Complex trade-off decisions needing broader perspective
- Unclear requirements or specifications requiring clarification
- Implementation approaches needing team consensus
- Solution complexity disproportionate to problem being solved

### Merge Criteria 🚀
- All approval criteria met with no outstanding issues
- CI/CD pipeline passes successfully
- No blocking discussions or unresolved threads
- Implementation ready for production deployment
- All review feedback addressed satisfactorily

## Quality Assurance Standards

### Review Completeness Checklist
- [ ] All changed files reviewed systematically
- [ ] Security implications thoroughly assessed
- [ ] Performance impact evaluated comprehensively
- [ ] Testing strategy verified and adequate
- [ ] Line-specific feedback provided for all significant issues
- [ ] Overall summary with clear recommendation provided

### Feedback Quality Standards
- [ ] Specific and actionable guidance provided consistently
- [ ] Constructive and professional tone maintained throughout
- [ ] Educational explanations included where helpful
- [ ] Critical issues clearly distinguished from suggestions
- [ ] Examples and alternatives provided for complex issues

### Technical Review Excellence
- [ ] Security awareness demonstrated throughout review
- [ ] Performance consciousness applied to assessment
- [ ] Code quality standards consistently verified
- [ ] Testing adequacy properly evaluated and documented

## Success Criteria

✅ **Workflow Complete When**:
- Systematic review completed for all changed files
- Security and performance thoroughly analyzed
- Testing adequacy verified and documented
- Constructive feedback provided with line-specific comments
- Overall assessment completed with clear recommendation
- Appropriate action executed based on assessment
- Professional communication maintained throughout process

## Best Practices

### Effective Review Approach
- **Start with Understanding**: Read MR description and requirements thoroughly
- **Review Systematically**: Don't skip files or rush through changes
- **Think Like a User**: Consider real-world usage scenarios and edge cases
- **Consider Maintenance**: Evaluate long-term maintainability impact
- **Focus on Impact**: Prioritize issues by potential impact and severity
- **Embrace Simplicity**: Favor simple solutions over complex architectures

### Communication Excellence
- **Be Precise**: Use line-specific comments for exact issue locations
- **Be Constructive**: Always suggest solutions alongside identified problems
- **Be Educational**: Explain reasoning behind suggestions and standards
- **Be Respectful**: Maintain collaborative and professional communication
- **Be Timely**: Provide reviews promptly to maintain development velocity
- **Be Appreciative**: Acknowledge good work and positive contributions

### Technical Excellence
- **Security First**: Always consider security implications of changes
- **Performance Aware**: Assess performance impact of modifications
- **Quality Focused**: Maintain high standards while being practical
- **Standards Consistent**: Apply project conventions uniformly
- **Testing Conscious**: Verify adequate test coverage and quality