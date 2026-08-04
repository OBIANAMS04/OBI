import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface CaseNote {
  id: string;
  noteBy: string;
  content: string;
  createdAt: string;
}

interface CaseDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  uploadedBy?: string;
  createdAt: string;
}

interface CaseDetail {
  id: string;
  userId: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  notes: CaseNote[];
  documents: CaseDocument[];
}

type CaseStatus = 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Denied' | 'Appealed';

const CASE_STATUSES: CaseStatus[] = ['Draft', 'Submitted', 'In Review', 'Approved', 'Denied', 'Appealed'];

export const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ status: '', assignedTo: '' });
  const [newNote, setNewNote] = useState('');
  const [newDocumentType, setNewDocumentType] = useState('');
  const [newDocumentUrl, setNewDocumentUrl] = useState('');

  useEffect(() => {
    loadCaseDetail();
  }, [id, token]);

  const loadCaseDetail = async () => {
    if (!id || !token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/cases/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCaseData(response.data);
      setEditData({
        status: response.data.status,
        assignedTo: response.data.assignedTo || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load case');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCase = async () => {
    if (!id || !token) return;

    try {
      setError(null);

      await api.put(`/cases/${id}`, editData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadCaseDetail();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update case');
    }
  };

  const handleAddNote = async () => {
    if (!id || !token || !newNote.trim()) return;

    try {
      setError(null);

      await api.post(`/cases/${id}/notes`, { content: newNote }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNewNote('');
      await loadCaseDetail();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add note');
    }
  };

  const handleAddDocument = async () => {
    if (!id || !token || !newDocumentType || !newDocumentUrl) return;

    try {
      setError(null);

      await api.post(`/cases/${id}/documents`, {
        documentType: newDocumentType,
        documentUrl: newDocumentUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNewDocumentType('');
      setNewDocumentUrl('');
      await loadCaseDetail();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add document');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back
          </button>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600">Case not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Denied':
        return 'bg-red-100 text-red-800';
      case 'Appealed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Case Header */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Case {caseData.id.substring(0, 8)}</h1>
                <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(caseData.status)}`}>
                  {caseData.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-gray-900">{new Date(caseData.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-gray-900">{new Date(caseData.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned To</p>
                <p className="text-gray-900">{caseData.assignedTo || '(Unassigned)'}</p>
              </div>
            </div>
          </div>

          {/* Edit Case */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Case Information</h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {CASE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To (Email)</label>
                  <input
                    type="email"
                    value={editData.assignedTo}
                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateCase}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Edit Case
              </button>
            )}
          </div>

          {/* Documents */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Documents ({caseData.documents.length})</h2>

            {caseData.documents.length > 0 ? (
              <div className="space-y-2 mb-6">
                {caseData.documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{doc.documentType}</p>
                        <p className="text-sm text-gray-600">{doc.documentUrl}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          {doc.uploadedBy && ` by ${doc.uploadedBy}`}
                        </p>
                      </div>
                      <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm">
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm mb-6">No documents uploaded yet.</p>
            )}

            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900">Add Document</h3>
              <input
                type="text"
                placeholder="Document type (e.g., proof_of_age)"
                value={newDocumentType}
                onChange={(e) => setNewDocumentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Document URL (e.g., s3://bucket/file.pdf)"
                value={newDocumentUrl}
                onChange={(e) => setNewDocumentUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleAddDocument}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Document
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Case Notes ({caseData.notes.length})</h2>

            {caseData.notes.length > 0 ? (
              <div className="space-y-3 mb-6">
                {caseData.notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{note.noteBy}</p>
                    <p className="text-gray-700 mt-2">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm mb-6">No notes yet.</p>
            )}

            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900">Add Note</h3>
              <textarea
                placeholder="Enter your note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleAddNote}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
