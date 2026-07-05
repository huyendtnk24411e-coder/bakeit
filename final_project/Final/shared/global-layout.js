document.addEventListener("DOMContentLoaded", () => {
    const formatVND = (amount) => amount.toLocaleString('vi-VN') + 'đ';

    const updateCartBadge = () => {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const count = CartStorage ? CartStorage.getItemCount() : 0;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    };

    const renderCartDropdown = () => {
        const title = document.querySelector('.cart-dropdown-title');
        const itemsContainer = document.querySelector('.cart-dropdown-items');
        const footer = document.querySelector('.cart-dropdown-footer');
        const cartItems = CartStorage ? CartStorage.getCartDetails() : [];

        if (!title || !itemsContainer || !footer) return;

        if (cartItems.length === 0) {
            title.textContent = 'Giỏ hàng của bạn';
            itemsContainer.innerHTML = '<div class="cart-empty-state" style="padding:12px 0;color:#9c8476;">Giỏ hàng đang trống.</div>';
            footer.innerHTML = `
                <div class="cart-total-row">
                    <span>Tạm tính:</span>
                    <span class="cart-total-price">0đ</span>
                </div>
                <div class="cart-action-buttons">
                    <button class="btn-view-cart">Xem giỏ hàng</button>
                    <button class="btn-checkout">Thanh toán</button>
                </div>
            `;
            return;
        }

        title.textContent = `Giỏ hàng của bạn (${cartItems.reduce((sum, item) => sum + item.qty, 0)} sản phẩm)`;
        itemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item-mini">
                <div class="item-mini-details">
                    <h4 class="item-mini-name">${item.title}</h4>
                    <div class="item-mini-controls">
                        <span class="item-mini-price">${formatVND(item.price)}</span>
                        <div class="quantity-control-group">
                            <button class="btn-qty-minus" data-id="${item.id}" type="button">-</button>
                            <span class="qty-number">${item.qty}</span>
                            <button class="btn-qty-plus" data-id="${item.id}" type="button">+</button>
                        </div>
                    </div>
                </div>
                <button class="item-mini-remove" data-id="${item.id}" type="button">×</button>
            </div>
        `).join('');

        const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
        footer.innerHTML = `
            <div class="cart-total-row">
                <span>Tạm tính:</span>
                <span class="cart-total-price">${formatVND(totalPrice)}</span>
            </div>
            <div class="cart-action-buttons">
                <button class="btn-view-cart">Xem giỏ hàng</button>
                <button class="btn-checkout">Thanh toán</button>
            </div>
        `;

        itemsContainer.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const cart = CartStorage.getCart();
                const item = cart.find(entry => entry.id === id);
                if (item) {
                    CartStorage.setQty(id, Math.max(1, item.qty - 1));
                    renderCartDropdown();
                    updateCartBadge();
                }
            });
        });

        itemsContainer.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const cart = CartStorage.getCart();
                const item = cart.find(entry => entry.id === id);
                if (item) {
                    CartStorage.setQty(id, item.qty + 1);
                    renderCartDropdown();
                    updateCartBadge();
                }
            });
        });

        itemsContainer.querySelectorAll('.item-mini-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                CartStorage.removeItem(Number(btn.dataset.id));
                renderCartDropdown();
                updateCartBadge();
            });
        });

        footer.querySelector('.btn-view-cart')?.addEventListener('click', () => {
            window.location.href = '../cart/cart.html';
        });

        footer.querySelector('.btn-checkout')?.addEventListener('click', () => {
            if (CartStorage.getCart().length === 0) return;
            CartStorage.showToast('Thanh toán thành công! Cảm ơn bạn đã mua hàng tại Bake it.');
            setTimeout(() => {
                CartStorage.saveCart([]);
                renderCartDropdown();
                updateCartBadge();
            }, 1200);
        });
    };

    // =========================================================
    // 1. TỰ ĐỘNG SINH NỘI DUNG HEADER CHUẨN MÀU (KHÔNG ẢNH GIỎ HÀNG)
    // =========================================================
    const headerContainer = document.getElementById('shared-header');
    if (headerContainer) {
        headerContainer.innerHTML = `
        <header class="main-header">
            <div class="header-top">
                <button class="logo-btn" onclick="location.href='../product-list/product-list.html'">Bake it !</button>
                <div class="search-box">
                    <input type="text" placeholder="Tìm kiếm nguyên liệu, dụng cụ làm bánh...">
                </div>
                
                <div class="header-actions">
                    <div class="user-avatar" title="Tài khoản của bạn">
                        <span class="user-icon">👤</span>
                    </div>
                    
                    <div class="cart-wrapper" title="Giỏ hàng">
                        <div class="cart-trigger">
                            <span class="cart-icon">🛒</span>
                            <span class="cart-badge">0</span>
                        </div>
                        
                        <div class="cart-dropdown">
                            <h3 class="cart-dropdown-title">Giỏ hàng của bạn</h3>
                            <div class="cart-dropdown-items"></div>
                            <div class="cart-dropdown-footer"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <nav class="main-nav">
                <a href="#">Trang chủ</a>
                
                <div class="nav-item-dropdown has-mega">
                    <a href="../product-list/product-list.html" class="active">Sản phẩm <span class="arrow-down">▼</span></a>
                    
                    <div class="mega-menu">
                        <div class="mega-container">
                            <div class="mega-column">
                                <h4>SET NGUYÊN LIỆU TIỆN LỢI (DIY BAKING)</h4>
                                <ul>
                                    <li><a href="#"><strong>Làm ăn tại nhà:</strong></a></li>
                                    <li><a href="#">Set làm bánh lạnh</a></li>
                                    <li><a href="#">Set làm bánh quy</a></li>
                                    <li><a href="#">Set làm bánh mì</a></li>
                                    <li><a href="#">Set bánh dùng lò nướng</a></li>
                                    <li><a href="#">Set làm bánh truyền thống</a></li>
                                    <li><a href="#">Set chè, trà sữa</a></li>
                                </ul>
                            </div>
                            <div class="mega-column" style="margin-top: 35px;">
                                <ul>
                                    <li><a href="#"><strong>Tặng quà:</strong></a></li>
                                    <li><a href="#">Set trang trí bánh kem</a></li>
                                    <li><a href="#">Set socola/Pepero</a></li>
                                    <li style="margin-top: 15px;"><a href="#"><strong>Dịp lễ:</strong></a></li>
                                    <li><a href="#">Set làm bánh Tết</a></li>
                                    <li><a href="#">Set làm bánh Valentine</a></li>
                                    <li><a href="#">Set làm bánh Women's day</a></li>
                                    <li><a href="#">Set làm bánh Trung Thu</a></li>
                                    <li><a href="#">Set làm bánh Noel</a></li>
                                </ul>
                            </div>
                            <div class="mega-column">
                                <h4>ĐỒ LÀM BÁNH</h4>
                                <ul>
                                    <li><a href="#"><strong>Nguyên liệu làm bánh:</strong></a></li>
                                    <li><a href="#">Bột làm bánh</a></li>
                                    <li><a href="#">Phụ gia làm bánh</a></li>
                                    <li><a href="#">Nguyên liệu socola</a></li>
                                    <li><a href="#">Nguyên liệu trang trí</a></li>
                                    <li><a href="#">Nguyên liệu tạo màu</a></li>
                                </ul>
                            </div>
                            <div class="mega-column" style="margin-top: 35px;">
                                <ul>
                                    <li><a href="#"><strong>Kem, bơ, sữa:</strong></a></li>
                                    <li><a href="#">Kem tươi</a></li>
                                    <li><a href="#">Bơ</a></li>
                                    <li><a href="#">Phô mai</a></li>
                                    <li><a href="#">Bánh đông lạnh</a></li>
                                    <li style="margin-top: 15px;"><a href="#"><strong>Dụng cụ làm bánh:</strong></a></li>
                                    <li><a href="#">Dụng cụ cơ bản</a></li>
                                    <li><a href="#">Khuôn khay làm bánh</a></li>
                                    <li><a href="#">Túi hộp đựng bánh</a></li>
                                    <li><a href="#">Máy móc làm bánh</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="#">Blog</a>
                <a href="#">About us</a>
            </nav>
        </header>
        `;
    }

    // =========================================================
    // 2. LOGIC CLICK HIỂN THỊ DROPDOWN GIỎ HÀNG
    // =========================================================
    const cartWrapper = document.querySelector('.cart-wrapper');
    const cartTrigger = document.querySelector('.cart-trigger');
    const btnViewCart = document.querySelector('.btn-view-cart');

    updateCartBadge();
    renderCartDropdown();
    document.addEventListener('cart:updated', () => {
        updateCartBadge();
        renderCartDropdown();
    });

    if (cartTrigger && cartWrapper) {
        cartTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            cartWrapper.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!cartWrapper.contains(e.target)) {
                cartWrapper.classList.remove('show');
            }
        });
    }

    if (btnViewCart) {
        btnViewCart.addEventListener('click', () => {
            window.location.href = '../cart/cart.html';
        });
    }
});