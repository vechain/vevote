import { describe, test, expect } from "vitest";
import { validateDiscourseTopicExists } from "../src/utils/discourse";

describe("validateDiscourseTopicExists", () => {
  test("accepts a plain slug", () => {
    expect(validateDiscourseTopicExists("my-topic-slug")).toBe(true);
  });

  test("accepts a slug followed by a numeric id", () => {
    expect(validateDiscourseTopicExists("my-topic-slug/12345")).toBe(true);
  });

  test("accepts a purely numeric topic id", () => {
    expect(validateDiscourseTopicExists("12345")).toBe(true);
  });

  test("accepts a full pasted URL", () => {
    expect(validateDiscourseTopicExists("https://vechain.discourse.group/t/my-topic-slug/98765")).toBe(true);
  });

  test("rejects an empty string", () => {
    expect(validateDiscourseTopicExists("")).toBe(false);
  });

  test("rejects a whitespace-only string", () => {
    expect(validateDiscourseTopicExists("   ")).toBe(false);
  });

  test("rejects a value containing spaces", () => {
    expect(validateDiscourseTopicExists("my topic with spaces")).toBe(false);
  });
});
