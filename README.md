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
import { effect, get, pack, val } from '@vyke/val'

const $name = val('Joe')
const $age = val(15)

console.log(get($name)) // Joe
console.log(get($age)) // 15

const $fullName = select((name, age) => {
	return `${name} ${age}`
}, $name, $age)

const $user = pack({
	fullName: $fullName,
	username: val('joe15')
})

effect((user) => {
	console.log(user.fullName)
}, $user)
```

### Using fn vals
```ts
import { effect, pack } from '@vyke/val'
import { val } from '@vyke/val/fn'

const $name = val('Joe')
const $age = val(15)

console.log($name()) // Joe
console.log($age()) // 15

const $fullName = select((name, age) => {
	return `${name} ${age}`
}, $name, $age)

const $user = pack({
	fullName: $fullName,
	username: val('joe15')
})

effect((user) => {
	console.log(user.fullName)
}, $user)
```

## API
### val
Create a new val

```ts
import { val } from '@vyke/val'

const $index = val(1)
//      ^? number
// Type inferred by default or manually
const $counter = val<1 | 2 | 3 | 4>(1)
```

### get
returns the value of a val

```ts
import { get, val } from '@vyke/val'

const $index = val(1)
console.log(get($index))
```

### set

sets the value of a val

```ts
import { get, set, val } from '@vyke/val'

const $index = val(1)
console.log(get($index))

set($index, 2)

console.log(get($index))
```

### getValues
Similar to the get function but for multiple vals at once

```ts
import { getValues, val } from '@vyke/val'

const $name = val('Jose')
const $age = val(15)
const [name, age] = getValues($name, $age)
```

### watch
To watch any changes for one or multiple vals at once

```ts
import { val, watch } from '@vyke/val'
const $name = val('Jose')
const $age = val(15)
watch((name, age) => {
	console.log(name, age) // Jose 15 | run until next change
}, $name, $age)
```

### effect
Very similar to watch but it will run the listener at least once

```ts
import { effect, val } from '@vyke/val'
const $name = val('Jose')
const $age = val(15)
effect((name, age) => {
	console.log(name, age) // Jose 15 | run immediately and on change
}, $name, $age)
```

### computed
Create a new val using one or more val to base from, similar to a computed function

```ts
import { select, val } from '@vyke/val'

const $val = val(1)
const $plusOne = select((value) => {
	return value + 1
}, $val)
console.log(get($plusOne)) // 2
set($val, 2)
console.log(get($plusOne)) // 3
```

### pack
Create a new val using the given object where each key is a val

```ts
import { pack, val } from '@vyke/val'

const $val1 = val(1)
const $val2 = val(2)
const $val12 = pack({
	val1: $val1,
	val2: $val2,
})

console.log(get($val12)) // { val1: 1, val2: 2 }
```

## Others vyke projects
- [Flowmodoro app by vyke](https://github.com/albizures/vyke-flowmodoro)
- [@vyke/results](https://github.com/albizures/vyke-results)
- [@vyke/dom](https://github.com/albizures/vyke-dom)
- [@vyke/tsdocs](https://github.com/albizures/vyke-tsdocs)
