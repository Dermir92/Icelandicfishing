const DEFAULT_HEADERS = {
  "user-agent": "VeidistadirIngestionBot/1.0 (+https://veidistadir.local)",
  accept: "application/json,text/html;q=0.9,*/*;q=0.8",
} as const;

async function ensureOk(response: Response, url: string) {
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    redirect: "follow",
  });

  await ensureOk(response, url);
  return (await response.json()) as T;
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    redirect: "follow",
  });

  await ensureOk(response, url);
  return response.text();
}
