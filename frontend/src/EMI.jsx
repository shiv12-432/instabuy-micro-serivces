import Sidebar from "./Sidebar";

export default function EMI() {

  const productPrice = 24000;

  const emi = productPrice / 12;

  return (
    <div>

      <Sidebar />

      <div className="page-with-sidebar page-shell">

        <h1>EMI Options</h1>

        <div className="panel">

          <h2>
            Product Price: ₹{productPrice}
          </h2>

          <h2>
            12 Month EMI: ₹{emi}
          </h2>

        </div>

      </div>

    </div>
  );
}