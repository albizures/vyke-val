import { describe, expect, it, vi } from 'vitest'
import { computed, pack, val } from './fn'
import { effect, getValues } from '.'

describe('val', () => {
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
})

describe('computed', () => {
	it('should be sync to the selected val', () => {
		const $age = val(15)
		const $legalAge = val(18)
		const $isUnder = computed((age, legalAge) => {
			return age >= legalAge
		}, $age, $legalAge)

		expect($isUnder()).toBe(false)

		$age(19)
		expect($isUnder()).toBe(true)
	})

	it('should subscribe to changes', () => {
		const $age = val(15)
		const $legalAge = val(18)
		const $isUnderAge = computed((age, legalAge) => {
			return age >= legalAge
		}, $age, $legalAge)

		const fn = vi.fn()
		$isUnderAge.watch(fn)
		$age(19)

		expect(fn).toHaveBeenNthCalledWith(1, true)

		$age(10)

		expect(fn).toHaveBeenNthCalledWith(2, false)

		$legalAge(22)
		$age(24)

		expect(fn).toHaveBeenNthCalledWith(3, true)
	})

	it('should run the listener only once', () => {
		const $age = val(15)
		const $legalAge = val(18)
		const $isUnderAge = computed((age, legalAge) => {
			return age >= legalAge
		}, $age, $legalAge)

		const fn = vi.fn()
		$isUnderAge.watch(fn)
		$age(19)
		$age(20)

		expect(fn).toHaveBeenCalledTimes(1)
	})

	describe('the returned value is the same', () => {
		it('should not notify', () => {
			const $age = val(15)
			const $legalAge = val(18)
			const $isUnderAge = computed((age, legalAge) => {
				return age >= legalAge
			}, $age, $legalAge)

			const fn = vi.fn()
			$isUnderAge.watch(fn)
			$age(19)
			$age(19)

			expect(fn).toHaveBeenNthCalledWith(1, true)

			$age(19)

			expect(fn).toHaveBeenCalledTimes(1)
		})
	})
})

describe('pack', () => {
	it('should return the values', () => {
		const $name = val('Jose')
		const $age = val(15)

		const $user = pack({ name: $name, age: $age })

		expect($user()).toStrictEqual({
			name: 'Jose',
			age: 15,
		})
	})

	it('should subscribe to changes', () => {
		const $name = val('Jose')
		const $age = val(15)

		const $user = pack({ name: $name, age: $age })

		const fn = vi.fn()

		$user.watch(fn)

		$name('Maria')

		expect(fn).toHaveBeenNthCalledWith(1, {
			name: 'Maria',
			age: 15,
		})
	})
})
