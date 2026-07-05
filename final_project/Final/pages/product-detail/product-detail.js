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
            console.error('Không thể tải dữ liệu sản phẩm:', error);
            return [];
        }
    };

    const AVAILABLE_IMAGES = [
        "assets/images/products/Dụng_cụ/totronbot.png",
        "assets/images/products/Dụng_cụ/tamnuongsilicon.png",
        "assets/images/products/Dụng_cụ/spatula.png",
        "assets/images/products/Dụng_cụ/maydanhtrung.png",
        "assets/images/products/Nguyên_liệu/Kem/WhippingCreamAnchor.png",
        "assets/images/products/Nguyên_liệu/Kem/SourCreamTatua1kg.png",
        "assets/images/products/Nguyên_liệu/Kem/CreamCheese.png",
        "assets/images/products/Nguyên_liệu/bơ/BơAnchor.png",
        "assets/images/products/Nguyên_liệu/bột/BC8.png",
        "assets/images/products/Nguyên_liệu/bột/BC11.png",
        "assets/images/products/Nguyên_liệu/bột/BotBap.png",
        "assets/images/products/Nguyên_liệu/bột/BotGao.png",
        "assets/images/products/Nguyên_liệu/bột/BotMatcha.png",
        "assets/images/products/Nguyên_liệu/bột/BotNang.png"
    ];

    const IMAGE_FALLBACKS = {
        tools: "assets/images/products/Dụng_cụ/totronbot.png",
        butter: "assets/images/products/Nguyên_liệu/bơ/BơAnchor.png",
        cream: "assets/images/products/Nguyên_liệu/Kem/WhippingCreamAnchor.png",
        flour: "assets/images/products/Nguyên_liệu/bột/BC8.png"
    };

    const normalizeImagePath = (imgPath = '') => {
        if (!imgPath) return '';
        let normalized = imgPath.replace(/\\/g, '/').trim();
        if (/^https?:\/\//i.test(normalized)) return normalized;
        normalized = normalized
            .replace('assets/images/products/Dung_cu/', 'assets/images/products/Dụng_cụ/')
            .replace('assets/images/products/Nguyen_lieu/', 'assets/images/products/Nguyên_liệu/')
            .replace('assets/images/products/Nguyên_lieu/', 'assets/images/products/Nguyên_liệu/');
        return normalized;
    };

    const getProductImageUrl = (imgPath, product = null) => {
        const normalized = normalizeImagePath(imgPath);
        if (!normalized) return `${IMG_ROOT}${IMAGE_FALLBACKS.tools}`;
        if (/^https?:\/\//i.test(normalized)) return normalized;

        const resolved = normalized.startsWith('assets/') ? normalized : `assets/${normalized.replace(/^\.?\//, '')}`;
        if (AVAILABLE_IMAGES.includes(resolved)) {
            return `${IMG_ROOT}${resolved}`;
        }

        const title = (product?.title || '').toLowerCase();
        const category = (product?.category || '').toLowerCase();
        if (category.includes('dụng cụ') || title.includes('máy') || title.includes('khuôn') || title.includes('spatula') || title.includes('tấm') || title.includes('tô')) {
            return `${IMG_ROOT}${IMAGE_FALLBACKS.tools}`;
        }
        if (title.includes('bơ') || title.includes('butter')) {
            return `${IMG_ROOT}${IMAGE_FALLBACKS.butter}`;
        }
        if (title.includes('kem') || title.includes('cream') || title.includes('sữa') || title.includes('sua')) {
            return `${IMG_ROOT}${IMAGE_FALLBACKS.cream}`;
        }
        if (title.includes('bột') || title.includes('bot') || title.includes('matcha') || title.includes('gao') || title.includes('bắp') || title.includes('ngô')) {
            return `${IMG_ROOT}${IMAGE_FALLBACKS.flour}`;
        }
        return `${IMG_ROOT}${IMAGE_FALLBACKS.tools}`;
    };

    const allProducts = (typeof window.PRODUCTS_DATA !== 'undefined' && Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length > 0)
        ? window.PRODUCTS_DATA
        : await loadProducts();
    window.PRODUCTS_DATA = allProducts;

    // ============ LẤY SẢN PHẨM THEO ?id= TRÊN URL ============
    const params = new URLSearchParams(window.location.search);
    const requestedId = Number(params.get('id'));
    let product = allProducts.find(p => p.id === requestedId);

    // Nếu không có id hợp lệ trên URL (vd: người dùng vào thẳng trang), hiển thị sản phẩm đầu tiên
    if (!product && allProducts.length > 0) {
        product = allProducts[0];
    }

    if (!product) {
        document.querySelector('.container').innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:#9c8476;">
                <h2>Không tìm thấy sản phẩm</h2>
                <p>Sản phẩm bạn tìm không tồn tại hoặc đã bị gỡ bỏ.</p>
                <button onclick="location.href='../product-list/product-list.html'" style="margin-top:15px;padding:10px 20px;border:none;background:#4a3329;color:#fff;border-radius:6px;cursor:pointer;">← Quay lại danh sách sản phẩm</button>
            </div>
        `;
        return;
    }

    // ============ RENDER THÔNG TIN SẢN PHẨM ============
    document.title = `${product.title} - Bake it!`;
    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-price').textContent = formatVND(product.price);
    document.getElementById('desc-category').textContent = product.category;

    const shortDesc = `
        <p><strong>${product.title}</strong> là lựa chọn hoàn hảo cho những ai yêu thích làm bánh tại nhà. Sản phẩm thuộc danh mục <strong>${product.category}</strong> và được Bake it! tuyển chọn kỹ lưỡng để mang lại trải nghiệm sử dụng dễ dàng, an toàn và hiệu quả.</p>
        <p>Được thiết kế phù hợp cho cả người mới bắt đầu và người làm bánh chuyên nghiệp, sản phẩm giúp bạn tiết kiệm thời gian, tối ưu công đoạn chuẩn bị và tạo ra những món bánh thơm ngon, đẹp mắt hơn mỗi ngày.</p>
    `;
    document.getElementById('product-desc').innerHTML = shortDesc;

    // SỬA TẠI ĐÂY: Sử dụng hàm getProductImageUrl để lấy link chuẩn
    const imageUrl = getProductImageUrl(product.img_path, product);
    const mainImageBox = document.getElementById('main-image-box');
    mainImageBox.style.backgroundImage = `url('${imageUrl}')`;

    const thumbnailRow = document.getElementById('thumbnail-row');
    thumbnailRow.innerHTML = [0, 1, 2].map(i => `
        <div class="thumb-item ${i === 0 ? 'active' : ''}" style="background-image: url('${imageUrl}');"></div>
    `).join('');
    thumbnailRow.querySelectorAll('.thumb-item').forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbnailRow.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            mainImageBox.style.backgroundImage = thumb.style.backgroundImage;
        });
    });

    // ============ BỘ CHỌN SỐ LƯỢNG ============
    const qtyInput = document.querySelector('.qty-input');
    document.querySelector('.qty-btn.minus').addEventListener('click', () => {
        const val = Math.max(1, Number(qtyInput.value) - 1);
        qtyInput.value = val;
    });
    document.querySelector('.qty-btn.plus').addEventListener('click', () => {
        qtyInput.value = Number(qtyInput.value) + 1;
    });
    qtyInput.addEventListener('change', () => {
        if (Number(qtyInput.value) < 1 || isNaN(Number(qtyInput.value))) qtyInput.value = 1;
    });
    qtyInput.addEventListener('wheel', (event) => {
        event.preventDefault();
    });

    // ============ THÊM VÀO GIỎ / MUA NGAY ============
    document.getElementById('btn-add-cart').addEventListener('click', () => {
        CartStorage.addItem(product.id, Number(qtyInput.value));
        CartStorage.showToast('Đã thêm sản phẩm vào giỏ hàng');
        const btn = document.getElementById('btn-add-cart');
        const originalText = btn.textContent;
        btn.textContent = 'Đã thêm ✓';
        setTimeout(() => btn.textContent = originalText, 900);
    });

    document.getElementById('btn-buy-now').addEventListener('click', () => {
        CartStorage.addItem(product.id, Number(qtyInput.value));
        CartStorage.showToast('Đã thêm sản phẩm vào giỏ hàng');
        window.location.href = '../cart/cart.html';
    });

    const faqForm = document.querySelector('.faq-form');
    if (faqForm) {
        faqForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const textarea = faqForm.querySelector('textarea');
            if (textarea) {
                alert('Câu hỏi của bạn đã được ghi nhận. Bake it! sẽ phản hồi sớm nhất có thể.');
                textarea.value = '';
            }
        });
    }

    // ============ SẢN PHẨM LIÊN QUAN (CÙNG DANH MỤC) ============
    const relatedGrid = document.getElementById('related-products-grid');
    if (relatedGrid) {
        let related = allProducts.filter(p => p.category === product.category && p.id !== product.id);
        // Nếu không đủ 4 sản phẩm cùng danh mục, bổ sung thêm sản phẩm khác cho đủ
        if (related.length < 4) {
            const filler = allProducts.filter(p => p.id !== product.id && !related.includes(p));
            related = related.concat(filler.slice(0, 4 - related.length));
        }
        related = related.slice(0, 4);

        // SỬA TẠI ĐÂY: Áp dụng hàm getProductImageUrl cho phần sản phẩm liên quan
        relatedGrid.innerHTML = related.map(p => `
            <div class="product-card" data-id="${p.id}" style="cursor:pointer;">
                <div class="product-card-img" style="background-image: url('${getProductImageUrl(p.img_path, p)}'); background-size: cover; background-position: center;"></div>
                <h4 class="product-card-title">${p.title}</h4>
                <div class="product-card-brand">Danh mục: ${p.category}</div>
                <div class="product-card-footer">
                    <div class="product-card-price">${formatVND(p.price)}</div>
                    <button class="product-card-btn add-to-cart-btn" data-id="${p.id}">+</button>
                </div>
            </div>
        `).join('');

        relatedGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                window.location.href = `./product-detail.html?id=${card.dataset.id}`;
            });
        });
        relatedGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                CartStorage.addItem(Number(btn.dataset.id), 1);
                btn.textContent = '✓';
                setTimeout(() => btn.textContent = '+', 700);
            });
        });
    }
});