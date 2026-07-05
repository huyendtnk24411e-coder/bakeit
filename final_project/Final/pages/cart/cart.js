document.addEventListener('DOMContentLoaded', async () => {
    const formatVND = (amount) => amount.toLocaleString('vi-VN') + 'đ';
    const IMG_ROOT = '../../';
    const dataUrl = '../../data/products.json';

    const loadProducts = async () => {
        try {
            const response = await fetch(dataUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : (data.products || []);
        } catch (error) {
            console.error('Không thể tải dữ liệu sản phẩm cho giỏ hàng:', error);
            return [];
        }
    };

    const products = (typeof window.PRODUCTS_DATA !== 'undefined' && Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length > 0)
        ? window.PRODUCTS_DATA
        : await loadProducts();
    window.PRODUCTS_DATA = products;

    const cartLayout = document.getElementById('cart-layout');
    const emptyState = document.getElementById('cart-empty-state');
    const tbody = document.getElementById('cart-table-body');
    const summaryItemCount = document.getElementById('summary-item-count');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const btnCheckout = document.getElementById('btn-checkout-page');

    function renderCartPage() {
        const items = CartStorage.getCartDetails();

        if (items.length === 0) {
            if (cartLayout) cartLayout.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        if (cartLayout) cartLayout.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = items.map(item => `
            <tr class="cart-table-row" data-id="${item.id}">
                <td class="col-img">
                    <div class="cart-prod-img" style="background-image: url('${IMG_ROOT}${item.img_path}');"></div>
                </td>
                <td class="col-name">
                    <h4 class="cart-prod-name">${item.title}</h4>
                    <span class="cart-prod-brand">Danh mục: ${item.category}</span>
                </td>
                <td class="col-price">${formatVND(item.price)}</td>
                <td class="col-qty">
                    <div class="cart-qty-box">
                        <button class="cart-qty-btn minus" data-id="${item.id}" type="button">-</button>
                        <input type="number" class="cart-qty-input" data-id="${item.id}" value="${item.qty}" min="1">
                        <button class="cart-qty-btn plus" data-id="${item.id}" type="button">+</button>
                    </div>
                </td>
                <td class="col-subtotal">${formatVND(item.subtotal)}</td>
                <td class="col-remove">
                    <button class="btn-remove-item" data-id="${item.id}" title="Xóa mặt hàng này">×</button>
                </td>
            </tr>
        `).join('');

        // Tổng tiền
        const totalCount = items.reduce((sum, i) => sum + i.qty, 0);
        const totalPrice = CartStorage.getTotalPrice();
        summaryItemCount.textContent = `Tạm tính (${totalCount} sản phẩm):`;
        summarySubtotal.textContent = formatVND(totalPrice);
        summaryTotal.textContent = formatVND(totalPrice);

        bindRowEvents();
    }

    function bindRowEvents() {
        tbody.querySelectorAll('.cart-qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const cart = CartStorage.getCart();
                const item = cart.find(i => i.id === id);
                if (item) CartStorage.setQty(id, Math.max(1, item.qty - 1));
                renderCartPage();
            });
        });
        tbody.querySelectorAll('.cart-qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const cart = CartStorage.getCart();
                const item = cart.find(i => i.id === id);
                if (item) CartStorage.setQty(id, item.qty + 1);
                renderCartPage();
            });
        });
        tbody.querySelectorAll('.cart-qty-input').forEach(input => {
            input.addEventListener('change', () => {
                const id = Number(input.dataset.id);
                let val = parseInt(input.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                CartStorage.setQty(id, val);
                renderCartPage();
            });
        });
        tbody.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                CartStorage.removeItem(Number(btn.dataset.id));
                renderCartPage();
            });
        });
    }

    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (CartStorage.getCart().length === 0) return;
            CartStorage.showToast('Thanh toán thành công! Cảm ơn bạn đã mua hàng tại Bake it.');
            setTimeout(() => {
                CartStorage.saveCart([]);
                renderCartPage();
            }, 1200);
        });
    }

    renderCartPage();
});
