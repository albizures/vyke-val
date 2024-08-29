import { describe, expect, it, vi } from 'vitest'
import { createVal, getValues, watch } from '.'

it('should return the value', () => {
	const value = createVal<number | undefined>(undefined)

	expect(value.get()).toBe(undefined)

	value.set(1)

	expect(value.get()).toBe(1)
})

it('should subscribe to changes', () => {
	const value = createVal<number>(0)

	const fn = vi.fn()

	value.watch(fn)

	value.set(1)
	expect(fn).toHaveBeenNthCalledWith(1, 1)
	value.set(2)
	expect(fn).toHaveBeenNthCalledWith(2, 2)
})

describe('when returning false', () => {
	it('should unsubscribe', () => {
		const value = createVal<number>(0)

		const fn = vi.fn(() => false)

		value.watch(fn)

		value.set(1)
		expect(fn).toHaveBeenNthCalledWith(1, 1)
		value.set(2)
		value.set(3)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})

describe('getValues', () => {
	it('should return each value', () => {
		const nameVal = createVal('Jose')
		const ageVal = createVal(15)

		const [name, age] = getValues(nameVal, ageVal)

		expect(name).toBe('Jose')
		expect(age).toBe(15)
	})
})

describe('subscribe', () => {
	it('should subscribe', () => {
		const nameVal = createVal('Miguel')
		const ageVal = createVal(15)

		const listener = vi.fn()

		watch(listener, nameVal, ageVal)

		nameVal.set('Maria')

		expect(listener).toHaveBeenNthCalledWith(1, 'Maria', 15)

		ageVal.set(18)

		expect(listener).toHaveBeenNthCalledWith(2, 'Maria', 18)
	})

	describe('when returning false', () => {
		it('should unsubscribe', () => {
			const nameVal = createVal('Miguel')
			const ageVal = createVal(15)

			const listener = vi.fn(() => false)

			watch(listener, nameVal, ageVal)

			nameVal.set('Maria')

			expect(listener).toHaveBeenNthCalledWith(1, 'Maria', 15)

			ageVal.set(18)
			ageVal.set(19)
			ageVal.set(20)

			expect(listener).toHaveBeenCalledTimes(1)
		})
	})
})
