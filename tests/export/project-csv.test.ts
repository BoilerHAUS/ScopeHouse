import assert from "node:assert/strict";
import test from "node:test";
import { buildBudgetCsv } from "@/features/export/services/build-budget-csv";
import { buildScopeCsv } from "@/features/export/services/build-scope-csv";

test("buildBudgetCsv formats readable currency and includes totals", () => {
  const csv = buildBudgetCsv({
    categories: [
      {
        id: "cat_1",
        projectId: "project_1",
        label: "Cabinetry",
        notes: "Primary millwork scope",
        status: "active",
        itemOrder: 0,
        totals: {
          estimateCents: 220000,
          allowanceCents: 250000,
          quotedCents: 280000,
          actualCents: 0,
          planningCents: 280000,
        },
        lines: [
          {
            id: "line_1",
            projectId: "project_1",
            categoryId: "cat_1",
            scopeItemId: "scope_1",
            label: "Lower cabinets",
            estimateCents: 220000,
            allowanceCents: 250000,
            quotedCents: 280000,
            actualCents: null,
            sourceReference: "Quote A",
            notes: "Includes install",
            itemOrder: 0,
            scopeItem: {
              id: "scope_1",
              label: "Install cabinets",
              phaseName: "Construction",
              areaName: "Kitchen",
            },
          },
        ],
      },
    ],
    totals: {
      estimateCents: 220000,
      allowanceCents: 250000,
      quotedCents: 280000,
      actualCents: 0,
      planningCents: 280000,
    },
  });

  assert.match(csv, /Cabinetry/);
  assert.match(csv, /Lower cabinets/);
  assert.match(csv, /\$2,200/);
  assert.match(csv, /\$2,800/);
  assert.match(csv, /Planning total,"\$2,800"/);
});

test("buildScopeCsv flattens phases, areas, and items into spreadsheet rows", () => {
  const csv = buildScopeCsv([
    {
      phaseName: "Construction",
      phaseOrder: 0,
      areas: [
        {
          areaName: "Kitchen",
          areaOrder: 0,
          items: [
            {
              id: "scope_1",
              projectId: "project_1",
              phaseName: "Construction",
              phaseOrder: 0,
              areaName: "Kitchen",
              areaOrder: 0,
              itemOrder: 0,
              label: "Install cabinets",
              notes: "Verify filler strips before order.",
              status: "active",
              source: "manual",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    },
  ]);

  assert.match(csv, /Phase,Phase Order,Area,Area Order,Item,Item Order,Status,Source,Notes/);
  assert.match(csv, /Construction,0,Kitchen,0,Install cabinets,0,active,manual,Verify filler strips before order\./);
});
