---
title: "Iterative Development"
description: "Continue development with incremental improvements while addressing ongoing review feedback"
---

# Iterative Development

Balance ongoing feature development with review feedback incorporation using systematic iterative approach for complex features.

## Purpose

This step manages complex feature development that requires both continued implementation progress and ongoing response to reviewer feedback through coordinated iterative cycles.

## Prerequisites

- Existing merge request with partial implementation in progress
- Understanding of remaining development work and requirements
- Active or potential reviewer feedback to incorporate
- Development environment ready for continued work

## Development Strategy

### Progress Assessment

**Current State Evaluation**:
- Review existing implementation against original requirements
- Identify completed, in-progress, and pending work items
- Assess code quality and architectural decisions made so far
- Understand any requirement changes or scope evolution

**Remaining Work Planning**:
- Break remaining work into 3-6 logical development iterations
- Prioritize work based on business value and technical dependencies
- Plan integration points and validation milestones
- Consider reviewer feedback timing and incorporation points

### Balanced Development Approach

**Development vs. Feedback Balance**:
- Alternate between new development and feedback response cycles
- Address critical feedback immediately regardless of development phase
- Plan feedback incorporation at logical development boundaries
- Maintain momentum while ensuring quality and responsiveness

**Iteration Planning**:
- Each iteration should add measurable functionality
- Plan iterations to be reviewable and validatable independently
- Consider technical risks and validation requirements
- Plan for feedback incorporation within iteration cycles

## Implementation Process

### Development Iteration Cycle

**Per Development Iteration**:
1. **Plan Iteration**: Define specific functionality to implement
2. **Implement Incrementally**: Break into small, logical commits
3. **Test Continuously**: Validate each commit locally before pushing
4. **Push and Monitor**: Push commits and monitor pipeline completion
5. **Update Documentation**: Keep MR description and comments current
6. **Request Feedback**: Proactively seek review at iteration boundaries

**Commit Strategy**:
- Make small, logical commits within each iteration
- Use clear commit messages explaining specific functionality added
- Test each commit individually before pushing
- Maintain clean commit history for easy review

### Feedback Integration Cycles

**Ongoing Feedback Response**:
- Monitor for new reviewer feedback throughout development
- Address critical feedback immediately as separate commits
- Batch less critical feedback for iteration boundary incorporation
- Maintain clear communication about feedback response timing

**Integration Approach**:
- Address feedback as atomic changes when possible
- Integrate feedback responses at logical development boundaries
- Ensure feedback responses don't conflict with ongoing development
- Test integration between new development and feedback responses

## Quality Management

### Continuous Quality Assurance

**Per-Iteration Validation**:
- Run comprehensive test suite for each iteration
- Verify integration with previously completed work
- Check that new development doesn't break existing functionality
- Validate architectural consistency across iterations

**Pipeline Management**:
- Monitor CI/CD pipelines for each commit and iteration
- Fix pipeline failures immediately before continuing development
- Use pipeline status as validation gate for iteration completion
- Ensure cumulative changes maintain pipeline stability

### Code Quality Maintenance

**Architectural Consistency**:
- Maintain consistent architecture and patterns across iterations
- Refactor when necessary to prevent technical debt accumulation
- Keep code structure clean and organized throughout development
- Consider architectural implications of ongoing changes

**Documentation Updates**:
- Update MR description with each major iteration completion
- Document significant architectural or design decisions
- Keep code comments current with implementation changes
- Update project documentation as needed

## Communication and Coordination

### Progress Communication

**Stakeholder Updates**:
- Provide regular progress updates through MR comments
- Communicate iteration completions with functionality summaries
- Highlight any scope changes or requirement clarifications needed
- Share timeline updates and milestone progress

**Review Coordination**:
- Request reviews at appropriate iteration boundaries
- Communicate readiness for feedback on specific areas
- Prioritize critical feedback over continued development when needed
- Coordinate with reviewers on timing and focus areas

### Feedback Response Communication

**Response Strategy**:
- Acknowledge new feedback promptly with response timeline
- Explain how feedback fits into current development iteration
- Communicate any conflicts between feedback and ongoing work
- Request clarification on feedback priorities and urgency

## Success Criteria

✅ **Complete when you have**:
- Successfully completed all planned development iterations
- Addressed all reviewer feedback appropriately and timely
- Maintained code quality and architectural consistency throughout
- Kept comprehensive documentation updated with progress
- Ensured all CI/CD pipelines pass consistently
- Achieved balance between development velocity and review responsiveness
- Met all original requirements and acceptance criteria

## Next Steps

**If development and feedback cycles complete successfully** → Continue to @quality-assurance@

**If scope or requirements have evolved significantly** → Reassess approach and potentially restart planning process

**If coordination challenges arise** → Communicate with reviewers and stakeholders to establish clearer process

## Best Practices

### Development Excellence
- **Incremental Progress**: Make steady, measurable progress through focused iterations
- **Quality Focus**: Maintain high code quality throughout all development cycles
- **Architectural Consistency**: Ensure design coherence across all iterations
- **Testing Discipline**: Validate each iteration thoroughly before proceeding

### Communication Excellence  
- **Proactive Updates**: Keep stakeholders informed of progress and changes
- **Responsive Feedback**: Address critical feedback promptly without derailing development
- **Clear Coordination**: Communicate development plans and feedback integration approach
- **Transparent Process**: Make development process and decisions visible to reviewers

### Process Excellence
- **Balanced Approach**: Maintain optimal balance between development and feedback response
- **Pipeline Discipline**: Use CI/CD as quality gate for all iterations
- **Documentation Maintenance**: Keep documentation current throughout development
- **Strategic Planning**: Plan iterations to enable effective review and validation