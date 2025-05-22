import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import SummaryApi from "api/common";

import DisplayImage from "helpers/DisplayImage";
import uploadFile from "helpers/uploadFile";
import { useHistory } from 'react-router-dom';

export default function CardEditService() {
  const history = useHistory();
  const { id } = useParams();
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");
  const [service, setService] = useState({
    Image: "",
    Name: "",
    Description: "",
    Tags: "",
  });
  const [errors, setErrors] = useState({}); // Stocke les erreurs de validation

  // Fetch service details
  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`${SummaryApi.serviceDetails.url}/${id}`);
      const dataResponse = await response.json();
      if (dataResponse.success && dataResponse.service) {
        const { Image, Name, Description, Tags } = dataResponse.service;
        setService({
          Image,
          Name,
          Description,
          Tags,
        });
      } else {
        toast.error(dataResponse.message || "Erreur: Service non trouvé ou format invalide");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      toast.error("Erreur lors du chargement des données du service.");
    }
  };

  // Validation côté frontend avant soumission
  const validateForm = () => {
    const newErrors = {};
    if (!service.Name || service.Name.trim().length < 3) {
      newErrors.Name = "Le nom doit contenir au moins 3 caractères.";
    }
    if (!service.Image && !(service.Image instanceof File)) {
      newErrors.Image = "Veuillez ajouter une image.";
    }
    if (service.Tags && service.Tags.split(",").some(tag => tag.trim().length < 2)) {
      newErrors.Tags = "Chaque tag doit faire au moins 2 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setService({
      ...service,
      [name]: value,
    });
  };

  // Handle file upload (single file)
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Aucun fichier sélectionné.");
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
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non valide. Veuillez télécharger une image ou un document.");
      return;
    }
    if (file.size > maxSize) {
      toast.error("La taille du fichier dépasse la limite de 5 Mo.");
      return;
    }

    setService((prev) => ({
      ...prev,
      Image: file,
    }));
    toast.success("Fichier sélectionné avec succès !");
  };

  // Handle image deletion
  const handleDeleteImage = () => {
    setService((prev) => ({
      ...prev,
      Image: "",
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Arrête si les validations échouent
    }

    try {
      const formData = {
        Name: service.Name,
        Description: service.Description,
        Tags: service.Tags,
      };

      // Upload new image if a file is selected
      if (service.Image instanceof File) {
        try {
          const fileUploadResponse = await uploadFile(service.Image);
          formData.Image = fileUploadResponse.url;
        } catch (uploadError) {
          console.error("Erreur lors du téléchargement du fichier :", uploadError);
          toast.error("Échec de l'upload de l'image. Veuillez réessayer.");
          return;
        }
      } else {
        formData.Image = service.Image;
      }

      // Send update request to the server
      const response = await fetch(`${SummaryApi.updateService.url}/${id}`, {
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
            toast.error(`${err.message}`);
          });
        } else {
          toast.error(result.message || "Erreur serveur inconnue");
        }
        return;
      }

      toast.success(result.message);
      history.push("/admin/service");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du service :", error);
      toast.error(error.message || "Une erreur est survenue, veuillez réessayer.");
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-blueGray-700 text-xl font-bold">Modifier les Informations de Service</h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap">
              {/* Service Name */}
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Name">
                    Nom de Service
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={service.Name}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                      errors.Name ? "border-red-500 border" : ""
                    }`}
                    placeholder="Nom de Service"
                  />
                  {errors.Name && <p className="text-red-500 text-xs mt-1">{errors.Name}</p>}
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
                    value={service.Tags}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${
                      errors.Tags ? "border-red-500 border" : ""
                    }`}
                    placeholder="Entrez les tags"
                  />
                  {errors.Tags && <p className="text-red-500 text-xs mt-1">{errors.Tags}</p>}
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
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </label>
                  {errors.Image && <p className="text-red-500 text-xs mt-1">{errors.Image}</p>}
                </div>

                {/* Display Image */}
                {service.Image && (
                  <div className="relative group">
                    <img
                      src={
                        service.Image instanceof File
                          ? URL.createObjectURL(service.Image)
                          : service.Image
                      }
                      alt="Service"
                      width={80}
                      height={80}
                      className="bg-slate-100 border cursor-pointer"
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(
                          service.Image instanceof File
                            ? URL.createObjectURL(service.Image)
                            : service.Image
                        );
                      }}
                    />
                    <p className="text-xs mt-1">{service.Image.name ? service.Image.name : "Image existante"}</p>
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
                    value={service.Description}
                    onChange={handleInputChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Description de service..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-end">
                <button
                  className="bg-orange-dys text-white active:bg-orange-dys font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  type="submit"
                >
                  <i className="fas fa-save mr-2"></i>
                  Enregistrer
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