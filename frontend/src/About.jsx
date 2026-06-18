import Sidebar from "./Sidebar";

export default function About() {
  const highlights = [
    {
      title: 'For customers',
      text: 'Browse live products, add items to cart, checkout quickly, and follow every order from placement to shipment.',
    },
    {
      title: 'For sellers',
      text: 'Manage catalog details, stock quantity, prices, discounts, and customer order decisions from one focused workspace.',
    },
    {
      title: 'For admins',
      text: 'Review accepted orders and move them to shipment after seller approval, keeping fulfillment clear and controlled.',
    },
  ];

  return (
    <div>

      <Sidebar />

      <div className="page-with-sidebar page-shell">

        <h1>About InstaBuy</h1>

        <div className="panel">

          <p>
            InstaBuy is a modern ecommerce and order-management platform built
            for shoppers, sellers, and admins. It brings product discovery,
            seller onboarding, stock updates, discounts, checkout, and order
            status tracking into one clean experience.
          </p>

          <p>
            Customers can shop with confidence because product pricing and
            stock are updated by sellers directly. Sellers can accept or decline
            customer orders, and admins can ship orders after seller approval.
            This creates a simple workflow where every role knows what to do
            next.
          </p>

        </div>

        <div className="feature-grid" style={{ marginTop: 18 }}>
          {highlights.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 18 }}>

          <h3>What InstaBuy focuses on</h3>

          <p>
            Fast shopping, accurate catalog information, practical seller
            tools, and transparent order movement. The platform is designed to
            keep daily ecommerce work simple rather than scattered across
            separate pages and manual updates.
          </p>

          <h3>Location</h3>

          <p>Bangalore, Karnataka, India</p>

          <h3>Support</h3>

          <p>support@instabuy.com</p>

        </div>

      </div>

    </div>
  );
}
