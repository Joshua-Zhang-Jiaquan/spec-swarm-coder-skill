import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { access, readdir } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

const REQUIRED_ARTIFACTS = ["spec.md", "plan.md", "tasks.md"] as const;

const CLARIFICATION_TOOL_NOTICE =
  "Clarification tool contract: use real tool invocations only; never emit <tool_call> XML tags or pseudo tool names. Clarification is TUI-only: use question with questions as an array object (not a JSON string). Tool names are case-sensitive snake_case. Never call start_session, pick_one, pick_many, get_next_answer, AskUserQuestion, StartSession, PickOne, or PickMany.";

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const text = value.trim();
  if (!text) {
    return value;
  }
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
}

function normalizeQuestions(value: unknown): unknown[] | null {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === "object") {
    return [parsed];
  }
  return null;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listFeatureDirs(worktree: string): Promise<string[]> {
  const specsRoot = join(worktree, "specs");
  if (!(await exists(specsRoot))) {
    return [];
  }
  const entries = await readdir(specsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(specsRoot, entry.name));
}

async function artifactStatus(featureDir: string) {
  const rows = await Promise.all(
    REQUIRED_ARTIFACTS.map(async (file) => {
      const filePath = join(featureDir, file);
      return {
        file,
        exists: await exists(filePath),
      };
    }),
  );

  const missing = rows.filter((row) => !row.exists).map((row) => row.file);
  return { rows, missing };
}

export const SpecSwarmCoderPlugin: Plugin = async ({ client, worktree }) => {
  await client.app.log({
    body: {
      service: "spec-swarm-coder-plugin",
      level: "info",
      message: "spec-swarm-coder plugin initialized",
    },
  });

  return {
    "experimental.chat.system.transform": async (_input, output) => {
      output.system.push(CLARIFICATION_TOOL_NOTICE);
    },

    "tool.execute.before": async (input, output) => {
      const args =
        output.args && typeof output.args === "object"
          ? (output.args as Record<string, unknown>)
          : null;
      if (!args) {
        return;
      }

      if (input.tool === "question") {
        const normalized = normalizeQuestions(args.questions);
        if (normalized) {
          args.questions = normalized;
        } else if (
          typeof args.question === "string" &&
          typeof args.header === "string" &&
          Array.isArray(parseMaybeJson(args.options))
        ) {
          args.questions = [
            {
              question: args.question,
              header: args.header,
              options: parseMaybeJson(args.options),
              multiple: Boolean(args.multiple),
            },
          ];
        }

        output.args = args;
        return;
      }

      if (
        input.tool === "start_session" ||
        input.tool === "pick_one" ||
        input.tool === "pick_many" ||
        input.tool === "get_next_answer"
      ) {
        throw new Error(
          "Clarification is TUI-only in this workflow. Use question with a questions array.",
        );
      }
    },

    tool: {
      spec_swarm_status: tool({
        description:
          "Check whether spec-swarm artifacts are ready for implementation.",
        args: {
          featureDir: tool.schema
            .string()
            .optional()
            .describe("Absolute or relative feature directory (optional)."),
        },
        async execute(args, context) {
          const targetDir = args.featureDir
            ? isAbsolute(args.featureDir)
              ? args.featureDir
              : join(context.directory, args.featureDir)
            : null;

          if (targetDir) {
            const status = await artifactStatus(targetDir);
            return JSON.stringify(
              {
                featureDir: targetDir,
                files: status.rows,
                ready: status.missing.length === 0,
                next:
                  status.missing.length === 0
                    ? "Ready for /speckit.implement"
                    : `Missing: ${status.missing.join(", ")}. Run /speckit.specify -> /speckit.plan -> /speckit.tasks.`,
              },
              null,
              2,
            );
          }

          const featureDirs = await listFeatureDirs(worktree);
          if (featureDirs.length === 0) {
            return JSON.stringify(
              {
                ready: false,
                next: "No specs/* feature directory found. Start with /speckit.specify.",
              },
              null,
              2,
            );
          }

          const report = await Promise.all(
            featureDirs.map(async (featureDir) => {
              const status = await artifactStatus(featureDir);
              return {
                featureDir,
                files: status.rows,
                ready: status.missing.length === 0,
                missing: status.missing,
              };
            }),
          );

          const blocked = report.filter((item) => !item.ready);
          return JSON.stringify(
            {
              ready: blocked.length === 0,
              report,
              next:
                blocked.length === 0
                  ? "All feature specs are implementation-ready."
                  : "Some features are missing required artifacts. Complete /speckit.specify, /speckit.plan, and /speckit.tasks.",
            },
            null,
            2,
          );
        },
      }),
    },

    "command.execute.before": async (input) => {
      if (input.command !== "/speckit.implement" && input.command !== "speckit.implement") {
        return;
      }

      const featureDirs = await listFeatureDirs(worktree);
      if (featureDirs.length === 0) {
        throw new Error(
          "Cannot run /speckit.implement yet: no specs/* feature directory found. Run /speckit.specify first.",
        );
      }

      const statuses = await Promise.all(featureDirs.map((dir) => artifactStatus(dir)));
      const hasReadyFeature = statuses.some((status) => status.missing.length === 0);

      if (!hasReadyFeature) {
        throw new Error(
          "Cannot run /speckit.implement yet: required artifacts are missing. Complete /speckit.specify, /speckit.plan, and /speckit.tasks.",
        );
      }
    },
  };
};

export default SpecSwarmCoderPlugin;
