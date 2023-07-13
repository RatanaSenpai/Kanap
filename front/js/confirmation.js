// Écoute l'événement 'DOMContentLoaded', qui se déclenche lorsque le contenu HTML initial est complètement chargé et analysé
document.addEventListener("DOMContentLoaded", function() {
    const queryString = window.location.search;
    // Vérifie si la chaîne de requête contient "orderId" (nous nous attendons à ce qu'elle contienne l'ID de la commande)
    if (queryString.includes("orderId")) {
        // Créé un objet URLSearchParams à partir de la chaîne de requête pour faciliter l'accès aux paramètres de l'URL
        const urlParams = new URLSearchParams(queryString);
        // Récupére la valeur de l'ID de la commande à partir des paramètres de l'URL
        const orderId = urlParams.get('orderId');
        console.log("orderId:", orderId);
        // Récupére l'élément HTML où l'ID de la commande doit être affiché
        const orderIdElement = document.getElementById("orderId");
        // Mettre à jour le contenu de l'élément HTML avec l'ID de la commande récupéré
        orderIdElement.textContent = orderId;
    } else {
        console.error("Aucun orderId trouvé dans l'URL");
    }
});
