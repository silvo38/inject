import { Injector } from "./injector.ts";
import { inject, provide, resetGlobalInjector } from "./mod.ts";
import { expect } from "@std/expect";
import { beforeEach, describe, it } from "@std/testing/bdd";

class Foo {
  constructor(public value = 0) {}
}

class Bar {
  constructor(public value = "") {}
}

describe("Injector", () => {
  let injector: Injector;

  beforeEach(() => {
    injector = new Injector();
  });

  describe("provideInstance", () => {
    it("can provide different instances for different types", () => {
      const foo = new Foo(123);
      const bar = new Bar("abc");
      injector.provideInstance(Foo, foo);
      injector.provideInstance(Bar, bar);

      expect(injector.inject(Foo)).toBe(foo);
      expect(injector.inject(Bar)).toBe(bar);
    });

    it("can override the provided instance for a type", () => {
      const foo1 = new Foo(123);
      injector.provideInstance(Foo, foo1);
      const foo2 = new Foo(456);
      injector.provideInstance(Foo, foo2);

      expect(injector.inject(Foo)).toBe(foo2);
    });

    it("can provide an abstract class", () => {
      abstract class Base {
        abc = "base";
      }
      class Derived extends Base {
        override abc = "derived";
      }
      injector.provideInstance(Base, new Derived());
      expect(injector.inject(Base).abc).toBe("derived");
    });

    it("throws if instance was not provided", () => {
      expect(() => injector.inject(Foo)).toThrow(
        "Injection error: Type Foo was not provided",
      );
    });
  });

  describe("provideFactory", () => {
    it("can provide a factory", () => {
      const foo = new Foo(123);
      injector.provideFactory(Foo, () => foo);
      expect(injector.inject(Foo)).toBe(foo);
    });

    it("only invokes the factory function once", () => {
      let timesCalled = 0;
      injector.provideFactory(Foo, () => {
        timesCalled++;
        return new Foo();
      });
      const foo1 = injector.inject(Foo);
      const foo2 = injector.inject(Foo);
      expect(foo2).toBe(foo1);
      expect(timesCalled).toBe(1);
    });

    it("overrides any previously provided instances", () => {
      injector.provideInstance(Foo, new Foo(123));
      injector.provideFactory(Foo, () => new Foo(456));
      expect(injector.inject(Foo).value).toBe(456);
    });
  });

  describe("provideClass", () => {
    it("can provide a class", () => {
      injector.provideClass(Foo);
      const foo = injector.inject(Foo);
      expect(foo).toBeInstanceOf(Foo);
      expect(foo.value).toBe(0);
    });

    it("always provides the exact same instance", () => {
      injector.provideClass(Foo);
      const foo1 = injector.inject(Foo);
      const foo2 = injector.inject(Foo);
      expect(foo2).toBe(foo1);
    });

    it("overrides any previously provided instances", () => {
      injector.provideInstance(Foo, new Foo(123));
      injector.provideClass(Foo);
      expect(injector.inject(Foo).value).toBe(0);
    });

    it("overrides any previously provided factories", () => {
      injector.provideFactory(Foo, () => new Foo(123));
      injector.provideClass(Foo);
      expect(injector.inject(Foo).value).toBe(0);
    });
  });

  describe("reset", () => {
    it("clears instances", () => {
      injector.provideInstance(Foo, new Foo(123));
      injector.reset();
      expect(() => injector.inject(Foo)).toThrow(
        "Injection error: Type Foo was not provided",
      );
    });

    it("clears factories", () => {
      injector.provideFactory(Foo, () => new Foo(123));
      injector.reset();
      expect(() => injector.inject(Foo)).toThrow(
        "Injection error: Type Foo was not provided",
      );
    });
  });
});

describe("provide", () => {
  beforeEach(resetGlobalInjector);

  it("can provide instances", () => {
    provide(Foo, new Foo(123));
    expect(inject(Foo).value).toBe(123);
  });

  it("can provide factories", () => {
    provide(Foo, () => new Foo(123));
    expect(inject(Foo).value).toBe(123);
  });

  it("can provide classes", () => {
    provide(Foo);
    expect(inject(Foo).value).toBe(0);
  });

  it("class fields can be injected", () => {
    // This test uses TestInjector and new classes because we want a totally clean state.
    class TestClassA {}
    class TestClassB {
      a = inject(TestClassA);
    }
    class TestClassC {
      a = inject(TestClassA);
      b = inject(TestClassB);
    }
    // Construct in any order, everything is run lazily.
    provide(TestClassC);
    provide(TestClassA);
    provide(TestClassB);

    const c = inject(TestClassC);
    expect(c).toBeInstanceOf(TestClassC);
    const b = inject(TestClassB);
    expect(b).toBeInstanceOf(TestClassB);
    const a = inject(TestClassA);
    expect(a).toBeInstanceOf(TestClassA);

    expect(c.b).toBe(b);
    expect(c.a).toBe(a);
    expect(b.a).toBe(a);
  });
});
