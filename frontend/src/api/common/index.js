const backendDomin = process.env.REACT_APP_BACKEND_URL//"http://localhost:8080"

const SummaryApi = {
    signUP: {
        url: `${backendDomin}/signup`,
        method: "post"
    },
    signIn: {
        url: `${backendDomin}/signin`,
        method: "post"
    },
    current_user: {
        url: `${backendDomin}/user-details`,
        method: "get"
    },

    logout_user: {
        url: `${backendDomin}/userLogout`,
        method: 'get'
    },
    deleteChat: {
        url: `${backendDomin}/deleteChat`,
        method: 'delete'
    },
    deleteAllHistorique: {
        url: `${backendDomin}/deleteAllHistorique`,
        method: 'delete'
    },
    deleteHistorique: {
        url: `${backendDomin}/deleteHistorique`,
        method: 'delete'
    },
    allUser: {
        url: `${backendDomin}/getAllUser`,
        method: 'get'
    },
    allHistory: {
        url: `${backendDomin}/getAllHistory`,
        method: 'get'
    },
    getHistorique: {
        url: `${backendDomin}/getHistorique`,
        method: 'get'
    },
    addHistorique: {
        url: `${backendDomin}/addHistorique`,
        method: 'post'
    },
    signInFace: {
        url: `${backendDomin}/SignInFace`,
        method: 'post'
    },
    suggestions: {
        url: `${backendDomin}/suggestions`,
        method: 'post'
    },
    getUser: {
        url: `${backendDomin}/getUser`,
        method: 'get'
    },
    searchProducts: {
        url: `${backendDomin}/searchProducts`,
        method: 'get'
    },
    updateReclamation: {
        url: `${backendDomin}/updateReclamation`,
        method: 'put'
    },
    updateReponse: {
        url: `${backendDomin}/updateReponse`,
        method: 'put'
    },
    searchServices: {
        url: `${backendDomin}/searchServices`,
        method: 'get'
    },
    findHistory: {
        url: `${backendDomin}/findHistory`,
        method: 'get'
    },
    findUsers: {
        url: `${backendDomin}/findUsers`,
        method: 'get'
    },
    findReclamation: {
        url: `${backendDomin}/findReclamation`,
        method: 'get'
    },
    findRemboursements: {
        url: `${backendDomin}/findRemboursements`,
        method: 'get'
    },
    getAllRemboursement: {
        url: `${backendDomin}/getAllRemboursement`,
        method: 'get'
    },
    getRemboursementsBycurrentClient: {
        url: `${backendDomin}/getRemboursementsBycurrentClient`,
        method: 'get'
    },
    getInterventionsClient: {
        url: `${backendDomin}/getInterventionsClient`,
        method: 'get'
    },

    getRemboursementsReciever: {
        url: `${backendDomin}/getRemboursementsReciever`,
        method: "GET",
    },
    getRemboursementsSender: {
        url: `${backendDomin}/getRemboursementsSender`,
        method: "GET",
    },
 getInterventionsByCurrentUser: {
        url: `${backendDomin}/getInterventionsByCurrentUser`,
        method: "GET",
    },
 
    getRemboursementsByCurrentUser: {
        url: `${backendDomin}/getRemboursementsByCurrentUser`,
        method: 'get'
    },
    getInterventionsByCurrentUser: {
        url: `${backendDomin}/getInterventionsByCurrentUser`,
        method: 'get'
    },

    getUserByReclamationId: {
        url: `${backendDomin}/getUserByReclamationId`,
        method: 'get'
    },
    updateUserRole: {
        url: `${backendDomin}/updateUserRole`,
        method: "put"
    },
    updateUser: {
        url: `${backendDomin}/updateUser`,
        method: "put"
    },
    updateStatus: {
        url: `${backendDomin}/updateStatus`,
        method: "put"
    },
    deleteUser: {
        url: `${backendDomin}/deleteUser`,  // Ensure this is correct
        method: 'DELETE'
    },
    deleteRemboursement: {
        url: `${backendDomin}/deleteRemboursement`,  // Ensure this is correct
        method: 'DELETE'
    },

    deleteReponse: {
        url: `${backendDomin}/deleteReponse`,  // Ensure this is correct
        method: 'DELETE'
    },

    deleteProduit: {
        url: `${backendDomin}/deleteProduit`,  // Ensure this is correct
        method: 'DELETE'
    },
    deleteInterv: {
        url: `${backendDomin}/deleteInterv`,  // Ensure this is correct
        method: 'DELETE'
    },

    serviceDetails: {
        url: `${backendDomin}/getServiceDetails`,
        method: "get"
    },
    RecievedRec: {
        url: `${backendDomin}/RecievedRec`,
        method: "get"
    },
    deleteMessage: {
        url: `${backendDomin}/deleteMessage`,
        method: "delete"
    },
    deleteNotification: {
        url: `${backendDomin}/deleteNotification`,
        method: "delete"
    },
    updateMessage: {
        url: `${backendDomin}/updateMessage`,
        method: "put"
    },
    getReclamation: {
        url: `${backendDomin}/getReclamation`,
        method: "get"
    },
    getResponsesByReclamation: {
        url: `${backendDomin}/getResponsesByReclamation`,
        method: "get"
    },
    addRecToVendor: {
        url: `${backendDomin}/addRectoVendor`,
        method: "post"
    },
    addRecToAdmin: {
        url: `${backendDomin}/addRecToAdmin`,
        method: "post"
    },
    getAllReclamation: {
        url: `${backendDomin}/getAllReclamation`,
        method: "get"
    },
    allProduit: {
        url: `${backendDomin}/getAllProduit`,
        method: 'get'
    },
    productDetails: {
        url: `${backendDomin}/getProductDetails`,
        method: "get"
    },
    updateProduit: {
        url: `${backendDomin}/updateProduit`,
        method: "put"
    },
    createChatMessagerie: {
        url: `${backendDomin}/createChatMessagerie`,
        method: "post"
    },
    ArchiveRec: {
        url: `${backendDomin}/ArchiveRec`,
        method: "put"
    },
    desArchiveRec: {
        url: `${backendDomin}/desArchiveRec`,
        method: "put"
    },
    addNewProduct: {
        url: `${backendDomin}/addNewProduct`,
        method: "post"
    },

    updateService: {
        url: `${backendDomin}/updateService`,
        method: "put"
    },
    allReclamation: {
        url: `${backendDomin}/getAllReclamation`,
        method: 'get'
    },
    getIntervention: {
        url: `${backendDomin}/getIntervention`,
        method: 'get'
    },
    searchUsers: {
        url: "/api/searchUsers", // L'endpoint pour la recherche
        method: "GET", // La méthode HTTP
    },
    getchats: {
        url: `${backendDomin}/getuserChats`,
        method: "GET"
    },
    getMessages: {
        url: `${backendDomin}/getMessages`,
        method: "GET"
    },
    addMessage: {
        url: `${backendDomin}/addMessage`,
        method: "POST"
    },
    getRemboursement: {
        url: `${backendDomin}/getRemboursement`,
        method: 'get'
    },
    sortUsers: {
        url: `${backendDomin}/sortUsers`,
        method: 'get'
    },
    sortRemboursements: {
        url: `${backendDomin}/sortRemboursements`,
        method: 'get'
    },
    sortIntervention: {
        url: `${backendDomin}/sortIntervention`,
        method: 'get'
    },
    sortServices: {
        url: `${backendDomin}/sortServices`,
        method: 'get'
    },
    sortHistory: {
        url: `${backendDomin}/sortHistory`,
        method: 'get'
    },
    sortProducts: {
        url: `${backendDomin}/sortProducts`,
        method: 'get'
    },
    sortReclamation: {
        url: `${backendDomin}/sortReclamation`,
        method: 'get'
    },
    updateCallStatus: {
        url: `${backendDomin}/updateCallStatus`,
        method: 'put'
    },
    startAudioCall: {
        url: `${backendDomin}/startAudioCall`,
        method: 'post'
    },
    verifyFace: {
        url: `${backendDomin}/verifyFace`,
        method: 'post'
    },
    registerFace: {
        url: `${backendDomin}/registerFace`,
        method: 'post'
    },
    signInWithFace: {
        url: `${backendDomin}/SignInWithFace`,
        method: "POST"
    },
    speechToText: {
        url: `${backendDomin}/speechToText`,
        method: 'post'
    },
    generateZegoToken: {
        url: `${backendDomin}/generate-zego-token`,
        method: 'post'
    },
    rembStats: {
        url: `${backendDomin}/rembStats`,
        method: 'get'
    },
    IntervStats: {
        url: `${backendDomin}/IntervStats`,
        method: 'get'
    },
    getUserStats: {
        url: `${backendDomin}/getUserStats`,
        method: 'get'
    },
    productsByVendorStats: {
        url: `${backendDomin}/productsByVendorStats`,
        method: 'get'
    },
    reclamationStats: {
        url: `${backendDomin}/reclamationStats`,
        method: 'get'
    },
    updateRemboursement: {
        url: `${backendDomin}/updateRemboursement`,
        method: 'put'
    },
    getUserDetailsByInterventionId: {
        url: `${backendDomin}/getUserDetailsByInterventionId`,
        method: 'get'
    },
    getUserDetailsByRembId: {
        url: `${backendDomin}/getUserDetailsByRembId`,
        method: 'get'
    },
    allInterventions: {
        url: `${backendDomin}/allInterventions`,
        method: 'get'
    },
    getNotifications: {
        url: `${backendDomin}/getNotifications`,
        method: 'get'
    },
    mesReclamations: {
        url: `${backendDomin}/mesReclamations`,
        method: 'get'
    },
    addCommentaire: {
        url: `${backendDomin}/addCommentaire`,
        method: 'post'
    },
    getAllCommentaire: {
        url: `${backendDomin}/getAllCommentaire`,
        method: 'get'
    },
    getCommentsByService: {
        url: `${backendDomin}/getCommentsByService`,
        method: 'get'
    },
    getCommentsByProduct: {
        url: `${backendDomin}/getCommentsByProduct`,
        method: 'get'
    },
    addLikeProduct: {
        url: `${backendDomin}/addLike`,
        method: 'post'
    },
    addLikeService: {
        url: `${backendDomin}/addLikeService`,
        method: 'post'
    },
    addNewService: {
        url: `${backendDomin}/addNewService`,
        method: 'post'
    },
    getLikeStatus: {
        url: `${backendDomin}/getLikeStatus`,
        method: 'get'
    },
    getLikeStatusService: {
        url: `${backendDomin}/getLikeStatusService`,
        method: 'get'
    },
    findIntervention: {
        url: `${backendDomin}/findIntervention`,
        method: 'get'
    },
    DeleteLikeProduct: {
        url: `${backendDomin}/DeleteLikeProduct`,
        method: 'put'
    },
    updateIntervention: {
        url: `${backendDomin}/updateIntervention`,
        method: 'put'
    },
    deleteComment: {
        url: `${backendDomin}/deleteComment`,
        method: 'delete'
    },

    //réponse

    addReponse: {
        url: `${backendDomin}/addReponse`,
        method: 'post'
    },
    detailsReclamation: {
        url: `${backendDomin}/detailsReclamation`,
        method: 'get'
    },
    CountCommentService: {
        url: `${backendDomin}/CountCommentService`,
        method: 'get'
    },
    CountCommentProduct: {
        url: `${backendDomin}/CountCommentProduct`,
        method: 'get'
    },
    allService: {
        url: `${backendDomin}/getAllService`,
        method: 'get'
    },
    deleteService: {
        url: `${backendDomin}/deleteService`,  // Ensure this is correct
        method: 'DELETE'
    },

    deleteReclamation: {
        url: `${backendDomin}/deleteReclamation`,  // Ensure this is correct
        method: 'DELETE'
    },

    //reset
    sendRecoveryEmail: {
        url: `${backendDomin}/password-reset/send_recovery_email`,
        method: 'post'
    },
    resetPassword: {
        url: `${backendDomin}/password-reset/change`,
        method: 'post'
    },
    getVendors: {
        url: `${backendDomin}/getVendors`,
        method: 'get'
    },

}


export default SummaryApi