import { useState } from "react";
import { api } from "../../utils/api";
function BulkUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/customers/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data) {
        onUploadSuccess(response.data);
        setFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <div>
      <h2>Bulk Upload Customers</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default BulkUpload;
