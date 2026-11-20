type ImgBBResponse = {
  success?: boolean;
  data?: { display_url?: string };
  error?: { message?: string };
};

export async function uploadBookImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a valid image file.");
  }

  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!key) {
    throw new Error("Add NEXT_PUBLIC_IMGBB_API_KEY to your client environment.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json() as ImgBBResponse;

  if (!response.ok || !result.success || !result.data?.display_url) {
    throw new Error(result.error?.message || "Image upload failed.");
  }

  return result.data.display_url;
}
