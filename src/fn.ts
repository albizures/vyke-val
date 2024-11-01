import type { Val } from './index'
import { val as createVal } from './index'

type Fn<T> = {
	(): T
	(value: T, update?: boolean): void
}
type FnVal<T> = Fn<T> & Val<T>

/**
 * creates a val with a default value and returns a function that can be used to get and set the value
 */
export function val<T>(defaultValue: T): FnVal<T> {
	const val = createVal<T>(defaultValue)

	function fn(value?: T, update?: boolean) {
		if (value !== undefined) {
			val.set(value, update)
		}

		return val.get()
	}

	return Object.assign(fn, val)
}
