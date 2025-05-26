import { supabaseBrowserClient } from "../client";

interface DownloadImageParams {
  path: string;
  callBackSuccess?: (url: string) => void;
  callBackError?: () => void;
}
export async function downloadImage({
  path,
  callBackSuccess,
  callBackError,
}: DownloadImageParams) {
  try {
    const { data, error } = await supabaseBrowserClient.storage
      .from("avatars")
      .download(path);

    if (error) {
      console.error("Error downloading image:", error);
      if (callBackError) {
        callBackError();
      }
      return;
    }

    const url = URL.createObjectURL(data);
    if (callBackSuccess) {
      callBackSuccess(url);
    }
  } catch (error) {
    console.error("Error downloading image:", error);
    if (callBackError) {
      callBackError();
    }
  }
}
