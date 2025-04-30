import { type Class, type ConstructableClass, Injector } from "./injector.ts";

/** Global injector. */
const globalInjector: Injector = new Injector();

/** Returns an instance of class T. Must have been provided already. */
export function inject<T>(cls: Class<T>): T {
  return globalInjector.inject(cls);
}

/** Provide a class, using its no-args constructor. */
export function provide<T>(cls: ConstructableClass<T>): void;

/** Provide an instance of a class. */
export function provide<SuperT, SubT extends SuperT>(
  cls: Class<SuperT>,
  instance: SubT,
): void;

/** Provide a factory function for constructing an instance of a class. */
export function provide<SuperT, SubT extends SuperT>(
  cls: Class<SuperT>,
  factory: () => SubT,
): void;

/** Common implementation of all provide functions. */
export function provide<SuperT, SubT extends SuperT>(
  cls: Class<SuperT>,
  factoryOrInstance?: () => SubT | SubT,
): void {
  if (factoryOrInstance === undefined) {
    // Class is a no-args constructor.
    globalInjector.provideClass(cls as ConstructableClass<SuperT>);
  } else if (typeof factoryOrInstance === "function") {
    // Was given a factory function.
    globalInjector.provideFactory(cls, factoryOrInstance);
  } else {
    // Must be an instance.
    globalInjector.provideInstance(cls, factoryOrInstance);
  }
}

/** Clears all state in the global injector. Call this in unit tests. */
export function resetGlobalInjector() {
  globalInjector.reset();
}
