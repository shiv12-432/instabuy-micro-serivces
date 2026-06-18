import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ProductDescription({ text, productName }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;

  return (
    <>
      <button
        type="button"
        className="desc-expand-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        <span className="desc-expand-icon">+</span>
        <span>Description</span>
      </button>

      {open && createPortal(
        <div
          className="desc-modal-overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="desc-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="desc-modal-header">
              <h3>{productName}</h3>
              <button
                type="button"
                className="desc-modal-close"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="desc-modal-body">{text}</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
