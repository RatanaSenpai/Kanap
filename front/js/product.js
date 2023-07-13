// Crée un nouvel objet URLSearchParams à partir des paramètres de recherche (query string) de l'URL actuelle
const urlParams = new URLSearchParams(window.location.search);

// Methode GET récupère la valeur du paramètre "id" pour savoir quel produit afficher
const productId = urlParams.get('id');

/**
 * Récupère les détails d'un produit en utilisant son identifiant (productId).
 * @param {number|string} productId - L'identifiant unique du produit à récupérer
 * @returns {Promise<Object|null>} - Renvoie un objet contenant les détails du produit ou null si une erreur s'est produite
 */
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        const product = await response.json();
        return product;
    } catch (error) {
        console.error("Erreur:", error);
        return null;
    }
}
// Récupère les détails du produit avec l'ID récupéré
fetchProductDetails(productId)
.then(product => {
    if (!product) {
        console.error("Erreur lors de la récupération du produit");
        return;
    }
        // Met à jour le titre de la page avec le nom du produit
        const title = document.querySelector("title");
        title.innerHTML = product.name;

        // Met à jour l'image du produit
        const img = document.querySelector(".item__img");
        img.innerHTML = `<img src="${product.imageUrl}" alt="${product.altTxt}">`;

        // Met à jour le nom du produit
        const titleProduct = document.getElementById("title");
        titleProduct.textContent = product.name;

        // Met à jour le prix du produit
        const priceElement = document.getElementById("price");
        priceElement.textContent = product.price;

        // Met à jour la description du produit
        const descriptionElement = document.getElementById("description");
        descriptionElement.textContent = product.description;

        // Met à jour les options de couleur du produit
        const colorsElement = document.getElementById("colors");
        for (const color of product.colors) {
            // Crée les options de la liste déroulante
            const optionElement = document.createElement("option");
            optionElement.value = color; // Option de la couleur retourné au serveur
            optionElement.textContent = color; //Affiche le nom de chaque couleur
            colorsElement.appendChild(optionElement); // Ajoute les options à la liste déroulante
        }
        // Stocke les informations du produit pour une utilisation ultérieure
        const productName = product.name;
        const productImageUrl = product.imageUrl;
        // Récupère le bouton "Ajouter au panier"
        const addToCartButton = document.getElementById("addToCart");
        // Ajoute l'événement au click sur le bouton Ajouter au panier, récupère le nom du produit en cliquant sur le bouton
        addToCartButton.addEventListener("click", () => addToCart(productName, productImageUrl));
    })
    .catch(error => console.error("Erreur:", error));

/**
 *  Fonction pour afficher une alerte lorsqu'un produit est ajouté au panier
 * @param {string} productName 
 * @param {number} productQuantity 
 * @param {number} totalQuantityInCart 
 */
function displayAlert(productName, productQuantity, totalQuantityInCart) {
    if (totalQuantityInCart <= 100){
        console.log('Le produit a été ajouté avec succès');
        alert(`Le produit ${productName} a été ajouté au panier avec succès. Quantité : ${productQuantity}`);
    }
}

/**
 * LocalStorage - Fonction pour ajouter le produit au panier
 * @param {string} productName - Le nom du produit à ajouter au panier
 * @param {string} productImageUrl - L'URL de l'image du produit à ajouter au panier
 * @returns 
 */
function addToCart(productName, productImageUrl) {
    // Récupère la couleur et la quantité sélectionnées
    const productColor = document.getElementById("colors").value;
    const productQuantity = parseInt(document.getElementById("quantity").value); 
    const quantityInput = document.getElementById('quantity');
    displayAlert(productName, productQuantity);
    // Valide que l'utilisateur a saisi un nombre entier pour la quantité
    quantityInput.addEventListener('input', (event) => {
        const value = event.target.value;
        if (value.includes('.')) {
            alert('Veuillez entrer un nombre entier.');
            event.target.value = Math.floor(value); // arrondit à l'entier inférieur
        }
    });
    // Vérifie si la couleur et la quantité sont valides
    if (!productColor) {
        alert("Veuillez choisir une couleur avant d'ajouter le produit au panier.");
        return;
    }
    if (productQuantity < 0) {
        alert("La quantité ne peut pas être négative !");
        return;
    }
    if (isNaN(productQuantity) || productQuantity <= 0) {
        alert("Veuillez entrer une quantité valide.");
        return;
    }

    // Récupération du contenu actuel du panier depuis le localStorage
    const cartContent = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Vérification si le produit est déjà présent dans le panier
    const index = cartContent.findIndex(item => item.id === productId && item.color === productColor);
    console.log('Index', index);
    if (index === -1) {
        if (productQuantity > 100) {
            alert("Vous ne pouvez pas ajouter plus de 100 articles de ce produit.");
            return;
        }
        //Ajoute un nouvel objet auy tableau cartContent
        cartContent.push({
            id: productId, 
            color: productColor, 
            quantity: productQuantity, 
            name: productName,
            image: productImageUrl,
        });
        totalQuantityInCart = productQuantity;
        // Afficher le nom du canapé
        console.log("nom du canap ajouté:", productName); 
    } else {
        // Si le produit est déjà présent, on incrémente simplement la quantité du produit correspondant
        totalQuantityInCart = cartContent[index].quantity + productQuantity;
        if (totalQuantityInCart > 100) {
            alert("Vous ne pouvez pas ajouter plus de 100 articles de ce produit.");
            return;            
        }
        cartContent[index].quantity = totalQuantityInCart;
    }
    // Appel de la fonction pour afficher une alerte en fonction de la quantité totale
    if (totalQuantityInCart <= 100) {
        displayAlert(productName, productQuantity, totalQuantityInCart);
    }
    //Enregistre le contenu du panier dans le localStorage
    localStorage.setItem('cart', JSON.stringify(cartContent)); 
}



