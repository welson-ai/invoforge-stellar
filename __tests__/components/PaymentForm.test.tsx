import React from 'react'
import { render, screen } from '@testing-library/react'
import PaymentForm from '@/components/PaymentForm'

describe('PaymentForm Component', () => {
  it('renders payment form with title', () => {
    const mockPublicKey = 'GBQHD24ONBXMQV2WQ7YYEJGNW5R736LDXK3ULAPDR5QTA3XKFICBU33Z'
    render(<PaymentForm publicKey={mockPublicKey} />)
    
    const formTitles = screen.getAllByText(/send payment/i)
    expect(formTitles.length).toBeGreaterThan(0)
  })

  it('displays warning message about irreversible transactions', () => {
    const mockPublicKey = 'GBQHD24ONBXMQV2WQ7YYEJGNW5R736LDXK3ULAPDR5QTA3XKFICBU33Z'
    render(<PaymentForm publicKey={mockPublicKey} />)
    
    const warningMessage = screen.getByText(/double-check/i)
    expect(warningMessage).toBeInTheDocument()
  })

  it('renders component without crashing', () => {
    const mockPublicKey = 'GBQHD24ONBXMQV2WQ7YYEJGNW5R736LDXK3ULAPDR5QTA3XKFICBU33Z'
    const { container } = render(<PaymentForm publicKey={mockPublicKey} />)
    expect(container).toBeInTheDocument()
  })
})
