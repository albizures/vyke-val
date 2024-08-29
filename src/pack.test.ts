import { expect, it, vi } from 'vitest'
import { createVal, get, pack } from '.'

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

it('should subscribe to changes', () => {
	const nameVal = createVal('Jose')
	const ageVal = createVal(15)

	const userVal = pack({ name: nameVal, age: ageVal })

	const fn = vi.fn()

	userVal.watch(fn)

	nameVal.set('Maria')

	expect(fn).toHaveBeenNthCalledWith(1, {
		name: 'Maria',
		age: 15,
	})
})
