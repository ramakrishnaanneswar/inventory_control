Inventory Control — Demo Clone
===============================

This is a simple, self-contained client-side demo that reproduces the landing page
and a functional browser-only inventory demo (no server required).

What's included:
 - index.html          : Landing page + sign in modal
 - app.html            : Single-page client-side inventory app (dashboard, products, orders, warehouses)
 - assets/style.css    : Styling
 - assets/app.js       : Client-side logic
 - data/sample-data.json : Example data used by the demo

How to run:
1. Unzip the bundle.
2. Open index.html in your browser. (For full fetch() compatibility, you may need a local static server.)
   - Simple option: run `python -m http.server 8000` in the folder, then open http://localhost:8000/index.html
3. Click "Sign In" and enter any username to access the demo.

Notes:
 - This is a demonstration copy and not the original product.
 - To persist changes, edit data/sample-data.json manually or wire a backend.
