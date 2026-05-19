import { NextRequest, NextResponse } from "next/server";
import config from "@/config/config";

export async function POST(req: NextRequest) {
  try {
    const targetUrl = String(config.commerceBaseUrl ?? "").trim();

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Commerce base URL is not configured" },
        { status: 500 },
      );
    }

    // Read incoming request body (GraphQL payload)
    const body = await req.text();

    // Forward only required headers to avoid upstream routing issues.
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    const authHeader =
      req.headers.get("authorization") ?? req.headers.get("Authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const requestStore =
      req.headers.get("store") ??
      req.headers.get("Store") ??
      config.commerceStoreCode;
    if (requestStore) {
      headers.set("Store", requestStore);
    }

    const requestApiKey =
      req.headers.get("x-api-key") ??
      req.headers.get("X-Api-Key") ??
      config.commerceApiKey;
    if (requestApiKey) {
      headers.set("X-Api-Key", requestApiKey);
    }

    if (process.env.COMMERCE_GRAPHQL_TLS_INSECURE === "true") {
      // DDEV/local SSL can be self-signed; allow opt-in insecure TLS for dev.
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
