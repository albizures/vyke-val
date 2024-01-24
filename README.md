<div align="center">
	<h1>
		@vyke/val
	</h1>
</div>
Functional and tiny (<1kb) helpers to select (compute) watch and manage values. Similar to signals but with explicit dependencies

## Installation
```sh
# @vyke/results is a peer dependency
npm i @vyke/val
```

## Examples
```ts
import { r } from '@vyke/val'
import { query, select } from '@vyke/dom'

const [app] = r.unwrap(select(
	query<HTMLDivElement>('#app'),
))

console.log(app)
//           ^? HTMLDivElement
```

Querying inside an specific element
```ts
import { r } from '@vyke/results/r'
import { query, selectIn } from '@vyke/dom'

const [submitBtn] = r.unwrap(selectIn(
	form,
	query<HTMLButtonElement>('#submit'),
))

console.log(submitBtn)
//             ^? HTMLButtonElement
```

## API
### createVal
Create a new val

```ts
import { createVal } from '@vyke/val'

const index = createVal(1)
//      ^? number
// Type infered by default or manually
const counter = createVal<1 | 2 | 3 | 4>(1)
```

### get
returns the value of a val

```ts
import { createVal, get } from '@vyke/val'

const index = createVal(1)
console.log(get(index))
```

### set

sets the value of a val

```ts
import { createVal, get, set } from '@vyke/val'

const index = createVal(1)
console.log(get(index))

set(index, 2)

console.log(get(index))
```

### getValues
Similar to the get function but for multiple vals at once

```ts
import { createVal, getValues } from '@vyke/val'

const nameVal = createVal('Jose')
const ageVal = createVal(15)
const [name, age] = getValues(nameVal, ageVal)
```

### watch
To watch any changes for one or multiple vals at once

```ts
import { createVal, watch } from '@vyke/val'
const nameVal = createVal('Jose')
const ageVal = createVal(15)
watch((name, age) => {
	console.log(name, age)
}, nameVal, ageVal)
```

### select
Create a new val using one or more val to base from, similar to a computed function

```ts
import { createVal, select } from '@vyke/val'

const val = createVal(1)
const plusOne = select((value) => {
	return value + 1
}, val)
```

# Inspiration and Credits
 -
