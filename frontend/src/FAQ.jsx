const faqs = [
  {
    category: 'Account',
    question: 'How do I create a customer account?',
    answer: 'Open Create Account, verify your details, then sign in to browse products, add items to cart, checkout, and track orders.',
  },
  {
    category: 'Shopping',
    question: 'Can I see products before signing in?',
    answer: 'Yes. You can explore featured products and categories from the public homepage. Sign in when you want to add items to your cart.',
  },
  {
    category: 'Orders',
    question: 'How can customers track orders?',
    answer: 'Customers can open My Orders after signing in to see whether an order is placed, accepted, shipped, delivered, or declined.',
  },
  {
    category: 'Payments',
    question: 'Is checkout secure?',
    answer: 'InstaBuy keeps the checkout flow clear and account-based, with visible cart pricing, discounts, and order confirmation details.',
  },
  {
    category: 'Delivery',
    question: 'How fast is delivery?',
    answer: 'Delivery timing depends on the product and seller, but product cards highlight fast delivery options wherever available.',
  },
  {
    category: 'Seller',
    question: 'Can I become a seller?',
    answer: 'Yes. Open Seller Registration, verify your email, add business details, and start managing products from the seller dashboard.',
  },
  {
    category: 'Seller',
    question: 'Can sellers add and update products?',
    answer: 'Yes. Sellers can add products, update product details, stock quantity, prices, discounts, and images.',
  },
  {
    category: 'Support',
    question: 'How do I contact support?',
    answer: 'You can contact InstaBuy support at support@instabuy.com for account, seller, product, or order help.',
  },
];

export default function FAQ() {
  return (
    <main className="faq-page-shell">
      <section className="faq-hero-panel">
        <div>
          <p className="eyebrow">InstaBuy Support</p>
          <h1>Questions, answered clearly.</h1>
          <p>
            Find quick help for shopping, checkout, delivery, orders, and seller registration
            without leaving the public experience.
          </p>
        </div>

        <div className="faq-help-card">
          <span aria-hidden="true" />
          <strong>Need more help?</strong>
          <p>Reach support at support@instabuy.com</p>
        </div>
      </section>

      <section className="faq-modern-layout single-column">
        <div className="faq-list-modern" id="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-modern-item">
              <summary>
                <strong>{faq.question}</strong>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
