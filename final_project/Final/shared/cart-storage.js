(function () {
    const STORAGE_KEY = 'bakeit_cart';

    function ensureToast() {
        if (document.getElementById('cart-toast')) return;

        const toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.style.cssText = [
            'position: fixed',
            'right: 20px',
            'bottom: 24px',
            'z-index: 99999',
            'background: #4a3329',
            'color: #fff',
            'padding: 12px 16px',
            'border-radius: 8px',
            'box-shadow: 0 8px 20px rgba(0,0,0,0.18)',
            'max-width: 320px',
            'line-height: 1.4',
            'opacity: 0',
            'transform: translateY(10px)',
            'transition: opacity 0.2s ease, transform 0.2s ease'
        ].join(';');
        document.body.appendChild(toast);
    }

    const CartStorage = {
        getCart() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (error) {
                console.error('Không đọc được giỏ hàng:', error);
                return [];
            }
        },

        saveCart(cart) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
            this.dispatchUpdate();
        },

        addItem(id, qty = 1) {
            const cart = this.getCart();
            const parsedQty = Number(qty) || 1;
            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.qty += parsedQty;
            } else {
                cart.push({ id, qty: parsedQty });
            }
            this.saveCart(cart);
            return this.getItemCount();
        },

        setQty(id, qty) {
            const safeQty = Math.max(1, Number(qty) || 1);
            const cart = this.getCart()
                .map(item => item.id === id ? { ...item, qty: safeQty } : item)
                .filter(item => item.qty > 0);
            this.saveCart(cart);
        },

        removeItem(id) {
            const cart = this.getCart().filter(item => item.id !== id);
            this.saveCart(cart);
        },

        clear() {
            this.saveCart([]);
        },

        getItemCount() {
            return this.getCart().reduce((sum, item) => sum + item.qty, 0);
        },

        getCartDetails() {
            const products = Array.isArray(window.PRODUCTS_DATA) ? window.PRODUCTS_DATA : [];
            return this.getCart()
                .map(item => {
                    const product = products.find(p => p.id === item.id);
                    if (!product) return null;
                    return {
                        ...product,
                        qty: item.qty,
                        subtotal: product.price * item.qty
                    };
                })
                .filter(Boolean);
        },

        getTotalPrice() {
            return this.getCartDetails().reduce((sum, item) => sum + item.subtotal, 0);
        },

        showToast(message) {
            ensureToast();
            const toast = document.getElementById('cart-toast');
            toast.textContent = message;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            clearTimeout(toast._hideTimer);
            toast._hideTimer = setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
            }, 1800);
        },

        dispatchUpdate() {
            document.dispatchEvent(new CustomEvent('cart:updated', { detail: this.getCart() }));
        }
    };

    window.CartStorage = CartStorage;
})();
