type Listener<T> = (value: T) => boolean | void
type Unsubscribe = () => void

export type ReadVal<T> = {
	get: () => T
	watch: (fn: Listener<T>) => Unsubscribe
}
export type Val<T> = ReadVal<T> & {
	notify: () => void
	set: (value: T, update?: boolean) => void
}

/**
 * Create a new val
 * @example
 * ```ts
 * import { createVal } from '@vyke/val'
 *
 * const index = createVal(1)
 * //      ^? number
 * // Type inferred by default or manually
 * const counter = createVal<1 | 2 | 3 | 4>(1)
 * ```
 */
export let createVal = <T>(defaultValue: T): Val<T> => {
	let current = defaultValue
	let listeners = new Set<Listener<any>>()

	let val = {
		notify() {
			for (let listener of listeners) {
				if (listener(current) === false) {
					listeners.delete(listener)
				}
			}
		},
		watch<T>(listener: Listener<T>) {
			listeners.add(listener)

			return () => {
				listeners.delete(listener)
			}
		},
		get() {
			return current
		},
		set(value: T, update = true) {
			if (value === current) {
				return
			}

			current = value

			if (update) {
				val.notify()
			}
		},
	}

	return val
}

export type InferType<TVal> = TVal extends ReadVal<infer TValue> ? TValue : never
export type InferEachType<TVals> = TVals extends [infer THead]
	? [InferType<THead>]
	: TVals extends [infer THead, ... infer TTail]
		? [InferType<THead>, ...InferEachType<TTail>]
		: never

/**
 * returns the value of a val
 * @example
 * ```ts
 * import { createVal, get } from '@vyke/val'
 *
 * const index = createVal(1)
 * console.log(get(index))
 * ```
 */
export let get = <T>(val: ReadVal<T>): T => {
	return val.get()
}

/**
 *
 * sets the value of a val
 * @example
 * ```ts
 * import { createVal, get, set } from '@vyke/val'
 *
 * const index = createVal(1)
 * console.log(get(index))
 *
 * set(index, 2)
 *
 * console.log(get(index))
 * ```
 */
export let set = <T>(val: Val<T>, value: T): T => {
	val.set(value)
	return value
}

/**
 * Similar to the get function but for multiple vals at once
 * @example
 * ```ts
 * import { createVal, getValues } from '@vyke/val'
 *
 * const nameVal = createVal('Jose')
 * const ageVal = createVal(15)
 * const [name, age] = getValues(nameVal, ageVal)
 * ```
 */
export let getValues = <T extends Array<ReadVal<any>>>(...values: T): InferEachType<T> => {
	return values.map(get) as InferEachType<T>
}

export type Watcher<TValues extends Array<any>> = (...value: TValues) => boolean | void

/**
 * To watch any changes for one or multiple vals at once
 * @example
 * ```ts
 * import { createVal, watch } from '@vyke/val'
 * const nameVal = createVal('Jose')
 * const ageVal = createVal(15)
 * watch((name, age) => {
 * 	console.log(name, age)
 * }, nameVal, ageVal)
 * ```
 */
export let watch = <TVals extends Array<ReadVal<any>>>(
	listener: Watcher<InferEachType<TVals>>,
	...vals: TVals
): () => void => {
	let unwatchers: Array<Unsubscribe> = []

	function unwatch() {
		for (let currentUnwatcher of unwatchers) {
			currentUnwatcher()
		}

		unwatchers = []
	}

	for (let val of vals) {
		unwatchers.push(val.watch(() => {
			if (listener(...getValues(...vals)) === false) {
				unwatch()
				return false
			}
		}))
	}

	return unwatch
}

export type SelectFn<TValues extends Array<any>, TOutput> = (...value: TValues) => TOutput

/**
 * Create a new val using one or more val to base from, similar to a computed function
 * @example
 * ```ts
 * import { createVal, select } from '@vyke/val'
 *
 * const val = createVal(1)
 * const plusOne = select((value) => {
 * 	return value + 1
	}, val)
 * ```
 */
export let select = <
	TVals extends Array<ReadVal<any>>,
	TOutput,
>(
	fn: SelectFn<InferEachType<TVals>, TOutput>,
	...vals: TVals
): ReadVal<TOutput> => {
	const listeners = new Set<Listener<TOutput>>()
	let value = fn(...getValues(...vals))

	watch((...values) => {
		let newValue = fn(...values)
		if (newValue !== value) {
			value = newValue

			for (let listener of listeners) {
				if (listener(value) === false) {
					listeners.delete(listener)
				}
			}
		}
	}, ...vals)

	let val = {
		watch(listener: Listener<TOutput>) {
			listeners.add(listener)

			return () => {
				listeners.delete(listener)
			}
		},
		get() {
			return value
		},
	}

	return val
}

/**
 * Create a new val using the given object where each key is a val
 * @example
 * ```ts
 * import { createVal, pack } from '@vyke/val'
 *
 * const val1 = createVal(1)
 * const val2 = createVal(2)
 * const val12 = pack({
 * 	val1,
 * 	val2,
 * })
 *
 * plusOne.watch((values) => {
 * 	console.log(values.val1, values.val2)
 * })
 * ```
 */
export let pack = <
	TValues extends Record<string, ReadVal<any>>,
	TOutput = { [K in keyof TValues]: InferType<TValues[K]> },

>(vals: TValues): ReadVal<TOutput> => {
	const entries = Object.entries(vals)
	const listeners = new Set<Listener<TOutput>>()
	let result: Partial<Record<string, unknown>> = {}

	function sync() {
		let changed = false
		for (let [key, val] of entries) {
			let newValue = get(val)
			if (result[key] !== newValue) {
				changed = true
				result[key] = newValue
			}
		}

		return changed
	}

	watch(() => {
		if (sync()) {
			for (let listener of listeners) {
				if (listener(result as TOutput) === false) {
					listeners.delete(listener)
				}
			}
		}
	}, ...Object.values(vals))

	sync()

	let val = {
		watch(listener: Listener<TOutput >) {
			listeners.add(listener)

			return () => {
				listeners.delete(listener)
			}
		},
		get() {
			return result as TOutput
		},
	}

	return val
}
