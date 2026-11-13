import { tool, createAgent } from "langchain";
import * as z from "zod";

// 1. Store the copied SKILL.md contents directly as constants in memory
const SKILLS_REGISTRY: Record<string, string> = {
    write_sql: `# SQL Writing Expert Skill

You are an expert database administrator and query optimizer. 
Follow these guidelines when writing SQL:
1. Always use explicit ANSI-SQL JOIN syntax.
2. Index considerations: Always comment on potential indexing requirements.`,

    review_legal_doc: `# Legal Document Reviewer Skill

You are a meticulous legal contract reviewer. 
Focus on identifying high-risk clauses such as:
1. Unlimited liabilities or broad indemnification.
2. Unfavorable intellectual property assignment terms.
3. Strict auto-renewal and termination penalties.`,

    xrpl_agent_wallet: `# XRPL Agent Wallet Skill

[Paste the exact contents of the xrpl-agent-wallet/SKILL.md file here as a template string]
- Key management strategies for automated agents on the XRP Ledger
- Funding, trust lines, and transaction signing protocols
- Error handling for ledger sequence mismatches and fee escalation`
};

// 2. Define the tool to look up the skill from the in-memory registry
const loadSkill = tool(
    async ({ skillName }) => {
        const skillContent = SKILLS_REGISTRY[skillName];

        if (!skillContent) {
            return JSON.stringify({
                error: `Skill '${skillName}' not found in registry.`
            });
        }

        return skillContent;
    },
    {
        name: "load_skill",
        description: `Load a specialized skill prompt and context directly from memory.

Available skills:
- write_sql: SQL query writing expert
- review_legal_doc: Legal document reviewer
- xrpl_agent_wallet: XRP Ledger wallet management for AI agents

Returns the full markdown instructions for the requested skill.`,
        schema: z.object({
            skillName: z
                .enum(["write_sql", "review_legal_doc", "xrpl_agent_wallet"])
                .describe("Name of the skill to load")
        })
    }
);

const agent = createAgent({
    model: "gpt-4o",
    tools: [loadSkill],
    systemPrompt: (
        "You are a modular expert assistant. " +
        "You have access to specialized skills: write_sql, review_legal_doc, and xrpl_agent_wallet. " +
        "Use load_skill to fetch instructions whenever a user request matches a skill domain."
    ),
});