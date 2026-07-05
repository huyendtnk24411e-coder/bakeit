document.addEventListener('DOMContentLoaded', async () => {
    const formatVND = (amount) => amount.toLocaleString('vi-VN') + 'đ';
    const IMG_ROOT = '../../'; // từ /pages/product-list/ lùi 2 cấp về gốc dự án
    const PAGE_SIZE = 12;
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
        if (!normalized) return '../../' + IMAGE_FALLBACKS.tools;
        if (/^https?:\/\//i.test(normalized)) return normalized;

        const resolved = normalized.startsWith('assets/') ? normalized : `assets/${normalized.replace(/^\.?\//, '')}`;
        if (AVAILABLE_IMAGES.includes(resolved)) {
            return '../../' + resolved;
        }

        const title = (product?.title || '').toLowerCase();
        const category = (product?.category || '').toLowerCase();
        if (category.includes('dụng cụ') || title.includes('máy') || title.includes('khuôn') || title.includes('spatula') || title.includes('tấm') || title.includes('tô')) {
            return '../../' + IMAGE_FALLBACKS.tools;
        }
        if (title.includes('bơ') || title.includes('butter')) {
            return '../../' + IMAGE_FALLBACKS.butter;
        }
        if (title.includes('kem') || title.includes('cream') || title.includes('sữa') || title.includes('sua')) {
            return '../../' + IMAGE_FALLBACKS.cream;
        }
        if (title.includes('bột') || title.includes('bot') || title.includes('matcha') || title.includes('gao') || title.includes('bắp') || title.includes('ngô')) {
            return '../../' + IMAGE_FALLBACKS.flour;
        }
        return '../../' + IMAGE_FALLBACKS.tools;
    };

    const allProducts = (typeof window.PRODUCTS_DATA !== 'undefined' && Array.isArray(window.PRODUCTS_DATA) && window.PRODUCTS_DATA.length > 0)
        ? window.PRODUCTS_DATA
        : await loadProducts();
    window.PRODUCTS_DATA = allProducts;

    // ============ STATE BỘ LỌC HIỆN TẠI ============
    const state = {
        category: 'all',
        subcategory: 'all',
        priceRanges: [], 
        keyword: '',
        sort: 'Phổ biến',
        page: 1
    };

    // ============ DOM ELEMENTS ============
    const mainGrid = document.getElementById('shop-main-grid');
    const promoGrid = document.getElementById('promo-mini-grid');
    const tagsContainer = document.getElementById('tags-container');
    const resultsCountText = document.querySelector('.results-count');
    const sortSelect = document.querySelector('.sort-select-wrapper select');
    const paginationWrapper = document.querySelector('.pagination-wrapper');
    const searchInput = document.querySelector('.search-box input');
    const categoryTree = document.querySelector('.category-tree');
    const priceCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const btnClearFilters = document.getElementById('btn-clear-filters');

    // ============ TẦNG PILL DANH MỤC NHANH ============
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
    if (tagsContainer) {
        tagsContainer.innerHTML = [
            `<div class="category-pill active" data-category="all">Tất cả sản phẩm</div>`,
            ...uniqueCategories.map(cat => `<div class="category-pill" data-category="${cat}">${cat}</div>`)
        ].join('');
    }

    // ============ HÀM LỌC + SẮP XẾP TỔNG HỢP ============
    function getFilteredProducts() {
        let result = allProducts.slice();

        if (state.category !== 'all') {
            result = result.filter(p => p.category === state.category);
        }

        if (state.subcategory !== 'all') {
            result = result.filter(p => p.subcategory && p.subcategory.toString() === state.subcategory.toString());
        }

        if (state.priceRanges.length > 0) {
            result = result.filter(p =>
                state.priceRanges.some(range => p.price >= range.min && p.price <= range.max)
            );
        }

        if (state.keyword) {
            result = result.filter(p =>
                p.title.toLowerCase().includes(state.keyword) ||
                p.category.toLowerCase().includes(state.keyword)
            );
        }

        if (state.sort === 'Giá tăng dần') {
            result.sort((a, b) => a.price - b.price);
        } else if (state.sort === 'Giá giảm dần') {
            result.sort((a, b) => b.price - a.price);
        } else if (state.sort === 'Phổ biến') {
            result.sort((a, b) => {
                const aPopular = Number(a.is_popular || 0);
                const bPopular = Number(b.is_popular || 0);
                if (aPopular !== bPopular) return bPopular - aPopular;
                return (Number(b.sales || 0)) - (Number(a.sales || 0));
            });
        } else {
            result.sort((a, b) => {
                if (Number(a.is_new) !== Number(b.is_new)) return Number(b.is_new) - Number(a.is_new);
                return b.id - a.id;
            });
        }

        return result;
    }

    // ============ RENDER 1 CARD SẢN PHẨM ============
    function productCardHTML(prod) {
        const imageUrl = getProductImageUrl(prod.img_path, prod);
        return `
            <div class="product-card" data-id="${prod.id}" style="cursor:pointer;">
                <div class="product-card-media">
                    <div class="product-card-img" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"></div>
                    ${prod.is_new ? '<span class="product-card-badge">Mới</span>' : ''}
                </div>
                <h4 class="product-card-title" title="${prod.title}">${prod.title}</h4>
                <div class="product-card-brand">Danh mục: <span style="color: #dd7a46; font-weight:600;">${prod.category}</span></div>
                <div class="product-card-footer">
                    <div class="product-card-price">${formatVND(prod.price)}</div>
                    <button class="product-card-btn add-to-cart-btn" data-id="${prod.id}">+</button>
                </div>
            </div>
        `;
    }

    // ============ RENDER LƯỚI SẢN PHẨM CHÍNH (CÓ PHÂN TRANG / XỬ LÝ ĐANG CẬP NHẬT) ============
    function renderMainGrid() {
        if (!mainGrid) return;
        const filtered = getFilteredProducts();

        if (filtered.length === 0) {
            mainGrid.innerHTML = `
                <div style="grid-column: span 4; text-align: center; padding: 60px 20px; color: #9c8476;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🍞</div>
                    <h3 style="color: #4a3329; margin-bottom: 10px; font-weight: 700;">Sản phẩm đang được cập nhật</h3>
                    <p style="font-size: 14px; color: #7c6b61;">Bake it! đang chuẩn bị những nguyên liệu tươi ngon nhất cho danh mục này. Bạn quay lại sau nhé!</p>
                </div>
            `;
            if (resultsCountText) resultsCountText.textContent = `Hiển thị 0 kết quả`;
            renderPagination(0);
            return;
        }

        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (state.page > totalPages) state.page = totalPages;
        const startIdx = (state.page - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);

        mainGrid.innerHTML = pageItems.map(productCardHTML).join('');

        if (resultsCountText) {
            resultsCountText.textContent = `Hiển thị ${startIdx + 1} - ${startIdx + pageItems.length} trong tổng số ${filtered.length} kết quả`;
        }

        bindCardEvents(mainGrid);
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        if (!paginationWrapper) return;
        if (totalPages <= 1) {
            paginationWrapper.innerHTML = '';
            return;
        }
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn" data-page="${i}" style="min-width:36px;height:36px;border-radius:6px;border:1px solid #ddd;background:${i === state.page ? '#4a3329' : '#fff'};color:${i === state.page ? '#fff' : '#4a3329'};cursor:pointer;font-weight:600;">${i}</button>`;
        }
        paginationWrapper.innerHTML = html;
        paginationWrapper.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.page = Number(btn.dataset.page);
                renderMainGrid();
                mainGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function bindCardEvents(container) {
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                const id = card.dataset.id;
                window.location.href = `../product-detail/product-detail.html?id=${id}`;
            });
        });
        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.id);
                CartStorage.addItem(id, 1);
                CartStorage.showToast('Đã thêm sản phẩm vào giỏ hàng');
                btn.textContent = '✓';
                btn.style.background = '#389e0d';
                setTimeout(() => {
                    btn.textContent = '+';
                    btn.style.background = '';
                }, 700);
            });
        });
    }

    // ============ RENDER LƯỚI SẢN PHẨM KHUYẾN MÃI ============
    function renderPromoGrid() {
        if (!promoGrid) return;
        const promoProducts = allProducts.slice(0, 6);
        
        promoGrid.innerHTML = promoProducts.map((prod, idx) => `
            <div class="mini-card" data-id="${prod.id}" style="cursor:pointer;">
                <div class="mini-card-media">
                    <div class="mini-card-img" style="background-image: url('${getProductImageUrl(prod.img_path, prod)}'); background-size: cover; background-position: center;"></div>
                    ${prod.is_new ? '<span class="mini-card-badge">Mới</span>' : ''}
                </div>
                <div class="mini-card-status" style="color: ${idx % 3 === 0 ? '#f5222d' : '#389e0d'}">
                    ${idx % 3 === 0 ? '● Hết hàng' : '● Còn hàng'}
                </div>
                <h5 class="mini-card-title" title="${prod.title}">${prod.title}</h5>
                <div class="mini-card-footer">
                    <div class="mini-card-price">${formatVND(prod.price - 5000)}</div>
                    <button class="mini-card-btn add-to-cart-btn" data-id="${prod.id}">Mua</button>
                </div>
            </div>
        `).join('');

        promoGrid.querySelectorAll('.mini-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                window.location.href = `../product-detail/product-detail.html?id=${card.dataset.id}`;
            });
        });
        promoGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                CartStorage.addItem(Number(btn.dataset.id), 1);
                CartStorage.showToast('Đã thêm sản phẩm vào giỏ hàng');
                btn.textContent = 'Đã thêm ✓';
                setTimeout(() => btn.textContent = 'Mua', 700);
            });
        });
    }

    function syncCategorySelection(category, subcategory = 'all') {
        state.category = category;
        state.subcategory = subcategory;
        state.page = 1;

        document.querySelectorAll('.category-tree li').forEach(item => item.classList.remove('active'));

        if (category === 'all') {
            document.querySelector('.category-tree > li[data-category="all"]')?.classList.add('active');
        } else {
            const parentItem = document.querySelector(`.category-tree > li[data-category="${category}"]`);
            parentItem?.classList.add('active');
            if (subcategory !== 'all') {
                const childItem = document.querySelector(`.category-tree li[data-parent="${category}"][data-subcategory="${subcategory}"]`);
                childItem?.classList.add('active');
            }
        }

        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.category === category);
        });

        renderMainGrid();
    }

    if (categoryTree) {
        categoryTree.addEventListener('click', (e) => {
            const item = e.target.closest('li');
            if (!item) return;
            const category = item.dataset.category || item.dataset.parent || 'all';
            const subcategory = item.dataset.subcategory || 'all';
            syncCategorySelection(category, subcategory);
        });
    }

    if (tagsContainer) {
        tagsContainer.addEventListener('click', (e) => {
            const pill = e.target.closest('.category-pill');
            if (!pill) return;
            const cat = pill.dataset.category;
            syncCategorySelection(cat, 'all');
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    }

    priceCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            state.priceRanges = Array.from(priceCheckboxes)
                .filter(el => el.checked)
                .map(el => ({ min: Number(el.dataset.min), max: Number(el.dataset.max) }));
            state.page = 1;
            renderMainGrid();
        });
    });

    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            state.category = 'all';
            state.subcategory = 'all';
            state.priceRanges = [];
            state.keyword = '';
            state.page = 1;
            if (searchInput) searchInput.value = '';
            priceCheckboxes.forEach(cb => cb.checked = false);
            syncCategorySelection('all', 'all');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.keyword = e.target.value.toLowerCase().trim();
            state.page = 1;
            renderMainGrid();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sort = e.target.value;
            state.page = 1;
            renderMainGrid();
        });
    }

    const requestForm = document.getElementById('product-request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Cảm ơn bạn! Yêu cầu sản phẩm đã được gửi tới Bake it!');
            requestForm.reset();
        });
    }

    renderMainGrid();
    renderPromoGrid();
});