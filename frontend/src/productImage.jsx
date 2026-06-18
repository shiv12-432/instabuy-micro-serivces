export function ProductImage({ product, className = 'product-image' }) {
  if (product?.imageUrl) {
    return (
      <img
        className={className}
        src={product.imageUrl}
        alt={product.name || 'Product image'}
        loading="lazy"
      />
    );
  }

  return <div className="product-visual">IB</div>;
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
