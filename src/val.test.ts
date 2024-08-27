import { describe, expect, it, vi } from 'vitest'
import { createVal, get, getValues, pack, select, watch } from '.'

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

describe('select', () => {
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

		expect(fn).toHaveBeenNthCalledWith(3, false)
		expect(fn).toHaveBeenNthCalledWith(4, true)
	})

	describe('when returning false', () => {
		it('should unsubscribe', () => {
			const ageVal = createVal(15)
			const legalAge = createVal(18)
			const isUnderAge = select((age, legalAge) => {
				return age >= legalAge
			}, ageVal, legalAge)

			const fn = vi.fn(() => false)
			isUnderAge.watch(fn)
			ageVal.set(19)

			expect(fn).toHaveBeenNthCalledWith(1, true)

			ageVal.set(10)
			ageVal.set(11)
			ageVal.set(11)

			expect(fn).toHaveBeenCalledTimes(1)
		})
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

describe('pack', () => {
	it('should return the values', () => {
		const nameVal = createVal('Jose')
		const ageVal = createVal(15)

		const userVal = pack({ name: nameVal, age: ageVal })

		const user = get(userVal)

		expect(user).toStrictEqual({
			name: 'Jose',
			age: 15,
		})
	})
})
