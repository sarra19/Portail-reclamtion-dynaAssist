import SummaryApi from "api/common";

import DisplayImage from "helpers/DisplayImage";
import uploadFile from "helpers/uploadFile";
import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import { useHistory } from 'react-router-dom';

export default function CardAddService() {
  const initialData = {
    Image: [],
    Name: "",
    Description: "",
    Tags: "",
  };

  const history = useHistory();
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");
  const [data, setData] = useState(initialData);
  const [isGeneratingAITags, setIsGeneratingAITags] = useState(false);
  const [lastGeneratedName, setLastGeneratedName] = useState("");
  const [errors, setErrors] = useState({}); // Stocke les erreurs de validation

  // Validation côté frontend avant soumission
  const validateForm = () => {
    const newErrors = {};
    if (!data.Name || data.Name.trim().length < 3) {
      newErrors.Name = "Le nom doit contenir au moins 3 caractères.";
    }
    if (data.Image.length === 0) {
      newErrors.Image = "Veuillez ajouter une image.";
    }

    if (data.Tags && data.Tags.split(",").some(tag => tag.trim().length < 2)) {
      newErrors.Tags = "Chaque tag doit faire au moins 2 caractères.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // AI Tag Generation Function
  const generateAITags = async (serviceName, retryCount = 0) => {
    if (!serviceName || serviceName.length < 3 || serviceName === lastGeneratedName) return;
    setIsGeneratingAITags(true);
    setLastGeneratedName(serviceName);
    try {
      const prompt = `
Génère 5 à 7 mots-clés en français pour ce service : "${serviceName}"
Format : "tag1, tag2, tag3"
Aucun texte introductif ni mot technique ("Tags", "pgi", "erp", etc.)
`.trim();

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.REACT_APP_SITE_URL || "localhost",
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
          stop: ["\n"],
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

      let rawTags = rawContent
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
      toast.warning("⚠️ Échec de l'IA", { autoClose: 2000 });
    } finally {
      setIsGeneratingAITags(false);
    }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "Name") {
      const timer = setTimeout(() => {
        generateAITags(value);
      }, 1000);
      return () => clearTimeout(timer);
    }
  };

  // Handle File Upload
  const handleUploadFile = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      toast.error("Aucun fichier sélectionné.");
      return;
    }

 

    setData(prev => ({
      ...prev,
      Image: [...prev.Image, ...files],
    }));
    toast.success("Fichiers sélectionnés avec succès !");
  };

  // Handle Delete Image
  const handleDeleteImage = (index) => {
    const newImage = [...data.Image];
    newImage.splice(index, 1);
    setData(prev => ({
      ...prev,
      Image: [...newImage],
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Arrête si les validations échouent
    }

    try {
      const formData = {
        Image: "",
        Name: data.Name,
        Description: data.Description,
        Tags: data.Tags,
      };

      if (data.Image.length > 0) {
        const fileUrls = [];
        for (const file of data.Image) {
          try {
            const fileUploadResponse = await uploadFile(file);
            fileUrls.push(fileUploadResponse.url);
          } catch (uploadError) {
            console.error("Erreur lors du téléchargement du fichier :", uploadError);
            toast.error("Échec du téléchargement de l'image. Veuillez réessayer.");
            return;
          }
        }
        formData.Image = fileUrls.join(",");
      }

      const response = await fetch(SummaryApi.addNewService.url, {
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
      history.push("/admin/service");
      setData(initialData);
    } catch (error) {
      console.error("Erreur lors de l'ajout du service :", error);
      toast.error(error.message || "Une erreur est survenue, veuillez réessayer.");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t bg-white mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-blueGray-700 text-xl font-bold">Saisir les Informations de Service</h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Name">
                    Nom de Service
                  </label>
                  <input
                    type="text"
                    name="Name"
                    value={data.Name}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Name ? "border-red-500 border" : ""
                      }`}
                    placeholder="Nom de Service"
                  />
                  {errors.Name && <p className="text-red-500 text-xs mt-1">{errors.Name}</p>}
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="Tags">
                    Tags {isGeneratingAITags && <span className="text-xs text-gray-500">(AI generating...)</span>}
                  </label>
                  <input
                    type="text"
                    name="Tags"
                    value={data.Tags}
                    onChange={handleInputChange}
                    className={`border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${errors.Tags ? "border-red-500 border" : ""
                      }`}
                    placeholder="Tags seront générés automatiquement"
                  />
                  {errors.Tags && <p className="text-red-500 text-xs mt-1">{errors.Tags}</p>}
                </div>
              </div>

              <div className="w-full px-4">
                <div className="relative w-full mb-3">
                  <label htmlFor="uploadImageInput" className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Image de service :
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
                          accept="image/*"  // Seulement les images de tous types

                          className="hidden"
                          onChange={handleUploadFile}
                          multiple
                        />
                      </div>
                    </div>
                  </label>
                  {errors.Image && <p className="text-red-500 text-xs mt-1">{errors.Image}</p>}

                  {data.Image.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      {data.Image.map((el, index) => {


                        return (
                          <div className="relative group" key={index}>
                            <img
                              src={URL.createObjectURL(el)}
                            alt={el.name}
                            width={80}
                            height={80}
                            className="bg-slate-100 border cursor-pointer"
                            onClick={() => {
                              setOpenFullScreenImage(true);
                              setFullScreenImage(URL.createObjectURL(el));
                            }}
                            />
                            <p className="text-xs">{el.name}</p>
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
                    placeholder="Description du service..."
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