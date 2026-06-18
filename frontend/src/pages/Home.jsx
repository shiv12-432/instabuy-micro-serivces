import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import Sidebar from '../Sidebar';
import { getStoredUser } from '../authUser';
import { fmt } from '../currency';
import { ProductImage } from '../productImage.jsx';
import ProductDescription from '../components/ProductDescription.jsx';

const CATEGORY_META = {
  Mobiles: { image: 'https://cdn.pixabay.com/photo/2016/11/29/12/13/phone-1869510_640.jpg', emoji: '📱', color: '#1e3a5f' },
  Audio:   { image: 'https://cdn.pixabay.com/photo/2018/09/17/14/27/headphones-3683983_640.jpg', emoji: '🎧', color: '#2d1b4e' },
  Fashion: { image: 'https://cdn.pixabay.com/photo/2017/08/06/20/11/woman-2597085_640.jpg', emoji: '👗', color: '#4a1942' },
  Beauty:  { image: 'https://cdn.pixabay.com/photo/2017/05/19/12/38/cosmetics-2326087_640.jpg', emoji: '💄', color: '#5c1a2e' },
  Home:    { image: 'https://cdn.pixabay.com/photo/2017/03/28/12/10/chairs-2181960_640.jpg', emoji: '🛋️', color: '#1a3d2b' },
  Fitness: { image: 'https://cdn.pixabay.com/photo/2017/05/25/15/08/jogging-2343558_640.jpg', emoji: '🏋️', color: '#3d2a00' },
};
const FALLBACK_IMAGES = Object.fromEntries(Object.entries(CATEGORY_META).map(([k, v]) => [k, v.image]));

const heroSlides = [
  {
    kicker: 'Weekend Mega Deals',
    title: 'Shop smarter with InstaBuy.',
    text: 'Discover trending products, sharp prices, and smooth checkout in one premium shopping experience.',
    image: 'https://cdn.pixabay.com/photo/2019/11/08/11/56/shopping-4611482_1280.jpg',
  },
  {
    kicker: 'Fast Delivery Picks',
    title: 'Everything you love, delivered faster.',
    text: 'From daily tech to lifestyle essentials, InstaBuy keeps your cart moving from browse to doorstep.',
    image: 'https://cdn.pixabay.com/photo/2017/11/24/10/43/pay-2974645_1280.jpg',
  },
  {
    kicker: 'Trending Now',
    title: 'Best prices on products people want.',
    text: 'Find fresh arrivals, limited offers, and customer favorites without digging through clutter.',
    image: 'https://cdn.pixabay.com/photo/2015/09/02/12/29/shopping-919297_1280.jpg',
  },
];

const shopBenefits = [
  { title: 'Secure checkout', text: 'Shop with clear pricing, simple cart flow, and account-based order tracking.' },
  { title: 'Fresh deals', text: 'Discount badges and featured products help you spot value quickly.' },
  { title: 'Fast delivery', text: 'Delivery-focused shopping paths make it easy to move from discovery to doorstep.' },
];

const faqItems = [
  {
    question: 'Can I see products before signing in?',
    answer: 'Yes. You can explore the public homepage and featured products. Sign in when you want to add items to your cart.',
  },
  {
    question: 'How do I track an order?',
    answer: 'After signing in, open My Orders to see order status from placement through delivery updates.',
  },
  {
    question: 'Can I become a seller too?',
    answer: 'Yes. Seller Registration is available from the navigation and quick access menu, but shopping stays the main homepage experience.',
  },
];

// Stable random rating/reviews seeded by product id
const getRating = (id) => (3.5 + ((id * 7) % 15) / 10).toFixed(1);
const getReviews = (id) => 50 + ((id * 13) % 151);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });

  const categories = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p.category && !map[p.category]) {
        map[p.category] = p.imageUrl || FALLBACK_IMAGES[p.category] || '';
      }
    });
    // include fallback categories not yet in products
    Object.entries(FALLBACK_IMAGES).forEach(([name, image]) => {
      if (!map[name]) map[name] = image;
    });
    return Object.entries(map).map(([name, image]) => ({ name, image }));
  }, [products]);

  const featured = useMemo(() => products.slice(0, 8), [products]);
  const trending = useMemo(() => [...products].sort((a, b) => (Number(b.discountPercent) || 0) - (Number(a.discountPercent) || 0)).slice(0, 8), [products]);
  const categoryProducts = useMemo(() => selectedCategory ? products.filter((p) => p.category === selectedCategory) : [], [products, selectedCategory]);

  const role = currentUser?.role?.toUpperCase();
  const isSeller = role === 'SELLER';
  const isAdmin = role === 'ADMIN';
  const isInCart = (id) => cartItems.some((item) => Number(item.id || item.productId) === Number(id));

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
    try { setCartItems(JSON.parse(localStorage.getItem('cart') || '[]')); } catch { setCartItems([]); }
    setLoadingProducts(true);

    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [showLogin]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((slide) => (slide + 1) % heroSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const addToCart = (p) => {
    const user = getStoredUser();

    if (!user) {
      setShowLogin(true);
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find((c) => Number(c.id) === Number(p.id));
    const discount = Number(p.discountPercent) || 0;
    const salePrice = Number(p.price) * (1 - discount / 100);

    if (ex) {
      ex.quantity = Math.min((Number(ex.quantity) || 1) + 1, p.stock);
      ex.price = salePrice;
      ex.discountPercent = discount;
      ex.imageUrl = p.imageUrl || ex.imageUrl || '';
    } else {
      cart.push({
        id: p.id,
        productId: p.id,
        name: p.name,
        description: p.description,
        price: salePrice,
        originalPrice: Number(p.price),
        discountPercent: discount,
        quantity: 1,
        stock: p.stock,
        imageUrl: p.imageUrl || '',
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setCartItems(cart);
    window.dispatchEvent(new Event('storage'));
  };

  const renderProducts = (items, ref) => {
    if (loadingProducts) {
      return (
        <div className="product-carousel">
          {[1, 2, 3, 4].map((item) => <div className="product-skeleton" key={item} />)}
        </div>
      );
    }

    if (items.length === 0) {
      return <p className="empty-state">No products available yet.</p>;
    }

    return (
      <div className="product-carousel" ref={ref}>
        {items.map((p) => {
          const discount = Number(p.discountPercent) || 0;
          const displayPrice = Number(p.price) * (1 - discount / 100);

          return (
            <article key={p.id} className="product-card" style={{ minHeight: 'unset' }}>
              <ProductImage product={p} />
              <p className="product-sku">{p.sku}</p>
              <h3>{p.name}</h3>
              <ProductDescription text={p.description} productName={p.name} />
              <div className="stars">{'★'.repeat(Math.round(getRating(p.id)))}{'☆'.repeat(5 - Math.round(getRating(p.id)))} <span className="rating-text">{getRating(p.id)} · {getReviews(p.id)} reviews</span></div>
              <div className="price-box">
                {discount > 0 && <span className="old-price">{fmt(p.price)}</span>}
                <span className="new-price">{fmt(displayPrice)}</span>
              </div>
              {discount > 0 && <span className="discount-badge">{discount}% off</span>}
              <div className="product-meta">
                <span>{p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}</span>
              </div>
              <span className="prime-badge">Fast Delivery</span>
              {!isSeller && !isAdmin && (
                <button
                  className="checkout-btn"
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                >
                  {p.stock === 0 ? 'Out of Stock' : currentUser ? isInCart(p.id) ? 'Added' : 'Add to Cart' : 'Sign in to Add'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  const slide = heroSlides[activeSlide];

  return (
    <main className={currentUser ? 'landing-shell logged-in-home shopper-home' : 'landing-shell premium-home shopper-home'}>
      <Sidebar />

      <section className="shopper-hero" id="home">
        <div className="hero-slider" aria-label="InstaBuy shopping highlights">
          {heroSlides.map((item, index) => (
            <div
              key={item.title}
              className={`hero-slide ${activeSlide === index ? 'active' : ''}`}
              style={{ backgroundImage: `linear-gradient(105deg, rgba(10,18,32,.86), rgba(10,18,32,.44)), url(${item.image})` }}
            />
          ))}
        </div>

        <div className="shopper-hero-copy">
          <p className="eyebrow">{slide.kicker}</p>
          <h1>{slide.title}</h1>
          <p className="hero-text">{slide.text}</p>

          <div className="landing-actions">
            <Link to={currentUser ? '/products' : '/register'} className="hero-cta glow-cta">
              Start Shopping
            </Link>
            <a href="#featured-products" className="hero-secondary">
              Explore Products
            </a>
            <a href="#categories" className="hero-secondary">
              Browse Categories
            </a>
          </div>

          <div className="trust-row" aria-label="Shopping trust badges">
            <span>Easy returns</span>
            <span>Best price deals</span>
            <span>Fast delivery</span>
          </div>
        </div>

        <div className="hero-deal-card">
          <span>Today&apos;s pick</span>
          {featured[0] ? <ProductImage product={featured[0]} className="hero-deal-image" /> : <div className="hero-deal-image fallback">IB</div>}
          <strong>{featured[0]?.name || 'Trending product drops'}</strong>
          <small>{featured[0] ? 'Fresh deal available now' : 'New arrivals are loading'}</small>
        </div>

        <div className="slider-dots" aria-label="Hero slider controls">
          {heroSlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={activeSlide === index ? 'active' : ''}
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="category-section premium-section" id="categories">
        <div className="section-title">
          <p className="eyebrow">Popular categories</p>
          <h2>Shop by what you love.</h2>
        </div>
        <div className="category-showcase">
          {categories.map((category) => {
            const meta = CATEGORY_META[category.name] || { emoji: '🛍️', color: '#1b2a4a' };
            const isActive = selectedCategory === category.name;
            return (
              <button
                type="button"
                className={`category-card-modern${isActive ? ' category-card-active' : ''}`}
                key={category.name}
                onClick={() => {
                  setSelectedCategory(isActive ? null : category.name);
                  document.getElementById('category-products')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.style.background = `linear-gradient(135deg, ${meta.color}, #0f1b32)`;
                    const el = document.createElement('div');
                    el.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;font-size:3rem;z-index:1';
                    el.textContent = meta.emoji;
                    e.currentTarget.parentElement.insertBefore(el, e.currentTarget.parentElement.firstChild);
                  }}
                />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedCategory && (
        <section className="premium-section product-showcase" id="category-products">
          <div className="panel-heading premium-heading">
            <div>
              <p className="eyebrow">Category</p>
              <h2>{selectedCategory}</h2>
            </div>
            <button type="button" className="hero-secondary dark" style={{ cursor: 'pointer', border: '1px solid #cbd5e1' }} onClick={() => setSelectedCategory(null)}>
              ✕ Clear filter
            </button>
          </div>
          {renderProducts(categoryProducts, null)}
        </section>
      )}

      <section className="premium-section product-showcase" id="featured-products">
        <div className="panel-heading premium-heading">
          <div>
            <p className="eyebrow">Featured deals</p>
            <h2>Products worth adding to cart.</h2>
          </div>
          {currentUser && <Link to="/products" className="text-link">See all products</Link>}
        </div>
        {renderProducts(featured, null)}
      </section>

      <section className="premium-section product-showcase">
        <div className="panel-heading premium-heading">
          <div>
            <p className="eyebrow">Trending products</p>
            <h2>High-demand picks with better prices.</h2>
          </div>
        </div>
        {renderProducts(trending.length > 0 ? trending : featured, null)}
      </section>

      <section className="about-instabuy-section" id="why-instabuy">
        <div>
          <p className="eyebrow">About InstaBuy</p>
          <h2>A trusted shopping platform built for faster everyday buying.</h2>
          <p>
            InstaBuy brings modern product discovery, secure checkout, fast delivery signals,
            seller-backed catalog updates, and order tracking into one clean customer experience.
          </p>
          <div className="about-mini-stats" aria-label="InstaBuy shopping highlights">
            <span><strong>24/7</strong> Shopping access</span>
            <span><strong>Fast</strong> Checkout flow</span>
            <span><strong>Live</strong> Product deals</span>
          </div>
        </div>
        <div className="about-visual-grid">
          <span className="about-tile secure"><i aria-hidden="true" /><b>Secure checkout</b><small>Simple cart, clear prices, protected account flow.</small></span>
          <span className="about-tile delivery"><i aria-hidden="true" /><b>Fast delivery</b><small>Delivery-first shopping cards and order progress.</small></span>
          <span className="about-tile sellers"><i aria-hidden="true" /><b>Trusted sellers</b><small>Fresh catalog updates from active seller stores.</small></span>
          <span className="about-tile shopping"><i aria-hidden="true" /><b>Modern shopping</b><small>Premium discovery, offers, reviews, and tracking.</small></span>
        </div>
      </section>

      <section className="premium-section shopper-benefits">
        <div className="section-title">
          <p className="eyebrow">Why shop with InstaBuy</p>
          <h2>A smoother way to discover, buy, and track.</h2>
        </div>
        <div className="feature-grid premium-feature-grid">
          {shopBenefits.map((card, index) => (
            <article className="feature-card premium-card shopper-benefit-card" key={card.title}>
              <span className="feature-icon">{`0${index + 1}`}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="delivery-banner">
        <div>
          <p className="eyebrow">Delivery highlights</p>
          <h2>Cart today. Doorstep faster.</h2>
          <p>Enjoy a polished checkout experience, fast delivery signals, and order updates after sign in.</p>
        </div>
        <Link to={currentUser ? '/products' : '/register'} className="hero-secondary dark">Shop Now</Link>
      </section>

      <section className="premium-section">
        <div className="section-title">
          <p className="eyebrow">Customer love</p>
          <h2>Designed for shoppers who want less friction.</h2>
        </div>
        <div className="testimonial-grid">
          {['The homepage makes finding offers quick.', 'Products feel easy to compare and buy.', 'Checkout and order tracking are simple.'].map((quote, index) => (
            <article className="testimonial-card shopper-testimonial" key={quote}>
              <div className="testimonial-avatar">{['AM', 'PS', 'RK'][index]}</div>
              <div className="testimonial-stars">★★★★★</div>
              <p>&quot;{quote}&quot;</p>
              <strong>{['Aarav M.', 'Priya S.', 'Rohan K.'][index]}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-section faq-preview">
        <div className="section-title">
          <p className="eyebrow">Need answers?</p>
          <h2>Popular questions</h2>
        </div>
        <div className="faq-accordion">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary><span>?</span>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => setShowLogin(false)}
      />
    </main>
  );
}
