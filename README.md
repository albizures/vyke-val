<div align="center">
	<h1>
		@vyke/val
	</h1>
</div>
Simple and tiny (<1kb) helpers to select (compute), watch and manage values. Similar to signals but with explicit dependencies

## Installation
```sh
npm i @vyke/val
```

## Examples
```ts
import { createVal, pack } from '@vyke/val'

const $name = createVal('Joe')
const $age = createVal(15)

const $fullName = select((name, age) => {
	return `${name} ${age}`
}, $name, $age)

const $user = pack({
	fullName: $fullName,
	username: createVal('joe15')
})

watch((user) => {
	console.log(user.fullName)
}, $user)
```

## API
### createVal
Create a new val

```ts
import { createVal } from '@vyke/val'

const $index = createVal(1)
//      ^? number
// Type inferred by default or manually
const $counter = createVal<1 | 2 | 3 | 4>(1)
```

### get
returns the value of a val

```ts
import { createVal, get } from '@vyke/val'

const $index = createVal(1)
console.log(get($index))
```

### set

sets the value of a val

```ts
import { createVal, get, set } from '@vyke/val'

const $index = createVal(1)
console.log(get($index))

set($index, 2)

console.log(get($index))
```

### getValues
Similar to the get function but for multiple vals at once

```ts
import { createVal, getValues } from '@vyke/val'

const $name = createVal('Jose')
const $age = createVal(15)
const [name, age] = getValues($name, $age)
```

### effect
To watch any changes for one or multiple vals at once

```ts
import { createVal, watch } from '@vyke/val'
const $name = createVal('Jose')
const $age = createVal(15)
watch((name, age) => {
	console.log(name, age)
}, $name, $age)
```

### computed
Create a new val using one or more val to base from, similar to a computed function

```ts
import { createVal, select } from '@vyke/val'

const $val = createVal(1)
const $plusOne = select((value) => {
	return value + 1
}, $val)
```

### pack
Create a new val using the given object where each key is a val

```ts
import { createVal, pack } from '@vyke/val'

const $val1 = createVal(1)
const $val2 = createVal(2)
const $val12 = pack({
	val1: $val1,
	val2: $val2,
})

$val12.watch((values) => {
	console.log($values.val1, $values.val2)
})
```

## Others vyke projects
- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/results](https://github.com/albizures/vyke-results)
- [@vyke/dom](https://github.com/albizures/vyke-dom)
- [@vyke/tsdocs](https://github.com/albizures/vyke-tsdocs)
