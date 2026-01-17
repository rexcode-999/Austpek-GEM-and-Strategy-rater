import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TrendScraper } from './components/TrendScraper';
import { GemRater } from './components/GemRater';
import { AppTab, AiProvider } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TRENDS);
  const [provider, setProvider] = useState<AiProvider>(AiProvider.GEMINI);

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      provider={provider}
      onProviderChange={setProvider}
    >
      {activeTab === AppTab.TRENDS ? (
        <TrendScraper provider={provider} />
      ) : (
        <GemRater provider={provider} />
      )}
    </Layout>
  );
}
