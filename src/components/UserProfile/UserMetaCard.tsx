import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import useUser from "../../hooks/useUser";
import axios from "axios";

/* ------------------ TYPES ------------------ */
interface User {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: string;
  profile?: string;
}

interface UploadPhotoModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: (path: string) => void;
}

/* ------------------ UPLOAD PHOTO MODAL ------------------ */
function UploadPhotoModal({
  open,
  onClose,
  onUploaded,
}: UploadPhotoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview("");
    }
  }, [open]);

  if (!open) return null;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const img = e.dataTransfer.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select an image first!");

    const formData = new FormData();
    formData.append("profile", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/doctor-panel-upload-photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onUploaded(res.data.profile);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-[350px] p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-center mb-4">
          Upload Profile Photo
        </h2>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
        >
          {preview ? (
            <img
              src={preview}
              className="w-28 h-28 object-cover rounded-full mx-auto"
            />
          ) : (
            <>
              <div className="text-5xl mb-2">📁</div>
              <p>Drag & drop image here</p>
              <p className="text-xs">OR</p>
            </>
          )}

          <label className="mt-2 block cursor-pointer">
            <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              Choose File
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelect}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-1.5 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file}
            className="px-4 py-1.5 bg-blue-600 text-white rounded"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ MAIN USER META CARD ------------------ */
export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, loading, refreshUser } = useUser() as {
    user: User | null;
    loading: boolean;
    refreshUser: () => void;
  };

  const [form, setForm] = useState<User | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string>("");

  useEffect(() => {
    if (user?.profile) {
      setProfilePreview(`http://localhost:5000${user.profile}`);
    }
  }, [user]);

  const handleOpen = () => {
    setForm(user);
    openModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/doctor-panel-update-profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      refreshUser();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUploaded = (path: string) => {
    setProfilePreview(`http://localhost:5000${path}`);
    refreshUser();
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User Not Found</div>;

  return (
    <>
      <div className="p-5 border rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 overflow-hidden rounded-full border">
              <img
                src={profilePreview || "/images/user/owner.jpg"}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setUploadModal(true)}
              className="absolute bottom-1 right-1 bg-white p-1 rounded-full"
            >
              ✏️
            </button>
          </div>

          <div>
            <h4 className="text-lg font-semibold">
              {user.name} {user.phone && `| ${user.phone}`}
            </h4>
            <div className="text-sm text-gray-500">
              <span>{user.role}</span> · <span>{user.email}</span>
              {user.address && ` · ${user.address}`}
            </div>
          </div>
        </div>

        <button
          onClick={handleOpen}
          className="border px-4 py-2 rounded-full"
        >
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px]">
        <div className="p-6">
          <h4 className="text-2xl font-semibold mb-4">
            Edit Personal Info
          </h4>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label>Full Name</Label>
              <Input name="name" value={form?.name || ""} onChange={handleChange} />
            </div>

            <div>
              <Label>Email</Label>
              <Input name="email" value={form?.email || ""} onChange={handleChange} />
            </div>

            <div>
              <Label>Phone</Label>
              <Input name="phone" value={form?.phone || ""} onChange={handleChange} />
            </div>

            <div>
              <Label>Address</Label>
              <Input name="address" value={form?.address || ""} onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>

      <UploadPhotoModal
        open={uploadModal}
        onClose={() => setUploadModal(false)}
        onUploaded={handlePhotoUploaded}
      />
    </>
  );
}
