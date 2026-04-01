import assert from "node:assert/strict";
import test from "node:test";
import { signUpSchema } from "@/features/auth/schemas/sign-up";

test("signUpSchema requires matching passwords", () => {
  const result = signUpSchema.safeParse({
    name: "Jamie Builder",
    email: "jamie@example.com",
    password: "scopehouse-demo",
    confirmPassword: "scopehouse-dem0",
  });

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  const issues = result.error.flatten().fieldErrors;
  assert.deepEqual(issues.confirmPassword, ["Passwords do not match."]);
});

test("signUpSchema trims and normalizes signup values", () => {
  const result = signUpSchema.safeParse({
    name: "  Jamie Builder  ",
    email: "  JAMIE@EXAMPLE.COM  ",
    password: "scopehouse-demo",
    confirmPassword: "scopehouse-demo",
  });

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.data.name, "Jamie Builder");
  assert.equal(result.data.email, "jamie@example.com");
});
