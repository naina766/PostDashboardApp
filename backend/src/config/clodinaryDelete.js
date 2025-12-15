import cloudinary from "../config/cloudinary.js";

const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  const publicId = imageUrl
    .split("/")
    .pop()
    .split(".")[0];

  await cloudinary.uploader.destroy(`posts/${publicId}`);
};

export default deleteImage;
