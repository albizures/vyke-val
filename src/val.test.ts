import { describe, expect, it, vi } from 'vitest'
import { effect, getValues, isVal, val, watch } from '.'
import { val as fnVal } from './fn'

it('should return the value', () => {
	const $value = val<number | undefined>(undefined)

	expect($value.get()).toBe(undefined)

	$value.set(1)

	expect($value.get()).toBe(1)
})

it('should subscribe to changes', () => {
	const $value = val<number>(0)

	const fn = vi.fn()

	$value.watch(fn)

	$value.set(1)
	expect(fn).toHaveBeenNthCalledWith(1, 1)
	$value.set(2)
	expect(fn).toHaveBeenNthCalledWith(2, 2)
})

describe('when returning false', () => {
	it('should unsubscribe', () => {
		const $value = val<number>(0)

		const fn = vi.fn(() => false)

		$value.watch(fn)

		$value.set(1)
		expect(fn).toHaveBeenNthCalledWith(1, 1)
		$value.set(2)
		$value.set(3)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})

describe('getValues', () => {
	it('should return each value', () => {
		const $name = val('Jose')
		const $age = val(15)

		const [name, age] = getValues($name, $age)

		expect(name).toBe('Jose')
		expect(age).toBe(15)
	})
})

describe('subscribe', () => {
	it('should subscribe', () => {
		const $name = val('Miguel')
		const $age = val(15)

		const listener = vi.fn()

		watch(listener, $name, $age)

		$name.set('Maria')

		expect(listener).toHaveBeenNthCalledWith(1, 'Maria', 15)

		$age.set(18)

		expect(listener).toHaveBeenNthCalledWith(2, 'Maria', 18)
	})

	describe('when returning false', () => {
		it('should unsubscribe', () => {
			const $name = val('Miguel')
			const $age = val(15)

			const listener = vi.fn(() => false)

			watch(listener, $name, $age)

			$name.set('Maria')

			expect(listener).toHaveBeenNthCalledWith(1, 'Maria', 15)

			$age.set(18)
			$age.set(19)
			$age.set(20)

			expect(listener).toHaveBeenCalledTimes(1)
		})
	})
})

describe('effect', () => {
	it('should run the listener at least once', () => {
		const $name = val('Jose')
		const $age = val(15)

		const listener = vi.fn()

		effect(listener, $name, $age)

		expect(listener).toHaveBeenNthCalledWith(1, 'Jose', 15)
	})
})

describe('isVal', () => {
	it('should return true for a val', () => {
		const $value = val(1)
		const $fn = fnVal(2)

		expect(isVal($value)).toBe(true)
		expect(isVal($fn)).toBe(true)
	})

	it('should return false for a non-val', () => {
		expect(isVal(1)).toBe(false)
		expect(isVal({})).toBe(false)
		expect(isVal([])).toBe(false)
		expect(isVal(null)).toBe(false)
		expect(isVal(undefined)).toBe(false)
		expect(isVal(() => {})).toBe(false)
	})
})

describe('use', () => {
	it('should return a val', () => {
		const $value = val(1)

		const $plusOne = $value.use((current) => current + 1)

		expect(isVal($plusOne)).toBe(true)
	})

	it('should return the value', () => {
		const $value = val(1)
		const $user = val({ lastName: 'Doe', firstName: 'John' })

		const $plusOne = $value.use((current) => current + 1)
		const $fullName = $user.use((current) => `${current.firstName} ${current.lastName}`)

		expect($plusOne.get()).toBe(2)
		expect($fullName.get()).toBe('John Doe')
	})
})

describe('prop', () => {
	it('should return a val', () => {
		const $user = val({ lastName: 'Doe', firstName: 'John' })

		const $firstName = $user.prop('firstName')

		expect(isVal($firstName)).toBe(true)
	})

	it('should return the value', () => {
		const $user = val({ lastName: 'Doe', firstName: 'John' })

		const $firstName = $user.prop('firstName')

		expect($firstName.get()).toBe('John')
	})
})
