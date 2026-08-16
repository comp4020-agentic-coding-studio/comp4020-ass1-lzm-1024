import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { strict as assert } from "node:assert";

const DIST = resolve("dist");
const EVIDENCE = resolve("browser-evidence");

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

function browserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);

  const executable = candidates.find((candidate) => existsSync(candidate));
  if (!executable) {
    throw new Error("Chrome or Edge was not found. Set CHROME_PATH to run browser evidence checks.");
  }
  return executable;
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
      const filePath = resolve(DIST, relativePath);
      if (filePath !== DIST && !filePath.startsWith(`${DIST}${sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(filePath);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": MIME_TYPES.get(extname(filePath)) ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Static server did not expose a port.");
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

async function waitForFile(path, timeoutMilliseconds = 10_000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    if (existsSync(path)) return;
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${path}`);
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Map();
    this.pageErrors = [];

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
        else pending.resolve(message.result);
        return;
      }

      if (message.method === "Runtime.exceptionThrown") {
        this.pageErrors.push(message.params.exceptionDetails.text);
      }
      const eventWaiters = this.waiters.get(message.method) ?? [];
      this.waiters.delete(message.method);
      for (const waiter of eventWaiters) waiter(message.params);
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolveOpen, rejectOpen) => {
      socket.addEventListener("open", resolveOpen, { once: true });
      socket.addEventListener("error", rejectOpen, { once: true });
    });
    return new CdpClient(socket);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { method, resolve: resolveSend, reject: rejectSend });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMilliseconds = 10_000) {
    return new Promise((resolveEvent, rejectEvent) => {
      const timer = setTimeout(() => rejectEvent(new Error(`Timed out waiting for ${method}`)), timeoutMilliseconds);
      const waiter = (params) => {
        clearTimeout(timer);
        resolveEvent(params);
      };
      const existing = this.waiters.get(method) ?? [];
      existing.push(waiter);
      this.waiters.set(method, existing);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  }

  async waitFor(expression, label, timeoutMilliseconds = 7_000) {
    const deadline = Date.now() + timeoutMilliseconds;
    while (Date.now() < deadline) {
      if (await this.evaluate(expression)) return;
      await delay(50);
    }
    throw new Error(`Timed out waiting for ${label}`);
  }

  close() {
    this.socket.close();
  }
}

async function launchBrowser(origin) {
  const profile = await mkdtemp(join(tmpdir(), "stopping-browser-evidence-"));
  const browser = spawn(browserExecutable(), [
    "--headless=new",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-sync",
    "--no-default-browser-check",
    "--no-first-run",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });

  let browserError = "";
  browser.stderr.on("data", (chunk) => {
    browserError = `${browserError}${chunk}`.slice(-4_000);
  });
  const activePortFile = join(profile, "DevToolsActivePort");
  try {
    await waitForFile(activePortFile);
  } catch (error) {
    browser.kill();
    throw new Error(`${error.message}\n${browserError}`);
  }

  const [port] = (await readFile(activePortFile, "utf8")).split(/\r?\n/);
  const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(origin)}`, {
    method: "PUT",
  });
  if (!targetResponse.ok) throw new Error(`Chrome target creation failed: ${targetResponse.status}`);
  const target = await targetResponse.json();
  const client = await CdpClient.connect(target.webSocketDebuggerUrl);

  return { browser, client, profile };
}

async function setViewport(client, width, height, mobile) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
}

async function navigate(client, url) {
  const loaded = client.waitForEvent("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await loaded;
  await client.waitFor("document.readyState === 'complete'", `load of ${url}`);
}

async function pressKey(client, { key, code, virtualKeyCode, text = "" }) {
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    text,
    unmodifiedText: text,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
}

async function assertNoHorizontalOverflow(client, label) {
  const dimensions = await client.evaluate(`({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth
  })`);
  assert.ok(
    dimensions.content <= dimensions.viewport + 1,
    `${label} overflows horizontally: ${dimensions.content}px content in ${dimensions.viewport}px viewport`,
  );
}

async function screenshot(client, filename) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(join(EVIDENCE, filename), Buffer.from(result.data, "base64"));
}

async function run() {
  assert.ok(existsSync(join(DIST, "index.html")), "dist/index.html is missing; run pnpm build first.");
  await mkdir(EVIDENCE, { recursive: true });
  const { server, origin } = await startStaticServer();
  const { browser, client, profile } = await launchBrowser(origin);

  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");

    await setViewport(client, 1920, 1080, false);
    await navigate(client, `${origin}/index.html`);
    const before = await client.evaluate(`({
      total: Number(document.querySelector('#total-distance').textContent),
      marker: document.querySelector('.road-visual').style.getPropertyValue('--total-position')
    })`);
    const after = await client.evaluate(`(() => {
      const speed = document.querySelector('#speed');
      speed.value = '110';
      speed.dispatchEvent(new Event('input', { bubbles: true }));
      return {
        total: Number(document.querySelector('#total-distance').textContent),
        marker: document.querySelector('.road-visual').style.getPropertyValue('--total-position')
      };
    })()`);
    assert.ok(after.total > before.total, "The desktop speed control did not increase stopping distance.");
    assert.notEqual(after.marker, before.marker, "The desktop road marker did not follow the model.");

    const keyboardStart = await client.evaluate(`(() => {
      const speed = document.querySelector('#speed');
      speed.focus();
      return speed.value;
    })()`);
    await pressKey(client, { key: "ArrowLeft", code: "ArrowLeft", virtualKeyCode: 37 });
    const keyboardEnd = await client.evaluate("document.querySelector('#speed').value");
    assert.notEqual(keyboardEnd, keyboardStart, "The range input did not respond to the keyboard.");
    await assertNoHorizontalOverflow(client, "desktop home page");
    await client.evaluate("window.scrollTo(0, 0)");
    await screenshot(client, "desktop-core-interaction.png");

    await navigate(client, `${origin}/experiments.html`);
    await assertNoHorizontalOverflow(client, "desktop experiments page");
    await client.evaluate("document.querySelector('#reaction-start').click()");
    await client.waitFor("document.querySelector('#reaction-game').dataset.state === 'waiting'", "reaction waiting state");

    await setViewport(client, 390, 844, true);
    const stateAfterResize = await client.evaluate("document.querySelector('#reaction-game').dataset.state");
    assert.ok(["waiting", "go"].includes(stateAfterResize), "Reaction state was lost during resize.");
    await assertNoHorizontalOverflow(client, "mobile experiments page during reaction run");
    await client.waitFor("document.querySelector('#reaction-game').dataset.state === 'go'", "random reaction hazard", 4_000);
    await delay(250);
    await pressKey(client, { key: " ", code: "Space", virtualKeyCode: 32, text: " " });
    await client.waitFor("document.querySelector('#reaction-game').dataset.state === 'result'", "keyboard reaction result");
    const reactionResult = await client.evaluate(`({
      visible: !document.querySelector('#reaction-result').hidden,
      seconds: Number(document.querySelector('#measured-reaction').textContent)
    })`);
    assert.equal(reactionResult.visible, true, "The reaction result did not become visible.");
    assert.ok(reactionResult.seconds >= 0.01, "The reaction result was not measured.");
    await client.evaluate("document.querySelector('#reaction-result').scrollIntoView({ block: 'center' })");
    await screenshot(client, "mobile-keyboard-reaction.png");

    await client.evaluate("document.querySelector('#hazard-start').click()");
    await client.waitFor("document.querySelector('#hazard-clip').dataset.state === 'hazard'", "random hazard appearance", 6_000);
    await delay(250);
    await pressKey(client, { key: " ", code: "Space", virtualKeyCode: 32, text: " " });
    await client.waitFor("document.querySelector('#hazard-clip').dataset.state === 'result'", "keyboard hazard result");
    const hazardResult = await client.evaluate(`({
      scenario: document.querySelector('#hazard-clip').dataset.scenario,
      visible: !document.querySelector('#hazard-analysis').hidden,
      seconds: Number(document.querySelector('#hazard-reaction-time').textContent)
    })`);
    assert.ok(["pedestrian", "cyclist", "stopped-car"].includes(hazardResult.scenario), "No random scenario ran.");
    assert.equal(hazardResult.visible, true, "The hazard analysis did not become visible.");
    assert.ok(hazardResult.seconds >= 0.01, "The hazard response was not measured.");
    await assertNoHorizontalOverflow(client, "mobile experiments page after hazard result");
    await client.evaluate("document.querySelector('#hazard-analysis').scrollIntoView({ block: 'center' })");
    await screenshot(client, "mobile-random-hazard.png");

    await setViewport(client, 1920, 1080, false);
    assert.equal(
      await client.evaluate("document.querySelector('#hazard-clip').dataset.state"),
      "result",
      "Hazard result was lost when resizing back to desktop.",
    );
    await assertNoHorizontalOverflow(client, "resized desktop experiments page");
    assert.deepEqual(client.pageErrors, [], `Browser page errors: ${client.pageErrors.join("; ")}`);

    const report = {
      viewports: ["1920x1080", "390x844"],
      checks: [
        "core slider changes both calculation and road marker",
        "range control responds to keyboard input",
        "reaction run survives a desktop-to-mobile resize",
        "Space completes the random reaction test",
        "Space completes a random hazard scenario",
        "no horizontal overflow at either marking viewport",
        "completed interaction state survives resize back to desktop",
      ],
      screenshots: [
        "desktop-core-interaction.png",
        "mobile-keyboard-reaction.png",
        "mobile-random-hazard.png",
      ],
    };
    await writeFile(join(EVIDENCE, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Browser evidence passed (${report.checks.length} checks, ${report.screenshots.length} screenshots).`);
  } finally {
    client.close();
    const browserExited = new Promise((resolveExit) => browser.once("exit", resolveExit));
    browser.kill();
    await Promise.race([browserExited, delay(2_000)]);
    await new Promise((resolveClose) => server.close(resolveClose));
    const temporaryRoot = `${resolve(tmpdir())}${sep}`;
    if (resolve(profile).startsWith(temporaryRoot)) {
      await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } else {
      console.error(`Refusing to remove unexpected browser profile path: ${profile}`);
      process.exitCode = 1;
    }
  }
}

await run().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
