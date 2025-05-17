  // Configuración de Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDLi-egzQlgbKW8XV_qIhU6313Gd8gocCg",
            authDomain: "inventario-35d6b.firebaseapp.com",
            databaseURL: "https://inventario-35d6b-default-rtdb.firebaseio.com",
            projectId: "inventario-35d6b",
            storageBucket: "inventario-35d6b.appspot.com",
            messagingSenderId: "266100399659",
            appId: "1:266100399659:web:92358d28cbd803c8a7d46e"
        };

        // Inicializar Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        // Inicializar EmailJS
        emailjs.init("32MfEXLHPu9Uj6rMc");

        // Sistema de Alertas
        function showAlert(type, message) {
            const alertContainer = document.getElementById('alert-container');
            const icons = {
                success: 'fa-check-circle',
                warning: 'fa-exclamation-triangle',
                error: 'fa-times-circle',
                info: 'fa-info-circle'
            };
            
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.innerHTML = `
                <i class="fas ${icons[type]}"></i>
                ${message}
            `;
            
            alertContainer.appendChild(alert);
            
            // Mostrar alerta
            setTimeout(() => {
                alert.classList.add('show');
            }, 10);
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                alert.classList.remove('show');
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }, 5000);
        }
        
        // Cargar configuración general
        function loadGeneralConfig() {
            db.collection('configuracion').doc('general').get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        
                        // Configuración del sitio
                        document.getElementById('logo-text').textContent = data.logoText || 'RETOM RT';
                        document.getElementById('hero-title').textContent = data.heroTitle || 'Soluciones Tecnológicas Avanzadas';
                        document.getElementById('hero-description').textContent = data.heroDescription || 'Software especializado para gestión de inventarios, control de acceso, registro de tiempo y administración de energía. Optimiza tus operaciones con nuestras soluciones digitales futuristas.';
                        
                        // Información de contacto
                        document.getElementById('contact-email').textContent = data.contactEmail || 'info@retomrt.com';
                        document.getElementById('contact-phone').textContent = data.contactPhone || '(840) 515-8440';
                        document.getElementById('contact-description').textContent = data.contactDescription || 'Estamos disponibles para responder tus preguntas y asesorarte sobre cuál de nuestras soluciones se adapta mejor a tus necesidades.';
                        
                        // Footer
                        document.getElementById('footer-title').textContent = data.footerTitle || 'Retom RT';
                        document.getElementById('footer-description').textContent = data.footerDescription || 'Soluciones tecnológicas avanzadas para la gestión empresarial. Software especializado para mejorar la eficiencia operativa.';
                        document.getElementById('copyright-text').textContent = data.copyrightText || '© 2023 Retom RT. Todos los derechos reservados.';
                    }
                })
                .catch(error => {
                    console.error("Error cargando configuración general:", error);
                    showAlert('error', 'Error al cargar la configuración del sitio');
                });
        }

        // Cargar información "Quiénes Somos"
        function loadAboutUs() {
            db.collection('configuracion').doc('aboutUs').get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        
                        document.getElementById('about-title').textContent = data.title || 'Innovación Tecnológica para un Futuro Eficiente';
                        
                        // Convertir saltos de línea en párrafos
                        const content = data.content || '';
                        const paragraphs = content.split('\n').filter(p => p.trim() !== '');
                        
                        const aboutContent = document.getElementById('about-content');
                        aboutContent.innerHTML = '';
                        
                        paragraphs.forEach(p => {
                            const paragraph = document.createElement('p');
                            paragraph.textContent = p;
                            aboutContent.appendChild(paragraph);
                        });
                        
                        // Imagen
                        if (data.imageUrl) {
                            document.getElementById('about-image').src = data.imageUrl;
                        }
                    }
                })
                .catch(error => {
                    console.error("Error cargando información 'Quiénes Somos':", error);
                    showAlert('error', 'Error al cargar la información de la empresa');
                });
        }

        // Cargar productos
        function loadProducts() {
            const productsContainer = document.getElementById('products-container');
            productsContainer.innerHTML = '<div class="product-card"><p>Cargando productos...</p></div>';
            
            db.collection('productos').orderBy('order', 'asc').get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        productsContainer.innerHTML = '<div class="product-card"><p>No hay productos disponibles</p></div>';
                        return;
                    }
                    
                    productsContainer.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const product = doc.data();
                        const productCard = document.createElement('div');
                        productCard.className = 'product-card';
                        productCard.setAttribute('data-id', doc.id);
                        
                        productCard.innerHTML = `
                            <div class="product-icon"><i class="${product.icon || 'fas fa-box'}"></i></div>
                            <h3>${product.name || 'Producto'}</h3>
                            <p>${product.description ? product.description.substring(0, 100) + '...' : 'Descripción no disponible'}</p>
                        `;
                        
                        // Agregar evento click para mostrar detalles
                        productCard.addEventListener('click', () => showProductDetails(doc.id, product));
                        
                        productsContainer.appendChild(productCard);
                    });
                    
                    // También cargar productos en el footer
                    loadFooterProducts();
                })
                .catch(error => {
                    console.error("Error cargando productos:", error);
                    productsContainer.innerHTML = '<div class="product-card"><p>Error al cargar los productos</p></div>';
                    showAlert('error', 'Error al cargar los productos');
                });
        }

        // Mostrar detalles del producto en modal
        function showProductDetails(id, product) {
            const modal = document.getElementById('product-modal');
            const modalIcon = document.getElementById('modal-icon');
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            
            // Configurar contenido del modal
            modalIcon.className = `modal-icon fas ${product.icon || 'fa-box'}`;
            modalTitle.textContent = product.name || 'Producto';
            
            // Convertir descripción en párrafos si tiene saltos de línea
            const description = product.description || 'Descripción no disponible';
            const paragraphs = description.split('\n').filter(p => p.trim() !== '');
            
            modalBody.innerHTML = '';
            
            paragraphs.forEach(p => {
                const paragraph = document.createElement('p');
                paragraph.textContent = p;
                modalBody.appendChild(paragraph);
            });
            
            // Mostrar modal
            modal.style.display = 'block';
            
            // Cerrar modal al hacer clic en la X
            document.querySelector('.close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Cerrar modal al hacer clic fuera del contenido
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Cargar productos en el footer
        function loadFooterProducts() {
            const footerProducts = document.getElementById('footer-products');
            footerProducts.innerHTML = '';
            
            db.collection('productos').orderBy('order', 'asc').limit(4).get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        const product = doc.data();
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="#productos">${product.name || 'Producto'}</a>`;
                        footerProducts.appendChild(li);
                    });
                })
                .catch(error => {
                    console.error("Error cargando productos para footer:", error);
                });
        }

        // Cargar clientes
        function loadClients() {
            const clientsContainer = document.getElementById('clients-container');
            clientsContainer.innerHTML = '<p>Cargando clientes...</p>';
            
            db.collection('clientes').orderBy('order', 'asc').get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        clientsContainer.innerHTML = '<p>No hay clientes para mostrar</p>';
                        return;
                    }
                    
                    clientsContainer.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const client = doc.data();
                        const img = document.createElement('img');
                        img.className = 'client-logo';
                        img.src = client.logoUrl || 'https://via.placeholder.com/150x80?text=Cliente';
                        img.alt = client.name || 'Cliente';
                        img.title = client.name || '';
                        
                        clientsContainer.appendChild(img);
                    });
                })
                .catch(error => {
                    console.error("Error cargando clientes:", error);
                    clientsContainer.innerHTML = '<p>Error al cargar los clientes</p>';
                    showAlert('error', 'Error al cargar los clientes');
                });
        }

        // Cargar redes sociales
        function loadSocialLinks() {
            const socialLinksContainer = document.getElementById('social-links');
            socialLinksContainer.innerHTML = '';
            
            db.collection('redesSociales').orderBy('order', 'asc').get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        const social = doc.data();
                        const link = document.createElement('a');
                        link.href = social.url || '#';
                        link.target = '_blank';
                        link.title = social.name || 'Red social';
                        
                        const icon = document.createElement('i');
                        icon.className = `fab ${social.icon || 'fa-link'}`;
                        
                        link.appendChild(icon);
                        socialLinksContainer.appendChild(link);
                    });
                })
                .catch(error => {
                    console.error("Error cargando redes sociales:", error);
                    showAlert('error', 'Error al cargar las redes sociales');
                });
        }

        // Manejo del formulario de contacto
        document.getElementById('contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const submitLoading = document.getElementById('submit-loading');
            
            // Mostrar loading
            submitText.style.display = 'none';
            submitLoading.style.display = 'inline';
            submitBtn.disabled = true;
            
            // Enviar a EmailJS
            emailjs.sendForm('service_vwjqy7p', 'template_m0s04cs', this)
                .then(() => {
                    // Registrar en Firebase
                    const formData = {
                        name: this.from_name.value,
                        email: this.from_email.value,
                        message: this.message.value,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    return db.collection('mensajes').add(formData);
                })
                .then(() => {
                    showAlert('success', 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.');
                    this.reset();
                })
                .catch((error) => {
                    showAlert('error', 'Error al enviar el mensaje: ' + error.message);
                    console.error('Error:', error);
                })
                .finally(() => {
                    // Ocultar loading
                    submitText.style.display = 'inline';
                    submitLoading.style.display = 'none';
                    submitBtn.disabled = false;
                });
        });
        
        // Cargar todos los datos al iniciar
        document.addEventListener('DOMContentLoaded', () => {
            loadGeneralConfig();
            loadAboutUs();
            loadProducts();
            loadClients();
            loadSocialLinks();
            
            // Mostrar alerta de bienvenida
            showAlert('info', 'Bienvenido a Retom RT');
        });
 
