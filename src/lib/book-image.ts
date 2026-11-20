import { api } from "./api";

export async function uploadBookImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a valid image file.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Choose an image that is 5 MB or smaller.");
  }

  const formData = new FormData();
  formData.append("image", file);
  const result = await api<{ image: string }>("/images", {
    method: "POST",
    body: formData,
  }, true);
  return result.image;
}
