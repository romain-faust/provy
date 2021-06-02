import { Identifier } from './Identifier'

interface Factory<T> {
	(container: Container): T
}

interface AliasDependency<T> {
	readonly resolveTo: Identifier<T>
	readonly type: 'ALIAS'
}

interface ConstantDependency<T> {
	readonly type: 'CONSTANT'
	readonly value: T
}

interface DynamicDependency<T> {
	readonly factory: Factory<T>
	readonly type: 'DYNAMIC'
}

interface MemoizedDependency<T> {
	readonly factory: Factory<T>
	readonly memoized: boolean
	readonly type: 'MEMOIZED'
	readonly value?: T
}

type Dependency<T> =
	| AliasDependency<T>
	| ConstantDependency<T>
	| DynamicDependency<T>
	| MemoizedDependency<T>

export class Container {
	protected _parent: Container | undefined
	protected readonly _registry: Map<Identifier, Dependency<any>>

	constructor(parent?: Container) {
		this._parent = parent
		this._registry = new Map()
	}

	get parent() {
		return this._parent
	}

	set parent(parent: Container | undefined) {
		if (parent === this) {
			throw new Error('Could not self-link container')
		}

		this._parent = parent
	}

	alias<T, A extends T>(identifier: Identifier<T>, resolveTo: Identifier<A>) {
		if (identifier === resolveTo) {
			throw new Error('Could not self-link dependency')
		}

		this._registry.set(identifier, {
			resolveTo,
			type: 'ALIAS',
		})

		return this
	}

	bindConstant<T>(identifier: Identifier<T>, value: T) {
		this._registry.set(identifier, {
			type: 'CONSTANT',
			value,
		})

		return this
	}

	bindDynamic<T>(identifier: Identifier<T>, factory: Factory<T>) {
		this._registry.set(identifier, {
			factory,
			type: 'DYNAMIC',
		})

		return this
	}

	bindMemoized<T>(identifier: Identifier<T>, factory: Factory<T>) {
		this._registry.set(identifier, {
			factory,
			memoized: false,
			type: 'MEMOIZED',
		})

		return this
	}

	isBound(identifier: Identifier) {
		return this._registry.has(identifier)
	}

	resolve<T>(identifier: Identifier<T>): T {
		const dependency = this._registry.get(identifier)

		if (dependency == null) {
			if (this._parent != null) {
				return this._parent.resolve(identifier)
			}

			throw new Error(`Dependency/alias "${identifier.name}" not found`)
		}

		switch (dependency.type) {
			case 'ALIAS': {
				return this.resolve(dependency.resolveTo)
			}
			case 'CONSTANT': {
				return dependency.value
			}
			case 'DYNAMIC': {
				return dependency.factory(this)
			}
			case 'MEMOIZED': {
				if (dependency.memoized) {
					return dependency.value
				}

				const value = dependency.factory(this)

				this._registry.set(identifier, {
					...dependency,
					memoized: true,
					value,
				})

				return value
			}
		}
	}

	unbind(identifier: Identifier) {
		this._registry.delete(identifier)

		return this
	}
}
