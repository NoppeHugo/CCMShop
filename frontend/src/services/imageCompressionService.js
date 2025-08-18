// Service de compression d'images
class ImageCompressionService {
  // Compresser une image en réduisant sa qualité et sa taille
  static compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions en gardant le ratio
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Redimensionner le canvas
        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir en base64 avec compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      
      // Créer l'URL de l'image depuis le fichier
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Compresser spécifiquement pour les aperçus (plus petit)
  static compressForPreview(file) {
    return this.compressImage(file, 400, 0.6);
  }

  // Compresser pour les images de couverture
  static compressForCover(file) {
    return this.compressImage(file, 1200, 0.8);
  }

  // Vérifier la taille du localStorage
  static getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  // Afficher les statistiques de stockage
  static logStorageStats() {
  // Removed localStorage-based stats; fallback to counting bytes of known keys if available
  const sizeBytes = this.getLocalStorageSize();
  const sizeMB = Number((sizeBytes / (1024 * 1024)).toFixed(2));
  const maxSizeMB = 5;
  const usagePercent = Number(((sizeBytes / (maxSizeMB * 1024 * 1024)) * 100).toFixed(1));

  console.log(`📊 LocalStorage (approx): ${sizeMB}MB utilisés (~${usagePercent}% de ${maxSizeMB}MB)`);
  }
}

export default ImageCompressionService;
