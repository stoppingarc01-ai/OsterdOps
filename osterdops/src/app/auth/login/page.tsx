import { redirect } from "next/navigation";

export default async function AuthLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      queryString.set(key, value);
    } else if (Array.isArray(value)) {
      queryString.set(key, value.join(","));
    }
  }

  const query = queryString.toString();
  redirect(query ? `/sign-in?${query}` : "/sign-in");
}
