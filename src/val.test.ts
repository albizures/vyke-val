import { describe, expect, it, vi } from 'vitest'
import { effect, getValues, val, watch } from '.'

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
