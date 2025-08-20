---
title: "Merge Request Analysis"
description: "Understand MR purpose, scope, and existing feedback before conducting detailed code review"
---

# Merge Request Analysis

Comprehensively analyze the merge request to understand its purpose, scope, and context before conducting detailed code review.

## Purpose

This step ensures thorough understanding of the merge request's objectives, current state, and any existing feedback before diving into detailed code analysis, enabling more effective and focused review.

## Prerequisites

- Code review context established with project understanding
- Specific merge request identified for review
- GitLab API access for MR and discussion retrieval
- Understanding of project standards and review criteria

## Analysis Process

### Merge Request Overview

**Basic Information Gathering**:
- Use `gitlab_get_merge_request` to retrieve comprehensive MR details
- Review title, description, and metadata (labels, assignees, milestone)
- Check MR status (draft, ready for review, approved, etc.)
- Understand source and target branches and their significance

**Purpose and Scope Understanding**:
- Extract the problem being solved from MR description
- Identify business value and user impact of proposed changes
- Understand acceptance criteria and success measures
- Assess scope appropriateness and potential for scope creep

### Requirements Analysis

**Requirement Validation**:
- Verify MR description includes clear problem statement
- Check that solution approach is explained adequately
- Confirm acceptance criteria are specific and testable
- Identify any missing context or unclear requirements

**Business Context Assessment**:
- Understand business priority and urgency of changes
- Identify stakeholders and their interests in the outcome
- Assess user impact and experience implications
- Consider competitive or market factors if applicable

### Technical Scope Assessment

**Change Overview**:
- Use `gitlab_get_merge_request_changes` to get detailed file modifications
- Identify all affected files and understand change distribution
- Assess the complexity and breadth of modifications
- Understand architectural implications of proposed changes

**Impact Analysis**:
- Identify integration points with existing system components
- Assess potential for breaking changes or compatibility issues
- Consider performance implications of proposed modifications
- Evaluate security considerations and potential vulnerabilities

### Existing Feedback Review

**Discussion Thread Analysis**:
- Use `gitlab_list_merge_request_discussions` to review all feedback
- Categorize existing feedback by type (bugs, suggestions, questions)
- Identify unresolved issues and ongoing discussion threads
- Understand review history and any patterns in feedback

**Review Progress Assessment**:
- Check which discussions have been resolved vs. outstanding
- Identify any blocking issues or critical concerns raised
- Assess author responsiveness to previous feedback
- Understand any disagreements or alternative approaches discussed

### CI/CD and Quality Status

**Pipeline Assessment**:
- Review current CI/CD pipeline status for latest commits
- Identify any failing tests, builds, or quality checks
- Assess consistency of pipeline results over time
- Check for any infrastructure or dependency issues affecting builds

**Automated Quality Feedback**:
- Review results from automated code quality tools
- Check security scanning results and vulnerability reports
- Assess test coverage reports and testing adequacy
- Identify any automated performance or compliance issues

## Review Strategy Planning

### Focus Area Identification

**Priority Review Areas**:
Based on analysis, identify key focus areas for detailed review:
- High-risk or complex code changes requiring extra attention
- Security-sensitive modifications needing thorough validation
- Performance-critical paths requiring optimization review
- Integration points with potential for breaking changes
- Areas with previous bug history or known complexity

**Review Depth Planning**:
- Determine appropriate review depth for different file types
- Plan extra attention for unfamiliar technology areas
- Identify areas requiring domain expert consultation
- Consider time allocation based on complexity assessment

### Quality Criteria Application

**Project Standards Alignment**:
- Identify applicable coding standards and conventions
- Understand security requirements and compliance needs
- Know performance benchmarks and quality thresholds
- Apply accessibility, usability, or domain-specific requirements

**Review Framework Selection**:
- Choose appropriate review methodology for change type
- Plan security-focused review approach if applicable
- Determine testing adequacy assessment approach
- Select communication style appropriate for author experience level

## Documentation and Planning

### Analysis Documentation

**Review Planning Summary**:
- Document MR purpose, scope, and business context
- Identify key focus areas and potential concerns
- Note existing feedback status and resolution needs
- Plan review approach and time allocation

**Context Preservation**:
- Record important background information for review reference
- Document any assumptions or constraints identified
- Note stakeholder expectations and timeline considerations
- Preserve links to related issues, documentation, or dependencies

### Communication Planning

**Review Communication Strategy**:
- Plan appropriate tone and style for author interaction
- Consider author experience level and learning opportunities
- Prepare constructive feedback approach emphasizing improvement
- Plan for collaborative discussion of complex issues

## Success Criteria

✅ **Complete when you have**:
- Thoroughly understood MR purpose, scope, and business context
- Analyzed all file changes and assessed technical complexity
- Reviewed existing feedback and discussion thread status
- Assessed CI/CD pipeline status and automated quality results
- Identified key focus areas and potential review concerns
- Planned appropriate review strategy and approach
- Documented analysis results for reference during detailed review

## Next Steps

**If MR analysis complete and review strategy planned** → Continue to @systematic-file-review@

**If MR description inadequate for effective review** → Request clarification from author before proceeding with detailed review

**If critical pipeline or quality issues identified** → Note these for priority attention in review feedback

## Best Practices

### Analysis Excellence
- **Comprehensive Understanding**: Gather complete context before detailed review
- **Strategic Focus**: Identify highest-value areas for review attention
- **Stakeholder Awareness**: Understand business context and user impact
- **Risk Assessment**: Identify potential issues early in review process

### Planning Excellence
- **Appropriate Depth**: Plan review depth matching complexity and risk
- **Efficient Process**: Optimize review approach for maximum value
- **Communication Preparation**: Plan constructive, collaborative feedback approach
- **Time Management**: Allocate review time appropriately based on analysis

### Documentation Excellence
- **Context Preservation**: Document important context for reference during review
- **Decision Framework**: Establish clear criteria for review decisions
- **Progress Tracking**: Plan approach for tracking review progress and completion
- **Learning Opportunities**: Identify opportunities for knowledge sharing and improvement