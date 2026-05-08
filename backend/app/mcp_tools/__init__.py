"""MCP tools for Bedside.

Eight tools, grouped by concern:
  - observation_parser : parse_observation_log, log_observation
  - scoring            : update_wellbeing_score, calculate_observation_rate
  - patterns           : check_pattern_match, get_pattern_context
  - support            : find_local_support, draft_talking_points

All tools are real implementations (no fakes). Some tools call mocked data
sources (e.g. find_local_support reads from `app.data.demo_dataset`) — that
is fine and disclosed as such in BEDSIDE_SPEC.md §11.

Every tool obeys safer-language rules. No tool returns clinical claims.
"""
from app.mcp_tools.observation_parser import (
    log_observation,
    parse_observation_log,
)
from app.mcp_tools.patterns import check_pattern_match, get_pattern_context
from app.mcp_tools.scoring import (
    calculate_observation_rate,
    update_wellbeing_score,
)
from app.mcp_tools.support import draft_talking_points, find_local_support

ALL_TOOLS = [
    parse_observation_log,
    log_observation,
    update_wellbeing_score,
    calculate_observation_rate,
    check_pattern_match,
    get_pattern_context,
    find_local_support,
    draft_talking_points,
]
