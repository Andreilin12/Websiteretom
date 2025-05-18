        // Firebase Configuration
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
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();
        const storage = firebase.storage();

        // Mostrar el panel de administración directamente
        document.getElementById('admin-panel').style.display = 'block';
        
        // Identificar al usuario actual
        auth.onAuthStateChanged((user) => {
            if (user) {
                document.getElementById('current-user').textContent = user.email || 'Administrador';
            } else {
                // Si no hay usuario autenticado, mostrar como administrador anónimo
                document.getElementById('current-user').textContent = 'Administrador';
            }
        });

        // Mostrar alertas
        function showAlert(element, message, type) {
            element.textContent = message;
            element.className = `alert alert-${type}`;
            element.style.display = 'block';
            
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }

        // Navegación entre pestañas
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover clase active de todos los enlaces
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                // Agregar clase active al enlace clickeado
                link.classList.add('active');
                
                // Ocultar todos los contenidos
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Mostrar el contenido correspondiente
                const tabId = link.getAttribute('data-tab') + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Cargar datos para el panel de administración desde Firestore
        function loadAdminData() {
            // Cargar configuración general
            db.collection('configuracion').doc('general').get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        document.getElementById('site-title').value = data.siteTitle || '';
                        document.getElementById('logo-text').value = data.logoText || '';
                        document.getElementById('hero-title').value = data.heroTitle || '';
                        document.getElementById('hero-description').value = data.heroDescription || '';
                        document.getElementById('contact-email').value = data.contactEmail || '';
                        document.getElementById('contact-phone').value = data.contactPhone || '';
                        document.getElementById('contact-description').value = data.contactDescription || '';
                        document.getElementById('footer-title').value = data.footerTitle || '';
                        document.getElementById('footer-description').value = data.footerDescription || '';
                        document.getElementById('copyright-text').value = data.copyrightText || '';
                    } else {
                        // Crear documento si no existe
                        db.collection('configuracion').doc('general').set({
                            siteTitle: '',
                            logoText: '',
                            heroTitle: '',
                            heroDescription: '',
                            contactEmail: '',
                            contactPhone: '',
                            contactDescription: '',
                            footerTitle: '',
                            footerDescription: '',
                            copyrightText: ''
                        });
                    }
                })
                .catch(error => {
                    console.error("Error cargando configuración general:", error);
                    showAlert(document.getElementById('general-alert'), 'Error al cargar configuración: ' + error.message, 'error');
                });
            
            // Cargar información "Quiénes Somos"
            db.collection('configuracion').doc('aboutUs').get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        document.getElementById('about-title').value = data.title || '';
                        document.getElementById('about-content').value = data.content || '';
                        document.getElementById('about-image-url').value = data.imageUrl || '';
                        
                        const preview = document.getElementById('about-image-preview');
                        if (data.imageUrl) {
                            preview.src = data.imageUrl;
                            preview.style.display = 'block';
                        } else {
                            preview.style.display = 'none';
                        }
                    } else {
                        // Crear documento si no existe
                        db.collection('configuracion').doc('aboutUs').set({
                            title: '',
                            content: '',
                            imageUrl: ''
                        });
                    }
                })
                .catch(error => {
                    console.error("Error cargando información 'Quiénes Somos':", error);
                    showAlert(document.getElementById('about-alert'), 'Error al cargar información: ' + error.message, 'error');
                });
            
            // Cargar productos
            loadProducts();
            
            // Cargar clientes
            loadClients();
            
            // Cargar redes sociales
            loadSocialLinks();
            
            // Cargar mensajes
            loadMessages();
        }

        // Cargar datos al iniciar
        loadAdminData();

        // Guardar configuración general
        document.getElementById('general-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const alert = document.getElementById('general-alert');
            
            const data = {
                siteTitle: document.getElementById('site-title').value,
                logoText: document.getElementById('logo-text').value,
                heroTitle: document.getElementById('hero-title').value,
                heroDescription: document.getElementById('hero-description').value,
                contactEmail: document.getElementById('contact-email').value,
                contactPhone: document.getElementById('contact-phone').value,
                contactDescription: document.getElementById('contact-description').value,
                footerTitle: document.getElementById('footer-title').value,
                footerDescription: document.getElementById('footer-description').value,
                copyrightText: document.getElementById('copyright-text').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            db.collection('configuracion').doc('general').set(data, { merge: true })
                .then(() => {
                    showAlert(alert, 'Configuración guardada correctamente', 'success');
                })
                .catch(error => {
                    showAlert(alert, 'Error al guardar la configuración: ' + error.message, 'error');
                    console.error("Error guardando configuración general:", error);
                });
        });

        // Guardar información "Quiénes Somos"
        document.getElementById('about-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const alert = document.getElementById('about-alert');
            const imageFile = document.getElementById('about-image').files[0];
            const imageUrl = document.getElementById('about-image-url').value;
            
            // Si hay una nueva imagen para subir
            if (imageFile) {
                const storageRef = storage.ref('about/' + imageFile.name);
                const uploadTask = storageRef.put(imageFile);
                
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        // Progreso de la subida
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                    }, 
                    (error) => {
                        // Manejar errores
                        showAlert(alert, 'Error al subir la imagen: ' + error.message, 'error');
                        console.error("Error subiendo imagen:", error);
                    }, 
                    () => {
                        // Subida completada, obtener URL de descarga
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            console.log('File available at', downloadURL);
                            
                            // Guardar datos con la nueva URL de la imagen
                            const data = {
                                title: document.getElementById('about-title').value,
                                content: document.getElementById('about-content').value,
                                imageUrl: downloadURL,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            };
                            
                            saveAboutData(data, alert);
                        });
                    }
                );
            } else {
                // No hay nueva imagen, guardar con la URL existente
                const data = {
                    title: document.getElementById('about-title').value,
                    content: document.getElementById('about-content').value,
                    imageUrl: imageUrl,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                saveAboutData(data, alert);
            }
        });

        function saveAboutData(data, alert) {
            db.collection('configuracion').doc('aboutUs').set(data, { merge: true })
                .then(() => {
                    showAlert(alert, 'Información guardada correctamente', 'success');
                    
                    // Actualizar vista previa si hay imagen
                    const preview = document.getElementById('about-image-preview');
                    if (data.imageUrl) {
                        preview.src = data.imageUrl;
                        preview.style.display = 'block';
                    }
                })
                .catch(error => {
                    showAlert(alert, 'Error al guardar la información: ' + error.message, 'error');
                    console.error("Error guardando información 'Quiénes Somos':", error);
                });
        }

        // Vista previa de imagen
        document.getElementById('about-image').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const preview = document.getElementById('about-image-preview');
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            
            reader.readAsDataURL(file);
        });

        // Funciones para productos
        function loadProducts() {
            const productsTable = document.getElementById('products-table');
            productsTable.innerHTML = '<tr><td colspan="4">Cargando productos...</td></tr>';
            
            db.collection('productos').orderBy('order', 'asc').get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        productsTable.innerHTML = '<tr><td colspan="4">No hay productos registrados</td></tr>';
                        return;
                    }
                    
                    productsTable.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const product = doc.data();
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${product.name || 'Sin nombre'}</td>
                            <td>${product.description ? product.description.substring(0, 50) + '...' : 'Sin descripción'}</td>
                            <td>${product.order || '0'}</td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${doc.id}">Editar</button>
                                <button class="action-btn delete-btn" data-id="${doc.id}">Eliminar</button>
                            </td>
                        `;
                        
                        productsTable.appendChild(row);
                    });
                    
                    // Agregar eventos a los botones
                    document.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', () => editProduct(btn.getAttribute('data-id')));
                    });
                    
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
                    });
                })
                .catch(error => {
                    console.error("Error cargando productos:", error);
                    productsTable.innerHTML = '<tr><td colspan="4">Error al cargar productos</td></tr>';
                    showAlert(document.getElementById('products-alert'), 'Error al cargar productos: ' + error.message, 'error');
                });
        }

        function editProduct(id) {
            db.collection('productos').doc(id).get()
                .then(doc => {
                    if (doc.exists) {
                        const product = doc.data();
                        
                        document.getElementById('product-id').value = id;
                        document.getElementById('product-name').value = product.name || '';
                        document.getElementById('product-description').value = product.description || '';
                        document.getElementById('product-icon').value = product.icon || '';
                        document.getElementById('product-order').value = product.order || 0;
                        
                        document.getElementById('product-form-title').textContent = 'Editar Producto';
                        document.getElementById('product-form-container').style.display = 'block';
                        document.getElementById('add-product-btn').style.display = 'none';
                        
                        // Desplazar hacia el formulario
                        document.getElementById('product-form-container').scrollIntoView({ behavior: 'smooth' });
                    }
                })
                .catch(error => {
                    console.error("Error cargando producto:", error);
                    showAlert(document.getElementById('products-alert'), 'Error al cargar producto: ' + error.message, 'error');
                });
        }

        function deleteProduct(id) {
            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                db.collection('productos').doc(id).delete()
                    .then(() => {
                        loadProducts();
                        showAlert(document.getElementById('products-alert'), 'Producto eliminado correctamente', 'success');
                    })
                    .catch(error => {
                        showAlert(document.getElementById('products-alert'), 'Error al eliminar el producto: ' + error.message, 'error');
                        console.error("Error eliminando producto:", error);
                    });
            }
        }

        document.getElementById('add-product-btn').addEventListener('click', () => {
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            document.getElementById('product-form-title').textContent = 'Agregar Nuevo Producto';
            document.getElementById('product-form-container').style.display = 'block';
            document.getElementById('add-product-btn').style.display = 'none';
            
            // Desplazar hacia el formulario
            document.getElementById('product-form-container').scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('cancel-product-btn').addEventListener('click', () => {
            document.getElementById('product-form-container').style.display = 'none';
            document.getElementById('add-product-btn').style.display = 'block';
        });

        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const alert = document.getElementById('products-alert');
            const productId = document.getElementById('product-id').value;
            
            const data = {
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                icon: document.getElementById('product-icon').value,
                order: parseInt(document.getElementById('product-order').value) || 0,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (productId) {
                // Actualizar producto existente
                db.collection('productos').doc(productId).update(data)
                    .then(() => {
                        showAlert(alert, 'Producto actualizado correctamente', 'success');
                        loadProducts();
                        document.getElementById('product-form-container').style.display = 'none';
                        document.getElementById('add-product-btn').style.display = 'block';
                    })
                    .catch(error => {
                        showAlert(alert, 'Error al actualizar el producto: ' + error.message, 'error');
                        console.error("Error actualizando producto:", error);
                    });
            } else {
                // Agregar nuevo producto
                db.collection('productos').add(data)
                    .then(() => {
                        showAlert(alert, 'Producto agregado correctamente', 'success');
                        loadProducts();
                        document.getElementById('product-form-container').style.display = 'none';
                        document.getElementById('add-product-btn').style.display = 'block';
                    })
                    .catch(error => {
                        showAlert(alert, 'Error al agregar el producto: ' + error.message, 'error');
                        console.error("Error agregando producto:", error);
                    });
            }
        });

        // Funciones para clientes
        function loadClients() {
            const clientsTable = document.getElementById('clients-table');
            clientsTable.innerHTML = '<tr><td colspan="4">Cargando clientes...</td></tr>';
            
            db.collection('clientes').orderBy('order', 'asc').get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        clientsTable.innerHTML = '<tr><td colspan="4">No hay clientes registrados</td></tr>';
                        return;
                    }
                    
                    clientsTable.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const client = doc.data();
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${client.name || 'Sin nombre'}</td>
                            <td><img src="${client.logoUrl || ''}" alt="${client.name || 'Cliente'}" style="max-width: 80px; max-height: 40px;"></td>
                            <td>${client.order || '0'}</td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${doc.id}">Editar</button>
                                <button class="action-btn delete-btn" data-id="${doc.id}">Eliminar</button>
                            </td>
                        `;
                        
                        clientsTable.appendChild(row);
                    });
                    
                    // Agregar eventos a los botones
                    document.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', () => editClient(btn.getAttribute('data-id')));
                    });
                    
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => deleteClient(btn.getAttribute('data-id')));
                    });
                })
                .catch(error => {
                    console.error("Error cargando clientes:", error);
                    clientsTable.innerHTML = '<tr><td colspan="4">Error al cargar clientes</td></tr>';
                    showAlert(document.getElementById('clients-alert'), 'Error al cargar clientes: ' + error.message, 'error');
                });
        }

        function editClient(id) {
            db.collection('clientes').doc(id).get()
                .then(doc => {
                    if (doc.exists) {
                        const client = doc.data();
                        
                        document.getElementById('client-id').value = id;
                        document.getElementById('client-name').value = client.name || '';
                        document.getElementById('client-logo').value = client.logoUrl || '';
                        document.getElementById('client-order').value = client.order || 0;
                        
                        document.getElementById('client-form-title').textContent = 'Editar Cliente';
                        document.getElementById('client-form-container').style.display = 'block';
                        document.getElementById('add-client-btn').style.display = 'none';
                        
                        // Desplazar hacia el formulario
                        document.getElementById('client-form-container').scrollIntoView({ behavior: 'smooth' });
                    }
                })
                .catch(error => {
                    console.error("Error cargando cliente:", error);
                    showAlert(document.getElementById('clients-alert'), 'Error al cargar cliente: ' + error.message, 'error');
                });
        }

        function deleteClient(id) {
            if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
                db.collection('clientes').doc(id).delete()
                    .then(() => {
                        loadClients();
                        showAlert(document.getElementById('clients-alert'), 'Cliente eliminado correctamente', 'success');
                    })
                    .catch(error => {
                        showAlert(document.getElementById('clients-alert'), 'Error al eliminar el cliente: ' + error.message, 'error');
                        console.error("Error eliminando cliente:", error);
                    });
            }
        }

        document.getElementById('add-client-btn').addEventListener('click', () => {
            document.getElementById('client-form').reset();
            document.getElementById('client-id').value = '';
            document.getElementById('client-form-title').textContent = 'Agregar Nuevo Cliente';
            document.getElementById('client-form-container').style.display = 'block';
            document.getElementById('add-client-btn').style.display = 'none';
            
            // Desplazar hacia el formulario
            document.getElementById('client-form-container').scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('cancel-client-btn').addEventListener('click', () => {
            document.getElementById('client-form-container').style.display = 'none';
            document.getElementById('add-client-btn').style.display = 'block';
        });

        document.getElementById('client-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const alert = document.getElementById('clients-alert');
            const clientId = document.getElementById('client-id').value;
            
            const data = {
                name: document.getElementById('client-name').value,
                logoUrl: document.getElementById('client-logo').value,
                order: parseInt(document.getElementById('client-order').value) || 0,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (clientId) {
                // Actualizar cliente existente
                db.collection('clientes').doc(clientId).update(data)
                    .then(() => {
                        showAlert(alert, 'Cliente actualizado correctamente', 'success');
                        loadClients();
                        document.getElementById('client-form-container').style.display = 'none';
                        document.getElementById('add-client-btn').style.display = 'block';
                    })
                    .catch(error => {
                        showAlert(alert, 'Error al actualizar el cliente: ' + error.message, 'error');
                        console.error("Error actualizando cliente:", error);
                    });
            } else {
                // Agregar nuevo cliente
                db.collection('clientes').add(data)
                    .then(() => {
                        showAlert(alert, 'Cliente agregado correctamente', 'success');
                        loadClients();
                        document.getElementById('client-form-container').style.display = 'none';
                        document.getElementById('add-client-btn').style.display = 'block';
                    })
                    .catch(error => {
                        showAlert(alert, 'Error al agregar el cliente: ' + error.message, 'error');
                        console.error("Error agregando cliente:", error);
                    });
            }
        });

        // Funciones para redes sociales
        function loadSocialLinks() {
            const socialTable = document.getElementById('social-table');
            socialTable.innerHTML = '<tr><td colspan="5">Cargando redes sociales...</td></tr>';
            
            db.collection('redesSociales').orderBy('order', 'asc').get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        socialTable.innerHTML = '<tr><td colspan="5">No hay redes sociales registradas</td></tr>';
                        return;
                    }
                    
                    socialTable.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const social = doc.data();
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${social.name || 'Sin nombre'}</td>
                            <td><a href="${social.url || '#'}" target="_blank">${social.url ? social.url.substring(0, 30) + '...' : 'Sin URL'}</a></td>
                            <td><i class="fab ${social.icon || 'fa-link'}"></i> ${social.icon || 'Sin icono'}</td>
                            <td>${social.order || '0'}</td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${doc.id}">Editar</button>
                                <button class="action-btn delete-btn" data-id="${doc.id}">Eliminar</button>
                            </td>
                        `;
                        
                        socialTable.appendChild(row);
                    });
                    
                    // Agregar eventos a los botones
                    document.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', () => editSocialLink(btn.getAttribute('data-id')));
                    });
                    
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => deleteSocialLink(btn.getAttribute('data-id')));
                    });
                })
                .catch(error => {
                    console.error("Error cargando redes sociales:", error);
                    socialTable.innerHTML = '<tr><td colspan="5">Error al cargar redes sociales</td></tr>';
                    showAlert(document.getElementById('social-alert'), 'Error al cargar redes sociales: ' + error.message, 'error');
                });
        }

        function editSocialLink(id) {
            db.collection('redesSociales').doc(id).get()
                .then(doc => {
                    if (doc.exists) {
                        const social = doc.data();
                        
                        document.getElementById('social-id').value = id;
                        document.getElementById('social-name').value = social.name || '';
                        document.getElementById('social-url').value = social.url || '';
                        document.getElementById('social-icon').value = social.icon || '';
                        document.getElementById('social-order').value = social.order || 0;
                        
                        document.getElementById('social-form-title').textContent = 'Editar Red Social';
                        document.getElementById('social-form-container').style.display = 'block';
                        document.getElementById('add-social-btn').style.display = 'none';
                        
                        // Desplazar hacia el formulario
                        document.getElementById('social-form-container').scrollIntoView({ behavior: 'smooth' });
                    }
                })
                .catch(error => {
                    console.error("Error cargando red social:", error);
                    showAlert(document.getElementById('social-alert'), 'Error al cargar red social: ' + error.message, 'error');
                });
        }

        function deleteSocialLink(id) {
            if (confirm('¿Estás seguro de que deseas eliminar esta red social?')) {
                db.collection('redesSociales').doc(id).delete()
                    .then(() => {
                        loadSocialLinks();
                        showAlert(document.getElementById('social-alert'), 'Red social eliminada correctamente', 'success');
                    })
                    .catch(error => {
                        showAlert(document.getElementById('social-alert'), 'Error al eliminar la red social: ' + error.message, 'error');
                        console.error("Error eliminando red social:", error);
                    });
            }
        }

        document.getElementById('add-social-btn').addEventListener('click', () => {
            document.getElementById('social-form').reset();
            document.getElementById('social-id').value = '';
            document.getElementById('social-form-title').textContent = 'Agregar Nueva Red Social';
            document.getElementById('social-form-container').style.display = 'block';
            document.getElementById('add-social-btn').style.display = 'none';
            
            // Desplazar hacia el formulario
            document.getElementById('social-form-container').scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('cancel-social-btn').addEventListener('click', () => {
            document.getElementById('social-form-container').style.display = 'none';
            document.getElementById('add-social-btn').style.display = 'block';
        });

        document.getElementById('social-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const alert = document.getElementById('social-alert');
            const socialId = document.getElementById('social-id').value;
            
            const data = {
                name: document.getElementById('social-name').value,
                url: document.getElementById('social-url').value,
                icon: document.getElementById('social-icon').value,
                order: parseInt(document.getElementById('social-order').value) || 0,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (socialId) {
                // Actualizar red social existente
                db.collection('redesSociales').doc(socialId).update(data)
                    .then(() => {
                        showAlert(alert, 'Red social actualizada correctamente', 'success');
                        loadSocialLinks();
                        document.getElementById('social-form-container').style.display = 'none';
                        document.getElementById('add-social-btn').style.display = 'block';
                    })
                    .catch(error => {
                        showAlert(alert, 'Error al actualizar la red social: ' + error.message, 'error');
                        console.error("Error actualizando red social:", error);
                    });
            } else {
                // Agregar nueva red social
                db.collection('redesSociales').add(data)
                    .then(() => {
                        showAlert(alert, 'Red social agregada correctamente', 'success');
                        loadSocialLinks();
                        document.getElementById('social-form-container').style.display = 'none';
                        document.getElementById('add-social-btn').style.display = 'block';
                    })
                    .catch(error => {
                        showAlert(alert, 'Error al agregar la red social: ' + error.message, 'error');
                        console.error("Error agregando red social:", error);
                    });
            }
        });

        // Funciones para mensajes
        function loadMessages() {
            const messagesTable = document.getElementById('messages-table');
            messagesTable.innerHTML = '<tr><td colspan="5">Cargando mensajes...</td></tr>';
            
            db.collection('mensajes').orderBy('timestamp', 'desc').get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        messagesTable.innerHTML = '<tr><td colspan="5">No hay mensajes recibidos</td></tr>';
                        return;
                    }
                    
                    messagesTable.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const message = doc.data();
                        const row = document.createElement('tr');
                        
                        const date = message.timestamp ? message.timestamp.toDate() : new Date();
                        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                        
                        row.innerHTML = `
                            <td>${message.name || 'Anónimo'}</td>
                            <td>${message.email || 'Sin email'}</td>
                            <td>${message.message ? message.message.substring(0, 50) + '...' : 'Sin mensaje'}</td>
                            <td>${formattedDate}</td>
                            <td>
                                <button class="action-btn delete-btn" data-id="${doc.id}">Eliminar</button>
                            </td>
                        `;
                        
                        messagesTable.appendChild(row);
                    });
                    
                    // Agregar eventos a los botones
                    document.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', () => deleteMessage(btn.getAttribute('data-id')));
                    });
                })
                .catch(error => {
                    console.error("Error cargando mensajes:", error);
                    messagesTable.innerHTML = '<tr><td colspan="5">Error al cargar mensajes</td></tr>';
                    showAlert(document.getElementById('messages-alert'), 'Error al cargar mensajes: ' + error.message, 'error');
                });
        }

        function deleteMessage(id) {
            if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
                db.collection('mensajes').doc(id).delete()
                    .then(() => {
                        loadMessages();
                        showAlert(document.getElementById('messages-alert'), 'Mensaje eliminado correctamente', 'success');
                    })
                    .catch(error => {
                        showAlert(document.getElementById('messages-alert'), 'Error al eliminar el mensaje: ' + error.message, 'error');
                        console.error("Error eliminando mensaje:", error);
                    });
            }
        }
