---
title: "Systematic File Review"
description: "Conduct thorough, file-by-file code analysis focusing on quality, simplicity, and correctness"
---

# Systematic File Review

Conduct comprehensive, methodical review of each changed file with focus on code quality, KISS principles, and technical correctness.

## Purpose

This step ensures every modified file receives appropriate analysis for code quality, architectural alignment, and adherence to project standards while identifying over-engineering and unnecessary complexity.

## Prerequisites

- Merge request analysis completed with clear understanding of scope
- File change list available from MR analysis
- Understanding of project coding standards and patterns
- Review strategy planned based on complexity assessment

## Review Methodology

### File-by-File Analysis Process

**Systematic Approach**:
For each changed file identified in MR analysis:
1. **Context Understanding**: Read complete file to understand purpose and role
2. **Change Analysis**: Focus on specific modifications and their implications
3. **Quality Assessment**: Evaluate code quality against project standards
4. **Integration Review**: Assess how changes fit with existing codebase
5. **Documentation**: Record findings and specific issues identified

**Prioritization Strategy**:
- Review high-risk or complex files first
- Focus on security-sensitive components early
- Address core business logic before supporting files
- Review integration points and API changes carefully
- Save configuration and documentation files for last

### Code Quality Assessment Framework

### KISS Principle Application

**Simplicity Evaluation**:
- **Solution Appropriateness**: Is the solution as simple as possible while solving the problem?
- **Abstraction Level**: Are abstractions necessary or is there over-engineering?
- **Pattern Usage**: Are complex patterns used where simple solutions would work?
- **Code Structure**: Is the code organized clearly without unnecessary complexity?

**Over-Engineering Detection**:
- Unnecessary design patterns or architectural layers
- Premature optimization without proven performance needs
- Complex inheritance hierarchies where composition would suffice
- Abstraction for single-use cases
- Framework building for application-specific needs

### Technical Quality Analysis

**Code Correctness**:
- Use `Read` tool to examine complete file contents and understand context
- Verify logic correctness and algorithm implementation
- Check for potential null pointer or bounds checking issues
- Validate error handling appropriateness and completeness
- Assess thread safety and concurrency considerations

**Performance Considerations**:
- Evaluate algorithm time and space complexity
- Check for obvious performance bottlenecks
- Assess database query efficiency and N+1 problems
- Review memory management and resource cleanup
- Identify inefficient data structure usage

**Maintainability Assessment**:
- Code readability and self-documenting practices
- Function and class size appropriateness
- Variable and method naming clarity
- Comment quality and necessity
- Code organization and module structure

### Project Standards Compliance

**Convention Adherence**:
- Coding style and formatting consistency
- Naming convention compliance throughout
- File organization and structure standards
- Import/dependency management practices
- Documentation and comment standards

**Architectural Alignment**:
- Consistency with existing architectural patterns
- Proper separation of concerns implementation
- Appropriate use of existing utilities and libraries
- Integration pattern consistency
- Data flow and state management alignment

### Integration and Compatibility Analysis

**System Integration Review**:
- Compatibility with existing API contracts
- Database schema changes and migration safety
- Dependency updates and compatibility implications
- Configuration changes and backward compatibility
- External service integration correctness

**Impact Assessment**:
- Potential breaking changes identification
- Side effect analysis on existing functionality
- Cross-module interaction implications
- Testing implications for changed interfaces
- Deployment and rollback considerations

## Issue Documentation

### Finding Classification

**Critical Issues**:
- Security vulnerabilities requiring immediate attention
- Logic errors that could cause functional failures
- Breaking changes not properly handled
- Performance regressions or serious bottlenecks
- Data integrity or corruption risks

**Quality Improvements**:
- Code readability and maintainability enhancements
- Convention violations needing correction
- Over-engineering that should be simplified
- Missing error handling or validation
- Optimization opportunities with clear benefits

**Enhancement Suggestions**:
- Code structure improvements for future maintainability
- Design pattern applications that would improve clarity
- Testing approaches that would increase confidence
- Documentation additions that would help future developers
- Refactoring opportunities to reduce technical debt

### Detailed Issue Recording

**Issue Documentation Format**:
For each identified issue:
- **File and Line Reference**: Exact location using line numbers
- **Issue Category**: Security, performance, quality, or enhancement
- **Problem Description**: Clear explanation of the concern
- **Impact Assessment**: Potential consequences if not addressed
- **Suggested Solution**: Specific recommendation for improvement
- **Priority Level**: Critical, important, or suggestion

**Context Preservation**:
- Record surrounding code context for complex issues
- Note relationships between issues across multiple files
- Document patterns that appear in multiple locations
- Preserve examples of both problems and good practices found

## Review Quality Assurance

### Completeness Validation

**Coverage Verification**:
- Ensure all modified files have been reviewed systematically
- Verify that complex or high-risk areas received appropriate depth
- Check that integration points were analyzed thoroughly
- Confirm that new functionality is understood completely

**Consistency Check**:
- Apply same standards and criteria across all files
- Ensure similar issues are identified consistently
- Verify that review depth matches complexity appropriately
- Maintain consistent tone and constructiveness in feedback

### Issue Quality Review

**Finding Validation**:
- Verify each identified issue is legitimate and actionable
- Ensure suggestions are specific and implementable
- Check that critical issues are properly classified
- Confirm recommendations align with project standards

## Success Criteria

✅ **Complete when you have**:
- Systematically reviewed all changed files using consistent methodology
- Applied KISS principles to identify over-engineering and complexity issues
- Assessed code quality against project standards comprehensively
- Documented all findings with specific file and line references
- Classified issues by severity and impact appropriately
- Recorded specific, actionable recommendations for improvements
- Ensured review completeness and consistency across all files

## Next Steps

**If all files reviewed systematically with documented findings** → Continue to @security-performance-analysis@

**If complex areas need deeper analysis** → Schedule additional focused review time for challenging sections

**If questions arise about implementation approaches** → Prepare specific questions for author discussion

## Best Practices

### Review Excellence
- **Systematic Approach**: Use consistent methodology for all files to ensure thorough coverage
- **KISS Focus**: Actively look for over-engineering and unnecessary complexity
- **Quality Standards**: Apply project standards consistently and fairly
- **Context Understanding**: Understand file purpose before evaluating specific changes

### Analysis Excellence
- **Technical Depth**: Provide appropriate analysis depth matching code complexity
- **Integration Awareness**: Consider how changes affect system integration and compatibility
- **Performance Consciousness**: Evaluate performance implications of code changes
- **Maintainability Focus**: Assess long-term maintainability and technical debt implications

### Documentation Excellence
- **Specific Findings**: Document issues with precise file and line references
- **Actionable Feedback**: Provide specific, implementable recommendations
- **Priority Classification**: Distinguish between critical issues and suggestions appropriately
- **Context Preservation**: Record sufficient context for understanding and addressing issues