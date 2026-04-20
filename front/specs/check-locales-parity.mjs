import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

const LOCALE_CODES = ["en", "es", "it"];
const LOCALES_DIR = path.resolve(process.cwd(), "app/lib/i18n/locales");

const kindOf = (value) => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "function") return "function";
  if (typeof value === "object") return "object";
  return typeof value;
};

const loadLocale = (code) => {
  const filePath = path.join(LOCALES_DIR, `${code}.ts`);
  const source = fs.readFileSync(filePath, "utf8");

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const moduleRef = { exports: {} };
  const context = {
    module: moduleRef,
    exports: moduleRef.exports,
    require,
  };

  vm.runInNewContext(transpiled, context, {
    filename: filePath,
    timeout: 5000,
  });

  const dictionary = moduleRef.exports.default ?? context.exports.default;
  if (!dictionary || typeof dictionary !== "object" || Array.isArray(dictionary)) {
    throw new Error(`Locale ${code} does not export a dictionary object`);
  }

  return dictionary;
};

const collectPaths = (dictionary, prefix = "", output = new Map()) => {
  for (const key of Object.keys(dictionary)) {
    const value = dictionary[key];
    const nextPath = prefix ? `${prefix}.${key}` : key;
    const valueKind = kindOf(value);

    output.set(nextPath, valueKind);

    if (valueKind === "object") {
      collectPaths(value, nextPath, output);
    }
  }

  return output;
};

const dictionaries = Object.fromEntries(
  LOCALE_CODES.map((code) => [code, loadLocale(code)]),
);

const maps = Object.fromEntries(
  LOCALE_CODES.map((code) => [code, collectPaths(dictionaries[code])]),
);

const allPaths = new Set();
for (const code of LOCALE_CODES) {
  for (const key of maps[code].keys()) {
    allPaths.add(key);
  }
}

const sortedPaths = [...allPaths].sort();
const missing = [];
const mismatchedKinds = [];

for (const key of sortedPaths) {
  const presentIn = LOCALE_CODES.filter((code) => maps[code].has(key));

  if (presentIn.length !== LOCALE_CODES.length) {
    missing.push({ key, presentIn });
    continue;
  }

  const kinds = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, maps[code].get(key)]),
  );
  const uniqueKinds = new Set(Object.values(kinds));

  if (uniqueKinds.size > 1) {
    mismatchedKinds.push({ key, kinds });
  }
}

if (missing.length === 0 && mismatchedKinds.length === 0) {
  console.log(
    `[ok] Locale dictionaries are in parity (${LOCALE_CODES.join(", ")}) with ${sortedPaths.length} shared keys.`,
  );
  process.exit(0);
}

if (missing.length > 0) {
  console.error("[error] Missing locale keys detected:");
  for (const item of missing) {
    console.error(`- ${item.key} (present in: ${item.presentIn.join(", ") || "none"})`);
  }
}

if (mismatchedKinds.length > 0) {
  console.error("[error] Locale key type mismatches detected:");
  for (const item of mismatchedKinds) {
    const details = LOCALE_CODES.map(
      (code) => `${code}=${item.kinds[code]}`,
    ).join(", ");
    console.error(`- ${item.key} (${details})`);
  }
}

process.exit(1);
