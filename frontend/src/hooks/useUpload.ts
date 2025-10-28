import { useState } from "react";
import { validateFile } from "../utils/validation";
import { api } from "../services/api";

export const useUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File, moduleName: string) => {
        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // Validate File
            const validation = validateFile(file);

            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            // Upload file
            const result = await api.files.upload(file, moduleName);

            clearInterval(progressInterval);
            setProgress(100);

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            throw err;
        } finally {
            setUploading(false);
        }
    }

    return {
        uploading,
        progress,
        error,
        uploadFile,
        reset: () => {
            setError(null);
            setProgress(0);
        }
    }
}