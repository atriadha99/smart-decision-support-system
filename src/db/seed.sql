-- Seed Data for Smart Decision Support System (SDSS)
-- This file populates the database with default study cases: "Pemilihan Laptop Terbaik" and "Pemilihan Karyawan Berprestasi".

-- 1. Insert Studies
INSERT INTO studies (id, name, description) VALUES
('a1111111-1111-1111-1111-111111111111', 'Pemilihan Laptop Terbaik', 'Rekomendasi laptop untuk kebutuhan software engineering dan produktivitas harian dengan kriteria harga, RAM, storage, dan performa processor.'),
('b2222222-2222-2222-2222-222222222222', 'Pemilihan Karyawan Terbaik', 'Evaluasi performa tahunan karyawan untuk menentukan penerima penghargaan karyawan terbaik berdasarkan kedisiplinan, produktivitas, kerjasama, dan perilaku.');

-- 2. Insert Criteria for "Pemilihan Laptop Terbaik"
-- Target values are configured on a scale of 1-5 (common for Profile Matching)
INSERT INTO criteria (id, study_id, name, weight, type, target_value, is_core_factor) VALUES
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Harga', 0.3000, 'cost', 3.00, false), -- Secondary factor
('c1111111-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'RAM', 0.2000, 'benefit', 4.00, true),   -- Core factor
('c1111111-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Storage', 0.2000, 'benefit', 4.00, false), -- Secondary factor
('c1111111-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Processor', 0.3000, 'benefit', 5.00, true); -- Core factor

-- Insert Criteria for "Pemilihan Karyawan Terbaik"
INSERT INTO criteria (id, study_id, name, weight, type, target_value, is_core_factor) VALUES
('c2222222-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'Kedisiplinan', 0.2500, 'benefit', 4.00, true),
('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Produktivitas', 0.3000, 'benefit', 5.00, true),
('c2222222-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'Kerjasama', 0.2500, 'benefit', 4.00, false),
('c2222222-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'Sikap / Perilaku', 0.2000, 'benefit', 4.00, false);

-- 3. Insert Alternatives for "Pemilihan Laptop Terbaik"
INSERT INTO alternatives (id, study_id, name, description, category) VALUES
('a2111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'MacBook Air M2', 'Apple M2 8-Core, 8GB RAM, 256GB SSD, 13.6 inch Liquid Retina. Sangat tipis, baterai tahan lama.', 'Apple'),
('a2111111-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Lenovo ThinkPad X1 Carbon', 'Intel Core i7-1260P, 16GB RAM, 512GB SSD, 14 inch WUXGA. Durabilitas militer, keyboard terbaik.', 'Lenovo'),
('a2111111-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Dell XPS 13 Plus', 'Intel Core i7-1280P, 16GB RAM, 1TB SSD, 13.4 inch UHD+ Touch. Desain futuristik bezel-less.', 'Dell'),
('a2111111-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'ASUS Zenbook 14 OLED', 'AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD, 14 inch 2.8K OLED. Layar berkualitas tinggi, value for money.', 'ASUS');

-- Insert Alternatives for "Pemilihan Karyawan Terbaik"
INSERT INTO alternatives (id, study_id, name, description, category) VALUES
('a2222222-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'Budi Santoso', 'Staff IT Support - Rajin, selalu tepat waktu, namun kurang aktif di forum kerjasama tim.', 'IT Support'),
('a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Ani Wijaya', 'Senior Developer - Produktivitas sangat tinggi, sering memimpin tim, terkadang terlambat datang.', 'Engineering'),
('a2222222-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'Citra Lestari', 'Quality Assurance - Komunikatif, kerjasama tim sangat baik, output pekerjaan stabil.', 'QA');

-- 4. Insert Scores (Scale 1 to 5)
-- For Laptop:
-- C1: Harga (1 = Sangat Mahal / Buruk, 5 = Sangat Murah / Baik) - MacBook=2, ThinkPad=3, Dell=1, Asus=4
-- C2: RAM (1 = 4GB, 2 = 8GB, 3 = 12GB, 4 = 16GB, 5 = 32GB) - MacBook=2, ThinkPad=4, Dell=4, Asus=4
-- C3: Storage (1 = 128GB, 2 = 256GB, 3 = 512GB, 4 = 1TB, 5 = 2TB) - MacBook=2, ThinkPad=3, Dell=4, Asus=3
-- C4: Processor (1-5 Performance scale) - MacBook=4, ThinkPad=4, Dell=5, Asus=3

-- MacBook Air M2
INSERT INTO scores (alternative_id, criteria_id, value) VALUES
('a2111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 2.0000),
('a2111111-1111-1111-1111-111111111111', 'c1111111-2222-2222-2222-222222222222', 2.0000),
('a2111111-1111-1111-1111-111111111111', 'c1111111-3333-3333-3333-333333333333', 2.0000),
('a2111111-1111-1111-1111-111111111111', 'c1111111-4444-4444-4444-444444444444', 4.0000);

-- Lenovo ThinkPad X1 Carbon
INSERT INTO scores (alternative_id, criteria_id, value) VALUES
('a2111111-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 3.0000),
('a2111111-2222-2222-2222-222222222222', 'c1111111-2222-2222-2222-222222222222', 4.0000),
('a2111111-2222-2222-2222-222222222222', 'c1111111-3333-3333-3333-333333333333', 3.0000),
('a2111111-2222-2222-2222-222222222222', 'c1111111-4444-4444-4444-444444444444', 4.0000);

-- Dell XPS 13 Plus
INSERT INTO scores (alternative_id, criteria_id, value) VALUES
('a2111111-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 1.0000),
('a2111111-3333-3333-3333-333333333333', 'c1111111-2222-2222-2222-222222222222', 4.0000),
('a2111111-3333-3333-3333-333333333333', 'c1111111-3333-3333-3333-333333333333', 4.0000),
('a2111111-3333-3333-3333-333333333333', 'c1111111-4444-4444-4444-444444444444', 5.0000);

-- ASUS Zenbook 14 OLED
INSERT INTO scores (alternative_id, criteria_id, value) VALUES
('a2111111-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 4.0000),
('a2111111-4444-4444-4444-444444444444', 'c1111111-2222-2222-2222-222222222222', 4.0000),
('a2111111-4444-4444-4444-444444444444', 'c1111111-3333-3333-3333-333333333333', 3.0000),
('a2111111-4444-4444-4444-444444444444', 'c1111111-4444-4444-4444-444444444444', 3.0000);


-- For Employee Selection:
-- Budi Santoso: Disiplin=5, Produktivitas=3, Kerjasama=2, Perilaku=4
INSERT INTO scores (alternative_id, criteria_id, value) VALUES
('a2222222-1111-1111-1111-111111111111', 'c2222222-1111-1111-1111-111111111111', 5.0000),
('a2222222-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 3.0000),
('a2222222-1111-1111-1111-111111111111', 'c2222222-3333-3333-3333-333333333333', 2.0000),
('a2222222-1111-1111-1111-111111111111', 'c2222222-4444-4444-4444-444444444444', 4.0000);

-- Ani Wijaya: Disiplin=3, Produktivitas=5, Kerjasama=4, Perilaku=3
INSERT INTO scores (alternative_id, criteria_id, value) VALUES
('a2222222-2222-2222-2222-222222222222', 'c2222222-1111-1111-1111-111111111111', 3.0000),
('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 5.0000),
('a2222222-2222-2222-2222-222222222222', 'c2222222-3333-3333-3333-333333333333', 4.0000),
('a2222222-2222-2222-2222-222222222222', 'c2222222-4444-4444-4444-444444444444', 3.0000);

-- Citra Lestari: Disiplin=4, Produktivitas=4, Kerjasama=5, Perilaku=5
INSERT INTO scores (alternative_id, criteria_id, value) VALUES
('a2222222-3333-3333-3333-333333333333', 'c2222222-1111-1111-1111-111111111111', 4.0000),
('a2222222-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 4.0000),
('a2222222-3333-3333-3333-333333333333', 'c2222222-3333-3333-3333-333333333333', 5.0000),
('a2222222-3333-3333-3333-333333333333', 'c2222222-4444-4444-4444-444444444444', 5.0000);
