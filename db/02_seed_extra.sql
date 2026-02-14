-- SEED_EXTRA.SQL - Datos adicionales porque mi paginación no se veía :C

INSERT INTO usuarios (email, nombre, password_hash) VALUES
    ('tim@example.com', 'Tim Berners-Lee', 'hash_placeholder_7'),
    ('dennis@example.com', 'Dennis Ritchie', 'hash_placeholder_8'),
    ('ken@example.com', 'Ken Thompson', 'hash_placeholder_9'),
    ('bjarne@example.com', 'Bjarne Stroustrup', 'hash_placeholder_10'),
    ('james@example.com', 'James Gosling', 'hash_placeholder_11'),
    ('guido@example.com', 'Gu ido van Rossum', 'hash_placeholder_12'),
    ('brendan@example.com', 'Brendan Eich', 'hash_placeholder_13'),
    ('yukihiro@example.com', 'Yukihiro Matsumoto', 'hash_placeholder_14'),
    ('anders@example.com', 'Anders Hejlsberg', 'hash_placeholder_15'),
    ('larry@example.com', 'Larry Wall', 'hash_placeholder_16');


INSERT INTO ordenes (usuario_id, total, status, created_at) VALUES
    (1, 159.98, 'entregado', '2024-01-15 10:30:00'),
    (2, 299.99, 'entregado', '2024-01-20 14:00:00'),
    
    (3, 89.99, 'entregado', '2024-02-05 09:15:00'),
    (4, 449.97, 'enviado', '2024-02-18 16:45:00'),
    
    (5, 1299.99, 'pagado', '2024-03-10 11:00:00'),
    (6, 199.98, 'entregado', '2024-03-25 13:30:00'),
    
    (7, 749.96, 'entregado', '2024-04-08 10:00:00'),
    (8, 129.98, 'enviado', '2024-04-22 15:20:00'),
    
    (9, 399.99, 'pagado', '2024-05-12 12:10:00'),
    (10, 599.98, 'entregado', '2024-05-28 14:40:00'),
    
    (11, 249.99, 'entregado', '2024-06-03 09:30:00'),
    (12, 179.98, 'enviado', '2024-06-19 16:00:00'),
    
    (13, 899.97, 'pagado', '2024-07-07 11:45:00'),
    (14, 329.98, 'entregado', '2024-07-24 13:15:00'),
    
    (15, 1599.98, 'entregado', '2024-08-05 10:20:00'),
    (16, 99.99, 'enviado', '2024-08-20 15:50:00'),
    
    (1, 449.98, 'pagado', '2024-09-11 12:30:00'),
    (2, 799.97, 'entregado', '2024-09-27 14:00:00'),
    
    (3, 299.99, 'entregado', '2024-10-09 09:40:00'),
    (4, 549.98, 'enviado', '2024-10-23 16:20:00'),
    
    (5, 1299.99, 'pagado', '2024-11-06 11:10:00'),
    (6, 399.98, 'entregado', '2024-11-21 13:45:00'),
    
    (7, 999.97, 'entregado', '2024-12-14 10:50:00'),
    (8, 229.98, 'enviado', '2024-12-29 15:30:00');

INSERT INTO orden_detalles (orden_id, producto_id, cantidad, precio_unitario) VALUES
    (7, 2, 2, 29.99),
    (7, 6, 5, 19.99),
    
    (8, 4, 1, 399.99),
    
    (9, 3, 1, 89.99),
    
    (10, 1, 1, 1299.99),
    (10, 7, 3, 49.99),
    
    (11, 1, 1, 1299.99),
    
    (12, 2, 1, 29.99),
    (12, 3, 1, 89.99),
    (12, 5, 1, 59.99),
    
    (13, 12, 1, 249.99),
    
    (14, 2, 3, 29.99),
    (14, 6, 5, 19.99),
    
    (15, 4, 1, 399.99),
    (15, 8, 5, 39.99),
    
    (16, 1, 1, 1299.99),
    (16, 2, 10, 29.99),
    
    (17, 3, 1, 89.99),
    (17, 11, 1, 34.99),
    
    (18, 7, 1, 49.99),
    (18, 8, 1, 39.99),
    
    (19, 2, 5, 29.99),
    (19, 3, 5, 89.99),
    
    (20, 1, 2, 1299.99),
    
    (21, 4, 1, 399.99),
    (21, 7, 3, 49.99),
    
    (22, 12, 1, 249.99),
    
    (23, 2, 3, 29.99),
    (23, 6, 5, 19.99),
    
    (24, 1, 1, 1299.99),
    (24, 2, 1, 29.99),
    (24, 3, 1, 89.99),
    
    (25, 7, 5, 49.99),
    (25, 8, 5, 39.99),
    
    (26, 4, 1, 399.99),
    (26, 5, 1, 59.99),
    
    (27, 1, 1, 1299.99),
    
    (28, 2, 5, 29.99),
    (28, 6, 5, 19.99),
    
    (29, 12, 1, 249.99),
    (29, 11, 5, 34.99),
    
    (30, 3, 1, 89.99),
    (30, 2, 5, 29.99);

