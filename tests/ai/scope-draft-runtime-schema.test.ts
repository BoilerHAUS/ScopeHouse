import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { scopeDraftOutputSchema } from "@/features/ai/schemas/scope-draft";

test("scope draft runtime schema keeps nested arrays and notes required", () => {
  const schema = z.toJSONSchema(scopeDraftOutputSchema) as unknown as {
    required: string[];
    properties: {
      phases: {
        items: {
          required: string[];
          properties: {
            areas: {
              items: {
                required: string[];
                properties: {
                  items: {
                    items: {
                      required: string[];
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

  const phaseSchema = schema.properties.phases.items;
  const areaSchema = phaseSchema.properties.areas.items;
  const itemSchema = areaSchema.properties.items.items;

  assert.deepEqual(schema.required, [
    "projectSummary",
    "phases",
    "assumptions",
    "risks",
  ]);
  assert.deepEqual(phaseSchema?.required, ["name", "areas"]);
  assert.deepEqual(areaSchema?.required, ["name", "items"]);
  assert.deepEqual(itemSchema?.required, ["label", "status", "notes"]);
});
