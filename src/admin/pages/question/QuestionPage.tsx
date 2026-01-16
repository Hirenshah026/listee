import { useEffect, useState } from "react";
import axios from "axios";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "../../../components/common/PageMeta";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

interface QA {
  _id: string;
  question: string;
  answer: string;
}

const QA_API = "http://10.184.233.180:5000/api/questions";

const customStyles: TableStyles = {
  headRow: {
    style: {
      backgroundColor: "#f3f4f6",
      fontWeight: "600",
    },
  },
};

export default function QuestionAnswerList() {
  const [list, setList] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  const [errors, setErrors] = useState<{ question?: string; answer?: string }>({});

  // ================= FETCH =================
  const fetchQA = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(QA_API);
      if (data.success) setList(data.questions);
    } catch {
      setMessage({ type: "error", text: "Failed to load questions" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQA();
  }, []);

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors: { question?: string; answer?: string } = {};
    if (!formData.question.trim()) newErrors.question = "Question is required";
    if (!formData.answer.trim()) newErrors.answer = "Answer is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= HANDLERS =================
  const resetForm = () => {
    setEditingId(null);
    setFormData({ question: "", answer: "" });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingId) {
        await axios.put(`${QA_API}/${editingId}`, formData);
        setMessage({ type: "success", text: "Question updated successfully" });
      } else {
        await axios.post(QA_API, formData);
        setMessage({ type: "success", text: "Question added successfully" });
      }
      resetForm();
      fetchQA();
    } catch {
      setMessage({ type: "error", text: "Error saving question" });
    }
  };

  const handleEdit = (item: QA) => {
    setEditingId(item._id);
    setFormData({ question: item.question, answer: item.answer });
    setErrors({});
  };

  const openDeleteModal = (item: QA) => {
    setDeleteId(item._id);
    setDeleteQuestion(item.question);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await axios.delete(`${QA_API}/${deleteId}`);
      setMessage({ type: "success", text: "Question deleted successfully" });
      fetchQA();
    } catch {
      setMessage({ type: "error", text: "Failed to delete question" });
    }

    setShowDelete(false);
    setDeleteId(null);
    setDeleteQuestion("");
  };

  // ================= TABLE =================
  const columns: TableColumn<QA>[] = [
    { name: "#", cell: (_, i) => i + 1, width: "60px" },
    { name: "Question", selector: (row) => row.question, grow: 2, wrap: true },
    { name: "Answer", selector: (row) => row.answer, grow: 3, wrap: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="px-3 py-1 bg-yellow-400 rounded">
            Edit
          </button>
          <button onClick={() => openDeleteModal(row)} className="px-3 py-1 bg-red-600 text-white rounded">
            Delete
          </button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <>
      <PageMeta title="Question & Answer Management" description="Admin Panel" />

      <div className="p-4">
        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded ${message.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* FORM */}
        <ComponentCard title={editingId ? "Edit Question" : "Add Question"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Question</label>
              <textarea
                placeholder="Enter question..."
                value={formData.question}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, question: e.target.value }));
                  if (errors.question) setErrors((prev) => ({ ...prev, question: undefined }));
                }}
                className={`w-full border rounded px-3 py-2 min-h-[60px] ${errors.question ? "border-red-500" : ""}`}
              />

              {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Answer</label>
              <textarea
                placeholder="Enter answer..."
                value={formData.answer}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, answer: e.target.value }));
                  if (errors.answer) setErrors((prev) => ({ ...prev, answer: undefined }));
                }}
                className={`w-full border rounded px-3 py-2 min-h-[100px] ${errors.answer ? "border-red-500" : ""}`}
              />
              {errors.answer && <p className="text-red-500 text-sm mt-1">{errors.answer}</p>}
            </div>

            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update" : "Add"}</button>
              <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">
                Reset
              </button>
            </div>
          </form>
        </ComponentCard>

        {/* TABLE */}
        <div className="md:col-span-2">
          <ComponentCard title="All Questions">
            <DataTable
              columns={columns}
              data={list}
              progressPending={loading}
              pagination
              highlightOnHover
              striped
              customStyles={customStyles}
              noDataComponent="No question found"
            />
          </ComponentCard>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Delete Question</h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete:
              <br />
              <span className="font-semibold">{deleteQuestion}</span>
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
