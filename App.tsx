import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TrendScraper } from './components/TrendScraper';
import { GemRater } from './components/GemRater';
import { AppTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TRENDS);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === AppTab.TRENDS ? <TrendScraper /> : <GemRater />}
    </Layout>
  );
}
