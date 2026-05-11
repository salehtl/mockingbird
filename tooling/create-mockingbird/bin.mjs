#!/usr/bin/env node
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const TEMPLATE_REPO = 'https://github.com/salehtl/mockingbird.git';

function red(s)   { return `\x1b[31m${s}\x1b[0m`; }
function green(s) { return `\x1b[32m${s}\x1b[0m`; }
function dim(s)   { return `\x1b[2m${s}\x1b[0m`; }
function bold(s)  { return `\x1b[1m${s}\x1b[0m`; }

function die(msg) {
  console.error(`\n  ${red('✗')} ${msg}\n`);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) die(`Command failed: ${cmd} ${args.join(' ')}`);
}

function isValidName(name) {
  // npm package name rules, loosely: lowercase, no spaces, allowed punctuation.
  return /^[a-z0-9][a-z0-9._-]*$/.test(name);
}

async function prompt(question, fallback) {
  const rl = createInterface({ input: stdin, output: stdout });
  const ans = (await rl.question(`  ${question} ${dim(`(${fallback})`)} `)).trim();
  rl.close();
  return ans || fallback;
}

const cliArg = process.argv[2];
let projectName = cliArg;
if (!projectName) {
  projectName = await prompt('Project name?', 'my-mockingbird');
}

if (!isValidName(projectName)) {
  die(`Invalid project name: "${projectName}". Use lowercase letters, digits, dot, dash, or underscore.`);
}

const target = resolve(process.cwd(), projectName);
if (existsSync(target)) die(`Directory already exists: ${target}`);

console.log(`\n  ${bold('mockingbird')} ${dim('— scaffolding')} ${green(projectName)}\n`);

run('git', ['clone', '--depth', '1', TEMPLATE_REPO, target]);

// Strip template metadata and the scaffolder itself from the new project.
rmSync(`${target}/.git`, { recursive: true, force: true });
rmSync(`${target}/tooling`, { recursive: true, force: true });

const pkgPath = `${target}/package.json`;
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = basename(projectName);
pkg.version = '0.0.1';
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const readmePath = `${target}/README.md`;
if (existsSync(readmePath)) {
  const readme = readFileSync(readmePath, 'utf8');
  writeFileSync(readmePath, readme.replace(/^# mockingbird\b/, `# ${pkg.name}`));
}

run('git', ['init', '-b', 'main'], { cwd: target });

console.log(`\n  ${green('✓')} Ready.\n`);
console.log(`  ${dim('next:')}`);
console.log(`    cd ${projectName}`);
console.log(`    bun install`);
console.log(`    bun dev\n`);
