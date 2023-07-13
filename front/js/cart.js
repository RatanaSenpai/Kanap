/**
 * Récupère les détails du produit
 * @param {string} productId - L'identifiant du produit.
 * @returns {Promise<object|null>} - Les détails du produit ou null en cas d'erreur
 */
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des données: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération du produit :", error);
        return null;
    }
}

let cartContent;
try {
    // Récupére le panier depuis localStorage et le convertir en objet Javascript
    cartContent = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Contenu du panier récupéré :", cartContent);
    console.table("c'est bien convertit au format JSON", cartContent);
} catch (error) {
    console.error("Erreur lors de la récupération du panier depuis localStorage :", error);
    cartContent = [];
}

/**
 * Récupère et affiche les informations des produits du panier
 * @returns {Promise}
 */
async function displayCartItems() {
    for (const item of cartContent) {
        const product = await fetchProductDetails(item.id);
        console.log("Détails du produit bien récupéré");
        if (product) {
            addProductToCartItemsContainer({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.imageUrl,
                color: item.color,
                quantity: item.quantity,
            })
        }
    }
}

//Affichage des produits dans la page panier
const cartItemsContainer = document.getElementById("cart__items");
console.log("Affiche les produits", cartItemsContainer);

/**
 * Fonction principale qui gère l'affichage du panier
 * @returns {Promise}
 */
async function displayCart() {
    if (cartContent.length === 0) {
        console.log("Panier vide");
    } else {
        console.log("Panier contient des trucs");
        // Parcourir les produits du panier et les ajouter à l'affichage
        await displayCartItems();
    }
}

/**
 * Ajoute un produit au conteneur des articles du panier
 * @param {object} product - Les détails du produit
 */
function addProductToCartItemsContainer(product) {
    // Ajoute le HTML du produit au container
    cartItemsContainer.insertAdjacentHTML("beforeend", getProductHtml(product));
    // Récupére le dernier élément ajouté (le produit)
    const articleElement = cartItemsContainer.lastElementChild;
    // Ajouter un écouteur d'événements pour gérer le changement de quantité
    const input = articleElement.querySelector(".itemQuantity");
    input.addEventListener("input", handleItemQuantityChange);
    // Ajouter un écouteur d'événements pour gérer la suppression d'un produit
    const button = articleElement.querySelector(".deleteItem");
    button.addEventListener("click", handleDeleteButtonClick);
}

/**
 * Fonction pour générer le HTML d'un produit à partir de ses données
 * @param {object} product 
 * @returns 
 */
function getProductHtml(product) {
    return `
    <article class="cart__item" data-id="${product.id}" data-color="${product.color}">
        <div class="cart__item__img">
            <img src="${product.image}" alt="Photographie d'un canapé">
        </div>
        <div class="cart__item__content">
            <div class="cart__item__content__description">
                <h2>${product.name}</h2>
                <p>${product.color}</p>
                <p>${product.price} €</p>
            </div>
            <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                    <p>Qté :${product.quantity}</p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.quantity}">
                </div>
                <div class="cart__item__content__settings__delete">
                    <p class="deleteItem">Supprimer</p>
                </div>
            </div>
        </div>
    </article>
    `;
}


/**
 * Fonction pour gérer le changement de quantité d'un produit
 * @param {Event} event 
 */
async function handleItemQuantityChange(event) {
    console.log("handleItemQuantityChange appelé");
    const productElement = event.target.closest(".cart__item");
    const productId = productElement.dataset.id;
    const productColor = productElement.dataset.color;
    const newQuantity = event.target.value;
    const newQuantityInt = parseInt(newQuantity, 10);
    const isValidQuantity = Number.isInteger(newQuantityInt) && newQuantityInt >= 1 && newQuantityInt <= 100;
    if (isValidQuantity) {
        updateProductQuantityInLocalStorage(productId, productColor, newQuantityInt);
        productElement.querySelector(".cart__item__content__settings__quantity p").innerText = `Qté :${newQuantityInt}`;
        await updateCartSummary();
    } else {
        const cartContent = JSON.parse(localStorage.getItem("cartContent"));

        if (cartContent) {
            const oldQuantity = cartContent.find(
                (item) => item.id === productId && item.color === productColor
            )?.quantity;
            if (oldQuantity) {
                event.target.value = oldQuantity;
            }
            if (newQuantity !== "") {
                alert("Veuillez entrer une quantité valide entre 1 et 100.");
            }
        }
    }
}


/**
 * Fonction pour gérer la suppression d'un produit
 * @param {Event} event 
 */
    async function handleDeleteButtonClick(event) {
    // Récupére les informations du produit (ID, couleur)
    const articleElement = event.target.closest(".cart__item");
    const productId = articleElement.dataset.id;
    const productColor = articleElement.dataset.color;
    console.log("Suppression du produit :", productId, productColor);
    // Supprime le produit du localStorage et de l'affichage, puis mettre à jour le résumé du panier
    removeProductFromLocalStorage(productId, productColor);
    articleElement.remove();
    await updateCartSummary();
}

/**
 * Fonction pour mettre à jour la quantité d'un produit dans le localStorage
 * @param {string} productId 
 * @param {string} productColor 
 * @param {number} newQuantity 
 */
function updateProductQuantityInLocalStorage(productId, productColor, newQuantity) {
    // Trouve l'index du produit dans le tableau cartContent
    const index = cartContent.findIndex(item => item.id === productId && item.color === productColor);
    if (index !== -1) {
        // Met à jour la quantité du produit
        cartContent[index].quantity = newQuantity;
        console.log("Contenu du panier mis à jour :", cartContent);
        // Enregistre le nouveau contenu du panier dans le localStorage
        localStorage.setItem('cart', JSON.stringify(cartContent));
    }
}

// Fonction pour supprimer un produit du localStorage
/**
 * 
 * @param {string} productId 
 * @param {string} productColor 
 */
    function removeProductFromLocalStorage(productId, productColor) {
    // Trouve l'index du produit dans le tableau cartContent
    const index = cartContent.findIndex(item => item.id === productId && item.color === productColor);
    if (index !== -1) {
        // Supprime le produit du tableau
        cartContent.splice(index, 1);
        console.log("Contenu du panier mis à jour après suppression :", cartContent);
        // Enregistre le nouveau contenu du panier dans le localStorage
        localStorage.setItem('cart', JSON.stringify(cartContent));
    }
}

/**
 * Fonction pour mettre à jour le résumé du panier (quantité totale et prix total)
 */
async function updateCartSummary() {
    // Récupére le contenu du panier depuis le localStorage
    const cartContent = JSON.parse(localStorage.getItem("cart")) || [];
    let totalQuantity = 0;
    let totalPrice = 0;
    // Calcule la quantité totale et le prix total
    for (const item of cartContent) {
        const product = await fetchProductDetails(item.id);
        if (product) {
            totalQuantity += item.quantity;
            totalPrice += item.quantity * product.price;
        }
    }
    // Met à jour l'affichage de la quantité totale et du prix total
    document.getElementById("totalQuantity").innerText = totalQuantity;
    document.getElementById("totalPrice").innerText = totalPrice;
    // Choisir le texte approprié pour le mot "article(s)"
    let articleText;
    if (totalQuantity > 1) {
        articleText = "articles";
    } else {
        articleText = "article";
    }
    console.log(`Total (${totalQuantity} ${articleText}) : ${totalPrice} €`);
    // Met à jour le texte du résumé du panier
    document.querySelector(
        ".cart__price p"
    ).innerHTML = `Total (<span id="totalQuantity">${totalQuantity}</span> ${articleText}) : <span id="totalPrice">${totalPrice}</span> €`;
}

// Mettre à jour le résumé du panier
updateCartSummary();    
// Appel de la fonction displayCart() pour exécuter le code
displayCart();

//Confirmation de la commande:
// Attends que le DOM soit complètement chargé avant d'exécuter le code
document.addEventListener("DOMContentLoaded", function () {
     // Sélectionne le formulaire
    const form = document.querySelector(".cart__order__form");
    // Fonction pour afficher les messages d'erreur
    function showError(elementId, message) {
        document.getElementById(elementId).textContent = message;
    }
    // Fonction pour effacer les messages d'erreur
    function clearError(elementId) {
        showError(elementId, "");
    }
    // Fonction pour valider les champs du formulaire avec des expressions régulières
    function validateInput(value, regex, errorMsgElementId, errorMsg) {
        if (!regex.test(value)) {
            showError(errorMsgElementId, errorMsg);
            return false;
        } else {
            clearError(errorMsgElementId);
            return true;
        }
    }
    // Ajoute un écouteur d'événement 'submit' au formulaire
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        
        let isValid = true;
        // Récupére les valeurs des champs du formulaire
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const address = document.getElementById("address").value;
        const city = document.getElementById("city").value;
        const email = document.getElementById("email").value;
        // Expressions régulières pour valider les champs
        const nameRegex = /^[a-zA-Zàâäéèêëîïôöùûüç\s-]+$/;
        const addressRegex = /^[a-zA-Z0-9\s,'-]*[a-zA-Z]+[a-zA-Z0-9\s,'-]*$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        // Valider les champs du formulaire
        isValid &= validateInput(firstName, nameRegex, "firstNameErrorMsg", "Prénom invalide");
        isValid &= validateInput(lastName, nameRegex, "lastNameErrorMsg", "Nom invalide");
        isValid &= validateInput(address, addressRegex, "addressErrorMsg", "Adresse invalide");
        isValid &= validateInput(city, nameRegex, "cityErrorMsg", "Ville invalide");
        isValid &= validateInput(email, emailRegex, "emailErrorMsg", "Email invalide");
        console.log("formulaire validé!:", isValid);
        // Vérifie si le panier est vide
        if (cartContent.length === 0) {
            alert("Le panier est vide. Veuillez ajouter des produits avant de passer la commande.");
            isValid = false;
        }
        // Si le formulaire est valide, envoie la commande
        if (isValid) {
            const productsPurchased = cartContent.map(item => item.id);
            const order = {
                contact: {
                    firstName: firstName,
                    lastName: lastName,
                    address: address,
                    city: city,
                    email: email,
                },
                products: productsPurchased,
            };
            console.log("Order object:", order);
            console.log("Order JSON string:", JSON.stringify(order));
            // Envoi la requête POST à l'API pour passer la commande
            fetch("http://localhost:3000/api/products/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(order),
            })
                .then((response) => response.json())
                .then((data) => {
                    // Redirige vers la page de confirmation avec l'ID de la commande
                    window.location.href = `confirmation.html?orderId=${data.orderId}`;
                    // Vider le panier (localStorage)
                    localStorage.removeItem('cart');
                })
                .catch((error) => console.error(error));
        }
    });
}); 