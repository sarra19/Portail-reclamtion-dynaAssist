const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "gveun5cs");

    const resourceType = file.type.startsWith("audio/") ? "video" : "image"; // Cloudinary treats audio as "video" type
    const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME_CLOUDINARY}/${resourceType}/upload`;

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Upload error:", errorData); 
            throw new Error(errorData.error.message || "Upload failed");
        }

        const data = await response.json();
        return { url: data.secure_url };
    } catch (error) {
        console.error("Network error:", error);
        throw error; 
    }
};

export default uploadFile;