const path = require("path");
const natural = require("natural"); // For text processing and similarity calculation

// Charger un modèle pré-entraîné ou créer un modèle simple
class MLModel {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.data = require("../backend/reclamations_data.json"); // Charger les données d'entraînement
    }

    preprocess(text) {
        // Nettoyer et tokeniser le texte
        return this.tokenizer.tokenize(text.toLowerCase()).join(" ");
    }

    findSimilarSuggestions(content) {
        const processedContent = this.preprocess(content);
        const suggestions = [];

        // Calculer la similarité entre la réclamation et les données historiques
        this.data.forEach((item) => {
            const similarity = natural.JaroWinklerDistance(
                processedContent,
                this.preprocess(item.content)
            );
            if (similarity > 0.5) { // Seuil de similarité
                suggestions.push({
                    resolution: item.resolution,
                    similarity: similarity,
                });
            }
        });

        // Trier les suggestions par ordre de similarité décroissante
        suggestions.sort((a, b) => b.similarity - a.similarity);

        // Retourner jusqu'à 3 suggestions
        return suggestions.slice(0, 2).map(suggestion => suggestion.resolution);
    }
}

module.exports = new MLModel();