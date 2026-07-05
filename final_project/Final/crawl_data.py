from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time

def crawl_beemart_fixed_2026(url, total_needed=100):
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    options.add_argument('--disable-gpu')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    product_list = []
    
    try:
        print(f"Đang mở trình duyệt kết nối tới: {url}")
        driver.get(url)
        time.sleep(5)
        
        # 1. CUỘN CHUỘT TỰ ĐỘNG ĐỂ TẢI THÊM SẢN PHẨM (NẾU CÓ CƠ CHẾ CUỘN VÔ HẠN)
        print("Đang cuộn trang tự động để bung sản phẩm...")
        for i in range(5):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Thử click nút "Xem thêm" theo mọi cấu trúc chữ viết hoa/thường có thể có
            try:
                load_more = driver.find_element(By.XPATH, "//*[contains(translate(text(), 'XEM THÊM TẢI THÊM', 'xem thêm tải thêm'), 'xem thêm') or contains(translate(text(), 'XEM THÊM TẢI THÊM', 'xem thêm tải thêm'), 'tải thêm')]")
                if load_more.is_displayed():
                    driver.execute_script("arguments[0].click();", load_more)
                    print(f"-> Đã click nút xem thêm ở lượt cuộn {i+1}")
                    time.sleep(3)
            except:
                pass
        
        # Cuộn từ từ để nạp toàn bộ ảnh lazyload
        print("Đang nạp dữ liệu hình ảnh...")
        driver.execute_script("window.scrollTo(0, 0);")
        for scroll in range(0, 6000, 400):
            driver.execute_script(f"window.scrollTo(0, {scroll});")
            time.sleep(0.1)
        time.sleep(2)

        # 2. PHƯƠNG PHÁP QUÉT TRỰC TIẾP PHẦN TỬ (TỐI ƯU NHẤT)
        # Tìm toàn bộ các thẻ liên kết chứa tiêu đề sản phẩm có cấu trúc chữ trên trang
        titles_elements = driver.find_elements(By.CSS_SELECTOR, "h3 a, .product-title a, a.title, h3, .product-name")
        
        print(f"Đang bóc tách dữ liệu từ các phần tử tìm thấy...")
        
        for elem in titles_elements:
            if len(product_list) >= total_needed:
                break
                
            try:
                name = elem.text.strip()
                # Lọc bỏ các chuỗi rác, text quá ngắn không phải tên sản phẩm
                if not name or len(name) < 8 or any(x in name.lower() for x in ['xem thêm', 'giỏ hàng', 'liên hệ', 'đăng ký']):
                    continue
                
                # Tránh lấy trùng lặp tên sản phẩm
                if any(p['Tên Sản Phẩm'] == name for p in product_list):
                    continue
                    
                link = elem.get_attribute("href") or "N/A"
                
                # Tìm phần tử cha gần nhất để dò tìm Giá và Ảnh tương ứng của sản phẩm đó
                parent = elem.find_element(By.XPATH, "./ancestor::div[contains(@class, 'product') or position() <= 4]")
                
                # Dò tìm giá bán trong khối cha
                price = "Liên hệ"
                try:
                    price_elem = parent.find_element(By.CSS_SELECTOR, ".price, .product-price, [class*='price']")
                    price = price_elem.text.strip()
                except:
                    pass
                
                # Dò tìm ảnh sản phẩm trong khối cha
                img_url = "N/A"
                try:
                    img_elem = parent.find_element(By.TAG_NAME, "img")
                    img_url = img_elem.get_attribute("data-src") or img_elem.get_attribute("src")
                    if img_url and img_url.startswith("//"):
                        img_url = "https:" + img_url
                except:
                    pass

                product_list.append({
                    "STT": len(product_list) + 1,
                    "Tên Sản Phẩm": name,
                    "Giá Bán": price,
                    "Link Hình Ảnh": img_url,
                    "Đường Dẫn Chi Tiết": link
                })
            except:
                continue
                
    finally:
        driver.quit()
        
    return product_list

if __name__ == "__main__":
    url_target = "https://www.beemart.vn/do-lam-banh"
    data_result = crawl_beemart_fixed_2026(url_target, total_needed=100)
    
    if data_result:
        df = pd.DataFrame(data_result)
        file_excel = "beemart_vscode_data.xlsx"
        df.to_excel(file_excel, index=False)
        print(f"\n CHÚC MỪNG! Đã cào thành công {len(df)} sản phẩm!")
        print(f" File Excel đã được lưu với tên: '{file_excel}'")
    else:
        print("Vẫn không thu thập được dữ liệu. Vui lòng kiểm tra lại trạng thái hiển thị của trang web.")