export abstract class Singleton<T> {
    private static _instances: Map<string, any> = new Map();

    protected constructor() {
        const className = this.constructor.name;
        if (Singleton._instances.has(className)) {
            throw new Error(`${className} is a singleton and has already been instantiated.`);
        }
        Singleton._instances.set(className, this);
    }

    static get instance(): any {
        const className = this.name;
        if (!Singleton._instances.has(className)) {
            new (this as any)();
        }
        return Singleton._instances.get(className);
    }

    static clearInstance<T>(this: new () => T) {
        const className = this.name;
        Singleton._instances.delete(className);
    }
}
