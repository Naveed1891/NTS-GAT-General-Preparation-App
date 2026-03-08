/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import MockTest from './pages/MockTest';
import Analytics from './pages/Analytics';
import AITutor from './pages/AITutor';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/mock-test" element={<MockTest />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/tutor" element={<AITutor />} />
        </Routes>
      </Layout>
    </Router>
  );
}
