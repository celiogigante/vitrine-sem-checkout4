import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type Product } from "@/lib/products";

interface SearchAutoCompleteProps {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onProductSelect?: (product: Product) => void;
}

const SearchAutoComplete = ({
  products,
  value,
  onChange,
  placeholder = "Buscar celular...",
  onProductSelect,
}: SearchAutoCompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const searchLower = value.toLowerCase();
    
    const filtered = products
      .filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.brand.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => {
        const aNameStart = a.name.toLowerCase().startsWith(searchLower);
        const bNameStart = b.name.toLowerCase().startsWith(searchLower);
        const aBrandStart = a.brand.toLowerCase().startsWith(searchLower);
        const bBrandStart = b.brand.toLowerCase().startsWith(searchLower);

        if (aNameStart && !bNameStart) return -1;
        if (!aNameStart && bNameStart) return 1;
        if (aBrandStart && !bBrandStart) return -1;
        if (!aBrandStart && bBrandStart) return 1;
        
        return 0;
      })
      .slice(0, 8);

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  }, [value, products]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    onChange(product.name);
    setIsOpen(false);
    onProductSelect?.(product);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.trim() && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((product) => {
            const highlightStart = product.name
              .toLowerCase()
              .indexOf(value.toLowerCase());
            const isExactMatch = 
              product.name.toLowerCase().startsWith(value.toLowerCase()) ||
              product.brand.toLowerCase().startsWith(value.toLowerCase());

            return (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`w-full text-left px-4 py-3 border-b border-input last:border-b-0 hover:bg-accent/50 transition-colors flex items-center gap-3 ${
                  isExactMatch ? "bg-accent/30" : ""
                }`}
              >
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=100&h=100&fit=crop"}
                  alt={product.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {product.brand}
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {highlightStart !== -1 ? (
                      <>
                        <span className="text-muted-foreground">
                          {product.name.substring(0, highlightStart)}
                        </span>
                        <span className="text-yellow-400 font-bold">
                          {product.name.substring(
                            highlightStart,
                            highlightStart + value.length
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {product.name.substring(
                            highlightStart + value.length
                          )}
                        </span>
                      </>
                    ) : (
                      product.name
                    )}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                  R$ {product.price.toLocaleString("pt-BR")}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchAutoComplete;
