export class RedirectSignal extends Error {
  constructor(readonly location: string) {
    super(`Redirected to ${location}`);
    this.name = "RedirectSignal";
  }
}

export function createNavigationHarness() {
  const revalidatedPaths: string[] = [];

  return {
    revalidatedPaths,
    revalidatePath(path: string) {
      revalidatedPaths.push(path);
      return undefined;
    },
    redirect(path: string): never {
      throw new RedirectSignal(path);
    },
  };
}
