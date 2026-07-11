const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Unsigned upload straight from the browser. Returns the hosted https URL.
export async function uploadImage(file, folder) {
  if (!file.type.startsWith("image/")) throw new Error("Please pick an image file.");
  if (file.size > MAX_BYTES) throw new Error("Image is over 10 MB — pick a smaller one.");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  if (folder) fd.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || "Upload failed — check your connection and try again.");
  }
  return json.secure_url;
}

// Cloudinary on-the-fly transform for fast mobile thumbnails.
export const thumb = (url, w = 600) =>
  typeof url === "string"
    ? url.replace("/upload/", `/upload/c_fill,w_${w},q_auto,f_auto/`)
    : url;
