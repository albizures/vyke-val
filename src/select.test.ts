import { describe, expect, it, vi } from 'vitest'
import { createVal, select } from '.'

it('should be sync to the selected val', () => {
	const ageVal = createVal(15)
	const legalAgeVal = createVal(18)
	const isUnderAge = select((age, legalAge) => {
		return age >= legalAge
	}, ageVal, legalAgeVal)

	expect(isUnderAge.get()).toBe(false)

	ageVal.set(19)
	expect(isUnderAge.get()).toBe(true)
})

it('should subscribe to changes', () => {
	const ageVal = createVal(15)
	const legalAgeVal = createVal(18)
	const isUnderAge = select((age, legalAge) => {
		return age >= legalAge
	}, ageVal, legalAgeVal)

	const fn = vi.fn()
	isUnderAge.watch(fn)
	ageVal.set(19)

	expect(fn).toHaveBeenNthCalledWith(1, true)

	ageVal.set(10)

	expect(fn).toHaveBeenNthCalledWith(2, false)

	legalAgeVal.set(22)
	ageVal.set(24)

	expect(fn).toHaveBeenNthCalledWith(3, true)
})

it('should run the listener only once', () => {
	const ageVal = createVal(15)
	const legalAgeVal = createVal(18)
	const isUnderAge = select((age, legalAge) => {
		return age >= legalAge
	}, ageVal, legalAgeVal)

	const fn = vi.fn()
	isUnderAge.watch(fn)
	ageVal.set(19)
	ageVal.set(20)

	expect(fn).toHaveBeenCalledTimes(1)
})

describe('the returned value is the same', () => {
	it('should not notify', () => {
		const ageVal = createVal(15)
		const legalAge = createVal(18)
		const isUnderAge = select((age, legalAge) => {
			return age >= legalAge
		}, ageVal, legalAge)

		const fn = vi.fn()
		isUnderAge.watch(fn)
		ageVal.set(19)
		ageVal.set(19)

		expect(fn).toHaveBeenNthCalledWith(1, true)

		ageVal.set(19)

		expect(fn).toHaveBeenCalledTimes(1)
	})
})
