import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AddressBook() {

  const [addresses, setAddresses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    city: "",
    pincode: "",
    address: ""
  });

  const addAddress = () => {

    setAddresses([
      ...addresses,
      form
    ]);

    setForm({
      name: "",
      city: "",
      pincode: "",
      address: ""
    });
  };

  return (
    <div>

      <Sidebar />

      <div className="page-with-sidebar page-shell">

        <h1>My Addresses</h1>

        <div className="panel">

          <div className="order-form">

            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

            <input
              placeholder="City"
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city: e.target.value
                })
              }
            />

            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({
                  ...form,
                  pincode: e.target.value
                })
              }
            />

            <textarea
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value
                })
              }
            />

            <button
              className="btn-primary"
              onClick={addAddress}
            >
              Add Address
            </button>

          </div>

        </div>

        <div className="section-list">

          {addresses.map((a, i) => (

            <div key={i} className="panel">

              <h3>{a.name}</h3>

              <p>{a.address}</p>

              <p>
                {a.city} - {a.pincode}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}