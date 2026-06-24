-- Datos iniciales para la tabla de categorias
INSERT INTO categorias (id, nombre, descripcion) VALUES
('hierbas', 'Hierbas Tradicionales', 'Hierbas aromáticas y medicinales del altiplano y la selva.'),
('hongos', 'Hongos Funcionales', 'Variedades de hongos adaptógenos y nootrópicos.'),
('extractos', 'Extractos Naturales', 'Extractos concentrados de plantas medicinales.'),
('esencias', 'Esencias Botánicas', 'Aceites esenciales puros para aromaterapia y usos varios.'),
('polvos', 'Polvos y Resinas', 'Superalimentos y resinas en polvo para suplementación.')
ON CONFLICT (id) DO NOTHING;

-- Datos iniciales para la tabla de etiquetas
INSERT INTO etiquetas (nombre) VALUES
('popular'),
('nuevo'),
('oferta'),
('premium')
ON CONFLICT (nombre) DO NOTHING;

-- Datos iniciales para la tabla de productos
INSERT INTO productos (nombre, categoria_id, precio, precio_anterior, imagen, descripcion, stock, peso, origen, rating, etiquetas) VALUES
('Muña Andina Premium', 'hierbas', 28, 35, 'https://images.unsplash.com/photo-1600781831924-a66a8e7a1e97?w=400&h=300&fit=crop', 'Hierba aromática del altiplano peruano, ideal para digestión y altura.', 20, '50g', 'Cusco', 4.8, ARRAY['popular']),
('Chanca Piedra Orgánica', 'hierbas', 35, NULL, 'https://images.unsplash.com/photo-1515696955307-c8a57c5d8416?w=400&h=300&fit=crop', 'Poderosa hierba para el sistema renal. 100% orgánica.', 15, '60g', 'Amazonas', 4.6, ARRAY['nuevo']),
('Uña de Gato Selvática', 'hierbas', 42, 50, 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=300&fit=crop', 'Extracto de la enredadera amazónica con propiedades antiinflamatorias.', 8, '40g', 'Loreto', 4.9, ARRAY['popular', 'oferta']),
('Maca Negra Andina', 'hierbas', 55, NULL, 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&h=300&fit=crop', 'Variedad rara de maca negra, energizante natural del altiplano.', 12, '100g', 'Junín', 4.7, ARRAY['premium']),
('Reishi Rojo Orgánico', 'hongos', 89, 110, 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=400&h=300&fit=crop', 'El hongo de la inmortalidad. Adaptógeno y modulador inmunológico.', 18, '30g', 'Importado', 5.0, ARRAY['popular', 'premium']),
('Lion''s Mane Liofilizado', 'hongos', 75, NULL, 'https://images.unsplash.com/photo-1591213954196-2d0ccb3f8d4c?w=400&h=300&fit=crop', 'Hongo melena de león para función cognitiva y neurológica.', 10, '25g', 'Importado', 4.8, ARRAY['nuevo']),
('Chaga Siberiano', 'hongos', 95, 120, 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&h=300&fit=crop', 'Rey de los hongos adaptógenos. Rico en betaglucanos.', 6, '20g', 'Importado', 4.7, ARRAY['oferta']),
('Cordyceps Militaris', 'hongos', 110, NULL, 'https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=400&h=300&fit=crop', 'Hongo energizante atlético. Mejora el rendimiento físico.', 14, '15g', 'Importado', 4.9, ARRAY['premium']),
('Extracto Sangre de Grado', 'extractos', 48, 60, 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=300&fit=crop', 'Resina roja del árbol Croton lechleri. Cicatrizante y antiviral.', 22, '30ml', 'Ucayali', 4.8, ARRAY['popular']),
('Extracto de Cat''s Claw 10:1', 'extractos', 65, NULL, 'https://images.unsplash.com/photo-1559181567-c3190ca9d6e7?w=400&h=300&fit=crop', 'Extracto concentrado 10:1 de uña de gato amazónica.', 9, '50ml', 'Pucallpa', 4.6, ARRAY['premium']),
('Extracto Hercampuri', 'extractos', 38, NULL, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop', 'Planta amarga para el hígado. Depurativo y hepatoprotector.', 16, '40ml', 'Arequipa', 4.5, ARRAY['nuevo']),
('Tintura Valeriana Nativa', 'extractos', 32, 40, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop', 'Extracto de raíz de valeriana andina. Relajante y ansiolítico.', 25, '60ml', 'Cajamarca', 4.7, ARRAY['oferta']),
('Esencia de Palo Santo', 'esencias', 58, NULL, 'https://images.unsplash.com/photo-1602524813596-27ea7f2c10dc?w=400&h=300&fit=crop', 'Aceite esencial sagrado del Bursera graveolens peruano.', 30, '10ml', 'Piura', 4.9, ARRAY['popular']),
('Aceite de Copaiba', 'esencias', 72, 85, 'https://images.unsplash.com/photo-1612545812256-dfaa13a1a0ac?w=400&h=300&fit=crop', 'Resina oleosa de copaiba. Antiinflamatorio y aromatizante.', 11, '15ml', 'Madre de Dios', 4.8, ARRAY['premium', 'oferta']),
('Esencia de Ayahuasca (Legal)', 'esencias', 120, NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', 'Mezcla aromática legal de plantas del ritual. Sin DMT.', 5, '5ml', 'Iquitos', 5.0, ARRAY['premium']),
('Aceite Esencial de Muña', 'esencias', 45, NULL, 'https://images.unsplash.com/photo-1556909114-44e3e9399a2b?w=400&h=300&fit=crop', 'Destilado de vapor de muña andina. Mentolado y refrescante.', 18, '10ml', 'Puno', 4.6, ARRAY['nuevo']),
('Polvo de Lucuma Premium', 'polvos', 32, 38, 'https://images.unsplash.com/photo-1606170786765-8d36d9b36e19?w=400&h=300&fit=crop', 'Superfruta peruana deshidratada. Endulzante natural y nutritivo.', 35, '200g', 'La Libertad', 4.7, ARRAY['popular']),
('Camu Camu en Polvo', 'polvos', 48, NULL, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop', 'Mayor fuente natural de vitamina C. Sabor ácido exquisito.', 20, '100g', 'Loreto', 4.8, ARRAY['popular', 'nuevo']),
('Polvo de Maca Gelatinizada', 'polvos', 42, 55, 'https://images.unsplash.com/photo-1615485925763-86d4db5eddec?w=400&h=300&fit=crop', 'Maca gelatinizada para mejor absorción. Energía y libido.', 28, '250g', 'Pasco', 4.6, ARRAY['oferta']),
('Ashwagandha KSM-66', 'polvos', 78, NULL, 'https://images.unsplash.com/photo-1563228911-4c1d6f5e4e18?w=400&h=300&fit=crop', 'Extracto patentado de raíz de ashwagandha. Adaptógeno supremo.', 13, '100g', 'Importado', 4.9, ARRAY['premium']),
('Boldo Chileno-Peruano', 'hierbas', 18, NULL, 'https://images.unsplash.com/photo-1502977649367-cbb7e7a2de97?w=400&h=300&fit=crop', 'Hierba digestiva tradicional. Protege el hígado y la vesícula.', 40, '80g', 'Arequipa', 4.3, ARRAY[]::TEXT[]),
('Hierba Luisa Orgánica', 'hierbas', 15, NULL, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=300&fit=crop', 'Aromática y digestiva. Perfecta para infusiones relajantes.', 50, '60g', 'Ica', 4.4, ARRAY[]::TEXT[]),
('Shiitake Liofilizado', 'hongos', 55, NULL, 'https://images.unsplash.com/photo-1561835491-ed5f4e831b2f?w=400&h=300&fit=crop', 'Hongo del Este culinario-medicinal. Inmunológico y umami.', 22, '30g', 'Importado', 4.5, ARRAY['nuevo']),
('Extracto Andrographis', 'extractos', 55, NULL, 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop', 'Extracto antiviral e inmunoestimulante. Conocida como la espina de loto.', 7, '30ml', 'Importado', 4.6, ARRAY['nuevo']),
('Esencia Cedro Amazónico', 'esencias', 38, 48, 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop', 'Aceite de cedro amazónico puro. Armonizante y terroso.', 15, '10ml', 'Huánuco', 4.5, ARRAY['oferta']),
('Polvo de Sacha Inchi', 'polvos', 36, NULL, 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&h=300&fit=crop', 'Proteína vegetal completa con omega 3, 6 y 9. Superalimento peruano.', 33, '200g', 'San Martín', 4.7, ARRAY['popular']),
('Guayusa Amazónica', 'hierbas', 30, NULL, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', 'Planta energizante del Amazonas. Rica en cafeína y antioxidantes.', 18, '70g', 'Amazonas', 4.6, ARRAY['nuevo']),
('Polvo de Yacón', 'polvos', 28, NULL, 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=300&fit=crop', 'Prebiótico natural. Ideal para diabéticos y control de peso.', 24, '150g', 'Cajamarca', 4.4, ARRAY[]::TEXT[]),
('Hongo Maitake Polvo', 'hongos', 68, NULL, 'https://images.unsplash.com/photo-1600431521340-491eca880813?w=400&h=300&fit=crop', 'Hongo danzante. Regula glucosa, colesterol e inmunidad.', 9, '25g', 'Importado', 4.7, ARRAY['premium']),
('Aceite Mapacho Tabaco', 'esencias', 65, NULL, 'https://images.unsplash.com/photo-1616432052254-8c1a3b0f4b88?w=400&h=300&fit=crop', 'Aceite sagrado del tabaco mapacho amazónico. Uso ceremonial.', 4, '5ml', 'Loreto', 4.9, ARRAY['premium'])
ON CONFLICT (nombre) DO UPDATE SET
  categoria_id = EXCLUDED.categoria_id,
  precio = EXCLUDED.precio,
  precio_anterior = EXCLUDED.precio_anterior,
  imagen = EXCLUDED.imagen,
  descripcion = EXCLUDED.descripcion,
  stock = EXCLUDED.stock,
  peso = EXCLUDED.peso,
  origen = EXCLUDED.origen,
  rating = EXCLUDED.rating,
  etiquetas = EXCLUDED.etiquetas;

-- Conectar producto_etiquetas
INSERT INTO producto_etiquetas (producto_id, etiqueta_id)
SELECT p.id, e.id
FROM productos p, etiquetas e
WHERE e.nombre = ANY(p.etiquetas)
ON CONFLICT (producto_id, etiqueta_id) DO NOTHING;