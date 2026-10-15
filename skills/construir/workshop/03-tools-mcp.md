# Module 3: Tools & MCP

## Core Idea

So far, we've defined who the agents are and what their rules are. But agents can so far only think; they can't yet do anything.

An agent that only reads and writes text is like someone with no access to the actual tools of the trade. It has the knowledge, but not the hands.

**Tools** give an agent hands. They let it:
- Read and write files
- Call APIs
- Inspect external systems
- Validate things
- Use external services

## What a Tool Is

A tool is a function the agent can call. It decides for itself when it needs which tool, based on its task and the context.

From the agent's point of view, a tool looks like this:

```
Name:         read_record
Description:  Reads a record from the system of record
Input:        { "id": "..." }
Output:       The content as structured data
```

The agent reads the description and decides: "I need this information to check whether X already exists. I'll call this tool."

The description is what matters most. A poorly described tool gets used incorrectly by the agent, or not at all.

## What MCP Is

MCP stands for **Model Context Protocol**, an open standard that defines how tools get exchanged between systems.

Think of it as a power outlet:
- In the past, every AI provider had its own tool API, incompatible with all the others
- MCP is the standardized outlet: a tool that speaks MCP works with any agent that understands MCP

That means an MCP server someone else built (e.g. for Figma, GitHub, a database) works instantly in your own harness. You don't have to build it yourself.

```
Agent (a role in Claude Code)
    ↕ MCP
MCP Server (Figma, Filesystem, GitHub, internal system...)
    ↕
External System
```

## Two Kinds of Tools

**1. Built-in Tools**
Available directly in the agent system: reading/writing files, running code, web search. These don't need to be installed; a role just needs them on its list.

**2. MCP Servers**
External servers that provide specialized tools, for exactly the system this field works with. These need to be configured: which servers are available.

## What Tools Does This Harness Need?

Go through the roles from Module 2 and ask for each: what does it need to read? What does it need to write? What external system does it need to access?

| Role | Needs | Tool |
|---|---|---|
| *(from Module 2, role 1)* | *(read/write/check what)* | *(Filesystem / MCP server / Custom)* |
| *(from Module 2, role 2)* | … | … |
| Reviewer | Ability to read everything the others produced | `Read, Grep, Glob` (usually enough) |

Two or three tool categories usually cover almost everything; the rest is optional or very specific.

## How Tools Get Configured

Two places, two questions.

**1. Which servers exist?** One file at the project root, `.mcp.json`:

```json
{
  "mcpServers": {
    "<name>": {
      "command": "<mcp-server-command>",
      "args": ["<argument>"]
    }
  }
}
```

**2. Which role may use what?** The `tools` line in each role file from Module 2:

```markdown
---
name: <creator-role>
description: ...
tools: Read, Grep, Glob, Write, Edit, mcp__<server>__<tool>
---
```

`tools` is an allowlist: a role can use what's listed and nothing else. Built-in tools go by their name (`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`). Tools from an MCP server are named `mcp__<server>__<tool>`; `mcp__<server>` alone grants every tool that server offers.

This is where the boundaries from Module 2 become enforceable. A role whose file says "doesn't change the source of truth" and whose `tools` line has no write tool for it can't cross that line, even by mistake.

For the reviewer, list MCP tools one by one and only the ones that read. `mcp__<server>` would hand it the server's write tools too.

## Tool Descriptions Are Context

This is the most important point in this module: **tools aren't just functions, they're context.**

A good description tells the agent when to use the tool. A bad description leads to the agent ignoring the tool or misusing it.

Bad:
```
Name: get_file
Description: Gets a file
```

Good:
```
Name: get_record
Description: Reads a record from the system of record.
Use this before creating something new, to check whether it already exists.
Returns the full content of the requested record.
```

## Questions For You

- For each role from Module 2: what does it need to read/write/check?
- Which existing tools/systems are already used day-to-day that the agent should have access to? (From the intake, concretize here)
- Does an MCP server already exist for that (official or community), or does something custom need to be built?

## What Gets Built

- `.mcp.json` at the project root: which MCP servers are active (skip it if no role needs an external system)
- The `tools` line in every role file under `.claude/agents/`, updated to what that role actually needs
- Where a role should use a tool at a specific moment ("check for an existing record before creating one"), that sentence goes into the role's Process section
- Optional: `harness/tools/tool-descriptions.md`, a plain overview for humans of which role uses which tool. Agents don't load it.

## Notes For Running This

- If `.mcp.json` already exists, add to it; don't replace it. Show the person the result before writing.
- Never write secrets (API keys, tokens) into `.mcp.json`. Reference an environment variable instead (`"${API_KEY}"`) and note in `HANDOUT.md` that it needs to be set.
- Claude Code asks for approval before using servers from a project's `.mcp.json`. Tell the person to start a new session and approve them, then check with `/mcp` that they're connected.
- You don't write the descriptions of an existing MCP server's tools; the server brings them. The "good vs. bad description" lesson applies to custom tools and to how the role file tells a role when to use a tool.
- If it's unclear whether an MCP server exists, say so openly. Don't guess or invent one. Research it if possible, or flag it in `HANDOUT.md` as an open item.
- Start small: two well-described tools beat ten half-finished ones.
