import SummaryApi from "api/common";

import DisplayImage from "helpers/DisplayImage";
import uploadFile from "helpers/uploadFile";
import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import { useHistory } from 'react-router-dom';

export default function CardAddProd() {
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const history = useHistory();
  const [fullScreenImage, setFullScreenImage] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorData, setVendorData] = useState([]);
  const [isGeneratingAITags, setIsGeneratingAITags] = useState(false);
  const [lastGeneratedName, setLastGeneratedName] = useState("");
  const [errors, setErrors] = useState({});

  const initialData = {
    ImageProduct: [],
    Name: "",
    Description: "",
    Price: 0,
    Tags: "",
    Vendor: "",
    VendorId: "",
  };

  const [data, setData] = useState(initialData);

  const validateForm = () => {
    const newErrors = {};
    
    if (!data.Name || data.Name.length < 3) {
      newErrors.Name = "Le nom du produit est requis (min. 3 caractères)";
    }
    
    if (!data.Price || data.Price <= 0) {
      newErrors.Price = "Le prix doit être supérieur à 0";
    }
    
    if (!data.VendorId) {
      newErrors.Vendor = "Le fournisseur est obligatoire";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateAITags = async (productName, retryCount = 0) => {
    if (!productName || productName.length < 3 || productName === lastGeneratedName) return;
    setIsGeneratingAITags(true);
    setLastGeneratedName(productName);
  
    try {
      const prompt = `
  Génère 5 à 7 mots-clés en français pour ce produit : "${productName}"
  Format : "tag1, tag2, tag3"
  Aucun texte introductif ni mot technique ("Tags", "pgi", "erp", etc.)
  `.trim();
  
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.REACT_APP_SITE_URL || "http://localhost:3000",
          "X-Title": "Tag Generator App",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct-v0.2",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.6,
          stop: ["\n\n"],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Erreur API OpenRouter : ${await response.text()}`);
      }
  
      const result = await response.json();
      const rawContent = result.choices[0]?.message?.content.trim();
  
      if (!rawContent) {
        throw new Error("Réponse vide");
      }
  
      let rawTags = rawContent;
  
      // Nettoyage avancé
      rawTags = rawTags
        .replace(/["'()\[\]{}]/g, "")
        .replace(/\d+/g, "")
        .replace(/^[^a-zA-ZÀ-ÿ]+/g, "")
        .replace(/[^,\s\wàâäèéêëìíîïòôöùûüçÀÂÄÈÉÊËÌÍÎÏÒÔÖÙÛÜÇ\s]/g, "")
        .replace(/,+/g, ",")
        .replace(/^,|,$/g, "");
  
      const tagArray = rawTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length >= 2 && /^[a-zàâäèéêëìíîïòôöùûüç].*$/.test(t));
  
      const uniqueTags = [...new Set(tagArray)].slice(0, 7);
  
      setData((prev) => ({
        ...prev,
        Tags: uniqueTags.join(", "),
      }));
  
    } catch (error) {
      console.error("Erreur lors de la génération des tags:", error.message);
      toast.warning("⚠️ Échec de la génération des tags", { autoClose: 2000 });
    } finally {
      setIsGeneratingAITags(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Trigger AI tag generation when Name changes
    if (name === "Name") {
      const timer = setTimeout(() => {
        generateAITags(value);
      }, 1000);

      return () => clearTimeout(timer);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Aucun fichier sélectionné");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier invalide. Formats acceptés : JPEG, PNG, GIF, PDF, DOC, DOCX");
      return;
    }

    if (file.size > maxSize) {
      toast.error("La taille du fichier dépasse la limite de 5MB");
      return;
    }

    setData(prev => ({
      ...prev,
      ImageProduct: [...prev.ImageProduct, file],
    }));
    toast.success("Fichier sélectionné avec succès !");
  };

  const handleDeleteImage = (index) => {
    const newImage = [...data.ImageProduct];
    newImage.splice(index, 1);

    setData(prev => ({
      ...prev,
      ImageProduct: [...newImage],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const formData = {
        ImageProduct: "",
        Name: data.Name,
        Description: data.Description,
        Price: data.Price,
        Tags: data.Tags,
        Vendor: data.Vendor,
        VendorId: data.VendorId,
      };

      if (data.ImageProduct.length > 0) {
        const fileUrls = [];
        for (const file of data.ImageProduct) {
          try {
            const fileUploadResponse = await uploadFile(file);
            fileUrls.push(fileUploadResponse.url);
          } catch (uploadError) {
            console.error("Erreur lors du téléchargement du fichier :", uploadError);
            toast.error("Échec de l'upload de l'image. Veuillez réessayer.");
            return;
          }
        }
        formData.ImageProduct = fileUrls.join(",");
      }

      const response = await fetch(SummaryApi.addNewProduct.url, {
        method: "post",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          result.errors.forEach((err) => {
            toast.error(`${err.message}`);
          });
        } else {
          toast.error(result.message || "Erreur serveur inconnue");
        }
        return;
      }

      toast.success(result.message);
      setData(initialData);
      setSelectedVendor(null);
      history.push("/admin/produit");
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit :", error);
      toast.error(error.message || "Une erreur est survenue, veuillez réessayer.");
    }
  };

  const fetchVendor = async () => {
    try {
      const response = await fetch(SummaryApi.getVendors.url, {
        method: SummaryApi.getVendors.method,
      });
      const result = await response.json();
      if (result.success) {
        setVendorData(result.data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs:", error);
      toast.error("Échec de la récupération des fournisseurs");
    }
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  const handleVendorChange = (event) => {
    const selectedValue = JSON.parse(event.target.value);
    setSelectedVendor(selectedValue);
    setData((prev) => ({
      ...prev,
      Vendor: `${selectedValue.FirstName} ${selectedValue.LastName}`,
      VendorId: selectedValue.No_,
    }));
    
    // Clear vendor error when selected
    if (errors.Vendor) {
      setErrors(prev => ({
        ...prev,
        Vendor: null
      }));
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-blueGray-700 text-xl font-bold">Saisir les Informations de Produit</h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Name">
                    Nom de Produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={data.Name}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Name ? 'border border-red-500' : ''}`}
                    placeholder="Nom de Produit"
                  />
                  {errors.Name && <p className="text-red-500 text-xs italic mt-1">{errors.Name}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Price">
                    Prix <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="Price"
                    value={data.Price}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Price ? 'border border-red-500' : ''}`}
                  />
                  {errors.Price && <p className="text-red-500 text-xs italic mt-1">{errors.Price}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Vendor">
                    Nom de Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="Vendor"
                    value={JSON.stringify(selectedVendor)}
                    onChange={handleVendorChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Vendor ? 'border border-red-500' : ''}`}
                  >
                    <option value="">Sélectionnez un fournisseur</option>
                    {vendorData.map((vendor) => (
                      <option key={vendor.No_} value={JSON.stringify(vendor)}>
                        {`${vendor.FirstName} ${vendor.LastName}`}
                      </option>
                    ))}
                  </select>
                  {errors.Vendor && <p className="text-red-500 text-xs italic mt-1">{errors.Vendor}</p>}
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Tags">
                    Tags {isGeneratingAITags && <span className="text-xs text-gray-500">(Génération en cours...)</span>}
                  </label>
                  <input
                    type="text"
                    name="Tags"
                    value={data.Tags}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Les tags seront générés automatiquement"
                  />
                  <span
                    className="mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    disabled={isGeneratingAITags || !data.Name}
                  >
                    {isGeneratingAITags ? "Génération en cours..." : "Tags générés"}
                  </span>
                </div>
              </div>
              <div className="w-full px-4">
                <div className="relative w-full mb-3">
                  <label htmlFor="uploadImageInput" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Document :
                  </label>
                  <label htmlFor="uploadImageInput">
                    <div className="p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer">
                      <div className="text-slate-500 flex justify-center items-center flex-col gap-2">
                        <span className="text-4xl">
                          <FaCloudUploadAlt />
                        </span>
                        <p className="text-sm">Importer votre fichier</p>
                        <input
                          type="file"
                          id="uploadImageInput"
                          className="hidden"
                          onChange={handleUploadFile}
                          multiple
                        />
                      </div>
                    </div>
                  </label>
                </div>
                {data.ImageProduct.length > 0 && (
                  <div className="flex items-center gap-2">
                    {data.ImageProduct.map((el, index) => {
                      const isDocument = [
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ].includes(el.type);

                      const defaultDocImage = require("assets/img/file.png");

                      return (
                        <div className="relative group" key={index}>
                          <img
                            src={isDocument ? defaultDocImage : URL.createObjectURL(el)}
                            alt={el.name}
                            width={80}
                            height={80}
                            className="bg-slate-100 border cursor-pointer"
                            onClick={() => {
                              setOpenFullScreenImage(true);
                              setFullScreenImage(isDocument ? defaultDocImage : URL.createObjectURL(el));
                            }}
                          />
                          <p className="text-xs truncate w-20">{el.name}</p>
                          <div
                            className="absolute bottom-0 right-0 p-1 text-white bg-pink-600 rounded-full hidden group-hover:block cursor-pointer"
                            onClick={() => handleDeleteImage(index)}
                          >
                            <MdDelete />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />

            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Description">
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={data.Description}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Description de produit..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-end">
                <button
                  className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  type="submit"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Ajouter
                </button>
              </div>
            </div>
          </form>
          {openFullScreenImage && (
            <DisplayImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
          )}
        </div>
      </div>
    </>
  );
}