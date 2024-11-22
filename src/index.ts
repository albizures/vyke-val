type Listener<T> = (value: T) => boolean | void
type Unsubscribe = () => void
const IS_VAL = Symbol('is_val')

type ValsToValues<TVals extends Array<ReadVal<any>>> = {
	[K in keyof TVals]: TVals[K] extends ReadVal<infer TValue> ? TValue : never
}
type FnFromVals<TVals extends Array<ReadVal<any>>> = (...values: ValsToValues<TVals>) => boolean | void

let createSet = <T>() => new Set<T>()

type Getter<TIn, TOut> = (current: TIn) => TOut

/**
 * A read val is a reactive value that can be watched
 */
export type ReadVal<TValue> = {
	[IS_VAL]: true
	get: () => TValue
	watch: (fn: Listener<TValue>) => Unsubscribe
	/**
	 * Returns a new val that is based on the current value
	 * Similar to computed but with simpler usage
	 */
	use: <TOut>(getter: Getter<TValue, TOut>) => ReadVal<TOut>
	prop: <TKey extends keyof TValue>(key: TKey) => ReadVal<TValue[TKey]>
}
/**
 * A val is a reactive value that can be watched and updated
 */
export type Val<T> = ReadVal<T> & {
	notify: () => void
	set: (value: T, update?: boolean) => void
}

export type InferType<TVal> = TVal extends ReadVal<infer TValue> ? TValue : never
export type InferEachType<TVals> = { [K in keyof TVals]: InferType<TVals[K]> }

/**
 * returns the value of a val
 * @example
 * ```ts
 * import { get, val } from '@vyke/val'
 *
 * const $index = val(1)
 * console.log(get($index))
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
 * import { get, set, val } from '@vyke/val'
 *
 * const $index = val(1)
 * console.log(get($index))
 *
 * set($index, 2)
 *
 * console.log(get($index))
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
 * import { getValues, val } from '@vyke/val'
 *
 * const $name = val('Jose')
 * const $age = val(15)
 * const [name, age] = getValues($name, $age)
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
 * import { val, watch } from '@vyke/val'
 * const $name = val('Jose')
 * const $age = val(15)
 * watch((name, age) => {
 * 	console.log(name, age) // Jose 15 | run until next change
 * }, $name, $age)
 * ```
 */
export let watch = <
	const TVals extends Array<ReadVal<any>>,
>(
	watcher: FnFromVals<TVals>,
	...vals: TVals
): () => void => {
	let unwatchers: Array<Unsubscribe> = []

	let unwatch = () => {
		for (let currentUnwatcher of unwatchers) {
			currentUnwatcher()
		}

		unwatchers = []
	}

	for (let val of vals) {
		unwatchers.push(val.watch(() => {
			if (watcher(...getValues(...vals)) === false) {
				unwatch()
				return false
			}
		}))
	}

	return unwatch
}

/**
 * Very similar to watch but it will run the listener at least once
 * @example
 * ```ts
 * import { effect, val } from '@vyke/val'
 * const $name = val('Jose')
 * const $age = val(15)
 * effect((name, age) => {
 * 	console.log(name, age) // Jose 15 | run immediately and on change
 * }, $name, $age)
 * ```
 */
export let effect = <
	const TVals extends Array<ReadVal<any>>,
>(
	watcher: FnFromVals<TVals>,
	...vals: TVals
): () => void => {
	const unwatch = watch(watcher, ...vals)
	watcher(...getValues(...vals))

	return unwatch
}

export type ComputedFn<TVals extends Array<ReadVal<any>>, TOutput> = (...values: ValsToValues<TVals>) => TOutput

/**
 * Create a new val using one or more val to base from, similar to a computed function
 * @example
 * ```ts
 * import { select, val } from '@vyke/val'
 *
 * const $val = val(1)
 * const $plusOne = select((value) => {
 * 	return value + 1
 * }, $val)
 * console.log(get($plusOne)) // 2
 * set($val, 2)
 * console.log(get($plusOne)) // 3
 * ```
 */
export let computed = <
	const TVals extends Array<ReadVal<any>>,
	const TComputedFn extends ComputedFn<TVals, any>,
	const TOutput = ReturnType<TComputedFn>,
>(
	fn: TComputedFn,
	...vals: TVals
): ReadVal<TOutput> => {
	const listeners = createSet<Listener<TOutput>>()
	let value = fn(...getValues(...vals))

	effect((...values) => {
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

	let val: ReadVal<TOutput> = {
		[IS_VAL]: true,
		watch(listener: Listener<TOutput>) {
			listeners.add(listener)

			return () => {
				listeners.delete(listener)
			}
		},
		get() {
			return value
		},
		use<TOut>(getter: Getter<TOutput, TOut>) {
			return computed<[ReadVal<TOutput>], Getter<TOutput, TOut>>(getter, val)
		},
		prop<K extends keyof TOutput>(key: K) {
			return computed((value) => value[key], val)
		},
	}

	return val
}

/**
 * Create a new val using the given object where each key is a val
 * @example
 * ```ts
 * import { pack, val } from '@vyke/val'
 *
 * const $val1 = val(1)
 * const $val2 = val(2)
 * const $val12 = pack({
 * 	val1: $val1,
 * 	val2: $val2,
 * })
 *
 * console.log(get($val12)) // { val1: 1, val2: 2 }
 * ```
 */
export let pack = <
	TValues extends Record<string, ReadVal<any>>,
	TOutput = { [K in keyof TValues]: InferType<TValues[K]> },
>(vals: TValues): ReadVal<TOutput> => {
	const entries = Object.entries(vals)
	const listeners = createSet<Listener<TOutput>>()
	let result: Partial<Record<string, unknown>> = {}

	let sync = () => {
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

	// we are listening all the vals but we are not using the values
	effect(() => {
		if (sync()) {
			for (let listener of listeners) {
				if (listener(result as TOutput) === false) {
					listeners.delete(listener)
				}
			}
		}
	}, ...Object.values(vals))

	sync()

	let val: ReadVal<TOutput> = {
		[IS_VAL]: true,
		watch(listener: Listener<TOutput >) {
			listeners.add(listener)

			return () => {
				listeners.delete(listener)
			}
		},
		get() {
			return result as TOutput
		},

		use<TOut>(getter: Getter<TOutput, TOut>) {
			return computed<[ReadVal<TOutput>], Getter<TOutput, TOut>>(getter, val)
		},

		prop<K extends keyof TOutput>(key: K) {
			return computed((value) => value[key], val)
		},
	}

	return val
}

/**
 * checks whether a value is a val or not
 */
export let isVal = (value: any): value is ReadVal<unknown> => {
	return Boolean(value && value[IS_VAL])
}

/**
 * Create a new val
 * @index 0
 * @example
 * ```ts
 * import { val } from '@vyke/val'
 *
 * const $index = val(1)
 * //      ^? number
 * // Type inferred by default or manually
 * const $counter = val<1 | 2 | 3 | 4>(1)
 * ```
 */
export let val = <TValue>(defaultValue: TValue): Val<TValue> => {
	let current = defaultValue
	let listeners = createSet<Listener<any>>()

	let val: Val<TValue> = {
		[IS_VAL]: true,
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
		set(value: TValue, update = true) {
			if (value !== current) {
				current = value

				if (update) {
					val.notify()
				}
			}
		},
		use<TOut>(getter: Getter<TValue, TOut>) {
			return computed<[ReadVal<TValue>], Getter<TValue, TOut>>(getter, val)
		},
		prop<K extends keyof TValue>(key: K) {
			return computed((value) => value[key], val)
		},
	}

	return val
}
