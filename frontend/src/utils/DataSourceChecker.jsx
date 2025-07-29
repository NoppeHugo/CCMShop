import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const DataSourceChecker = () => {
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkDataSource = async () => {
      try {
        // Vérifier l'état de l'API
        const apiStatus = await apiService.checkApiStatus();
        
        // Vérifier les produits
        const products = await apiService.getProducts();
        
        setDataSource({
          connected: true,
          database: apiStatus.database || 'Inconnue',
          productCount: products.count,
          source: products.source || 'API',
          version: apiStatus.version || 'Inconnue',
          supabaseStatus: apiStatus.supabaseStatus || 'Non défini'
        });
      } catch (err) {
        console.error('Erreur lors de la vérification de la source de données:', err);
        setError(err.message);
        
        // Vérifier si localStorage est utilisé comme fallback
        const localProducts = localStorage.getItem('products');
        if (localProducts) {
          setDataSource({
            connected: false,
            database: 'localStorage (fallback)',
            productCount: JSON.parse(localProducts).length,
            source: 'local'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    checkDataSource();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Vérification de la source de données...</div>;
  }

  if (error && !dataSource) {
    return (
      <div className="text-sm text-red-500">
        Erreur de connexion à l'API. Utilisation des données locales.
      </div>
    );
  }

  const isSupabase = dataSource?.database?.includes('Supabase');

  return (
    <div className={`text-sm rounded-md p-2 ${isSupabase ? 'bg-green-100' : 'bg-yellow-100'}`}>
      <p className="font-medium">Source de données: {dataSource?.database}</p>
      {dataSource?.supabaseStatus && (
        <p>Status Supabase: {dataSource.supabaseStatus}</p>
      )}
      <p>Produits: {dataSource?.productCount}</p>
      {!isSupabase && (
        <p className="text-orange-600 font-medium mt-1">
          ⚠️ L'application utilise {dataSource?.source} au lieu de Supabase
        </p>
      )}
    </div>
  );
};

export default DataSourceChecker;