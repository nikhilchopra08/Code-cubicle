"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ApiKey {
  id: number;
  key: string;
  userId: string;
}

interface Context {
  id: number;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  apiKeyId: number;
}

const ApiKeysPage = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contextName, setContextName] = useState('');
  const [contextContent, setContextContent] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/api-keys');
        const { apiKeys, contexts } = response.data;
        setApiKeys(apiKeys);
        setContexts(contexts);
      } catch (error) {
        console.error('Error fetching API keys and contexts:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/api-keys', {
        contextName,
        contextContent,
      });
      const { apiKey, context } = response.data;

      // Update the state with the new API key and context
      setApiKeys((prevApiKeys) => [...prevApiKeys, apiKey]);
      setContexts((prevContexts) => [...prevContexts, context]);

      // Clear form fields
      setContextName('');
      setContextContent('');
    } catch (error) {
      console.error('Error creating API key or context:', error);
      setError('Failed to create API key or context');
    }
  };

  // Group contexts by apiKeyId
  const groupedContexts = contexts.reduce((acc, context) => {
    (acc[context.apiKeyId] = acc[context.apiKeyId] || []).push(context);
    return acc;
  }, {} as Record<number, Context[]>);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">API Keys and Contexts</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Context</h2>
        <div className="mb-4">
          <label htmlFor="contextName" className="block text-sm font-medium text-gray-700">Context Name</label>
          <input
            id="contextName"
            type="text"
            value={contextName}
            onChange={(e) => setContextName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="contextContent" className="block text-sm font-medium text-gray-700">Context Content</label>
          <textarea
            id="contextContent"
            value={contextContent}
            onChange={(e) => setContextContent(e.target.value)}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Context
        </button>
      </form>

      <div className="space-y-4">
        {apiKeys.map(apiKey => (
          <div key={apiKey.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">API Key</h2>
            <p className="bg-gray-100 p-2 rounded mb-4">{apiKey.key}</p>
            
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setSelectedApiKey(selectedApiKey === apiKey.id ? null : apiKey.id)}
            >
              {selectedApiKey === apiKey.id ? 'Hide Contexts' : 'Show Contexts'}
            </button>

            {selectedApiKey === apiKey.id && (
              <div className="mt-4">
                {groupedContexts[apiKey.id]?.map(context => (
                  <div key={context.id} className="border-t pt-2 mt-2">
                    <h3 className="font-semibold">{context.name}</h3>
                    <p>{context.content}</p>
                    <p className="text-gray-500 text-sm">Created At: {new Date(context.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeysPage;
