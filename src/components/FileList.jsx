import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FileList({ refreshTrigger }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFiles = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.storage
            .from("documents")
            .list("", {
                sortBy: {
                    column: "created_at",
                    order: "desc",
                },
            });

        if (error) {
            console.error("Error loading files from Supabase:", error);
            setLoading(false);
            return;
        }

        // Filter out system placeholders if any
        const validFiles = (data || []).filter((f) => f.name && !f.name.startsWith("."));
        setFiles(validFiles);
        setLoading(false);
    };

    useEffect(() => {
        loadFiles();
    }, [refreshTrigger]);

    const openFile = (fileName) => {
        if (!supabase) return;
        const { data } = supabase.storage
            .from("documents")
            .getPublicUrl(fileName);

        if (data?.publicUrl) {
            window.open(data.publicUrl, "_blank");
        }
    };

    const downloadFile = async (fileName) => {
        if (!supabase) return;
        const { data, error } = await supabase.storage
            .from("documents")
            .download(fileName);

        if (error) {
            console.error("Download error:", error);
            return;
        }

        const url = URL.createObjectURL(data);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <p style={{ color: "var(--text-muted)", padding: "1rem" }}>Loading files from Supabase...</p>;
    }

    return (
        <div>
            <h2>My Files</h2>

            {files.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No files uploaded yet.</p>
            ) : (
                files.map((file) => (
                    <div
                        key={file.name}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                            marginBottom: "12px",
                        }}
                    >
                        <span>{file.name}</span>

                        <button onClick={() => openFile(file.name)}>
                            View
                        </button>

                        <button onClick={() => downloadFile(file.name)}>
                            Download
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}