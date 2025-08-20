import React, { useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Grid, List, Loader2, AlertCircle } from 'lucide-react';
import { listProducts, getCategories } from "../api/products";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { TTQ } from "../lib/tiktok";

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Extract URL parameters
  const page = Number(params.get("page") ?? 1);
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = (params.get("sort") ?? "new") as "new" | "price-asc" | "price-desc";

  const queryClient = useQueryClient();

  // Fetch products
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", { page, q, sort, category }],
    queryFn: () => listProducts({ page, q, sort, category: category || undefined }),
    keepPreviousData: true,
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Update URL parameters
  const updateParam = (key: string, value: string) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') {
      params.set("page", "1"); // Reset to first page when filtering
    }
    setParams(params, { replace: true });
    
    // Track search event when query changes
    if (key === 'q' && value) {
      TTQ.search({
        contents: [{
          content_id: "search",
          content_type: "product_group",
          content_name: "catalog",
        }],
        value: 0,
        currency: "USD",
        search_string: value,
      });
    }
  };

  // Prefetch product details on hover
  const handleProductHover = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ["product", slug],
      queryFn: () => import("../api/products").then(m => m.getProductBySlug(slug))
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-stone-900 mb-2">Unable to Load Products</h3>
              <p className="text-stone-600 mb-6">{(error as Error).message}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      <SEO
        title="Products - Golden Graze"
        description="Discover our collection of ancestrally inspired tallow skincare products. Luxuriously crafted balms that nourish your skin through sacred rituals."
        url="/products"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Our Sacred Collection</h1>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Ancestrally inspired skincare rituals crafted with nature's finest ingredients
          </p>
          <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                  value={q}
                  onChange={(e) => updateParam("q", e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                value={category}
                onChange={(e) => updateParam("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
              >
                <option value="new">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-stone-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-stone-600">Loading our sacred collection...</p>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {!isLoading && data && (
          <>
            {data.items.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                  <Search size={48} className="text-amber-600" />
                </div>
                <h2 className="font-serif text-2xl text-stone-900 mb-4">No Products Found</h2>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">
                  {q || category 
                    ? 'No products match your current search or filter criteria. Try adjusting your search terms.'
                    : 'Our sacred collection is being prepared. Please check back soon.'
                  }
                </p>
                {(q || category) && (
                  <button
                    onClick={() => {
                      setParams(new URLSearchParams(), { replace: true });
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
                  >
                    CLEAR FILTERS
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-stone-600">
                    Showing {data.items.length} of {data.total} products
                    {q && ` for "${q}"`}
                    {category && ` in ${category}`}
                  </p>
                </div>

                {/* Products Grid */}
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                }`}>
                  {data.items.map((product, index) => (
                    <div
                      key={product.id}
                      onMouseEnter={() => handleProductHover(product.slug)}
                      className={`transition-all duration-1000 ${
                        isLoading ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                      }`}
                      style={{ 
                        transitionDelay: `${index * 100}ms`,
                        opacity: 1,
                        transform: 'translateY(0)'
                      }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-12">
                    <button 
                      className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                      disabled={page <= 1} 
                      onClick={() => updateParam("page", String(page - 1))}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(data.totalPages - 4, page - 2)) + i;
                        if (pageNum > data.totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => updateParam("page", String(pageNum))}
                            className={`w-10 h-10 rounded-lg transition-colors ${
                              pageNum === page
                                ? 'bg-amber-400 text-white'
                                : 'border border-stone-300 hover:bg-stone-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                      disabled={page >= data.totalPages} 
                      onClick={() => updateParam("page", String(page + 1))}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}