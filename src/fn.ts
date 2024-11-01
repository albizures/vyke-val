import type { ComputedFn, InferEachType, InferType, ReadVal, Val } from './index'
import { val as createVal, computed as valComputed, pack as valPack } from './index'

type ReadFn<T> = {
	(): T
}

export type ReadFnVal<T> = ReadFn<T> & ReadVal<T>

type Fn<T> = {
	(): T
	(value: T, update?: boolean): void
}

/**
 * a function that can be used to get and set the value of a val
 */
export type FnVal<T> = Fn<T> & Val<T>

/**
 * creates a val with a default value and returns a function that can be used to get and set the value
 * @example
 * ```ts
 * const $counter = val(0)
 *
 * console.log($counter()) // 0
 *
 * $counter(1)
 *
 * console.log($counter()) // 1
 * ```
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

/**
 * Create a new val using one or more val to base from, similar to a computed function
 * @example
 * ```ts
 * import { createVal, select } from '@vyke/val'
 *
 * const $val = createVal(1)
 * const $plusOne = select((value) => {
 * 	return value + 1
 * }, $val)
 * console.log($plusOne()) // 2
 * $val(2)
 * console.log($plusOne()) // 3
 * ```
 */
export let computed = <
	TVals extends Array<ReadVal<any>>,
	TOutput,
>(
	fn: ComputedFn<InferEachType<TVals>, TOutput>,
	...vals: TVals
): ReadFnVal<TOutput> => {
	const val = valComputed(fn, ...vals)

	const computedFn = () => {
		return val.get()
	}

	return Object.assign(computedFn, val)
}

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
