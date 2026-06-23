/**
 * StellaHub - Code & Project Ownership System (Final Unified Version)
 *
 * Tüm bileşenler (Dashboard, Creator, Manager) tek bir Home.tsx dosyasına entegre edilmiştir.
 * Proje: GitHub benzeri, Stellar üzerinde tokenleştirilmiş kod sahipliği platformu.
 */

'use client';

import { useState } from 'react';
import { registerProject, updateProject, type TransactionResult } from '@/lib/contract';

// DIKKAT: Bu importlar muhtemelen sizin projenizdeki /components klasöründen geliyor.
// Bu kısımların varlığını korumak zorundayız, aksi takdirde kod çalışmaz.
import WalletConnection from '@/components/WalletConnection';
import TokenizedProjectDisplay from '@/components/BalanceDisplay';
import ProjectTransferForm from '@/components/PaymentForm';
import OwnershipHistory from '@/components/TransactionHistory';

// Sekme İsimleri
type Tab = 'dashboard' | 'creator' | 'manager';

// ====================================================================
// YARDIMCI BİLEŞENLER (Bu dosya içinde tanımlandı)
// ====================================================================

// 1. Proje Oluşturma Formu (Project Creator)
interface ProjectCreatorProps {
  publicKey: string;
}

const ProjectCreator: React.FC<ProjectCreatorProps> = ({ publicKey }) => {
  const [assetCode, setAssetCode] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [licenseType, setLicenseType] = useState('MIT');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('5');
  const [metadata, setMetadata] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setError(null);
    setTransactionResult(null);
    
    try {
      const result = await registerProject(
        publicKey,
        assetCode,
        publicKey,
        projectUrl,
        licenseType,
        parseInt(royaltyPercentage),
        metadata
      );
      setTransactionResult(result);
      setStatus('success');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 p-8 rounded-2xl shadow-xl border border-primary-300/50">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Tokenize Yeni Proje</h3>
      <p className="text-gray-600 mb-6">
        Projeniz için benzersiz bir Owner Token'ı (Stellar Asset) oluşturun. Token, otomatik olarak cüzdanınıza tanımlanacaktır.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="assetCode" className="block text-sm font-medium text-gray-700 mb-2">
            Proje Kodu (Asset Code, Örn: MYCODE1, MAX 12 Karakter)
          </label>
          <input
            id="assetCode"
            type="text"
            value={assetCode}
            onChange={(e) => setAssetCode(e.target.value.toUpperCase().slice(0, 12))}
            required
            placeholder="PROJE_TOKENI"
            className="w-full p-3 bg-white border border-primary-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub/Proje URL
          </label>
          <input
            id="projectUrl"
            type="url"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            required
            placeholder="https://github.com/kullanici/proje-adi"
            className="w-full p-3 bg-white border border-primary-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-2">
            Lisans Türü
          </label>
          <select
            id="licenseType"
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            required
            className="w-full p-3 bg-white border border-primary-300 rounded-lg text-gray-900 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="MIT">MIT</option>
            <option value="Apache-2.0">Apache-2.0</option>
            <option value="GPL-3.0">GPL-3.0</option>
            <option value="BSD-3-Clause">BSD-3-Clause</option>
            <option value="Proprietary">Proprietary</option>
          </select>
        </div>

        <div>
          <label htmlFor="royaltyPercentage" className="block text-sm font-medium text-gray-700 mb-2">
            Telif Oranı (%)
          </label>
          <input
            id="royaltyPercentage"
            type="number"
            value={royaltyPercentage}
            onChange={(e) => setRoyaltyPercentage(e.target.value)}
            required
            min="0"
            max="100"
            placeholder="5"
            className="w-full p-3 bg-white border border-primary-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-2">
            Proje Açıklaması (Metadata)
          </label>
          <textarea
            id="metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            rows={3}
            required
            placeholder="Projenizi kısaca açıklayın..."
            className="w-full p-3 bg-white border border-primary-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className='bg-primary-50/50 p-3 rounded-lg border border-primary-300/50'>
            <p className='text-sm text-primary-700'>Not: Mülkiyet tokenı olarak, arzı **1 adet** olarak belirlenir. Bu token transferi, projenin tüm sahipliğini aktarır.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-200 ${
            isLoading
              ? 'bg-primary-600/70 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/40'
          }`}
        >
          {isLoading ? 'Token Oluşturuluyor...' : 'Projeyi Tokenize Et'}
        </button>
      </form>

      {status === 'success' && transactionResult && (
        <div className="mt-4 p-4 bg-success-100 text-success-700 rounded-lg border border-success-300/50">
          <p className="font-semibold mb-2">Proje Tokenı Başarıyla Oluşturuldu!</p>
          <p className="text-sm mb-2">Transaction Status: {transactionResult.status}</p>
          <a 
            href={transactionResult.explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium underline hover:text-success-900"
          >
            View Transaction on Stellar Expert →
          </a>
        </div>
      )}

      {status === 'error' && error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300/50">
          <p className="font-semibold mb-1">Hata Oluştu</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};


// 2. Proje Yöneticisi Formu (Project Manager)
interface ProjectManagerProps {
    publicKey: string;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ publicKey }) => {
    const [projectId, setProjectId] = useState('');
    const [newVersion, setNewVersion] = useState('');
    const [newMetadata, setNewMetadata] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setError(null);
        setTransactionResult(null);
        
        try {
            const result = await updateProject(
                publicKey,
                parseInt(projectId),
                publicKey,
                newVersion || undefined,
                newMetadata || undefined
            );
            setTransactionResult(result);
            setStatus('success');
        } catch (err) {
            setError((err as Error).message);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/80 p-8 rounded-2xl shadow-xl border border-secondary-300/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Sürüm ve Metadata Güncelle</h3>
            <p className="text-gray-600 mb-6">
                Bu işlemi sadece tokenın dağıtıcı (Issuer) hesabı yapabilir. Güncelleme, projenizin yaşam döngüsünü yönetmenizi sağlar.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                        Proje ID
                    </label>
                    <input
                        id="projectId"
                        type="number"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        required
                        placeholder="1"
                        className="w-full p-3 bg-white border border-secondary-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-secondary-500 focus:border-secondary-500"
                    />
                </div>

                <div>
                    <label htmlFor="newVersion" className="block text-sm font-medium text-gray-700 mb-2">
                        Yeni Sürüm (Versiyon) Numarası (Opsiyonel)
                    </label>
                    <input
                        id="newVersion"
                        type="text"
                        value={newVersion}
                        onChange={(e) => setNewVersion(e.target.value)}
                        placeholder="v2.0.1"
                        className="w-full p-3 bg-white border border-secondary-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-secondary-500 focus:border-secondary-500"
                    />
                </div>

                <div>
                    <label htmlFor="newMetadata" className="block text-sm font-medium text-gray-700 mb-2">
                        Güncelleme Notları / Açıklama (Opsiyonel)
                    </label>
                    <textarea
                        id="newMetadata"
                        value={newMetadata}
                        onChange={(e) => setNewMetadata(e.target.value)}
                        rows={3}
                        placeholder="Önemli hata düzeltmeleri ve yeni API entegrasyonu yapıldı."
                        className="w-full p-3 bg-white border border-secondary-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-secondary-500 focus:border-secondary-500"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-200 ${
                        isLoading
                            ? 'bg-secondary-600/70 cursor-not-allowed'
                            : 'bg-secondary-500 hover:bg-secondary-600 shadow-lg shadow-secondary-500/40'
                    }`}
                >
                    {isLoading ? 'Metadata Güncelleniyor...' : 'Meta Veriyi Güncelle'}
                </button>
            </form>

            {status === 'success' && transactionResult && (
                <div className="mt-4 p-4 bg-success-100 text-success-700 rounded-lg border border-success-300/50">
                    <p className="font-semibold mb-2">Proje Meta Verisi Başarıyla Güncellendi!</p>
                    <p className="text-sm mb-2">Transaction Status: {transactionResult.status}</p>
                    <a 
                        href={transactionResult.explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium underline hover:text-success-900"
                    >
                        View Transaction on Stellar Expert →
                    </a>
                </div>
            )}

            {status === 'error' && error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300/50">
                    <p className="font-semibold mb-1">Hata Oluştu</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};


// 3. Rehber Kartı (GuideCard)
const GuideCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
    <div className="bg-white/70 rounded-xl p-6 border border-primary-300/50 hover:bg-white/90 transition-colors">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 text-3xl font-extrabold text-primary-600">
            {icon}
        </div>
        <h3 className="text-gray-900 font-semibold mb-2 text-lg">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

// 4. Özellik Kartı (FeatureCard)
const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <div className="bg-white/70 rounded-xl p-6 border border-secondary-200 hover:border-secondary-400 transition-all duration-300 shadow-md">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-secondary-600 font-bold mb-2 text-xl">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

// ====================================================================
// ANA KOMPONENT (Home.tsx)
// ====================================================================

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard'); 

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
    setActiveTab('dashboard');
  };

  const handleDisconnect = () => {
    setPublicKey('');
    setIsConnected(false);
    setActiveTab('dashboard');
  };

  const handleTransferSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Tab stili için yardımcı fonksiyon
  const getTabClasses = (tabName: Tab) => 
    `px-6 py-2.5 text-lg font-semibold transition-all duration-200 rounded-lg ${
      activeTab === tabName
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
        : 'text-gray-600 hover:text-gray-900 hover:bg-primary-100/50'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 text-gray-900 font-sans">
      
      {/* Header - Sleek and Professional */}
      <header className="sticky top-0 z-10 border-b border-primary-200/50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                Invoforge
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-wider">Invoforge</h1>
                <p className="text-primary-600 text-xs mt-0.5 uppercase tracking-widest">
                  Tokenized Code Ownership
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Bağlantı Kesik Durum */}
        {!isConnected && (
          <div className="mb-12 bg-white/70 border border-primary-300/50 rounded-3xl p-10 text-center shadow-2xl">
             <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500 mb-4">
              Unlock the Future of Code Ownership
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Connect your wallet to manage your tokenized projects, transfer ownership (sell/license), and track history on the **Stellar Testnet**.
            </p>
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GuideCard icon="Wallet" title="Get Wallet" description="Install a Stellar-compatible wallet like Freighter or xBull." />
              <GuideCard icon="Link" title="Connect" description="Use the 'Connect Wallet' button to approve access to your public key." />
              <GuideCard icon="Fund" title="Fund Testnet" description="Use Friendbot to get free Testnet XLM to cover transaction fees." />
              <GuideCard icon="Manage" title="Manage Projects" description="View your owned Project Tokens (Assets) and transfer them instantly." />
            </div>
          </div>
        )}

        {/* BAĞLI KULLANICI PANOSU */}
        {isConnected && publicKey && (
          <div className="space-y-10">
            {/* Sekme Navigasyonu */}
            <div className="flex border-b border-primary-200/50 mb-8">
              <button 
                className={getTabClasses('dashboard')} 
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={getTabClasses('creator')} 
                onClick={() => setActiveTab('creator')}
              >
                Project Creator
              </button>
              <button 
                className={getTabClasses('manager')} 
                onClick={() => setActiveTab('manager')}
              >
                Project Manager
              </button>
            </div>
            
            {/* Sekme İçerikleri */}
            <div className="p-0">
                {/* 1. Dashboard Sekmesi */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-10">
                        {/* Cüzdan ve Bakiye (TokenizedProjectDisplay) */}
                        <section className="p-8 bg-white/80 rounded-2xl shadow-xl border border-primary-300/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-primary-600 mb-1">
                                        Connected Wallet:
                                    </h2>
                                    <p className="text-sm font-mono text-gray-700 break-all bg-primary-50/50 p-2 rounded-lg inline-block">
                                        {publicKey}
                                    </p>
                                </div>
                                <div className="text-right" key={`balance-${refreshKey}`}>
                                    <TokenizedProjectDisplay publicKey={publicKey} />
                                </div>
                            </div>
                        </section>

                        {/* Transfer ve Geçmiş */}
                        <div className="grid lg:grid-cols-5 gap-10">
                            <div className="lg:col-span-2">
                                <ProjectTransferForm publicKey={publicKey} onSuccess={handleTransferSuccess} />
                            </div>

                            <div className="lg:col-span-3 p-8 bg-white/80 rounded-2xl shadow-xl border border-accent-300/50">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="text-accent-600">History</span> Ownership & Transaction History
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Recent transactions reflect the transfer of Project Assets or XLM payments.
                                </p>
                                <div key={`history-${refreshKey}`}>
                                    <OwnershipHistory publicKey={publicKey} />
                                </div>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid md:grid-cols-3 gap-6 pt-4">
                            <FeatureCard icon="Fast" title="Instant Transfer" description="Ownership changes are recorded in 3-5 seconds—faster than traditional escrows."/>
                            <FeatureCard icon="Low Cost" title="Micro Fees" description="Transaction costs are negligible (0.00001 XLM), making micro-licensing viable."/>
                            <FeatureCard icon="Flexible" title="Asset Flexibility" description="Project tokens allow for fractional ownership, royalty streams, and complex licensing models."/>
                        </div>
                    </div>
                )}
                
                {/* 2. Project Creator Sekmesi */}
                {activeTab === 'creator' && (
                    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl">
                        <ProjectCreator publicKey={publicKey} />
                    </div>
                )}

                {/* 3. Project Manager Sekmesi */}
                {activeTab === 'manager' && (
                    <div className="bg-gradient-to-br from-secondary-50 to-accent-50 rounded-2xl">
                        <ProjectManager publicKey={publicKey} />
                    </div>
                )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-200 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p className="mb-2">
            Invoforge | Built on the Stellar Network | Testnet Interface
          </p>
          <p className="text-xs text-warning-600">
            This is a Testnet application. **Do not use real Stellar Lumens (XLM)**.
          </p>
        </div>
      </footer>
    </div>
  );
}