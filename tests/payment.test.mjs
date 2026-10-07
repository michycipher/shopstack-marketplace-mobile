import assert from 'node:assert/strict'
import test from 'node:test'
import { isPaidStatus, remainingAfterPurchase } from '../lib/payment.ts'

test('only a confirmed paid order clears purchased items', () => {
  assert.equal(isPaidStatus('Paid'), true)
  assert.equal(isPaidStatus(' paid '), true)
  assert.equal(isPaidStatus('Pending'), false)
  assert.equal(isPaidStatus('Failed'), false)
})

test('purchased quantities are removed without deleting later additions or other items', () => {
  const cart = [
    { id: 'shoe', quantity: 3 },
    { id: 'shirt', quantity: 1 },
  ]

  assert.deepEqual(remainingAfterPurchase(cart, [{ id: 'shoe', quantity: 2 }]), [
    { id: 'shoe', quantity: 1 },
    { id: 'shirt', quantity: 1 },
  ])
  assert.deepEqual(remainingAfterPurchase(cart, [{ id: 'shoe', quantity: 3 }]), [
    { id: 'shirt', quantity: 1 },
  ])
  assert.deepEqual(remainingAfterPurchase(cart, [
    { id: 'shoe', quantity: 1 },
    { id: 'shoe', quantity: 1 },
  ]), [
    { id: 'shoe', quantity: 1 },
    { id: 'shirt', quantity: 1 },
  ])
})
