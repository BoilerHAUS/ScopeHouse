import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("scope draft prompt schema requires notes on nested items and allows null", async () => {
  const schemaPath = path.join(
    process.cwd(),
    "prompts",
    "scope-draft",
    "output-schema.json",
  );
  const raw = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(raw) as {
    properties: {
      phases: {
        items: {
          properties: {
            areas: {
              items: {
                properties: {
                  items: {
                    items: {
                      required: string[];
                      properties: {
                        notes: {
                          anyOf?: Array<{ type: string }>;
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  const itemSchema =
    schema.properties.phases.items.properties.areas.items.properties.items.items;

  assert.ok(
    itemSchema.required.includes("notes"),
    "nested scope-draft items must require the notes field",
  );

  assert.deepEqual(itemSchema.properties.notes.anyOf, [
    { type: "string" },
    { type: "null" },
  ]);
});
