"""calc.js のテストを QuickJS で実行する（Node.js 不要）。

使い方:
    pip install quickjs
    python tests/run_tests.py
"""
import json
import pathlib
import sys

import quickjs

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ["saitama-data.js", "calc.js", "tests/calc.test.js"]


def main() -> int:
    ctx = quickjs.Context()
    for name in FILES:
        ctx.eval((ROOT / name).read_text(encoding="utf-8"))
    results = json.loads(ctx.eval("JSON.stringify(globalThis.__TEST_RESULTS__)"))
    failed = [r for r in results if not r["ok"]]
    for r in results:
        mark = "PASS" if r["ok"] else "FAIL"
        print(f"{mark}  {r['name']}" + ("" if r["ok"] else f"\n      {r['msg']}"))
    print(f"\n{len(results) - len(failed)} / {len(results)} passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
