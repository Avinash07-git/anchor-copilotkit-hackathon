"""MCP tool implementations for the RentProof agent.

Each tool corresponds to one capability the agent has. Tools start as
mocks (returning hardcoded data for Rita Sharma's demo case) and get
swapped to real implementations as the build progresses.

Tools defined here:
- read_letter_pdf
- read_lease_pdf
- read_photo_metadata
- lookup_state_law
- generate_demand_letter
"""
