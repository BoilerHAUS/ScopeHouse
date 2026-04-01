import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBudgetRollup,
  formatCurrencyFromCents,
  getBudgetLinePlanningCents,
} from "@/features/budget/services/budget-calculations";

test("getBudgetLinePlanningCents prioritizes actual over quoted, allowance, and estimate", () => {
  assert.equal(
    getBudgetLinePlanningCents({
      estimateCents: 1000,
      allowanceCents: 2000,
      quotedCents: 3000,
      actualCents: 4000,
    }),
    4000,
  );

  assert.equal(
    getBudgetLinePlanningCents({
      estimateCents: 1000,
      allowanceCents: 2000,
      quotedCents: 3000,
      actualCents: null,
    }),
    3000,
  );

  assert.equal(
    getBudgetLinePlanningCents({
      estimateCents: 1000,
      allowanceCents: 2000,
      quotedCents: null,
      actualCents: null,
    }),
    2000,
  );

  assert.equal(
    getBudgetLinePlanningCents({
      estimateCents: 1000,
      allowanceCents: null,
      quotedCents: null,
      actualCents: null,
    }),
    1000,
  );

  assert.equal(
    getBudgetLinePlanningCents({
      estimateCents: null,
      allowanceCents: null,
      quotedCents: null,
      actualCents: null,
    }),
    0,
  );
});

test("calculateBudgetRollup sums each amount column and planning total safely", () => {
  const rollup = calculateBudgetRollup([
    {
      estimateCents: 1000,
      allowanceCents: 1200,
      quotedCents: 1400,
      actualCents: null,
    },
    {
      estimateCents: 500,
      allowanceCents: null,
      quotedCents: null,
      actualCents: null,
    },
    {
      estimateCents: null,
      allowanceCents: null,
      quotedCents: 2000,
      actualCents: 2500,
    },
  ]);

  assert.deepEqual(rollup, {
    estimateCents: 1500,
    allowanceCents: 1200,
    quotedCents: 3400,
    actualCents: 2500,
    planningCents: 4400,
  });
});

test("formatCurrencyFromCents returns whole-dollar USD formatting", () => {
  assert.equal(formatCurrencyFromCents(123400), "$1,234");
});
