"use client";
import { Authenticated, useOne, useShow } from "@refinedev/core";
import Image from "next/image";
import Script from "next/script";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { generateARHtml } from "ar_viewer";
import { STORE_URL } from "app-constants";

export default function ARExperience() {
    const { query } = useShow({});
    const { data, isLoading } = query;
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
            <div className="w-full h-full">
                {iframeSrc && (
                    <iframe
                        ref={iframeRef}
                        src={iframeSrc}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="AR View"
                        allow="camera"
                    />
                )}
            </div>
        </Authenticated>
    );
}
