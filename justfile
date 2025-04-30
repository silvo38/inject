test:
  deno test

presubmit:
  deno fmt
  deno test
  deno lint
