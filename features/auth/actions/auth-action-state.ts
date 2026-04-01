export type AuthActionState = {
  error?: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "password" | "confirmPassword", string>
  >;
  formValues?: Partial<Record<"name" | "email", string>>;
};
