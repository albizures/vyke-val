import { describe, expect, it, vi } from 'vitest'
import { computed, val } from '.'

it('should be synced to the selected val', () => {
	const $age = val(15)
	const $legalAge = val(18)
	const $isUnder = computed((age, legalAge) => {
		return age >= legalAge
	}, $age, $legalAge)

	expect($isUnder.get()).toBe(false)

	$age.set(19)
	expect($isUnder.get()).toBe(true)
})

it('should subscribe to changes', () => {
	const $age = val(15)
	const $legalAge = val(18)
	const $isUnderAge = computed((age, legalAge) => {
		return age >= legalAge
	}, $age, $legalAge)

	const fn = vi.fn()
	$isUnderAge.watch(fn)
	$age.set(19)

	expect(fn).toHaveBeenNthCalledWith(1, true)

	$age.set(10)

	expect(fn).toHaveBeenNthCalledWith(2, false)

	$legalAge.set(22)
	$age.set(24)

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
	$age.set(19)
	$age.set(20)

	expect(fn).toHaveBeenCalledTimes(1)
})

describe('if the returned value is the same', () => {
	it('should not notify', () => {
		const $age = val(15)
		const $legalAge = val(18)
		const $isUnderAge = computed((age, legalAge) => {
			return age >= legalAge
		}, $age, $legalAge)

		const fn = vi.fn()
		$isUnderAge.watch(fn)
		$age.set(19)
		$age.set(19)

		expect(fn).toHaveBeenNthCalledWith(1, true)

		$age.set(19)

		expect(fn).toHaveBeenCalledTimes(1)
	})
})
