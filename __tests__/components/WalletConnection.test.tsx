import React from 'react'
import { render, screen } from '@testing-library/react'
import WalletConnection from '@/components/WalletConnection'

describe('WalletConnection Component', () => {
  it('renders connect wallet button when not connected', () => {
    render(<WalletConnection onConnect={() => {}} onDisconnect={() => {}} />)
    const connectButtons = screen.getAllByText(/connect wallet/i)
    expect(connectButtons.length).toBeGreaterThan(0)
  })

  it('renders component without crashing', () => {
    const { container } = render(<WalletConnection onConnect={() => {}} onDisconnect={() => {}} />)
    expect(container).toBeInTheDocument()
  })

  it('displays supported wallets information', () => {
    render(<WalletConnection onConnect={() => {}} onDisconnect={() => {}} />)
    const supportedWallets = screen.getByText(/supported wallets/i)
    expect(supportedWallets).toBeInTheDocument()
  })
})
