export class Identifier<T = any> {
	/**
	 * Internal property used to differentiate `Identifier`s based on their `T` type.
	 * @internal
	 */
	readonly __internalDoNotUse: T
	readonly name: string

	constructor(name: string) {
		this.__internalDoNotUse = {} as T
		this.name = name
	}
}
