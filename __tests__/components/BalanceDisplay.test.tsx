import React from 'react'
import { render, screen } from '@testing-library/react'
import BalanceDisplay from '@/components/BalanceDisplay'

describe('BalanceDisplay Component', () => {
  it('renders balance card with title', () => {
    const mockPublicKey = 'GBQHD24ONBXMQV2WQ7YYEJGNW5R736LDXK3ULAPDR5QTA3XKFICBU33Z'
    render(<BalanceDisplay publicKey={mockPublicKey} />)
    const balanceTitle = screen.getByText(/your balance/i)
    expect(balanceTitle).toBeInTheDocument()
  })

  it('renders component without crashing', () => {
    const mockPublicKey = 'GBQHD24ONBXMQV2WQ7YYEJGNW5R736LDXK3ULAPDR5QTA3XKFICBU33Z'
    const { container } = render(<BalanceDisplay publicKey={mockPublicKey} />)
    expect(container).toBeInTheDocument()
  })

  it('has proper card structure', () => {
    const mockPublicKey = 'GBQHD24ONBXMQV2WQ7YYEJGNW5R736LDXK3ULAPDR5QTA3XKFICBU33Z'
    const { container } = render(<BalanceDisplay publicKey={mockPublicKey} />)
    const card = container.querySelector('.bg-white\\/90')
    expect(card).toBeTruthy()
  })
})
