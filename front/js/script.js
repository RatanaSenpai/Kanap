//Définit l'URL de l'API à interroger pour récupérer la liste des produits
const apiUrl = 'http://localhost:3000/api/products';

//Récupère l'élément HTML qui sert de conteneur pour afficher la liste des produits.
const itemsContainer = document.getElementById("items");
console.log('html',itemsContainer)

//Effectue une requête HTTP GET sur l'URL de l'API
fetch(apiUrl)
    .then(response => response.json()) 
    .then(data => { 
        console.log('Données bien extraites!');
        for (const product of data) { 
        itemsContainer.innerHTML += ` 
        <a href="./product.html?id=${product._id}">
            <article>
            <img src="${product.imageUrl}" alt="${product.altTxt}">
            <h3 class="productName">${product.name}</h3>
            <p class="productDescription">${product.description}</p>
            </article>
        </a>` 
    }
    })
    //Message en cas d'erreur de la requete
    .catch(error => {
        console.error('Erreur:', error);
        itemsContainer.innerHTML = '<p>Une erreur est survenue lors du chargement des produits.</p>';
    }); 


