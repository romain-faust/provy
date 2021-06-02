# @romain-faust/provy

Simple and versatile dependency container.

## Installation

_With NPM:_

```bash
npm install @romain-faust/provy
```

_With Yarn:_

```bash
yarn add @romain-faust/provy
```

## Usage

```typescript
import { Container, Identifier } from '@romain-faust/provy'

interface FetchUsers {
	(): Promise<readonly User[]>
}

const identifiers = {
	apiUrl: new Identifier<string>('apiUrl'),
	fetchUsers: new Identifier<FetchUsers>('fetchUsers'),
}

const container = new Container()
	.bindConstant(identifiers.apiUrl, 'https://example.com/api')
	.bindMemoized(identifiers.fetchUsers, () => {
		return async () => {
			const apiUrl = container.resolve(identifiers.apiUrl)
			const response = await fetch(`${apiUrl}/users`)

			return response.json()
		}
	})

// Later...

container.resolve(identifiers.fetchUsers)
```

## API

### `Container`

#### `.parent`

Gets/Sets the parent `Container`.

#### `.alias(identifier, resolveTo)`

Registers an alias to another dependency.

#### `.bindConstant(identifier, value)`

Registers a constant value.

#### `.bindDynamic(identifier, factory)`

Registers a factory function, which is called whenever the dependency is requested.

#### `.bindMemoized(identifier, factory)`

Registers a factory function, which is called the first time the dependency is requested, the result is then memoized and reused with subsequent calls.

#### `.isBound(identifier)`

Checks if a dependency is registered within the **current** `Container`.

#### `.resolve(identifier)`

Retrieves the value associated to the given `Identifier`. If the `Identifier` is not registered an error is thrown.

#### `.unbind(identifier)`

Un-registers a dependency from the **current** `Container`.

### `Identifier`

An `Identifier` is used to identify a dependency within a `Container`.

_For TypeScript users:_

An `Identifier` accepts a generic type which can be used to specify the type of the dependency to which it should be associated within a `Container`.

#### `.name`

The name associated with the `Identifier` when it was created.

## License

[MIT](./license.md)
