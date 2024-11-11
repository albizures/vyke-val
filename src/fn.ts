import type { ComputedFn, InferType, ReadVal, Val, ValsFromFn } from './index'
import { val as createVal, computed as valComputed, pack as valPack } from './index'

type ReadFn<T> = {
	(): T
}

/**
 * a val that is also a function that can be used to get the value
 */
export type ReadFnVal<T> = ReadFn<T> & ReadVal<T>

type Fn<T> = {
	(): T
	(value: T, update?: boolean): void
}

/**
 * a val that is also a function that can be used to get and set the value
 */
export type FnVal<T> = Fn<T> & Val<T>

const NO_VALUE = Symbol('NO_VALUE')

/**
 * creates a val that is also a function that can be used to get and set the value
 * @example
 * ```ts
 * import { val, select } from '@vyke/val/fn'
 * const $counter = val(0)
 *
 * console.log($counter()) // 0
 *
 * $counter(1)
 *
 * console.log($counter()) // 1
 * ```
 */
export let val = <T>(defaultValue: T): FnVal<T> => {
	const val = createVal<T>(defaultValue)

	function fn(value: T | typeof NO_VALUE = NO_VALUE, update?: boolean) {
		if (value !== NO_VALUE) {
			val.set(value, update)
		}

		return val.get()
	}

	return Object.assign(fn, val)
}

/**
 * Create a new val using one or more val to base from, similar to a computed function
 * @example
 * ```ts
 * import { val, select } from '@vyke/val/fn'
 *
 * const $val = val(1)
 * const $plusOne = select((value) => {
 * 	return value + 1
 * }, $val)
 * console.log($plusOne()) // 2
 * $val(2)
 * console.log($plusOne()) // 3
 * ```
 */
export let computed = <
	const TComputedFn extends ComputedFn<any, any>,
>(
	fn: TComputedFn,
	...vals: ValsFromFn<TComputedFn>
): ReadFnVal<ReturnType<TComputedFn>> => {
	const val = valComputed(fn, ...vals)

	const computedFn = () => {
		return val.get()
	}

	return Object.assign(computedFn, val)
}

/**
 * Create a new val using the given object where each key is a val
 * @example
 * ```ts
 * import { val, pack } from '@vyke/val/fn'
 *
 * const $val1 = val(1)
 * const $val2 = val(2)
 * const $val12 = pack({
 * 	val1: $val1,
 * 	val2: $val2,
 * })
 *
 * console.log($val12()) // { val1: 1, val2: 2 }
 * ```
 */
export let pack = <
	TValues extends Record<string, ReadVal<any>>,
	TOutput = { [K in keyof TValues]: InferType<TValues[K]> },
>(vals: TValues): ReadFnVal<TOutput> => {
	const val = valPack(vals) as ReadVal<TOutput>

	const packFn = () => {
		return val.get() as TOutput
	}

	return Object.assign(packFn, val)
}
