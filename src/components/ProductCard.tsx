import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Product,
  conditionLabel,
  conditionColor,
  statusLabel,
  statusColor,
  getProductVariants
} from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Layers } from "lucide-react";
import { recordProductClick } from "@/hooks/useProductClick";

const ProductCard = ({ product }: { product: Product }) => {
  const [variantCount, setVariantCount] = useState(0);
  const sold = product.status === "vendido";

  useEffect(() => {
    const loadVariants = async () => {
      try {
        const variants = await getProductVariants(product.id);
        setVariantCount(variants.length);
      } catch (err) {
        console.error("Error loading variants:", err);
      }
    };
    loadVariants();
  }, [product.id]);

  const handleViewDetailsClick = () => {
    recordProductClick(product.id, { type: "product_card" });
  };

  return (
    <div
      className={`group rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full ${
        sold ? "opacity-60" : ""
      }`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <Link
        to={`/produto/${product.id}`}
        className="block relative aspect-[3/4] md:aspect-video overflow-hidden bg-secondary flex-shrink-0"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={statusColor(product.status)}>
            {statusLabel(product.status)}
          </Badge>

          <Badge className={conditionColor(product.condition)}>
            {conditionLabel(product.condition)}
          </Badge>

          {product.promotion && product.status === "disponivel" && (
            <Badge className="bg-destructive text-destructive-foreground">
              Oferta
            </Badge>
          )}

          {(product as any).is_on_request && (
            <Badge className="bg-orange-500 text-white">
              Por Pedido
            </Badge>
          )}

          {variantCount > 0 && (
            <Badge className="bg-blue-500 text-white flex items-center gap-1">
              <Layers className="h-3 w-3" /> {variantCount} variações
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" /> {product.views}
        </div>
      </Link>

      <div className="p-3 md:p-4 flex flex-col h-full">
        <div className="space-y-2 flex-1">
          <div>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            {product.originalPrice && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  R$ {product.originalPrice.toLocaleString("pt-BR")}
                </span>
                {product.promotion && (
                  <span className="text-xs font-bold text-destructive">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </>
            )}
            <span className={`text-lg font-bold ${product.promotion ? 'text-green-500' : ''}`}>
              R$ {product.price.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-2 mt-4">
          <Button asChild size="sm" variant="outline" className="flex-1 h-9" onClick={handleViewDetailsClick}>
            <Link to={`/produto/${product.id}`}>Ver detalhes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
