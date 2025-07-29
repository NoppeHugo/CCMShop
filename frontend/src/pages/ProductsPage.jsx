import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import PriceFilter from '../components/PriceFilter';
import apiService from '../services/apiService';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        if (response && response.data) {
          setProducts(response.data);
          setFilteredProducts(response.data);
          
          // Extraire les catégories uniques
          const uniqueCategories = [...new Set(response.data.map(product => product.category))];
          setCategories(uniqueCategories);
          
          // Déterminer la plage de prix
          const prices = response.data.map(product => product.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: minPrice, max: maxPrice });
        }
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Appliquer les filtres
    let result = [...products];
    
    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filtre par prix
    result = result.filter(
      product => product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    setFilteredProducts(result);
  }, [selectedCategory, priceRange, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md my-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nos Bijoux</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filtres */}
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Filtres</h2>
            
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            
            <div className="mt-6">
              <PriceFilter 
                min={Math.min(...products.map(p => p.price))} 
                max={Math.max(...products.map(p => p.price))}
                currentMin={priceRange.min}
                currentMax={priceRange.max}
                onPriceChange={handlePriceChange}
              />
            </div>
          </div>
        </div>
        
        {/* Liste de produits */}
        <div className="w-full md:w-3/4">
          {filteredProducts.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-md text-center">
              <p className="text-lg text-gray-600">Aucun produit ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;