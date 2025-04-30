/** Type representing an abstract class. */
interface AbstractClass<T> extends Function {
  prototype: T;
}

/** Type representing a concrete class. */
interface ConcreteClass<T> extends Function {
  // deno-lint-ignore no-explicit-any
  new (...args: any[]): T;
}

/** Type representing any class (abstract and concrete). */
export type Class<T> = ConcreteClass<T> | AbstractClass<T>;

/** Type representing a class with no-args constructor. */
export type ConstructableClass<T> = new () => T;

/**
 * Implementation of an injector. Clients of this library should use the
 * global injector instance instead of instantiating their own instances of this
 * class.
 */
export class Injector {
  private readonly instances: Map<unknown, unknown> = new Map();
  private readonly factories: Map<unknown, () => unknown> = new Map();

  inject<T>(cls: Class<T>): T {
    if (this.instances.has(cls)) {
      return this.instances.get(cls) as T;
    }
    if (this.factories.has(cls)) {
      const factory = this.factories.get(cls)!;
      const instance = factory();
      this.instances.set(cls, instance);
      return instance as T;
    }
    throw new Error(
      `Injection error: Type ${getClassName(cls)} was not provided`,
    );
  }

  provideInstance<SuperT, SubT extends SuperT>(
    cls: Class<SuperT>,
    instance: SubT,
  ) {
    this.instances.set(cls, instance);
  }

  provideFactory<SuperT, SubT extends SuperT>(
    cls: Class<SuperT>,
    factory: () => SubT,
  ) {
    this.instances.delete(cls);
    this.factories.set(cls, factory);
  }

  provideClass<T>(cls: ConstructableClass<T>) {
    this.provideFactory(cls, () => new cls());
  }

  reset() {
    this.instances.clear();
    this.factories.clear();
  }
}

function getClassName<T>(cls: Class<T>): string {
  return cls.prototype.constructor.name;
}
