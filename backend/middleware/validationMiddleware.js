const { body, validationResult } = require("express-validator");

const validateReclamation = [
    body("TargetType")
        .notEmpty().withMessage("Le type de cible est requis.")
        .isString().withMessage("Le type de cible doit être une chaîne de caractères.")
        .isLength({ min: 3 }).withMessage("Le type de cible doit contenir au minimum 3 caractères."),
    
    body("Name")
        .notEmpty().withMessage("Le nom est requis.")
        .isString().withMessage("Le nom doit être une chaîne de caractères.")
        .isLength({ min: 3 }).withMessage("Le nom doit contenir au minimum 3 caractères."),
    
    body("Subject")
        .notEmpty().withMessage("Le sujet est requis.")
        .isString().withMessage("Le sujet doit être une chaîne de caractères.")
        .isLength({ min: 5 }).withMessage("Le sujet doit contenir au minimum 5 caractères."),
    
   
    body("Content")
        .optional()
        .isString().withMessage("Le contenu doit être une chaîne de caractères.")
        .isLength({ min:10 ,max: 1000 }).withMessage("La description contenir entre 10 et 1000 caractères."),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path, 
                message: err.msg 
            }));
            return res.status(400).json({
                success: false,
                error: true,
                message: "Erreur de validation",
                errors: formattedErrors 
            });
        }
        next();
    }
];
const validateResponse = [
    body("Subject")
        .notEmpty().withMessage("Le sujet est requis.")
        .isString().withMessage("Le sujet doit être une chaîne de caractères.")
        .isLength({ min: 5 }).withMessage("Le sujet doit contenir au minimum 5 caractères."),

    body("Content")
        .notEmpty().withMessage("Le contenu est requis.")
        .isString().withMessage("Le contenu doit être une chaîne de caractères.")
        .isLength({ min: 10, max: 1000 }).withMessage("La réponse doit contenir entre 10 et 1000 caractères."),

    body("ReclamationId")
        .notEmpty().withMessage("L'ID de la réclamation est requis.")
        .isString().withMessage("L'ID de la réclamation doit être une chaîne de caractères."),

   
    body("Montant")
        .if(body("ServiceSup").isIn([1, 3])) // Obligatoire si ServiceSup est 1 ou 3
        .notEmpty().withMessage("Le montant est requis pour un remboursement.")
        .isDecimal().withMessage("Le montant doit être un nombre décimal.")
        .custom((value) => {
            if (value <= 0) {
                throw new Error("Le montant doit être supérieur à 0.");
            }
            return true;
        }),

        body("DatePrevu")
        .if(body("ServiceSup").isIn([1, 3])) // Obligatoire si ServiceSup est 1 ou 3
        .notEmpty().withMessage("La date prévue est requise pour un remboursement.")
        .isDate().withMessage("La date prévue doit être une date valide.")
        .custom((value, { req }) => {
          const today = new Date();
          const inputDate = new Date(value);
    
          // Vérifier si la date est après aujourd'hui
          if (inputDate <= today) {
            throw new Error("La date prévue de rembourssement doit être après la date d'aujourd'hui.");
          }
    
          return true; // Si la validation réussit
        }),

        body("DatePrevuInterv")
        .if(body("ServiceSup").isIn([2, 3])) // Obligatoire si ServiceSup est 2 ou 3
        .notEmpty().withMessage("La date prévue d'intervention est requise.")
        .isDate().withMessage("La date prévue d'intervention doit être une date valide.")
        .custom((value, { req }) => {
          const today = new Date();
          const inputDate = new Date(value);
    
          // Vérifier si la date est après aujourd'hui
          if (inputDate <= today) {
            throw new Error("La date prévue d'intervention doit être après la date d'aujourd'hui.");
          }
    
          return true; // Si la validation réussit
        }),
    body("TechnicienResponsable")
        .if(body("ServiceSup").isIn([2, 3])) 
        .notEmpty().withMessage("Le technicien responsable est requis.")
        .isString().withMessage("Le technicien responsable doit être une chaîne de caractères.")
        .isLength({ min: 3 }).withMessage("Le nom du technicien doit contenir au minimum 3 caractères."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path, 
                message: err.msg 
            }));
            return res.status(400).json({
                success: false,
                error: true,
                message: "Erreur de validation",
                errors: formattedErrors 
            });
        }
        next();
    }
];
const validateSignUp = [
    body("Email")
        .notEmpty().withMessage("L'email est requis.")
        .isEmail().withMessage("L'email doit être une adresse email valide.")
        .isLength({ max: 100 }).withMessage("L'email ne doit pas dépasser 100 caractères."),

    body("Password")
        .notEmpty().withMessage("Le mot de passe est requis.")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."),

    body("FirstName")
        .notEmpty().withMessage("Le prénom est requis.")
        .isString().withMessage("Le prénom doit être une chaîne de caractères.")
        .isLength({ min: 3, max: 50 }).withMessage("Le prénom doit contenir entre 2 et 50 caractères."),

    body("LastName")
        .notEmpty().withMessage("Le nom de famille est requis.")
        .isString().withMessage("Le nom de famille doit être une chaîne de caractères.")
        .isLength({ min: 3, max: 50 }).withMessage("Le nom de famille doit contenir entre 2 et 50 caractères."),

    body("ProfileImage")
        .optional()
        .isString().withMessage("L'image de profil doit être une chaîne de caractères.")
        .isLength({ max: 40000 }).withMessage("L'image de profil ne doit pas dépasser 40000 caractères."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));
            return res.status(400).json({
                success: false,
                error: true,
                message: "Erreur de validation",
                errors: formattedErrors
            });
        }
        next();
    }
];
const validateProduct = [
    body("Name")
        .notEmpty().withMessage("Le nom du produit est requis.")
        .isString().withMessage("Le nom du produit doit être une chaîne de caractères.")
        .isLength({ min: 3, max: 100 }).withMessage("Le nom du produit doit contenir entre 3 et 100 caractères."),

    body("Description")
        .optional()
        .isString().withMessage("La description doit être une chaîne de caractères.")
        .isLength({ max: 1000 }).withMessage("La description ne doit pas dépasser 1000 caractères."),

    body("Price")
        .notEmpty().withMessage("Le prix est requis.")
        .isDecimal().withMessage("Le prix doit être un nombre décimal.")
        .custom((value) => {
            if (value <= 0) {
                throw new Error("Le prix doit être supérieur à 0.");
            }
            return true;
        }),

   
    body("Tags")
        .optional()
        .isString().withMessage("Les tags doivent être une chaîne de caractères.")
        .isLength({ max: 500 }).withMessage("Les tags ne doivent pas dépasser 500 caractères."),

    body("ImageProduct")
        .optional()
        .isString().withMessage("L'image du produit doit être une chaîne de caractères.")
        .isLength({ max: 40000 }).withMessage("L'image du produit ne doit pas dépasser 40000 caractères."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));
            return res.status(400).json({
                success: false,
                error: true,
                message: "Erreur de validation",
                errors: formattedErrors
            });
        }
        next();
    }
];
const validateService = [
    body("Name")
        .notEmpty().withMessage("Le nom du service est requis.")
        .isString().withMessage("Le nom du service doit être une chaîne de caractères.")
        .isLength({ min: 3, max: 100 }).withMessage("Le nom du service doit contenir entre 3 et 100 caractères."),

    body("Description")
        .optional()
        .isString().withMessage("La description doit être une chaîne de caractères.")
        .isLength({ max: 1000 }).withMessage("La description ne doit pas dépasser 1000 caractères."),

    body("Tags")
        .optional()
        .isString().withMessage("Les tags doivent être une chaîne de caractères.")
        .isLength({ max: 500 }).withMessage("Les tags ne doivent pas dépasser 500 caractères."),

    body("Image")
        .optional()
        .isString().withMessage("L'image du service doit être une chaîne de caractères.")
        .isLength({ max: 40000 }).withMessage("L'image du service ne doit pas dépasser 40000 caractères."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));
            return res.status(400).json({
                success: false,
                error: true,
                message: "Erreur de validation",
                errors: formattedErrors
            });
        }
        next();
    }
];
const validateRemboursement = [
   
   
    body("Montant")
        .notEmpty().withMessage("Le montant est requis.")
        .isDecimal().withMessage("Le montant doit être un nombre décimal.")
        .custom((value) => {
            if (value <= 0) {
                throw new Error("Le montant doit être supérieur à 0.");
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));
            return res.status(400).json({
                success: false,
                error: true,
                message: "Erreur de validation",
                errors: formattedErrors
            });
        }
        next();
    }
];

const validateIntervention = [
   
   

    body("technicienResponsable")
        .notEmpty().withMessage("Le technicien responsable est requis.")
        .isString().withMessage("Le technicien responsable doit être une chaîne de caractères.")
        .isLength({ min: 3 }).withMessage("Le nom du technicien doit contenir au minimum 3 caractères."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));
            return res.status(400).json({
                success: false,
                error: true,
                message: "Erreur de validation",
                errors: formattedErrors
            });
        }
        next();
    }
];
module.exports = { validateReclamation ,validateIntervention,validateRemboursement,validateService,validateResponse,validateSignUp , validateProduct};
