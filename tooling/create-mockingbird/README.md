# create-mockingbird

Scaffold a new [mockingbird](https://github.com/salehtl/mockingbird) prototype.

```bash
bun create mockingbird my-app
# or
npm create mockingbird@latest my-app
# or
pnpm create mockingbird my-app
```

Then:

```bash
cd my-app
bun install
bun dev
```

Opens at <http://localhost:5173> with the device viewer wrapping a fresh prototype.

## What it does

1. Clones `salehtl/mockingbird` into the target directory (`--depth 1`)
2. Removes the original `.git/` and the `tooling/` directory
3. Rewrites `package.json` with the new project name and version `0.0.1`
4. Updates the README heading
5. Initializes a fresh git repo

No dependencies are installed automatically — run `bun install` (or your package manager of choice).

## Publishing this scaffolder

From the repo root:

```bash
cd tooling/create-mockingbird
npm publish --access public
```
