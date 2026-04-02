import { headers } from "next/headers";

function normalizeIpAddress(value: string | null) {
  return value?.split(",")[0]?.trim() || "unknown";
}

export function getIpAddressFromHeaders(headersLike: Pick<Headers, "get">) {
  return normalizeIpAddress(
    headersLike.get("x-forwarded-for") ?? headersLike.get("x-real-ip"),
  );
}

export async function getRequestIpAddress() {
  const headerStore = await headers();
  return getIpAddressFromHeaders(headerStore);
}
