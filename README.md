# Simple dependency injection library for TypeScript

This is inspired by Angular's `inject()` function, and doesn't rely on
decorators. The dependency resolution is done purely at run time.

It currently only supports injecting classes

## Installation

```sh
deno add jsr:@silvo38/inject
```

## Usage

```ts
import { inject, provide } from "jsr:@silvo38/inject";

class Foo {
  // Inject fields directly.
  private readonly someDepA = inject(SomeDepA);
  private readonly someDepB = inject(SomeDepB);
}

// Provide a class with a no-args constructor.
provide(Foo);

// Provide a specific instance that you have constructed manually.
const someDepA = SomeDepA.complexFactory();
provide(SomeDepA, someDepA);

// Provide an instance via a factory function. You can call inject() here.
provide(SomeDepB, () => new SomeDepB("someArg", inject(SomeDepA), "otherArg"));
```

## Unit testing

There is a single global injector instance, so for unit testing you will need to
call `resetGlobalInjector()` to clear any existing providers. Otherwise, usage
in unit tests is the same as in production.

```ts
import { inject, provide, resetGlobalInjector } from "jsr:@silvo38/inject";

describe("Test something", () => {
  beforeEach(() => {
    resetGlobalInjector();

    provide(SomeDepA, new FakeDepA());
    // Provide other deps.
  });

  it("should do something", () => {
    const foo = inject(Foo);
    // Do something with foo.
  });
});
```
