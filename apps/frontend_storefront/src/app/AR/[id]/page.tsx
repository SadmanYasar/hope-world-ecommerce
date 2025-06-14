"use client";
import { Authenticated, useOne } from "@refinedev/core";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { generateARHtml } from "ar_viewer";
import { STORE_URL } from "app-constants";
import { useRouter, useSearchParams } from "next/navigation";

export default function ARExperience({ params }: { params: { id: string } }) {
  const id = params.id;

  console.log("ARExperience id:", id);

  const { data, error, isLoading } = useOne({
    resource: "ARCollectible",
    id: id || "",
    queryOptions: {
      enabled: !!id,
    },
  });
  //   const { data, isLoading } = query;
  const [iframeSrc, setIframeSrc] = useState("");
  const iframeRef = useRef<any>(null);
  const record = data?.data;

  useEffect(() => {
    let url: any;
    if (record?.id) {
      const imageSrc = record?.image && JSON.parse(record?.image)?.[0]?.url;
      const html = generateARHtml(imageSrc);
      const blob = new Blob([html], { type: "text/html" });
      url = URL.createObjectURL(blob);
      setIframeSrc(url);
    }
    // Cleanup function to revoke the blob URL when the component unmounts
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [record]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Authenticated key={"AR"} loading={<>Loading...</>}>
      <div className="fixed inset-0 w-screen h-screen">
        {iframeSrc && (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            style={{ width: "100vw", height: "100vh", border: "none" }}
            title="AR View"
            allow="camera"
          />
        )}
      </div>
    </Authenticated>
  );
}

