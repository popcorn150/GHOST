import { X } from "lucide-react"

export function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
                    <X size={24} />
                </button>

                {children}
            </div>
        </div>
    );
}