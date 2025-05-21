import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import SummaryApi from "api/common";

import DisplayImage from "helpers/DisplayImage";
import uploadFile from "helpers/uploadFile";
import { useHistory } from 'react-router-dom';

export default function CardEditProd() {
  const { id } = useParams();
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorData, setVendorData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const initialData = {
    ImageProduct: "",
    Name: "",
    Description: "",
    Price: 0,
    Tags: "",
    Vendor: "",
    VendorId: "",
  };

  const [product, setProduct] = useState(initialData);

  const validateForm = () => {
    const newErrors = {};
    
    if (!product.Name || product.Name.length < 3) {
      newErrors.Name = "Le nom du produit est requis (min. 3 caractères)";
    }
    
    if (!product.Price || product.Price <= 0) {
      newErrors.Price = "Le prix doit être supérieur à 0";
    }
    
    if (!product.VendorId) {
      newErrors.Vendor = "Le fournisseur est obligatoire";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`${SummaryApi.productDetails.url}/${id}`);
      const dataResponse = await response.json();

      if (dataResponse.success && dataResponse.product) {
        const { ImageProduct, Name, Description, Price, Tags, Vendor, VendorId } = dataResponse.product;
        setProduct({
          ImageProduct: ImageProduct || "",
          Name,
          Description,
          Price,
          Tags: Tags || "",
          Vendor: Vendor || "",
          VendorId: VendorId || "",
        });

        if (VendorId && vendorData.length > 0) {
          const vendor = vendorData.find((v) => v.No_ === VendorId);
          if (vendor) {
            setSelectedVendor(vendor);
          }
        }
      } else {
        toast.error("Erreur: Produit non trouvé ou format invalide");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      toast.error("Erreur lors du chargement des données du produit.");
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
        toast.error(result.message || "Erreur lors de la récupération des fournisseurs");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs:", error);
      toast.error("Échec de la récupération des fournisseurs");
    }
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  useEffect(() => {
    if (vendorData.length > 0 && id) {
      fetchProductDetails();
    }
  }, [vendorData, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
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

    setProduct(prev => ({
      ...prev,
      ImageProduct: file,
    }));
    toast.success("Fichier sélectionné avec succès !");
  };

  const handleDeleteImage = () => {
    setProduct(prev => ({
      ...prev,
      ImageProduct: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const formData = {
        Name: product.Name,
        Description: product.Description,
        Price: product.Price,
        Tags: product.Tags,
        Vendor: product.Vendor,
        VendorId: product.VendorId,
      };

      if (product.ImageProduct instanceof File) {
        try {
          const fileUploadResponse = await uploadFile(product.ImageProduct);
          formData.ImageProduct = fileUploadResponse.url;
        } catch (uploadError) {
          console.error("Erreur lors du téléchargement du fichier :", uploadError);
          toast.error("Échec de l'upload de l'image. Veuillez réessayer.");
          setIsLoading(false);
          return;
        }
      } else {
        formData.ImageProduct = product.ImageProduct;
      }

      const response = await fetch(`${SummaryApi.updateProduit.url}/${id}`, {
        method: "PUT",
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
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(result.message || "Erreur serveur inconnue");
        }
        setIsLoading(false);
        return;
      }

      history.push("/admin/produit")
      toast.success(result.message);

      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit :", error);
      toast.error(error.message || "Une erreur est survenue, veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const handleVendorChange = (event) => {
    const selectedValue = JSON.parse(event.target.value);
    setSelectedVendor(selectedValue);
    setProduct(prev => ({
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
            <h6 className="text-blueGray-700 text-xl font-bold">Modifier les Informations de Produit</h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap">
              {/* Product Name */}
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Name">
                    Nom de Produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={product.Name}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Name ? 'border border-red-500' : ''}`}
                    placeholder="Nom de Produit"
                  />
                  {errors.Name && <p className="text-red-500 text-xs italic mt-1">{errors.Name}</p>}
                </div>
              </div>

              {/* Product Price */}
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Price">
                    Prix <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="Price"
                    value={product.Price}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Price ? 'border border-red-500' : ''}`}
                  />
                  {errors.Price && <p className="text-red-500 text-xs italic mt-1">{errors.Price}</p>}
                </div>
              </div>

              {/* Vendor Selection */}
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

              {/* Tags */}
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Tags">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="Tags"
                    value={product.Tags}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Entrez les tags"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="w-full px-4">
                <div className="relative w-full mb-3">
                  <label htmlFor="uploadImageInput" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Image :
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
                          accept="image/jpeg, image/png, image/gif, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />
                      </div>
                    </div>
                  </label>
                </div>

                {/* Display Image */}
                {product.ImageProduct && (
                  <div className="relative group">
                    <img
                      src={
                        product.ImageProduct instanceof File
                          ? URL.createObjectURL(product.ImageProduct)
                          : product.ImageProduct
                      }
                      alt="Product"
                      width={80}
                      height={80}
                      className="bg-slate-100 border cursor-pointer"
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(
                          product.ImageProduct instanceof File
                            ? URL.createObjectURL(product.ImageProduct)
                            : product.ImageProduct
                        );
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-0 p-1 text-white bg-pink-600 rounded-full hidden group-hover:block cursor-pointer"
                      onClick={handleDeleteImage}
                    >
                      <MdDelete />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300 mb-6" />

            {/* Description */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Description">
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={product.Description}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Description de produit..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-end">
                <button
                  className={`bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </span>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Full-Screen Image Display */}
          {openFullScreenImage && (
            <DisplayImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
          )}
        </div>
      </div>
    </>
  );
}