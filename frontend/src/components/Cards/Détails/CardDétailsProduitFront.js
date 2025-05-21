import React, { useState, useEffect } from "react";
import SummaryApi from '../../../api/common';
import { useParams } from 'react-router-dom';
import { FaSmile, FaPaperclip, FaThumbsUp, FaTimes, FaComment, FaTrash } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import uploadFile from '../../../helpers/uploadFile';
import { motion } from "framer-motion";
import { FaTags, FaUser, FaMoneyBillWave } from "react-icons/fa";
import { useSelector } from "react-redux";
export default function CardDétailsProduitFront() {
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState();
  const [isLiked, setIsLiked] = useState(false);
  const [commentsNumber, setCommentsNumber] = useState();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [data, setData] = useState({
    Image: "",
    Name: "",
    Description: "",
    Price: "",
    Vendor: "",
    AttachedFile: [],
  });
  function timeAgo(createdAt) {
    const now = new Date();
    const past = new Date(createdAt);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return `envoyé il y a ${diffInSeconds} s`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `envoyé il y a ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `envoyé il y a ${diffInHours} h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `envoyé il y a ${diffInDays} j`;
  }
  function timeAgo(createdAt) {
    const now = new Date();
    const past = new Date(createdAt);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return `envoyé il y a ${diffInSeconds} s`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `envoyé il y a ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `envoyé il y a ${diffInHours} h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `envoyé il y a ${diffInDays} j`;
  }

  const currentUser = useSelector(state => state?.user?.user)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };
  const handleDeleteComment = async (commentId) => {
    // Optimistic UI Update - suppression visuelle immédiate
    setComments(prev => prev.filter(c => c.No_ !== commentId));
    console.log(commentId)
    try {
      const response = await fetch(`${SummaryApi.deleteComment.url}/${commentId}`, {
        method: SummaryApi.deleteComment.method,
        credentials: "include",
      });

      toast.success("Commentaire supprimé avec succès");
      setCommentsNumber(prev => prev - 1);

      // Si l'API échoue, annulez la modification visuelle
      fetchComments(); // Recharge les vrais commentaires


    } catch (error) {
      fetchComments(); // Recharge en cas d'erreur réseau
      toast.error("Erreur de connexion");
    }
  };
  const handleEmojiClick = (emojiObject) => {
    setNewComment(newComment + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image (JPEG, PNG, GIF, PDF, DOC, DOCX).");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds the limit of 5MB.");
      return;
    }

    setData((prev) => ({
      ...prev,
      AttachedFile: [...(prev.AttachedFile || []), file],
    }));
    toast.success("File selected successfully!");
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Veuillez vous connecter...!");
      return;
    }

    if (newComment.trim() === "") {
      toast.error("Le commentaire ne peut pas être vide.");
      return;
    }

    const formData = {
      Content: newComment,
      ProductId: id,
      AttachedFile: "",
    };

    if (data.AttachedFile && data.AttachedFile.length > 0) {
      const fileUrls = [];
      for (const file of data.AttachedFile) {
        const fileUploadResponse = await uploadFile(file);
        fileUrls.push(fileUploadResponse.url);
      }
      formData.AttachedFile = fileUrls.join(",");
    }

    try {
      const response = await fetch(SummaryApi.addCommentaire.url, {
        method: SummaryApi.addCommentaire.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setCommentsNumber(prev => prev + 1); // 👈 Incrémente immédiatement


        await fetchComments(); // Recharge les vrais commentaires

        toast.success(result.message);
        setNewComment("");
        setData((prev) => ({ ...prev, AttachedFile: [] }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error);
      toast.error("Une erreur s'est produite lors de l'ajout du commentaire.");
    }
  };

  const fetchCommentStatus = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${SummaryApi.CountCommentProduct.url}?ProductId=${id}&UserId=${currentUser.No_}`, {
        method: SummaryApi.CountCommentService.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setCommentsNumber(result.data.comments);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching comments numbers:", error);
      toast.error("Failed to fetch comments numbers.");
    }
  };
  const fetchLikeStatus = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${SummaryApi.getLikeStatus.url}?ProductID=${id}&UserID=${currentUser.No_}`, {
        method: SummaryApi.getLikeStatus.method,
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        setIsLiked(result.data.isLiked);
        setLikes(result.data.likes);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching like status:", error);
      toast.error("Failed to fetch like status.");
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Veuillez vous connecter...!");
      return;
    }

    try {
      const response = await fetch(SummaryApi.addLikeProduct.url, {
        method: SummaryApi.addLikeProduct.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ProductID: id,
          UserID: currentUser.No_,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLikes(result.data.likes);
        setIsLiked(result.data.isLiked);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like.");
    }
  };


  useEffect(() => {
    if (currentUser) {
      fetchLikeStatus();
      fetchCommentStatus();

    }
  }, [currentUser]);
  const fetchComments = async () => {
    try {
      const response = await fetch(`${SummaryApi.getCommentsByProduct.url}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const commentsResponse = await response.json();
      setComments(commentsResponse?.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires :", error);
    }
  };
  useEffect(() => {


    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${SummaryApi.productDetails.url}/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dataResponse = await response.json();
        console.log("product détails :", dataResponse)

        setData(dataResponse?.product);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
    fetchComments();
  }, [id]);

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded w-11/12 md:w-11/12 lg:w-11/12 px-12 md:px-4 mr-auto ml-auto -mt-32">
        <ToastContainer position="top-center" />

        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-blueGray-700">
                Détails de Produit
              </h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {loading ? (
            <p className="text-center text-blueGray-700">Chargement...</p>
          ) : (
            <motion.div
              className="bg-bleu-dys p-4 rounded-xl shadow-2xl max-w-6xl w-full mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <motion.div
                  className="flex flex-col lg:flex-row items-center gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Image Section with hover effect */}
                  <motion.div
                    className="w-full lg:w-1/2 flex justify-center"
                    variants={itemVariants}
                  >
                    {data.ImageProduct && (
                      <motion.img
                        alt={data.Name}
                        src={data.ImageProduct}
                        className="w-50 h-auto object-cover rounded-xl shadow-lg border-8 border-white transform hover:scale-105 transition-transform duration-300"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      />
                    )}
                  </motion.div>

                  {/* Text Section */}
                  <motion.div
                    className="w-full lg:w-1/2 text-white"
                    variants={itemVariants}
                  >
                    <motion.h2
                      className="text-4xl font-bold mb-6 text-white"
                      variants={itemVariants}
                    >
                      {data.Name}
                    </motion.h2>

                    <motion.p
                      className=" mb-8 leading-relaxed"
                      variants={itemVariants}
                    >
                      {data.Description}
                    </motion.p>

                    {/* Vendor with icon */}
                    <motion.div
                      className="flex items-center mb-4"
                      variants={itemVariants}
                    >
                      <FaUser className="text-white mr-2 text-xl" />
                      <span className="">Fournisseur : {data.Vendor}</span>
                    </motion.div>

                    {/* Price with icon */}
                    <motion.div
                      className="flex items-center mb-6"
                      variants={itemVariants}
                    >
                      <FaMoneyBillWave className="text-white mr-2 text-xl" />
                      <span className="">Prix : {data.Price} TND</span>
                    </motion.div>

                    {/* Tags section */}
                    <motion.div
                      className="flex items-center mb-4"
                      variants={itemVariants}
                    >
                      <FaTags className="text-white mr-2 text-xl" />
                      <span className="font-semibold">Tags :</span>
                    </motion.div>

                    <motion.div
                      className="flex flex-wrap gap-3"
                      variants={containerVariants}
                    >
                      {data.Tags &&
                        data.Tags.split(",").map((tag, index) => (
                          <motion.span
                            key={index}
                            className="bg-white text-bleu-dys ml-1 mb-1 px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, backgroundColor: "#c4cbea" }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            #{tag.trim()}
                          </motion.span>
                        ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
        <div className="flex items-center justify-between text-gray-500 border-t border-b py-2">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 ${isLiked ? "text-blue-600" : "text-gray-500"
              }`}
          >
            <FaThumbsUp className="w-5 h-5 mr-2" />
            <span>J'aime ({likes})</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FaComment className="w-5 h-5 mr-2" />
            <span>Commenter({commentsNumber})</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4">
            <hr className="mt-2 mb-2" />
            <p className="text-gray-800 font-semibold">Commentaires</p>
            <hr className="mt-2 mb-2" />
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="flex items-center space-x-2 mt-4 justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mt-4 ">
                      <img
                        src={comment.user?.ProfileImage}
                        alt="User Avatar"
                        className="w-8 h-8 mr-2 rounded-full"
                      />
                      <div>
                        <p className="text-gray-800 font-semibold">{comment.user?.FirstName} {comment.user?.LastName}</p>
                        <p className="text-gray-500 text-sm">{comment.Content}</p>
                        {comment.AttachedFile && comment.AttachedFile.trim() !== "" && (
                          <img
                            src={comment.AttachedFile}
                            alt="Attached File"
                            width={80}
                            height={80}
                            className="bg-slate-100 border cursor-pointer"
                          />
                        )}
                        <p className="text-gray-400 text-xs mt-1">{timeAgo(comment.CreatedAt)}</p>
                      </div>
                    </div>
                  </div>
                  {(currentUser?.No_ === comment.UserId || currentUser?.Role === 0) && (
                    <button
                      onClick={() => handleDeleteComment(comment.No_)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}


                </div>

              ))
            ) : (
              <p className="text-center text-gray-500 w-full">
                Aucun commentaire disponible.
              </p>
            )}

            <form onSubmit={handleAddComment}>
              <label htmlFor="chat" className="sr-only">
                Your message
              </label>
              <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                >
                  <FaSmile className="w-5 h-5 mt-4 text-orange-dys" />
                  <span className="sr-only">Add emoji</span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 right-4 bg-white p-2 rounded-md shadow-lg z-50 w-64">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">
                        Choisir un emoji
                      </span>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>
                    <EmojiPicker
                      width={300}
                      height={400}
                      onEmojiClick={handleEmojiClick}
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="p-2 mt-4 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
                >
                  <FaPaperclip className="w-5 h-5 text-orange-dys" />
                  <span className="sr-only">Upload file</span>
                </label>
                <textarea
  id="chat"
  rows={1}
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
     e.preventDefault();
    handleAddComment(e); 
    }
  }}
  className="block mt-4 mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  placeholder="Votre commentaire..."
/>

                <button
                  type="submit"
                  className="mt-4 inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
                >
                  <i className="fas fa-paper-plane text-xl text-orange-dys transform rotate-45"></i>
                  <span className="sr-only">Send message</span>
                </button>
              </div>
              {data.AttachedFile && data.AttachedFile.length > 0 && (
                <div className="mt-2">
                  {data.AttachedFile.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt="File Preview"
                      className="w-20 h-20 mt-2 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </>
  );
}