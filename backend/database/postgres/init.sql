CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS roles (
    id_role serial PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    id_role INT DEFAULT 2,
    FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE TABLE IF NOT EXISTS orders (
    id_order serial PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS details_orders (
    id_detail_order serial PRIMARY KEY,
    order_id INT REFERENCES orders(id_order) ON DELETE CASCADE,
    product_sku VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id_payment serial PRIMARY KEY,
    order_id INT REFERENCES orders(id_order) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping (
    id_shipping serial PRIMARY KEY,
    order_id INT REFERENCES orders(id_order) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    shipping_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Processing',
    transport_company VARCHAR(100) NOT NULL
);


INSERT INTO roles (role_name, description) VALUES
('admin', 'Administrador del sistema'),
('cliente', 'Usuario registrado que realiza compras'),
('invitado', 'Usuario sin registro');

INSERT INTO users (name, email, password, id_role) VALUES
('Daniel Torres', 'daniel@example.com', crypt('securepass123', gen_salt('bf')), 1),
('Lucía Pérez', 'lucia@example.com', crypt('mypassword456', gen_salt('bf')), 2),
('Carlos Soto', 'carlos@example.com', crypt('pass789', gen_salt('bf')), 2);

INSERT INTO orders (user_id, order_date, status, total_amount) VALUES
(2, CURRENT_TIMESTAMP, 'Pending', 1299000.00),
(3, CURRENT_TIMESTAMP, 'Completed', 499000.00);

INSERT INTO details_orders (order_id, product_sku, quantity, price) VALUES
(1, 'SKU1234567890', 1, 1299000.00),
(2, 'SKU0987654321', 1, 499000.00);

INSERT INTO payments (order_id, payment_method, amount, status, payment_date) VALUES
(1, 'Tarjeta de crédito', 1299000.00, 'Pending', CURRENT_TIMESTAMP),
(2, 'Transferencia bancaria', 499000.00, 'Completed', CURRENT_TIMESTAMP);

INSERT INTO shipping (order_id, address, city, shipping_date, status, transport_company) VALUES
(1, 'Av. Los Pinos 123', 'Coquimbo', CURRENT_TIMESTAMP, 'Processing', 'Chilexpress'),
(2, 'Calle Las Rosas 456', 'La Serena', CURRENT_TIMESTAMP, 'Delivered', 'Starken');