import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { access, readdir } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

const REQUIRED_ARTIFACTS = ["spec.md", "plan.md", "tasks.md"] as const;

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
