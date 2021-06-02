import { Container } from './Container'
import { Identifier } from './Identifier'

describe('Container', () => {
	describe('parent', () => {
		describe('get', () => {
			it('should retrieve the parent instance', () => {
				const parent = new Container()
				const container = new Container(parent)

				expect(container.parent).toBe(parent)
			})

			it('should return `undefined` if there are no parent instance', () => {
				const container = new Container()

				expect(container.parent).toBeUndefined()
			})
		})

		describe('set', () => {
			it('should allow defining a parent container', () => {
				const parent = new Container()
				const container = new Container()

				container.parent = parent

				expect(container.parent).toBe(parent)
			})

			it('should allow overriding a parent container', () => {
				const parent = new Container()
				const container = new Container(parent)

				const newParent = new Container()

				container.parent = newParent

				expect(container.parent).toBe(newParent)
			})

			it('should throw when self-referencing the container', () => {
				const container = new Container()

				expect(() => {
					container.parent = container
				}).toThrow()
			})
		})
	})

	describe('.alias()', () => {
		it('should register an alias to another dependency', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')
			const value = 0

			container.bindConstant(identifier, value)

			const alias = new Identifier('alias')

			container.alias(alias, identifier)

			expect(container.resolve(alias)).toBe(value)
		})

		it('should throw an error if using the same identifier twice', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')
			const value = 0

			container.bindConstant(identifier, value)

			expect(() => {
				container.alias(identifier, identifier)
			}).toThrow()
		})
	})

	describe('.bindConstant()', () => {
		it('should register a constant value', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')
			const value = 0

			container.bindConstant(identifier, value)

			expect(container.resolve(identifier)).toBe(value)
		})
	})

	describe('.bindDynamic()', () => {
		it('should register a factory that is called every time a value is requested', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')
			let value = 0
			const factory = jest.fn(() => ++value)

			container.bindDynamic(identifier, factory)

			expect(container.resolve(identifier)).toBe(value)
			expect(factory).toHaveBeenCalledTimes(1)
			expect(factory).toHaveBeenLastCalledWith(container)

			expect(container.resolve(identifier)).toBe(value)
			expect(factory).toHaveBeenCalledTimes(2)
			expect(factory).toHaveBeenLastCalledWith(container)
		})
	})

	describe('.bindMemoized()', () => {
		it('should register a factory that is called only once', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')
			let value = 0
			const factory = jest.fn(() => ++value)

			container.bindMemoized(identifier, factory)

			expect(container.resolve(identifier)).toBe(value)
			expect(factory).toHaveBeenCalledTimes(1)
			expect(factory).toHaveBeenLastCalledWith(container)

			expect(container.resolve(identifier)).toBe(value)
			expect(factory).toHaveBeenCalledTimes(1)
			expect(factory).toHaveBeenLastCalledWith(container)
		})
	})

	describe('.isBound()', () => {
		it('should return `true` if the identifier is registered', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')

			container.bindConstant(identifier, 0)

			expect(container.isBound(identifier)).toBe(true)
		})

		it('should return `false` if the identifier is not registered', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')

			expect(container.isBound(identifier)).toBe(false)
		})
	})

	describe('.resolve()', () => {
		it('should throw an error if the identifier is not registered', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')

			expect(() => container.resolve(identifier)).toThrow()
		})
	})

	describe('.unbind()', () => {
		it('should remove a registered dependency', () => {
			const container = new Container()

			const identifier = new Identifier('identifier')

			container.bindConstant(identifier, 0)

			expect(container.isBound(identifier)).toBe(true)

			container.unbind(identifier)

			expect(container.isBound(identifier)).toBe(false)
		})
	})

	describe('Inheritance', () => {
		it('should find dependency in parent container', () => {
			const parent = new Container()
			const container = new Container(parent)

			const identifier = new Identifier('identifier')
			const value = 'value'

			parent.bindConstant(identifier, value)

			expect(container.resolve(identifier)).toBe(value)
		})

		it('should find dependency in deeply nested parent container', () => {
			const grandParent = new Container()
			const parent = new Container(grandParent)
			const container = new Container(parent)

			const identifier = new Identifier('identifier')
			const value = 'value'

			grandParent.bindConstant(identifier, value)

			expect(container.resolve(identifier)).toBe(value)
		})

		it('should throw if dependency could not be found in parent container', () => {
			const parent = new Container()
			const container = new Container(parent)

			const identifier = new Identifier('identifier')

			expect(() => container.resolve(identifier)).toThrow()
		})
	})
})
