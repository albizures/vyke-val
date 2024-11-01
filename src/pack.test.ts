import { expect, it, vi } from 'vitest'
import { pack, val } from '.'

it('should return the values', () => {
	const $name = val('Jose')
	const $age = val(15)

	const $user = pack({ name: $name, age: $age })

	expect($user.get()).toStrictEqual({
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

	$name.set('Maria')

	expect(fn).toHaveBeenNthCalledWith(1, {
		name: 'Maria',
		age: 15,
	})
})
