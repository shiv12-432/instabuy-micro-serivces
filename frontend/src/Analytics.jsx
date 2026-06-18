export default function Analytics() {

  return (
      <div className="page-shell">

        <h1>Sales Analytics</h1>

        <div className="section-grid">

          <div className="panel card-highlight">

            <h2>Total Revenue</h2>

            <h1 style={{ color: "green" }}>
              ₹2,45,000
            </h1>

          </div>

          <div className="panel">

            <h2>Total Orders</h2>

            <h1>
              145
            </h1>

          </div>

        </div>

        <div className="section-grid">

          <div className="panel">

            <h2>Today's Sales</h2>

            <h1>
              ₹45,000
            </h1>

          </div>

          <div className="panel">

            <h2>Pending Orders</h2>

            <h1>
              12
            </h1>

          </div>

        </div>

      </div>
  );
}
