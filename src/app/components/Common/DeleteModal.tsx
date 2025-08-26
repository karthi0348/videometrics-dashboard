import React from "react";

interface DeleteModalProps {
  show?: boolean;
  onDeleteClick?: () => void;
  onCloseClick?: () => void;
  recordId?: string;
  isLoading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  onDeleteClick,
  onCloseClick,
  isLoading,
  recordId,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-96 p-6 shadow-lg">
        <div className="text-center">
          <i className="ri-delete-bin-line text-5xl text-red-600"></i>
          <div className="mt-4">
            <h4 className="text-gray-600 text-lg">
              Are you sure you want to remove this record?
            </h4>
            {/* Optional: Show recordId */}
            {/* {recordId && <p className="text-gray-500 mt-2">{recordId}</p>} */}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={onCloseClick}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onDeleteClick}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            } transition flex items-center justify-center`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : null}
            {isLoading ? "Deleting..." : "Yes, Delete It!"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
