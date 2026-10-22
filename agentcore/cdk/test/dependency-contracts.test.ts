import { createRequire } from 'node:module';

// Coverage discovers TypeScript sources through test-exclude and minimatch.
// A cross-major brace-expansion override can break that public tooling path.
test('coverage discovers TypeScript source files', () => {
  const TestExclude = require('test-exclude');
  const files = new TestExclude({ cwd: process.cwd() }).globSync();
  expect(files).toContain('lib/cdk-stack.ts');
});

test('NYC accepts ordinary YAML configuration with the scoped parser', () => {
  const nycRequire = createRequire(require.resolve('@istanbuljs/load-nyc-config'));
  const yaml = nycRequire('js-yaml');
  expect(yaml.load('all: true\ninclude:\n  - src/**/*.ts\n')).toEqual({
    all: true,
    include: ['src/**/*.ts'],
  });
});
