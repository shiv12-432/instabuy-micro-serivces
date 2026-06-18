import { useState } from 'react';

const policyCopy = {
  terms: {
    title: 'InstaBuy Conditions of Use',
    body: [
      'Use InstaBuy only for lawful shopping, selling, and account management.',
      'Keep your account details accurate and protect your password and OTP codes.',
      'Orders, seller listings, payments, and delivery updates must be honest and complete.',
      'InstaBuy may restrict accounts that misuse the platform, submit false details, or violate these conditions.',
    ],
  },
  privacy: {
    title: 'InstaBuy Privacy Notice',
    body: [
      'InstaBuy uses account, contact, order, and seller details to run shopping, checkout, delivery, and support.',
      'OTP and login details are used to verify account access and protect users from unauthorized activity.',
      'Order and seller information may be used for fulfillment, dashboard reporting, and customer support.',
      'We do not ask you to share passwords or OTP codes with support staff.',
    ],
  },
};

export default function TermsAgreement({ checked, onChange, mode = 'creating an account' }) {
  const [openPolicy, setOpenPolicy] = useState(null);
  const policy = openPolicy ? policyCopy[openPolicy] : null;

  return (
    <>
      <label className="terms-agreement">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
        />
        <span>
          By {mode}, you agree to InstaBuy's{' '}
          <button type="button" className="terms-link" onClick={() => setOpenPolicy('terms')}>
            Conditions of Use
          </button>{' '}
          and{' '}
          <button type="button" className="terms-link" onClick={() => setOpenPolicy('privacy')}>
            Privacy Notice
          </button>
          .
        </span>
      </label>

      {policy && (
        <div className="terms-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">
          <div className="terms-modal">
            <div className="terms-modal-header">
              <h3 id="terms-modal-title">{policy.title}</h3>
              <button type="button" onClick={() => setOpenPolicy(null)} aria-label="Close policy">
                x
              </button>
            </div>
            <div className="terms-modal-body">
              {policy.body.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
            <button type="button" className="checkout-btn" onClick={() => setOpenPolicy(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
