import { type ReadVal, get } from '.'

let isValNonNullable = <TValue>(val: ReadVal<TValue>): val is ReadVal<NonNullable<TValue>> => {
	let value = get(val)
	return !(value === undefined || value === null)
}

export {
	isValNonNullable,
}
