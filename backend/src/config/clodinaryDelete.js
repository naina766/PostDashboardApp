import cloudinary from "../config/cloudinary.js";

const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const publicId = imageUrl
      .split("/")
      .pop()
      .split(".")[0];

    await cloudinary.uploader.destroy(`posts/${publicId}`);
  } catch (err) {
    console.error("Cloudinary image deletion failed:", err.message);
  }
};

export default deleteImage;
