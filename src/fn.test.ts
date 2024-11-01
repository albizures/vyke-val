import { describe, expect, it, vi } from 'vitest'
import { val } from './fn'
import { effect, getValues } from '.'

it('should return the value', () => {
	const $value = val<number | undefined>(undefined)

	expect($value()).toBe(undefined)

	$value(1)

	expect($value()).toBe(1)
})

it('should subscribe to changes', () => {
	const $value = val<number>(0)

	const fn = vi.fn()

	$value.watch(fn)

	$value(1)
	expect(fn).toHaveBeenNthCalledWith(1, 1)
	$value(2)
	expect(fn).toHaveBeenNthCalledWith(2, 2)
})

describe('when returning false', () => {
	it('should unsubscribe', () => {
		const $value = val<number>(0)

		const fn = vi.fn(() => false)

		$value.watch(fn)

		$value(1)
		expect(fn).toHaveBeenNthCalledWith(1, 1)
		$value(2)
		$value(3)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})

describe('getValues', () => {
	it('should return each value', () => {
		const $name = val('Jose')
		const ageVal = val(15)

		const [name, age] = getValues($name, ageVal)

		expect(name).toBe('Jose')
		expect(age).toBe(15)
	})
})

describe('subscribe', () => {
	it('should subscribe', () => {
		const $name = val('Miguel')
		const $age = val(15)

		const listener = vi.fn()

		effect(listener, $name, $age)

		$name('Maria')

		expect(listener).toHaveBeenNthCalledWith(1, 'Maria', 15)

		$age(18)

		expect(listener).toHaveBeenNthCalledWith(2, 'Maria', 18)
	})

	describe('when returning false', () => {
		it('should unsubscribe', () => {
			const $name = val('Miguel')
			const $age = val(15)

			const listener = vi.fn(() => false)

			effect(listener, $name, $age)

			$name('Maria')

			expect(listener).toHaveBeenNthCalledWith(1, 'Maria', 15)

			$age(18)
			$age(19)
			$age(20)

			expect(listener).toHaveBeenCalledTimes(1)
		})
	})
})
