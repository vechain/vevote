import { describe, test, expect, vi, afterEach } from "vitest";
import { validateDiscourseTopicExists } from "../src/utils/discourse";

// Use a 0ms debounce so the network branch runs immediately in tests.
const validate = (topic: string) => validateDiscourseTopicExists(topic, 0);

describe("validateDiscourseTopicExists", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("resolves false for an empty string without fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(validate("")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("resolves false for a whitespace-only string without fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(validate("   ")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("resolves true when the topic exists (CORS allowed, e.g. mainnet)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(validate("my-topic-slug")).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { method: "HEAD" });
  });

  test("resolves false when the topic genuinely does not exist (e.g. 404 on an allowed origin)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    await expect(validate("does-not-exist")).resolves.toBe(false);
  });

  test("fails open (resolves true) when the browser blocks the request (CORS/network error, e.g. testnet)", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(validate("my-topic-slug")).resolves.toBe(true);
  });
});
