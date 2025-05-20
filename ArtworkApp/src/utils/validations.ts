interface ValidationErrors {
    title?: string;
    description?: string;
    imageUrl?: string;
  }
  
  interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrors;
  }
  
  interface ArtworkValidation {
    title?: string;
    description?: string;
    imageUrl?: string;
  }
  
  export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };
  
  export const validateArtwork = (artwork: ArtworkValidation): ValidationResult => {
    const errors: ValidationErrors = {};
    
    if (!artwork.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!artwork.description?.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!artwork.imageUrl) {
      errors.imageUrl = 'Image is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
