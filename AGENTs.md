# AGENTS.md

## Core Development Rules

You are working on a real production-grade application, not a demo, mockup, prototype, or tutorial project.

Follow these rules strictly:

1. **No demo data**
   - Do not create fake users, fake records, fake products, fake API responses, fake dashboards, or placeholder business logic.
   - Do not hardcode sample data into components, services, databases, or tests unless explicitly required for a test fixture.
   - If real data is required, integrate with the actual API, database, environment variable, or documented data source.
   - If a required data source is missing, stop and report exactly what is missing.

2. **Build working functionality**
   - Implement real, end-to-end functionality.
   - UI must connect to real backend logic.
   - Backend routes must perform real validation, database operations, service calls, and error handling.
   - Do not leave TODOs, stubs, mock handlers, fake loaders, fake auth, or fake success states.
   - Every implemented feature must be usable by a real user.

3. **Avoid mistakes through verification**
   - Before finalizing changes, verify that the code works as expected.
   - Run the relevant commands for:
     - Type checking
     - Linting
     - Tests
     - Build
     - Formatting, if applicable
   - If a command fails, fix the issue before finishing.
   - If a command cannot be run, clearly explain why and provide the exact command that should be run manually.

4. **No guessing**
   - Do not invent APIs, schemas, environment variables, routes, package names, config values, or database fields.
   - Inspect the existing codebase before making changes.
   - Follow the current project structure, naming conventions, and architectural patterns.
   - If something is ambiguous, make the smallest safe assumption and document it.

5. **Scalable codebase**
   - Write code that can grow without becoming a dumpster fire in three commits.
   - Keep business logic separated from UI logic.
   - Use reusable services, utilities, hooks, DTOs, schemas, and components where appropriate.
   - Avoid large, tangled files.
   - Avoid duplicating logic.
   - Prefer clear module boundaries.
   - Use meaningful names for files, variables, functions, classes, and database entities.

6. **Production-quality error handling**
   - Handle loading, empty, success, and error states properly.
   - Validate user input.
   - Return useful API errors without leaking sensitive details.
   - Log meaningful server-side errors when appropriate.
   - Do not silently ignore failures.

7. **Security and environment rules**
   - Never hardcode secrets, API keys, tokens, passwords, private URLs, or credentials.
   - Use environment variables for configuration.
   - Validate required environment variables at startup where possible.
   - Do not expose server-only secrets to the client.
   - Follow existing authentication and authorization patterns.

8. **Database and persistence**
   - Use the real database layer already present in the project.
   - Do not fake persistence with local arrays, static JSON, browser storage, or temporary in-memory stores unless explicitly requested.
   - Use migrations or schema updates when needed.
   - Preserve existing data compatibility.

9. **Testing expectations**
   - Add or update tests for meaningful business logic.
   - Do not write useless tests that only check if a component renders without verifying behavior.
   - Tests must reflect real application behavior, not fake demo flows.
   - Use test fixtures only inside test files or approved testing utilities.

10. **UI expectations**
    - UI must reflect real states from real data.
    - Do not use placeholder cards, lorem ipsum, fake stats, fake charts, or mock lists.
    - Forms must submit to real handlers.
    - Buttons must perform real actions or be removed.
    - Navigation must point to real pages/routes.

11. **Final response requirements**
    - Summarize what changed.
    - Mention files modified.
    - Mention verification commands run and their results.
    - Mention anything that could not be verified.
    - Do not claim something works unless it was actually verified.

## Forbidden Patterns

Do not use:

- Mock data in production code
- Hardcoded sample users
- Placeholder API responses
- Fake loading delays
- Static JSON pretending to be real backend data
- TODO-only implementations
- Empty catch blocks
- Console-only error handling for real failures
- Unused files, unused functions, or dead code
- Over-engineered abstractions with no immediate purpose
- One giant file containing unrelated logic

## Required Behavior Before Editing

Before making code changes:

1. Inspect the relevant files.
2. Understand the current architecture.
3. Identify the real data flow.
4. Check existing package scripts.
5. Reuse existing patterns before introducing new ones.

## Required Behavior After Editing

After making code changes:

1. Run the relevant validation commands.
2. Fix all errors caused by the changes.
3. Confirm the feature works end-to-end.
4. Remove any temporary debugging code.
5. Ensure no sample/demo data was introduced.

## Quality Bar

The implementation should be suitable for a real production application.

The goal is not to make something that merely looks correct. The goal is to make something that actually works, is maintainable, and can survive future development without collapsing like a badly designed hackathon backend at 3 a.m.
