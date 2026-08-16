// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { initLanguageSwitcher, localizeDocument, t } from "./i18n";

describe("five-language mode", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
    document.body.innerHTML = `
      <select data-language-select aria-label="Language">
        <option value="en">English</option><option value="zh-CN">简体中文</option>
        <option value="zh-TW">繁體中文</option><option value="ja">日本語</option><option value="ko">한국어</option>
      </select>
      <h1>How much road do you really need to stop?</h1>
    `;
  });

  it.each([
    ["zh-CN", "你到底需要多长的道路才能停下？"],
    ["zh-TW", "你到底需要多長的道路才能停下？"],
    ["ja", "停止するには本当にどれだけの道路が必要？"],
    ["ko", "멈추려면 실제로 얼마나 긴 도로가 필요할까요?"],
  ])("localises static content into %s", (language, expected) => {
    localStorage.setItem("stopping-distance-language", language);
    localizeDocument();
    expect(document.documentElement.lang).toBe(language);
    expect(document.querySelector("h1")?.textContent).toBe(expected);
  });

  it("saves a selector change for navigation between pages", () => {
    initLanguageSwitcher();
    const selector = document.querySelector<HTMLSelectElement>("[data-language-select]")!;
    selector.value = "zh-CN";
    selector.dispatchEvent(new Event("change"));
    expect(localStorage.getItem("stopping-distance-language")).toBe("zh-CN");
    expect(document.documentElement.lang).toBe("zh-CN");
  });

  it("localises explanatory paragraphs and evidence links", () => {
    document.body.innerHTML = `
      <p>Reaction distance rises with speed. Braking distance rises with speed squared—and wet roads or worn tread stretch it further.</p>
      <p>Reaction time is fixed at 1.5 seconds. Dry and wet braking are calibrated to the Queensland Government stopping-distance table.</p>
      <a>Queensland stopping-distance data</a>
    `;
    localStorage.setItem("stopping-distance-language", "zh-CN");
    localizeDocument();

    expect(document.body.textContent).toContain("反应距离随速度线性增加");
    expect(document.body.textContent).toContain("反应时间固定为1.5秒");
    expect(document.querySelector("a")?.textContent).toBe("昆士兰停车距离数据");
  });

  it("switches the hazard-perception heading across all five modes", () => {
    document.body.innerHTML = "<h2>How quickly do you notice danger?</h2>";
    const expected = {
      en: "How quickly do you notice danger?",
      "zh-CN": "你能多快发现危险？",
      "zh-TW": "你能多快發現危險？",
      ja: "危険にどれだけ早く気づける？",
      ko: "위험을 얼마나 빨리 알아차릴까요?",
    };

    for (const [language, heading] of Object.entries(expected)) {
      localStorage.setItem("stopping-distance-language", language);
      localizeDocument();
      expect(document.querySelector("h2")?.textContent).toBe(heading);
    }
  });

  it("translates dynamic values", () => {
    localStorage.setItem("stopping-distance-language", "ja");
    expect(t("reaction.seconds", { value: "0.82" })).toContain("0.82");
    expect(t("reaction.seconds", { value: "0.82" })).toContain("反応時間");
  });
});
